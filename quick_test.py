
import os
import sys
from dotenv import load_dotenv

load_dotenv()

ARK_API_KEY = os.getenv("ARK_API_KEY")
ARK_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3"
DOUBAO_MODEL = "doubao-seed-1-6-vision-250815"

print(f"Testing model directly with simple approach")
print("="*60)
print(f"API Key: {ARK_API_KEY[:20]}..." if ARK_API_KEY else "API Key: Not set")
print(f"Base URL: {ARK_BASE_URL}")
print(f"Model: {DOUBAO_MODEL}")
print()

print("Trying with OpenAI SDK...")
try:
    from openai import OpenAI
    print("OpenAI imported successfully")
    client = OpenAI(
        base_url=ARK_BASE_URL,
        api_key=ARK_API_KEY,
    )
    print("Client created")
    print()

    # 1. First test with simple text query (without image)
    print("Test 1: Simple text query...")
    try:
        response = client.responses.create(
            model=DOUBAO_MODEL,
            input="你好，请用一句话介绍自己"
        )
        print("Response received!")
        print(str(response))
        print()
    except Exception as e:
        print(f"Test 1 failed: {e}")
        print()
        import traceback
        traceback.print_exc()

    print()

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()

print()
print("Done.")
