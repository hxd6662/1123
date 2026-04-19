#!/usr/bin/env python3
"""
调试修复后的阿里云OCR API
"""

import os
import sys
import base64
import hashlib
import hmac
from datetime import datetime
from urllib.parse import quote
import requests
from dotenv import load_dotenv
from PIL import Image, ImageDraw
import io
import json

load_dotenv()

print("=" * 70)
print("修复后的阿里云OCR API调试")
print("=" * 70)

access_key_id = os.getenv("ALIYUN_OCR_ACCESS_KEY_ID")
access_key_secret = os.getenv("ALIYUN_OCR_ACCESS_KEY_SECRET")

print(f"\nAccess Key ID: {access_key_id}")
print(f"Access Key Secret: {access_key_secret[:10]}...")

# 创建测试图片
print("\n创建测试图片...")
img = Image.new('RGB', (400, 200), color='white')
draw = ImageDraw.Draw(img)
try:
    from PIL import ImageFont
    font = ImageFont.truetype("arial.ttf", 30)
except:
    font = ImageFont.load_default()
draw.text((50, 50), "Hello World!", fill='black', font=font)
draw.text((50, 100), "测试文本 123", fill='black', font=font)
img_byte_arr = io.BytesIO()
img.save(img_byte_arr, format='PNG')
img_byte_arr = img_byte_arr.getvalue()
print(f"图片大小: {len(img_byte_arr)} 字节")

# 构建请求参数（查询字符串）
print("\n构建查询参数...")
params = {
    "Action": "RecognizeGeneral",
    "Format": "JSON",
    "Version": "2021-07-07",
    "SignatureMethod": "HMAC-SHA1",
    "SignatureVersion": "1.0",
    "SignatureNonce": str(int(datetime.now().timestamp() * 1000)),
    "Timestamp": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
    "AccessKeyId": access_key_id,
}

print(f"\n查询参数:")
for k, v in params.items():
    print(f"  {k}: {v}")

# 签名
print("\n计算签名...")
sorted_params = sorted(params.items())
canonicalized_query_string = '&'.join([f'{quote(k, safe="~")}={quote(v, safe="~")}' for k, v in sorted_params])
string_to_sign = f'POST&%2F&{quote(canonicalized_query_string, safe="~")}'
key = access_key_secret + '&'
signature = hmac.new(key.encode('utf-8'), string_to_sign.encode('utf-8'), hashlib.sha1).digest()
signature = base64.b64encode(signature).decode('utf-8')
params["Signature"] = signature
print(f"签名: {signature[:30]}...")

# 构建最终URL
url = "https://ocr-api.cn-hangzhou.aliyuncs.com/?" + canonicalized_query_string + f'&Signature={quote(signature, safe="~")}'

print("\n发送请求...")
try:
    response = requests.post(url, data=img_byte_arr, 
                           headers={'Content-Type': 'application/octet-stream'},
                           timeout=30)
    print(f"状态码: {response.status_code}")
    print(f"响应头: {dict(response.headers)}")
    print(f"\n响应内容:")
    print(response.text)
    
    if response.status_code == 200:
        result = response.json()
        print(f"\n解析后的JSON:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
        if "Code" in result and result["Code"] != "":
            print(f"\n❌ API返回错误:")
            print(f"  Code: {result.get('Code')}")
            print(f"  Message: {result.get('Message')}")
        else:
            print(f"\n✅ API调用成功!")
            data_str = result.get("Data", "{}")
            try:
                data = json.loads(data_str) if isinstance(data_str, str) else data_str
                print(f"\n识别结果:")
                print(f"  Content: {data.get('content', '')[:100]}...")
                print(f"  文字块数量: {len(data.get('prism_wordsInfo', []))}")
            except Exception as e:
                print(f"  解析Data失败: {e}")
                
except Exception as e:
    print(f"请求异常: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 70)
