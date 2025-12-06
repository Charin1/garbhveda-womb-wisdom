
import requests
import json
import asyncio

URL = "http://localhost:8000/api/vedic-names"

def test_name_generation():
    payload = {
        "gender": "Girl",
        "starting_letter": "A",
        "preference": "Modern"
    }
    
    try:
        print(f"Testing {URL} with payload: {payload}")
        response = requests.post(URL, json=payload)
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            names = data.get('names', [])
            print(f"Success! Received {len(names)} names:")
            for n in names:
                print(f"- {n.get('name')}: {n.get('meaning')}")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Connection Failed: {e}")

if __name__ == "__main__":
    test_name_generation()
