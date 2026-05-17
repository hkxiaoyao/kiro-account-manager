//! Kiro 账号配额/超额相关的统一工具
//!
//! 之前这些判断散在 3 个文件里（auto_switch、account、proxy），
//! 字段大小写、字段优先级、is_capped 逻辑都不一致，
//! 这里抽一份统一实现。
//!
//! 字段对照（IDE 源码）：
//!   subscriptionInfo.overageCapability    "OVERAGE_CAPABLE" / "OVERAGE_INCAPABLE"
//!   overageConfiguration.overageStatus    "ENABLED"         / "DISABLED"
//!   usageBreakdownList[0].currentUsage / currentUsageWithPrecision
//!   usageBreakdownList[0].usageLimit / usageLimitWithPrecision
//!   usageBreakdownList[0].overageCap / overageCapWithPrecision

use serde_json::Value;

/// 资格枚举（账号有没有资格开超额）
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum OverageCapability {
    /// Pro / Pro+ 账号有资格开超额
    Capable,
    /// Free / Power 账号没资格
    Incapable,
    /// API 没返回这个字段（账号未抓 usage 数据等）
    Unknown,
}

impl OverageCapability {
    pub fn from_usage_data(usage_data: Option<&Value>) -> Self {
        match usage_data
            .and_then(|d| d.get("subscriptionInfo"))
            .and_then(|s| s.get("overageCapability"))
            .and_then(Value::as_str)
        {
            Some("OVERAGE_CAPABLE") => Self::Capable,
            Some("OVERAGE_INCAPABLE") => Self::Incapable,
            _ => Self::Unknown,
        }
    }
}

/// 状态枚举（账号实际有没有开超额）
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum OverageStatus {
    Enabled,
    Disabled,
    /// API 没返回 overageConfiguration 字段
    Unknown,
}

impl OverageStatus {
    pub fn from_usage_data(usage_data: Option<&Value>) -> Self {
        match usage_data
            .and_then(|d| d.get("overageConfiguration"))
            .and_then(|c| c.get("overageStatus"))
            .and_then(Value::as_str)
        {
            Some("ENABLED") => Self::Enabled,
            Some("DISABLED") => Self::Disabled,
            _ => Self::Unknown,
        }
    }

    pub fn is_enabled(self) -> bool {
        self == Self::Enabled
    }
}

/// 配额数字（精度优先版本，回退到整数版本）
fn read_amount(item: &Value, integer_key: &str, precision_key: &str) -> Option<f64> {
    item.get(precision_key)
        .and_then(Value::as_f64)
        .or_else(|| item.get(integer_key).and_then(Value::as_f64))
        .or_else(|| item.get(integer_key).and_then(Value::as_i64).map(|n| n as f64))
}

/// usageBreakdownList[0] 三个核心字段：current / limit / overage_cap
#[derive(Debug, Clone, Copy)]
pub struct UsageBreakdown {
    pub current: f64,
    pub limit: f64,
    pub overage_cap: f64,
}

impl UsageBreakdown {
    pub fn from_usage_data(usage_data: Option<&Value>) -> Option<Self> {
        let item = usage_data?
            .get("usageBreakdownList")?
            .as_array()?
            .first()?;

        let current = read_amount(item, "currentUsage", "currentUsageWithPrecision")?;
        let limit = read_amount(item, "usageLimit", "usageLimitWithPrecision")?;
        let overage_cap = read_amount(item, "overageCap", "overageCapWithPrecision").unwrap_or(0.0);

        Some(Self { current, limit, overage_cap })
    }

    /// 总可用额度（含超额）
    pub fn effective_limit(&self, status: OverageStatus) -> f64 {
        if status.is_enabled() {
            self.limit + self.overage_cap
        } else {
            self.limit
        }
    }

    /// 用量百分比（0.0 ~ 100.0+），分母用有效额度
    pub fn usage_percentage(&self, status: OverageStatus) -> f64 {
        let denom = self.effective_limit(status);
        if denom <= 0.0 {
            return 0.0;
        }
        (self.current / denom) * 100.0
    }
}

/// 账号是否已封顶不可用
///
/// 真正封顶的两种情况：
/// 1. 没开超额（overageStatus=DISABLED 或字段缺失）+ 已用 ≥ usageLimit
/// 2. 开了超额（overageStatus=ENABLED）+ 已用 ≥ usageLimit + overageCap
pub fn is_usage_capped(usage_data: Option<&Value>) -> bool {
    let Some(breakdown) = UsageBreakdown::from_usage_data(usage_data) else {
        return false;
    };
    if breakdown.limit <= 0.0 {
        return false;
    }
    let status = OverageStatus::from_usage_data(usage_data);
    let limit = breakdown.effective_limit(status);
    breakdown.current >= limit
}

/// 账号配额是否超过给定阈值（百分比，0-100）
pub fn usage_exceeds_threshold(usage_data: Option<&Value>, threshold_pct: f64) -> bool {
    let Some(breakdown) = UsageBreakdown::from_usage_data(usage_data) else {
        return false;
    };
    if breakdown.limit <= 0.0 {
        return false;
    }
    let status = OverageStatus::from_usage_data(usage_data);
    breakdown.usage_percentage(status) >= threshold_pct
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn data(status: &str, current: f64, limit: f64, cap: f64, capability: &str) -> Value {
        json!({
            "subscriptionInfo": { "overageCapability": capability },
            "overageConfiguration": { "overageStatus": status },
            "usageBreakdownList": [{
                "currentUsageWithPrecision": current,
                "usageLimitWithPrecision": limit,
                "overageCapWithPrecision": cap
            }]
        })
    }

    #[test]
    fn capped_when_disabled_over_limit() {
        let d = data("DISABLED", 100.0, 100.0, 0.0, "OVERAGE_INCAPABLE");
        assert!(is_usage_capped(Some(&d)));
    }

    #[test]
    fn not_capped_when_disabled_under_limit() {
        let d = data("DISABLED", 50.0, 100.0, 0.0, "OVERAGE_INCAPABLE");
        assert!(!is_usage_capped(Some(&d)));
    }

    #[test]
    fn not_capped_when_enabled_within_overage() {
        // 已用 150，base 100，overage 100 → 总 200，未封顶
        let d = data("ENABLED", 150.0, 100.0, 100.0, "OVERAGE_CAPABLE");
        assert!(!is_usage_capped(Some(&d)));
    }

    #[test]
    fn capped_when_enabled_over_overage() {
        // 已用 250，base 100，overage 100 → 总 200，已封顶
        let d = data("ENABLED", 250.0, 100.0, 100.0, "OVERAGE_CAPABLE");
        assert!(is_usage_capped(Some(&d)));
    }

    #[test]
    fn capability_parsing() {
        let d = data("DISABLED", 0.0, 100.0, 0.0, "OVERAGE_CAPABLE");
        assert!(OverageCapability::from_usage_data(Some(&d)).is_capable());
        let d2 = data("DISABLED", 0.0, 100.0, 0.0, "OVERAGE_INCAPABLE");
        assert_eq!(OverageCapability::from_usage_data(Some(&d2)), OverageCapability::Incapable);
        assert_eq!(OverageCapability::from_usage_data(None), OverageCapability::Unknown);
    }

    #[test]
    fn threshold_uses_effective_limit() {
        // base 100，overage 100，已用 150 → enabled 时 75%，disabled 时算 150% 但 disabled 已经 capped
        let enabled = data("ENABLED", 150.0, 100.0, 100.0, "OVERAGE_CAPABLE");
        assert!((UsageBreakdown::from_usage_data(Some(&enabled)).unwrap()
            .usage_percentage(OverageStatus::Enabled) - 75.0).abs() < 0.01);
        assert!(!usage_exceeds_threshold(Some(&enabled), 80.0));
        assert!(usage_exceeds_threshold(Some(&enabled), 70.0));
    }
}
