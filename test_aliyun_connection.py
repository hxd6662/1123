#!/usr/bin/env python3
"""
详细测试阿里云OCR服务连接
"""

import os
import sys
import base64
from dotenv import load_dotenv
from PIL import Image, ImageDraw, ImageFont
import io

load_dotenv()

print("=" * 70)
print("阿里云OCR服务连接测试")
print("=" * 70)

# 1. 检查环境变量配置
print("\n[1/5] 检查环境变量配置...")
access_key_id = os.getenv("ALIYUN_OCR_ACCESS_KEY_ID")
access_key_secret = os.getenv("ALIYUN_OCR_ACCESS_KEY_SECRET")
ocr_provider = os.getenv("OCR_PROVIDER")

print(f"  OCR_PROVIDER: {ocr_provider}")
print(f"  Access Key ID: {access_key_id[:15] if access_key_id else '未配置'}...")
print(f"  Access Key Secret: {access_key_secret[:15] if access_key_secret else '未配置'}...")

if not access_key_id or not access_key_secret:
    print("  ✗ 阿里云OCR配置不完整")
    sys.exit(1)
elif access_key_id == "your-aliyun-access-key-id":
    print("  ✗ 请配置真实的阿里云Access Key")
    sys.exit(1)
else:
    print("  ✓ 阿里云OCR配置已完成")

# 2. 检查依赖库
print("\n[2/5] 检查依赖库...")
try:
    import requests
    print("  ✓ requests 已安装")
except ImportError:
    print("  ✗ requests 未安装")
    sys.exit(1)

try:
    from PIL import Image, ImageDraw
    print("  ✓ Pillow 已安装")
except ImportError:
    print("  ✗ Pillow 未安装")
    print("  安装命令: pip install pillow")
    sys.exit(1)

# 3. 导入并测试阿里云OCR服务
print("\n[3/5] 测试阿里云OCR服务...")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from src.services.ocr_service import get_aliyun_ocr_service
    ocr_service = get_aliyun_ocr_service()
    print("  ✓ 成功导入阿里云OCR服务")
    print(f"  服务可用状态: {ocr_service.is_available}")
except Exception as e:
    print(f"  ✗ 导入失败: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# 4. 创建测试图片
print("\n[4/5] 创建测试图片...")
try:
    img = Image.new('RGB', (400, 200), color='white')
    draw = ImageDraw.Draw(img)
    
    try:
        font = ImageFont.truetype("arial.ttf", 30)
    except:
        font = ImageFont.load_default()
    
    draw.text((50, 50), "Hello World!", fill='black', font=font)
    draw.text((50, 100), "测试文本 123", fill='black', font=font)
    
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr = img_byte_arr.getvalue()
    
    print("  ✓ 测试图片创建成功")
    print(f"  图片大小: {len(img_byte_arr)} 字节")
except Exception as e:
    print(f"  ✗ 创建测试图片失败: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# 5. 测试OCR识别
print("\n[5/5] 测试OCR识别...")
try:
    print("  正在调用阿里云OCR API...")
    result = ocr_service.recognize_text(image_data=img_byte_arr)
    
    if "error" in result:
        print(f"  ✗ OCR识别失败")
        print(f"  错误信息: {result.get('error')}")
        if "code" in result:
            print(f"  错误代码: {result.get('code')}")
        if "raw_response" in result:
            print(f"  原始响应: {result.get('raw_response')}")
    else:
        print("  ✓ OCR识别成功！")
        print(f"\n  识别结果:")
        print(f"  {'-' * 50}")
        print(f"  {result.get('text', '无文本')}")
        print(f"  {'-' * 50}")
        print(f"\n  详细信息:")
        print(f"  置信度: {result.get('confidence', 0)}")
        print(f"  识别行数: {len(result.get('lines', []))}")
        
except Exception as e:
    print(f"  ✗ OCR测试异常: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 70)
print("测试完成")
print("=" * 70)
