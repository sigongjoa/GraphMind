import requests

def test_lm_studio():
    try:
        response = requests.post(
            "http://localhost:1234/v1/chat/completions",
            json={
                "model": "local-model",
                "messages": [{"role": "user", "content": "Hello"}],
                "temperature": 0.7,
                "max_tokens": 50
            }
        )
        print(f"상태 코드: {response.status_code}")
        print(f"응답: {response.json()}")
    except Exception as e:
        print(f"오류 발생: {e}")

if __name__ == "__main__":
    test_lm_studio()