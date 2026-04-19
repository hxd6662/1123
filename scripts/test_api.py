import requests

BASE_URL = "http://localhost:8001"

def test_resources_api():
    print("测试学习资源API...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/resources/")
        print(f"状态码: {response.status_code}")
        print(f"响应头: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n响应数据:")
            print(f"成功: {data.get('success')}")
            if 'data' in data:
                print(f"资源数量: {len(data['data'].get('resources', []))}")
                print(f"总数: {data['data'].get('total')}")
                if data['data'].get('resources'):
                    print("\n第一个资源:")
                    print(data['data']['resources'][0])
        else:
            print(f"响应内容: {response.text}")
    except Exception as e:
        print(f"错误: {e}")

if __name__ == "__main__":
    test_resources_api()
