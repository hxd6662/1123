import os
import base64
import json
from dotenv import load_dotenv
import requests
import hashlib
import hmac
from datetime import datetime
from urllib.parse import quote

load_dotenv()

class AliyunOCRService:
    def __init__(self):
        self.access_key_id = os.getenv("ALIYUN_OCR_ACCESS_KEY_ID")
        self.access_key_secret = os.getenv("ALIYUN_OCR_ACCESS_KEY_SECRET")
        self.endpoint = "ocr-api.cn-hangzhou.aliyuncs.com"
        self.region = "cn-hangzhou"
        self.api_version = "2021-07-07"
        self.is_available = self.access_key_id and self.access_key_secret and \
                         self.access_key_id != "your-aliyun-access-key-id"
    
    def _sign(self, params):
        sorted_params = sorted(params.items())
        canonicalized_query_string = '&'.join([f'{quote(k, safe="~")}={quote(v, safe="~")}' for k, v in sorted_params])
        
        string_to_sign = f'POST&%2F&{quote(canonicalized_query_string, safe="~")}'
        
        key = self.access_key_secret + '&'
        signature = hmac.new(key.encode('utf-8'), string_to_sign.encode('utf-8'), hashlib.sha1).digest()
        signature = base64.b64encode(signature).decode('utf-8')
        
        return signature, canonicalized_query_string
    
    def recognize_text(self, image_data: bytes = None, image_url: str = None) -> dict:
        if not self.is_available:
            return {
                "text": "阿里云OCR服务未配置，这是模拟识别结果。\n在实际应用中，这里会调用阿里云OCR API。",
                "confidence": 0.95,
                "lines": [
                    {"text": "题目：解方程 2x + 5 = 15", "confidence": 0.98},
                    {"text": "A. x=5", "confidence": 0.96},
                    {"text": "B. x=10", "confidence": 0.95}
                ]
            }
        
        try:
            params = {
                "Action": "RecognizeGeneral",
                "Format": "JSON",
                "Version": self.api_version,
                "SignatureMethod": "HMAC-SHA1",
                "SignatureVersion": "1.0",
                "SignatureNonce": str(int(datetime.now().timestamp() * 1000)),
                "Timestamp": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
                "AccessKeyId": self.access_key_id,
            }
            
            if image_url:
                params["Url"] = image_url
            
            signature, canonicalized_query_string = self._sign(params)
            
            url = f"https://{self.endpoint}/?{canonicalized_query_string}&Signature={quote(signature, safe='~')}"
            
            if image_data:
                response = requests.post(url, data=image_data, 
                                       headers={'Content-Type': 'application/octet-stream'}, 
                                       timeout=30)
            else:
                response = requests.post(url, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                
                if "Code" in result and result["Code"] != "":
                    return {
                        "error": result.get("Message", "OCR recognition failed"),
                        "code": result.get("Code"),
                        "raw_response": result
                    }
                
                data_str = result.get("Data", "{}")
                try:
                    data = json.loads(data_str) if isinstance(data_str, str) else data_str
                except:
                    data = {}
                
                texts = []
                lines = []
                
                content = data.get("content", "")
                if content:
                    texts.append(content)
                
                prism_words_info = data.get("prism_wordsInfo", [])
                for word_info in prism_words_info:
                    word_text = word_info.get("word", "")
                    prob = word_info.get("prob", 99) / 100.0
                    if word_text:
                        lines.append({
                            "text": word_text,
                            "confidence": prob
                        })
                
                if not texts and lines:
                    texts = [line["text"] for line in lines]
                
                return {
                    "text": "\n".join(texts),
                    "confidence": 0.95,
                    "lines": lines,
                    "raw_response": result
                }
            else:
                return {"error": f"HTTP Error: {response.status_code}", "details": response.text}
                
        except Exception as e:
            return {
                "error": f"OCR Error: {str(e)}",
                "text": "这是模拟识别结果（阿里云OCR调用失败）。\n题目：解方程 2x + 5 = 15"
            }

_aliyun_ocr_service = None

def get_aliyun_ocr_service() -> AliyunOCRService:
    global _aliyun_ocr_service
    if _aliyun_ocr_service is None:
        _aliyun_ocr_service = AliyunOCRService()
    return _aliyun_ocr_service
