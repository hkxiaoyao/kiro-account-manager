# Requirements Document

## Introduction

本功能为 Kiro Account Manager 添加离线授权机制，通过硬件指纹绑定许可证，实现本地验证授权，无需联网。授权机制与 Kiro IDE 机器 ID 重置功能完全独立，互不影响。

## Glossary

- **Hardware_Fingerprint**: 基于硬件信息生成的设备唯一标识，Windows 使用 CPU ID + 主板序列号 + BIOS 序列号的 SHA256 哈希，macOS 使用 IOPlatformUUID 的 SHA256 哈希
- **License_File**: 许可证文件（.lic），包含加密的授权信息和 RSA 签名
- **License_Manager**: 许可证管理模块，负责生成指纹、验证许可证、管理授权状态
- **Public_Key**: 内置在应用中的 RSA 公钥，用于验证许可证签名
- **Private_Key**: 开发者持有的 RSA 私钥，用于生成许可证签名

## Requirements

### Requirement 1

**User Story:** As a user, I want to view my device's hardware fingerprint, so that I can provide it to obtain a license.

#### Acceptance Criteria

1. WHEN a user opens the license management page THEN the License_Manager SHALL display the device's Hardware_Fingerprint as a copyable string
2. WHEN the Hardware_Fingerprint is generated on Windows THEN the License_Manager SHALL compute SHA256 hash of CPU ID concatenated with motherboard serial number concatenated with BIOS serial number
3. WHEN the Hardware_Fingerprint is generated on macOS THEN the License_Manager SHALL compute SHA256 hash of IOPlatformUUID
4. WHEN any hardware information is unavailable THEN the License_Manager SHALL display an error message indicating which component failed

### Requirement 2

**User Story:** As a user, I want to import a license file, so that I can activate premium features.

#### Acceptance Criteria

1. WHEN a user selects a .lic file to import THEN the License_Manager SHALL read and parse the license content
2. WHEN the license file format is invalid THEN the License_Manager SHALL display an error message describing the format issue
3. WHEN the license is successfully imported THEN the License_Manager SHALL store it in the application data directory
4. WHEN a license already exists THEN the License_Manager SHALL prompt the user to confirm replacement before overwriting

### Requirement 3

**User Story:** As a user, I want the application to verify my license automatically, so that I can access features without manual intervention.

#### Acceptance Criteria

1. WHEN the application starts THEN the License_Manager SHALL automatically verify the stored license
2. WHEN verifying a license THEN the License_Manager SHALL check the RSA signature using the embedded Public_Key
3. WHEN verifying a license THEN the License_Manager SHALL compare the license's machine_id field with the current Hardware_Fingerprint
4. WHEN verifying a license THEN the License_Manager SHALL check that the current date is before the expires_at field
5. WHEN all verification checks pass THEN the License_Manager SHALL mark the license as valid and enable licensed features
6. WHEN any verification check fails THEN the License_Manager SHALL mark the license as invalid and display the specific failure reason

### Requirement 4

**User Story:** As a user, I want to see my license status, so that I know what features are available and when my license expires.

#### Acceptance Criteria

1. WHEN a valid license exists THEN the License_Manager SHALL display the license status as "已激活"
2. WHEN a valid license exists THEN the License_Manager SHALL display the expiration date
3. WHEN a valid license exists THEN the License_Manager SHALL display the list of enabled features
4. WHEN no license exists THEN the License_Manager SHALL display the license status as "未激活"
5. WHEN the license is expired THEN the License_Manager SHALL display the license status as "已过期"
6. WHEN the license machine_id does not match THEN the License_Manager SHALL display the license status as "设备不匹配"

### Requirement 5

**User Story:** As a user, I want to remove my license, so that I can transfer it to another device or clear invalid licenses.

#### Acceptance Criteria

1. WHEN a user requests to remove the license THEN the License_Manager SHALL prompt for confirmation
2. WHEN the user confirms removal THEN the License_Manager SHALL delete the license file from the application data directory
3. WHEN the license is removed THEN the License_Manager SHALL immediately disable all licensed features
4. WHEN the license removal fails THEN the License_Manager SHALL display an error message with the failure reason

### Requirement 6

**User Story:** As a developer, I want to generate license files offline, so that I can distribute licenses to users without an online service.

#### Acceptance Criteria

1. WHEN generating a license THEN the license generator tool SHALL accept machine_id, features list, and expiration date as inputs
2. WHEN generating a license THEN the license generator tool SHALL create a JSON structure containing all license fields
3. WHEN generating a license THEN the license generator tool SHALL sign the JSON content using the Private_Key with RSA-SHA256
4. WHEN generating a license THEN the license generator tool SHALL output a base64-encoded .lic file
5. WHEN the Private_Key is unavailable THEN the license generator tool SHALL display an error and refuse to generate

