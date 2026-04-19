#!/usr/bin/env python3
"""
最终测试修复后的OCR服务
"""

import os
import sys
from dotenv import load_dotenv
from PIL import Image, ImageDraw
import io

load_dotenv()

print("=" * 70)
print("最终测试修复后的OCR服务")
print("=" * 70)

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.services.ocr_service import get_aliyun_ocr_service

ocr_service = get_aliyun_ocr_service()

print("\n服务状态:")
print(f"  可用: {ocr_service.is_available}")
print(f"  Access Key ID: {ocr_service.access_key_id[:15]}...")
print(f"  端点: {ocr_service.endpoint}")

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

# 测试OCR识别
print("\n调用OCR识别...")
result = ocr_service.recognize_text(image_data=img_byte_arr)

if "error" in result:
    print(f"❌ OCR识别失败:")
    print(f"  错误: {result.get('error')}")
    if "code" in result:
        print(f"  代码: {result.get('code')}")
    if "raw_response" in result:
        print(f"  原始响应: {result.get('raw_response')}")
else:
    print(f"✅ OCR识别成功!")
    print(f"\n识别结果:")
    print(f"  {'-' * 50}")
    print(f"  {result.get('text', '无文本')}")
    print(f"  {'-' * 50}")
    print(f"\n详细信息:")
    print(f"  置信度: {result.get('confidence', 0)}")
    print(f"  识别行数: {len(result.get('lines', []))}")
    
    lines = result.get('lines', [])
    if lines:
        print(f"\n识别的文字行:")
        for i, line in enumerate(lines, 1):
            print(f"  {i}. {line.get('text')} (置信度: {line.get('confidence'):.2f})")

print("\n" + "=" * 70)
print("测试完成")
print("=" * 70)
