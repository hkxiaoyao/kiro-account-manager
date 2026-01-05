// KiroGate 认证管理
// 管理 access_token 生命周期

use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::RwLock;

const KIRO_REFRESH_URL: &str = "https://prod.us-east-1.auth.desktop.kiro.dev/refreshToken";
const TOKEN_REFRESH_THRESHOLD_SECS: u64 = 300; // 5 分钟前刷新

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RefreshResponse {
  pub access_token: String,
  pub refresh_token: String,
  pub expires_in: i64,
  pub profile_arn: String,
}

/// Token 管理器
pub struct TokenManager {
  refresh_token: String,
  access_token: RwLock<Option<String>>,
  profile_arn: RwLock<Option<String>>,
  expires_at: RwLock<Option<Instant>>,
  client: Client,
}

impl TokenManager {
  pub fn new(refresh_token: String) -> Self {
    let client = Client::builder()
      .timeout(Duration::from_secs(30))
      .build()
      .expect("failed to build reqwest client");

    Self {
      refresh_token,
      access_token: RwLock::new(None),
      profile_arn: RwLock::new(None),
      expires_at: RwLock::new(None),
      client,
    }
  }

  /// 获取有效的 access_token，必要时刷新
  pub async fn get_access_token(&self) -> Result<String, String> {
    // 检查是否需要刷新
    let needs_refresh = {
      let expires_at = self.expires_at.read().await;
      let access_token = self.access_token.read().await;
      
      if access_token.is_none() {
        true
      } else if let Some(exp) = *expires_at {
        exp.saturating_duration_since(Instant::now()) < Duration::from_secs(TOKEN_REFRESH_THRESHOLD_SECS)
      } else {
        true
      }
    };

    if needs_refresh {
      self.refresh().await?;
    }

    let token = self.access_token.read().await;
    token.clone().ok_or_else(|| "无法获取 access_token".to_string())
  }

  /// 获取 profile_arn
  pub async fn get_profile_arn(&self) -> Option<String> {
    self.profile_arn.read().await.clone()
  }

  /// 刷新 token
  async fn refresh(&self) -> Result<(), String> {
    #[derive(Serialize)]
    #[serde(rename_all = "camelCase")]
    struct RefreshRequest<'a> {
      refresh_token: &'a str,
    }

    let body = RefreshRequest {
      refresh_token: &self.refresh_token,
    };

    let resp = self.client
      .post(KIRO_REFRESH_URL)
      .json(&body)
      .send()
      .await
      .map_err(|e| format!("刷新 token 请求失败: {}", e))?;

    let status = resp.status();
    if !status.is_success() {
      let text = resp.text().await.unwrap_or_default();
      if status.as_u16() == 401 {
        return Err("RefreshToken 已过期或无效".to_string());
      }
      return Err(format!("刷新 token 失败 ({}): {}", status, text));
    }

    let data: RefreshResponse = resp.json().await
      .map_err(|e| format!("解析刷新响应失败: {}", e))?;

    // 更新状态
    let expires_at = Instant::now() + Duration::from_secs((data.expires_in - 60) as u64);
    
    *self.access_token.write().await = Some(data.access_token);
    *self.profile_arn.write().await = Some(data.profile_arn);
    *self.expires_at.write().await = Some(expires_at);

    Ok(())
  }
}

/// 认证缓存 - 缓存多个 refresh_token 对应的 TokenManager
pub struct AuthCache {
  cache: RwLock<std::collections::HashMap<String, Arc<TokenManager>>>,
}

impl AuthCache {
  pub fn new() -> Self {
    Self {
      cache: RwLock::new(std::collections::HashMap::new()),
    }
  }

  /// 获取或创建 TokenManager
  pub async fn get_or_create(&self, refresh_token: &str) -> Arc<TokenManager> {
    // 先尝试读取
    {
      let cache = self.cache.read().await;
      if let Some(manager) = cache.get(refresh_token) {
        return manager.clone();
      }
    }

    // 创建新的
    let manager = Arc::new(TokenManager::new(refresh_token.to_string()));
    
    {
      let mut cache = self.cache.write().await;
      cache.insert(refresh_token.to_string(), manager.clone());
    }

    manager
  }

  /// 清除缓存
  #[allow(dead_code)]
  pub async fn clear(&self) {
    let mut cache = self.cache.write().await;
    cache.clear();
  }
}
