import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), "../.."))

from backend.services import llm_service
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env.local"))

async def test_audio_generation():
    print("Testing generate_audio...")
    text = "Om Shanti Shanti Shanti"
    
    # We need to ensure the service is configured (api key etc)
    # The service module loads it from env on import if I recall, 
    # but llm_service uses client initialized at module level.
    # Let's check if we need to set API key manually if env loading failed.
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Warning: GEMINI_API_KEY not found in env")
        
    try:
        audio = await llm_service.generate_audio(text)
        if audio:
            print(f"Success! Generated {len(audio)} bytes.")
        else:
            print("Failed: generate_audio returned None")
    except Exception as e:
        print(f"Exception during test: {e}")

if __name__ == "__main__":
    asyncio.run(test_audio_generation())
