
import os
import sys
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

ARK_API_KEY = os.getenv("ARK_API_KEY")
ARK_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3"
DOUBAO_MODEL = "doubao-seed-1-6-vision-250815"

print("=" * 60)
print("Testing Doubao Vision Model")
print("=" * 60)
print(f"API Key: {ARK_API_KEY[:20]}..." if ARK_API_KEY else "API Key: not set")
print(f"Base URL: {ARK_BASE_URL}")
print(f"Model: {DOUBAO_MODEL}")
print()

try:
    print("Step 1: Initializing OpenAI client...")
    client = OpenAI(
        base_url=ARK_BASE_URL,
        api_key=ARK_API_KEY,
    )
    print("Client initialized successfully")
    print()
    
    print("Step 2: Preparing test input...")
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
    print("Test input ready")
    print()
    
    print("Step 3: Calling Doubao Vision API...")
    print("Please wait for response...")
    print()
    
    response = client.responses.create(
        model=DOUBAO_MODEL,
        input=test_input
    )
    
    print("=" * 60)
    print("API call successful!")
    print("=" * 60)
    print()
    
    print("Raw response:")
    print("-" * 60)
    print(response)
    print("-" * 60)
    print()
    
    print("Parsed output:")
    print("-" * 60)
    if hasattr(response, 'output'):
        output = response.output
        if isinstance(output, list) and len(output) > 0:
            for i, item in enumerate(output):
                print(f"Output {i+1}:")
                if hasattr(item, 'content'):
                    print(f"  Content: {item.content}")
                else:
                    print(f"  Value: {str(item)}")
        else:
            print(f"Output: {str(output)}")
    print("-" * 60)
    print()
    
    print("=" * 60)
    print("Doubao Vision Model Test Success!")
    print("=" * 60)
    
except Exception as e:
    print("=" * 60)
    print("Test failed")
    print("=" * 60)
    print(f"Error type: {type(e).__name__}")
    print(f"Error message: {str(e)}")
    print()
    import traceback
    print("Detailed error:")
    print("-" * 60)
    traceback.print_exc()
    print("-" * 60)
    sys.exit(1)
