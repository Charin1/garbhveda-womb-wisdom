import asyncio
import sys
import os

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.services import llm_service
from backend.main import get_initial_mantras

async def test_refresh_variability():
    print("--- Test Run 1 ---")
    res1 = await llm_service.get_initial_mantras()
    titles1 = [m.title for m in res1.mantras]
    print(f"Titles 1: {titles1}")

    print("\n--- Test Run 2 ---")
    res2 = await llm_service.get_initial_mantras()
    titles2 = [m.title for m in res2.mantras]
    print(f"Titles 2: {titles2}")

    # Check for set difference
    # Ideally, they should not be identical sets (probability of picking same 3 from 10 twice is low)
    if set(titles1) == set(titles2):
        print("\n[WARNING] Sets are identical. Might be bad luck (1/120 chance) or logic fail.")
    else:
        print("\n[SUCCESS] Mantra sets changed! Variety achieved.")
    
    # Also verify valid counts
    if len(titles1) == 3 and len(titles2) == 3:
         print("[SUCCESS] Returned exactly 3 mantras per request.")

if __name__ == "__main__":
    asyncio.run(test_refresh_variability())
