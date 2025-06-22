#!/usr/bin/env python3
import requests
import json

# Test authentication
base_url = "http://localhost:8000/api/v1"

# Test login
login_data = {
    "username": "torukundesu0530@gmail.com",
    "password": "test123"  # You'll need to replace with actual password
}

print("Testing login...")
login_response = requests.post(
    f"{base_url}/auth/login",
    data=login_data,
    headers={"Content-Type": "application/x-www-form-urlencoded"}
)

print(f"Login status: {login_response.status_code}")
if login_response.status_code == 200:
    tokens = login_response.json()
    print(f"Access token received: {tokens['access_token'][:20]}...")
    
    # Test profile endpoint
    print("\nTesting profile endpoint...")
    profile_response = requests.get(
        f"{base_url}/users/profile",
        headers={"Authorization": f"Bearer {tokens['access_token']}"}
    )
    print(f"Profile status: {profile_response.status_code}")
    if profile_response.status_code == 200:
        print(f"Profile data: {json.dumps(profile_response.json(), indent=2)}")
    else:
        print(f"Profile error: {profile_response.text}")
        
    # Test profile update
    print("\nTesting profile update...")
    update_data = {
        "display_name": "Test User",
        "love_theme_preference": "pink"
    }
    update_response = requests.put(
        f"{base_url}/users/profile",
        json=update_data,
        headers={"Authorization": f"Bearer {tokens['access_token']}"}
    )
    print(f"Update status: {update_response.status_code}")
    if update_response.status_code == 200:
        print(f"Updated data: {json.dumps(update_response.json(), indent=2)}")
    else:
        print(f"Update error: {update_response.text}")
else:
    print(f"Login error: {login_response.text}")