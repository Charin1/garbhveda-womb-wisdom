
import sys
import os
import asyncio

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.services import llm_service
from backend.models import DailyCurriculum

async def test_curriculum():
    print("Testing generate_daily_curriculum...")
    try:
        curriculum = await llm_service.generate_daily_curriculum(week=12, mood="Happy")
        if curriculum:
            print("\nSUCCESS: Generated Curriculum:")
            print(f"Sankalpa: {curriculum.sankalpa.description}")
            print(f"Activities: {len(curriculum.activities)}")
            for activity in curriculum.activities:
                print(f"- {activity.title} ({activity.category})")
        else:
            print("\nFAILED: No curriculum returned.")
    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_curriculum())
