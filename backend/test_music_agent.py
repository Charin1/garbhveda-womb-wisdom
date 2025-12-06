import asyncio
import os
import sys

# Add project root to path so we can import backend modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.services import gemini_service

async def test_raaga_generation():
    print("Testing generate_raaga_recommendations...")
    raagas = await gemini_service.generate_raaga_recommendations()
    
    if raagas:
        print("\nSUCCESS: Generated Raagas:")
        for r in raagas.raagas:
            print(f"- {r.title} ({r.time}): {r.url}")
            if "youtube.com" in r.url or "youtu.be" in r.url:
                print("  [OK] Valid Link")
            else:
                print("  [FAIL] Invalid Link")
    else:
        print("\nFAILED: No raagas returned.")

if __name__ == "__main__":
    asyncio.run(test_raaga_generation())
