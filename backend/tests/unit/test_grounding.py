import os
import sys

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))
import asyncio
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()
load_dotenv(".env.local")

api_key = os.getenv("VITE_GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

async def test_search():
    prompt = "Find 3 high-quality resources for a pregnancy activity: 'Prenatal Yoga for Back Pain'. Return as JSON."
    
    print("Sending request...")
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            tools=[types.Tool(google_search=types.GoogleSearch())],
            response_mime_type="application/json"
        )
    )
    
    print("\n--- Text Response ---")
    print(response.text)
    
    print("\n--- Grounding Metadata ---")
    if response.candidates and response.candidates[0].grounding_metadata:
        gm = response.candidates[0].grounding_metadata
        print(gm)
        if gm.grounding_chunks:
            print("\nChunks:")
            for chunk in gm.grounding_chunks:
                print(chunk)
        if gm.web_search_queries:
             print("\nQueries:", gm.web_search_queries)
    else:
        print("No grounding metadata found.")

if __name__ == "__main__":
    asyncio.run(test_search())
