import asyncio
import os
import sys

# Add project root to path so we can import backend modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.services import gemini_service

async def test_audio():
    print("Testing generate_audio...")
    text = "Om.... Om.... Om.... Feel the vibration of the universe within you. Om...."
    audio = await gemini_service.generate_audio(text)
    
    if audio:
        print(f"\nSUCCESS: Generated {len(audio)} bytes of audio.")
    else:
        print("\nFAILED: Audio generation returned None.")

if __name__ == "__main__":
    asyncio.run(test_audio())
