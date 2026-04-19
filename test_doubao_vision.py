
import os
import sys
import base64
import asyncio
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

ARK_API_KEY = os.getenv("ARK_API_KEY")
ARK_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3"
DOUBAO_MODEL = "doubao-seed-1-6-vision-250815"

print("=" * 60)
print("豆包视觉模型测试")
print("=" * 60)
print(f"API Key: {ARK_API_KEY[:20]}..." if ARK_API_KEY else "API Key: 未设置")
print(f"Base URL: {ARK_BASE_URL}")
print(f"Model: {DOUBAO_MODEL}")
print()

try:
    print("1. 初始化 OpenAI 客户端...")
    client = OpenAI(
        base_url=ARK_BASE_URL,
        api_key=ARK_API_KEY,
    )
    print("   ✓ 客户端初始化成功")
    print()
    
    print("2. 准备测试输入 (使用公开测试图片)...")
    test_input = [
        {
            "role": "user",
            "content": [
                {
                    "type": "input_image",
                    "image_url": "https://ark-project.tos-cn-beijing.volces.com/doc_image/ark_demo_img_1.png"
                },
                {
                    "type": "input_text",
                    "text": "你看见了什么？"
                },
            ],
        }
    ]
    print("   ✓ 测试输入准备完成")
    print()
    
    print("3. 调用豆包视觉API...")
    print("   请稍候，正在等待响应...")
    print()
    
    response = client.responses.create(
        model=DOUBAO_MODEL,
        input=test_input
    )
    
    print("=" * 60)
    print("API 调用成功！")
    print("=" * 60)
    print()
    
    print("4. 原始响应内容：")
    print("-" * 60)
    print(response)
    print("-" * 60)
    print()
    
    print("5. 解析后的输出：")
    print("-" * 60)
    if hasattr(response, 'output'):
        output = response.output
        if isinstance(output, list) and len(output) > 0:
            for i, item in enumerate(output):
                print(f"输出项 {i+1}:")
                if hasattr(item, 'content'):
                    print(f"  Content: {item.content}")
                else:
                    print(f"  Value: {str(item)}")
        else:
            print(f"Output: {str(output)}")
    print("-" * 60)
    print()
    
    print("=" * 60)
    print("✓ 豆包视觉模型测试成功！")
    print("=" * 60)
    
except Exception as e:
    print("=" * 60)
    print("✗ 测试失败")
    print("=" * 60)
    print(f"错误类型: {type(e).__name__}")
    print(f"错误信息: {str(e)}")
    print()
    import traceback
    print("详细错误信息：")
    print("-" * 60)
    traceback.print_exc()
    print("-" * 60)
    sys.exit(1)

