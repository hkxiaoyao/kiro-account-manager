/// MITM 代理管理命令

use crate::mitm::cert_manager::CertManager;
use crate::state::AppState;
use serde::{Deserialize, Serialize};
use tauri::State;

/// MITM 代理状态
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MitmStatus {
    pub running: bool,
    pub port: u16,
    pub ca_installed: bool,
    pub ca_cert_path: Option<String>,
    pub mitm_domains: Vec<String>,
    pub target_device_id: Option<String>,
}

/// MITM 代理配置（前端传入）
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MitmConfig {
    pub port: u16,
    pub mitm_domains: Vec<String>,
    pub target_device_id: Option<String>,
    pub log_requests: bool,
}

/// 获取 MITM 代理状态
#[tauri::command]
pub async fn get_mitm_status(_state: State<'_, AppState>) -> Result<MitmStatus, String> {
    let certs_dir = crate::mitm::cert_manager::default_certs_dir();
    let ca_installed = certs_dir.join("ca.crt").exists();
    let ca_cert_path = if ca_installed {
        Some(certs_dir.join("ca.crt").to_string_lossy().to_string())
    } else {
        None
    };

    Ok(MitmStatus {
        running: false, // TODO: 从运行时状态获取
        port: 8766,
        ca_installed,
        ca_cert_path,
        mitm_domains: vec![
            "q.us-east-1.amazonaws.com".to_string(),
            "q.eu-central-1.amazonaws.com".to_string(),
        ],
        target_device_id: None,
    })
}

/// 生成 CA 证书
#[tauri::command]
pub async fn generate_mitm_ca() -> Result<String, String> {
    let certs_dir = crate::mitm::cert_manager::default_certs_dir();
    let manager = CertManager::new(certs_dir)?;
    Ok(manager.ca_cert_path().to_string_lossy().to_string())
}

/// 安装 CA 到系统信任存储
#[tauri::command]
pub async fn install_mitm_ca() -> Result<(), String> {
    let certs_dir = crate::mitm::cert_manager::default_certs_dir();
    let manager = CertManager::new(certs_dir)?;
    manager.install_ca_to_system()
}

/// 获取 CA 证书 PEM 内容（用于导出）
#[tauri::command]
pub async fn get_mitm_ca_pem() -> Result<String, String> {
    let certs_dir = crate::mitm::cert_manager::default_certs_dir();
    let manager = CertManager::new(certs_dir)?;
    Ok(manager.ca_cert_pem().to_string())
}
