import requests
import json

# Test login endpoint
url = "http://localhost:8000/auth/login"
data = {
    "email": "alice@example.com",
    "password": "password"
}

try:
    response = requests.post(url, data=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")