
import os
import sys
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

ARK_API_KEY = os.getenv("ARK_API_KEY")
ARK_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3"
DOUBAO_MODEL = "doubao-seed-1-6-vision-250815"

output_file = open("test_result.txt", "w", encoding="utf-8")

def log(msg):
    print(msg)
    output_file.write(msg + "\n")
    output_file.flush()

log("=" * 60)
log("Testing Doubao Vision Model")
log("=" * 60)
log(f"API Key: {ARK_API_KEY[:20]}..." if ARK_API_KEY else "API Key: not set")
log(f"Base URL: {ARK_BASE_URL}")
log(f"Model: {DOUBAO_MODEL}")
log("")

try:
    log("Step 1: Initializing OpenAI client...")
    client = OpenAI(
        base_url=ARK_BASE_URL,
        api_key=ARK_API_KEY,
    )
    log("Client initialized successfully")
    log("")
    
    log("Step 2: Preparing test input...")
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
    log("Test input ready")
    log("")
    
    log("Step 3: Calling Doubao Vision API...")
    log("Please wait for response...")
    log("")
    
    response = client.responses.create(
        model=DOUBAO_MODEL,
        input=test_input
    )
    
    log("=" * 60)
    log("API call successful!")
    log("=" * 60)
    log("")
    
    log("Raw response:")
    log("-" * 60)
    log(str(response))
    log("-" * 60)
    log("")
    
    log("Parsed output:")
    log("-" * 60)
    if hasattr(response, 'output'):
        output = response.output
        if isinstance(output, list) and len(output) > 0:
            for i, item in enumerate(output):
                log(f"Output {i+1}:")
                if hasattr(item, 'content'):
                    log(f"  Content: {item.content}")
                else:
                    log(f"  Value: {str(item)}")
        else:
            log(f"Output: {str(output)}")
    log("-" * 60)
    log("")
    
    log("=" * 60)
    log("Doubao Vision Model Test Success!")
    log("=" * 60)
    
except Exception as e:
    log("=" * 60)
    log("Test failed")
    log("=" * 60)
    log(f"Error type: {type(e).__name__}")
    log(f"Error message: {str(e)}")
    log("")
    import traceback
    log("Detailed error:")
    log("-" * 60)
    log(traceback.format_exc())
    log("-" * 60)
    output_file.close()
    sys.exit(1)

output_file.close()
print("Test completed! Results saved to test_result.txt")
