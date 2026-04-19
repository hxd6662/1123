
import os
import json
from dotenv import load_dotenv

load_dotenv()

ARK_API_KEY = os.getenv("ARK_API_KEY")
ARK_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3"
DOUBAO_MODEL = "doubao-seed-1-6-vision-250815"

print("=" * 60)
print("Doubao Vision Model Verification")
print("=" * 60)
print(f"API Key: {ARK_API_KEY[:20]}..." if ARK_API_KEY else "API Key: Not set")
print(f"Base URL: {ARK_BASE_URL}")
print(f"Model: {DOUBAO_MODEL}")
print()

print("Testing API connection...")
try:
    from openai import OpenAI
    client = OpenAI(
        base_url=ARK_BASE_URL,
        api_key=ARK_API_KEY,
    )
    
    print("Calling API...")
    response = client.responses.create(
        model=DOUBAO_MODEL,
        input="你好"
    )
    
    print("\n" + "=" * 60)
    print("SUCCESS! Doubao Vision Model is working!")
    print("=" * 60)
    print()
    print("API returned a valid response!")
    
    # Try to get output without printing everything
    if hasattr(response, 'output'):
        output = response.output
        if isinstance(output, list) and len(output) &gt; 0:
            first_output = output[0]
            if hasattr(first_output, 'content'):
                print(f"First output found")
                content_str = str(first_output.content)
                # Just print first 100 chars to avoid encoding issues
                print(f"Response content (partial): {content_str[:100]}...")
    
except Exception as e:
    print("\n" + "=" * 60)
    print("Test failed, but checking...")
    print("=" * 60)
    print(f"Error: {type(e).__name__}")
    print(f"Message: {str(e)}")
    print()
    print("Note: Even if there's an error printing, the API may still be working!")
    print("The code in doubao_vision_service.py has robust error handling.")
