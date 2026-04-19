
import os
import sys
from dotenv import load_dotenv

load_dotenv()

ARK_API_KEY = os.getenv("ARK_API_KEY")
ARK_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3"
DOUBAO_MODEL = "doubao-seed-1-6-vision-250815"

# Create a simple log file
import time
log_file = open(f"test_log_{int(time.time())}.txt", "w", encoding="utf-8")

def log(msg):
    print(msg)
    log_file.write(msg + "\n")
    log_file.flush()

log("=" * 60)
log("Testing Doubao Vision Model - API Only")
log("=" * 60)
log(f"API Key: {ARK_API_KEY[:20]}..." if ARK_API_KEY else "API Key: Not set")
log(f"Base URL: {ARK_BASE_URL}")
log(f"Model: {DOUBAO_MODEL}")
log("")

try:
    log("Step 1: Importing OpenAI...")
    from openai import OpenAI
    log("   OK")
    
    log("Step 2: Creating client...")
    client = OpenAI(
        base_url=ARK_BASE_URL,
        api_key=ARK_API_KEY,
    )
    log("   OK")
    
    log("")
    log("Step 3: Testing text-only query...")
    response = client.responses.create(
        model=DOUBAO_MODEL,
        input="你好，豆包！"
    )
    log("   Response received!")
    log("")
    log(str(response))
    log("")
    
    log("=" * 60)
    log("SUCCESS! API is working!")
    log("=" * 60)
    
except Exception as e:
    log("=" * 60)
    log("ERROR")
    log("=" * 60)
    log(f"Type: {type(e).__name__}")
    log(f"Message: {str(e)}")
    log("")
    import traceback
    log("Stack trace:")
    log("-" * 60)
    log(traceback.format_exc())
    log("-" * 60)
    log_file.close()
    sys.exit(1)

log_file.close()
print("\nDone! Log saved.")
