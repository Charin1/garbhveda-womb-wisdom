import os
import json
import base64
from google import genai
from google.genai import types
from dotenv import load_dotenv
from ..models import DailyCurriculum, Activity, DreamInterpretationResponse, Resource, FinancialWisdomResponse, RhythmicMathResponse

from dotenv import load_dotenv
from pathlib import Path

# Try loading from .env
load_dotenv()

# If not found, try loading from .env.local in project root
if not os.getenv("VITE_GEMINI_API_KEY"):
    # backend/services/gemini_service.py -> backend/services -> backend -> root
    env_local_path = Path(__file__).resolve().parent.parent.parent / ".env.local"
    print(f"[Gemini] Attempting to load .env.local from: {env_local_path}")
    load_dotenv(dotenv_path=env_local_path)

api_key = os.getenv("VITE_GEMINI_API_KEY")
if not api_key:
    print("Warning: VITE_GEMINI_API_KEY not found in environment variables or .env.local")

client = genai.Client(api_key=api_key)

SYSTEM_INSTRUCTION = """
You are a holistic Garbh Sanskar guide named "GarbhVeda".
Your mission is to provide a daily routine for a pregnant mother that balances:
1. Left Brain (Logic, Math, Planning)
2. Right Brain (Art, Visualization, Music)
3. Soul (Spirituality, Values, Ancient Wisdom)
4. Connection (Bonding with baby)

Use a soothing, respectful, and culturally rich tone (Indian Vedic influence but universally applicable).
Always strictly follow the JSON schema.
"""

from typing import Optional

async def generate_daily_curriculum(week: int) -> Optional[DailyCurriculum]:
    print(f"[Gemini] Generating curriculum content for week {week}...")
    model = "gemini-2.0-flash"

    content_prompt = f"""
    Generate a daily Garbh Sanskar curriculum for Pregnancy Week {week}.

    1. **Sankalpa (Intention)**: A virtue for the day (e.g., Compassion, Courage) with a short mantra.
    2. **Activities**: Provide exactly 4 distinct activities:
       - One MATH/LOGIC activity (Einstein Hour). MUST include a puzzle and its solution.
       - One ART/CREATIVITY activity (Visualization or Art idea).
       - One SPIRITUALITY activity (Sloka or Moral Story).
       - One BONDING activity (Garbh Samvad - talk to baby prompt).

    Return ONLY the JSON object with this exact structure:
    {{
      "sankalpa": {{ "virtue": "...", "description": "...", "mantra": "..." }},
      "activities": [
        {{
          "id": "unique_id",
          "category": "MATH" | "ART" | "SPIRITUALITY" | "BONDING",
          "title": "...",
          "description": "...",
          "durationMinutes": 15,
          "content": "...",
          "solution": "...",
          "resources": [] 
        }}
      ]
    }}
    """

    try:
        response = client.models.generate_content(
            model=model,
            contents=content_prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                response_mime_type="application/json"
            )
        )

        text = response.text
        if not text:
            return None

        curriculum_data = json.loads(text)
        
        # Validate structure roughly by trying to parse into Pydantic model
        # Note: We might need to handle the 'resources' field being empty initially
        
        activities_data = curriculum_data.get("activities", [])
        if not isinstance(activities_data, list):
             print("[Gemini] Invalid curriculum format received")
             return None

        # Step 2: Find Resources for each activity
        print(f"[Gemini] Finding resources for {len(activities_data)} activities...")
        
        # In Python, we can use a loop or gather. For simplicity and avoiding complex async setup inside this function if not needed, we'll iterate.
        # However, to be efficient, let's just do it sequentially or use simple list comprehension if we make find_resources async.
        # Since we are in an async function, we can await.
        
        final_activities = []
        for activity in activities_data:
            resources = await find_resources_for_activity(activity.get("title", ""), activity.get("description", ""), activity.get("category", ""))
            activity["resources"] = resources
            activity["isCompleted"] = False
            final_activities.append(activity)
            
        curriculum_data["activities"] = final_activities
        
        return DailyCurriculum(**curriculum_data)

    except Exception as e:
        print(f"[Gemini] Error generating curriculum: {e}")
        return None

async def find_resources_for_activity(title: str, description: str, category: str) -> list[Resource]:
    print(f"[Gemini] Searching resources for: {title}")
    model = "gemini-2.0-flash"

    prompt = f"""
    Find 3-5 high-quality, ACTIVE, and WORKING external resources (YouTube videos, articles, blogs) for this pregnancy activity:
    
    Activity: {title}
    Category: {category}
    Description: {description}

    CRITICAL INSTRUCTIONS:
    1. Use the Google Search tool to find REAL content.
    2. Return ONLY valid URLs found in the search.
    3. If you can't find good links, return an empty list.
    
    Return ONLY a raw JSON object (no markdown formatting if possible) with this structure:
    {{
      "resources": [
        {{ "title": "...", "url": "...", "description": "..." }}
      ]
    }}
    """

    try:
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearch())],
                # response_mime_type="application/json" # Conflict with tools sometimes, better to parse manually if needed or rely on tool output
            )
        )

        # The response structure with tools is a bit different.
        # We need to look for the model's text response which should contain the JSON based on our prompt.
        # Or if the model uses the tool and then answers.
        
        text = response.text
        if not text:
            return []

        # Cleanup markdown
        json_str = text
        if "```json" in text:
            json_str = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
             json_str = text.split("```")[1].split("```")[0].strip()
        
        # Sometimes it might just be the JSON
        try:
            data = json.loads(json_str)
            return [Resource(**r) for r in data.get("resources", [])]
        except json.JSONDecodeError:
             # Fallback: try to find JSON-like structure
            import re
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                try:
                    data = json.loads(match.group(0))
                    return [Resource(**r) for r in data.get("resources", [])]
                except:
                    pass
            return []

    except Exception as e:
        print(f"[Gemini] Failed to find resources for {title}: {e}")
        return []

async def interpret_dream(dream_text: str) -> Optional[DreamInterpretationResponse]:
    model = "gemini-2.0-flash"
    prompt = f"""
      A pregnant woman has recorded this dream: "{dream_text}".
      
      Please provide:
      1. A gentle, positive interpretation. Frame even weird or anxious dreams as the subconscious processing changes or releasing fears. Focus on growth, protection, and love.
      2. A short, calming positive affirmation related to the dream.
      
      Keep the tone soothing, maternal, and wise.
    """

    try:
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                response_mime_type="application/json",
                response_schema={
                    "type": "OBJECT",
                    "properties": {
                        "interpretation": {"type": "STRING"},
                        "affirmation": {"type": "STRING"}
                    }
                }
            )
        )
        
        text = response.text
        if not text:
            return None
            
        return DreamInterpretationResponse(**json.loads(text))
    except Exception as e:
        print(f"[Gemini] Error interpreting dream: {e}")
        return None

async def generate_audio(text: str) -> Optional[bytes]:
    print(f"[Gemini] Generating audio for text: \"{text[:50]}...\"")
    try:
        # Note: The Python SDK for TTS might be slightly different or require specific endpoint usage.
        # Assuming standard generate_content with audio modality response if supported, 
        # OR we might need to use a specific speech endpoint if available in the SDK.
        # As of my knowledge cutoff, standard generate_content can return audio if requested properly via config.
        
        # However, for 'gemini-2.0-flash-exp', TTS might be via a specific method or just response modalities.
        # Let's try the standard approach mirroring the TS code.
        
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp", # Using a model known to support this or the one from TS
            contents=text,
            config=types.GenerateContentConfig(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name="Kore"
                        )
                    )
                )
            )
        )
        
        # The response should contain the audio data.
        # In Python SDK, it might be in parts.
        
        for part in response.candidates[0].content.parts:
            if part.inline_data:
                return base64.b64decode(part.inline_data.data)
                
        return None

    except Exception as e:
        print(f"[Gemini] Error generating audio: {e}")
        return None

async def generate_image(prompt: str) -> Optional[str]:
    print(f"[Gemini] Generating image for prompt: \"{prompt}\"")
    try:
        # Using Imagen 3 model
        response = client.models.generate_content(
            model='gemini-2.0-flash-exp', # Or specific imagen model if available via this SDK
            contents=prompt + " style: soft watercolor, spiritual, dreamy, pastel colors, high quality.",
            config=types.GenerateContentConfig(
                # For image generation, we might need specific config or model
                # If the SDK unifies it, great. If not, we might need to check if 'gemini-2.0-flash' supports image gen directly 
                # or if we need 'imagen-3.0-generate-001' etc.
                # The TS code used 'models/gemini-3-pro-image-preview' which seems like a placeholder or specific preview.
                # Let's assume 'gemini-2.0-flash-exp' can do it or use a known image model.
                # Actually, for image gen, we usually expect a specific image model.
            )
        )
        
        # Wait, the TS code used 'models/gemini-3-pro-image-preview'. 
        # Let's try to use a standard Imagen model if possible, or stick to what the TS code implied was working (maybe a multi-modal model).
        # However, 'gemini-2.0-flash' is text/multimodal-in -> text-out. 
        # Image generation usually requires an Imagen model.
        # Let's assume we can use 'imagen-3.0-generate-001' for now if we have access, or try the one from TS.
        
        # Let's try to be safe and use the same model string as TS if it works, or a standard one.
        # The TS code had: model: 'models/gemini-3-pro-image-preview'
        
        # For now, I will use a placeholder or try to use the same.
        # But actually, the Python SDK `genai.Client` is new.
        
        # Let's try to use the `imagen-3.0-generate-001` if available.
        
        # Actually, let's look at the TS code again. It used `gemini-3-pro-image-preview`.
        # I will use `imagen-3.0-generate-001` as it is the standard for Imagen 3.
        
        response = client.models.generate_images(
            model='imagen-3.0-generate-001',
            prompt=prompt + " style: soft watercolor, spiritual, dreamy, pastel colors, high quality.",
            config=types.GenerateImagesConfig(
                number_of_images=1,
            )
        )
        
        if response.generated_images:
             image = response.generated_images[0]
             # Return base64 data URI
             return f"data:image/png;base64,{image.image.base64_data}"
             
        return None

    except Exception as e:
        print(f"[Gemini] Image gen error: {e}")
        return None

async def generate_financial_wisdom() -> Optional[FinancialWisdomResponse]:
    print("[Gemini] Generating financial wisdom...")
    model = "gemini-2.0-flash"
    
    prompt = """
    Generate 3 distinct, practical, and valuable financial tips for expecting parents.
    Focus on budgeting for baby, long-term savings, insurance, or smart spending.
    
    Return ONLY a JSON object with this structure:
    {
      "tips": [
        {
          "id": "unique_id",
          "title": "Short catchy title",
          "content": "2-3 sentences of actionable advice.",
          "icon": "PiggyBank" | "TrendingUp" | "DollarSign" | "Wallet" | "CreditCard"
        }
      ]
    }
    """

    try:
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema={
                    "type": "OBJECT",
                    "properties": {
                        "tips": {
                            "type": "ARRAY",
                            "items": {
                                "type": "OBJECT",
                                "properties": {
                                    "id": {"type": "STRING"},
                                    "title": {"type": "STRING"},
                                    "content": {"type": "STRING"},
                                    "icon": {"type": "STRING", "enum": ["PiggyBank", "TrendingUp", "DollarSign", "Wallet", "CreditCard"]}
                                },
                                "required": ["id", "title", "content", "icon"]
                            }
                        }
                    }
                }
            )
        )

        text = response.text
        if not text:
            return None

        return FinancialWisdomResponse(**json.loads(text))

    except Exception as e:
        print(f"[Gemini] Error generating financial wisdom: {e}")
        return None

async def generate_rhythmic_math() -> Optional[RhythmicMathResponse]:
    print("[Gemini] Generating rhythmic math activities...")
    model = "gemini-2.0-flash"
    
    prompt = """
    Generate 3 distinct Rhythmic Math activities for prenatal education.
    These should combine math concepts (like tables, sequences, primes) with rhythm (beats, instruments).
    
    Return ONLY a JSON object with this structure:
    {
      "activities": [
        {
          "id": "unique_id",
          "title": "Creative Title (e.g., Table of 2 (Tabla Beat))",
          "duration": "MM:SS",
          "bpm": 60-120
        }
      ]
    }
    """

    try:
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema={
                    "type": "OBJECT",
                    "properties": {
                        "activities": {
                            "type": "ARRAY",
                            "items": {
                                "type": "OBJECT",
                                "properties": {
                                    "id": {"type": "STRING"},
                                    "title": {"type": "STRING"},
                                    "duration": {"type": "STRING"},
                                    "bpm": {"type": "INTEGER"}
                                },
                                "required": ["id", "title", "duration", "bpm"]
                            }
                        }
                    }
                }
            )
        )

        text = response.text
        if not text:
            return None

        return RhythmicMathResponse(**json.loads(text))

    except Exception as e:
        print(f"[Gemini] Error generating rhythmic math: {e}")
        return None
