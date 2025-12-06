import asyncio
import os
import sys

# Add project root to path so we can import backend modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.services import gemini_service

async def test_initial_music():
    print("Testing get_initial_raagas...")
    raagas = await gemini_service.get_initial_raagas()
    
    if raagas:
        print("\nSUCCESS: Initial Raagas:")
        for r in raagas.raagas:
            print(f"- {r.title}: {r.url}")
            if "youtube.com/watch" in r.url or "youtu.be/" in r.url:
                print("  [OK] Valid Video Link")
            else:
                print("  [FAIL] Search/Invalid Link")
    else:
        print("\nFAILED: No initial raagas returned.")

    print("\nTesting get_initial_mantras...")
    mantras = await gemini_service.get_initial_mantras()
    
    if mantras:
        print("\nSUCCESS: Initial Mantras:")
        for m in mantras.mantras:
            print(f"- {m.title}: {m.url}")
            if "youtube.com/watch" in m.url or "youtu.be/" in m.url:
                print("  [OK] Valid Video Link")
            else:
                print("  [FAIL] Search/Invalid Link")
    else:
        print("\nFAILED: No initial mantras returned.")

if __name__ == "__main__":
    asyncio.run(test_initial_music())
