import asyncio
import httpx

async def test_dad_joke():
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        try:
            print("Testing /api/dad-joke endpoint...")
            response = await client.get("/api/dad-joke")
            if response.status_code == 200:
                print("SUCCESS: Received joke:", response.json().get("joke"))
            else:
                print(f"FAILED: Status {response.status_code}, Response: {response.text}")
        except Exception as e:
            print(f"ERROR: Could not connect to backend: {e}")

if __name__ == "__main__":
    asyncio.run(test_dad_joke())
