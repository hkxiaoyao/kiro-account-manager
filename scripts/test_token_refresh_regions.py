#!/usr/bin/env python3
"""
测试不同 region 的 Token 刷新

对比 us-east-1 和 ap-southeast-2 两个 region 的 Token 刷新是否都能成功
"""

import json
import requests
from pathlib import Path

def test_token_refresh(region: str, client_id: str, client_secret: str, refresh_token: str):
    """测试指定 region 的 Token 刷新"""
    
    url = f"https://oidc.{region}.amazonaws.com/token"
    
    headers = {
        "Content-Type": "application/json",
        "x-amz-user-agent": "aws-sdk-js/3.738.0 KiroIDE",
        "user-agent": "aws-sdk-js/3.738.0 ua/2.1 os/win32#10.0.26100 lang/js md/nodejs#22.21.1 api/sso-oidc#3.738.0 m/E KiroIDE"
    }
    
    body = {
        "clientId": client_id,
        "clientSecret": client_secret,
        "grantType": "refresh_token",
        "refreshToken": refresh_token
    }
    
    print(f"\n{'='*60}")
    print(f"测试 Region: {region}")
    print(f"{'='*60}")
    print(f"URL: {url}")
    
    try:
        response = requests.post(url, headers=headers, json=body, timeout=10)
        
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ 刷新成功！")
            print(f"  - accessToken: {result.get('accessToken', '')[:50]}...")
            print(f"  - expiresIn: {result.get('expiresIn')} 秒")
            print(f"  - tokenType: {result.get('tokenType')}")
            return True
        else:
            print(f"❌ 刷新失败！")
            print(f"  - 错误: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ 请求异常: {e}")
        return False

def main():
    # 从导入模板读取测试数据
    template_path = Path(__file__).parent.parent / "enterprise-import.json"
    
    if not template_path.exists():
        print(f"❌ 找不到测试数据文件: {template_path}")
        return
    
    with open(template_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    client_id = data['clientId']
    client_secret = data['clientSecret']
    refresh_token = data['refreshToken']
    original_region = data['region']
    
    print("="*60)
    print("Token 刷新 Region 测试")
    print("="*60)
    print(f"原始 Region: {original_region}")
    print(f"ClientId: {client_id}")
    print(f"ClientSecret: {client_secret[:50]}...")
    print(f"RefreshToken: {refresh_token[:50]}...")
    
    # 测试两个 region
    regions = ["us-east-1", "ap-southeast-2"]
    results = {}
    
    for region in regions:
        results[region] = test_token_refresh(region, client_id, client_secret, refresh_token)
    
    # 总结
    print(f"\n{'='*60}")
    print("测试结果总结")
    print(f"{'='*60}")
    
    for region, success in results.items():
        status = "✅ 成功" if success else "❌ 失败"
        print(f"{region:20s} - {status}")
    
    print(f"\n{'='*60}")
    print("结论")
    print(f"{'='*60}")
    
    if all(results.values()):
        print("✅ 所有 region 都可以刷新 Token")
        print("   说明：Token 刷新不限制 region")
    elif results["ap-southeast-2"] and not results["us-east-1"]:
        print("⚠️  只有 ap-southeast-2 可以刷新")
        print("   说明：必须使用账号注册时的 region")
    elif results["us-east-1"] and not results["ap-southeast-2"]:
        print("⚠️  只有 us-east-1 可以刷新")
        print("   说明：可能账号是在 us-east-1 注册的")
    else:
        print("❌ 所有 region 都失败")
        print("   说明：Token 可能已过期或无效")

if __name__ == "__main__":
    main()
