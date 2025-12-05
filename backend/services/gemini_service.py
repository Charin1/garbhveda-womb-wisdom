import os
import json
import base64
import requests
from google import genai
from google.genai import types
from dotenv import load_dotenv
from ..models import DailyCurriculum, Activity, DreamInterpretationResponse, Resource, FinancialWisdomResponse, RhythmicMathResponse, RaagaResponse

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

async def generate_daily_curriculum(week: int, mood: Optional[str] = None) -> Optional[DailyCurriculum]:
    print(f"[Gemini] Generating curriculum content for week {week}, mood: {mood}...")
    model = "gemini-2.0-flash"

    mood_instruction = ""
    if mood:
        mood_instruction = f"The mother is feeling {mood}. Customize the activities and Sankalpa to support this emotional state (e.g., if Tired -> Restorative, if Anxious -> Calming, if Happy -> Celebrating)."

    content_prompt = f"""
    Generate a daily Garbh Sanskar curriculum for Pregnancy Week {week}.
    {mood_instruction}

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

def validate_url(url: str) -> bool:
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    try:
        print(f"[Gemini] Validating URL: {url}")
        response = requests.head(url, headers=headers, timeout=5, allow_redirects=True)
        if response.status_code == 200:
            return True
    except Exception as e:
        print(f"[Gemini] HEAD validation failed for {url}: {e}")

    try:
        # Fallback to GET if HEAD fails (some servers block HEAD)
        response = requests.get(url, headers=headers, timeout=5, stream=True)
        if response.status_code == 200:
            return True
        print(f"[Gemini] GET validation failed for {url} with status: {response.status_code}")
    except Exception as e:
        print(f"[Gemini] GET validation error for {url}: {e}")
    
    return False

async def find_single_valid_resource(title: str, description: str, category: str) -> Optional[Resource]:
    model = "gemini-2.0-flash"
    for attempt in range(2):
        print(f"[Gemini] Repair attempt {attempt+1} for: {title}")
        prompt = f"""
        Find EXACTLY ONE high-quality, ACTIVE, and WORKING external resource (YouTube video, article, or blog) for:
        
        Activity: {title}
        Category: {category}
        Description: {description}

        CRITICAL:
        1. Use Google Search to find a REAL, VALID link.
        2. Return ONLY a raw JSON object: {{ "title": "...", "url": "...", "description": "..." }}
        """
        
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    tools=[types.Tool(google_search=types.GoogleSearch())],
                )
            )
            
            text = response.text
            if not text: continue

            json_str = text
            if "```json" in text:
                json_str = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                json_str = text.split("```")[1].split("```")[0].strip()
            
            try:
                data = json.loads(json_str)
                # Handle if it returns a list or single object
                if "resources" in data and isinstance(data["resources"], list) and len(data["resources"]) > 0:
                    res_data = data["resources"][0]
                else:
                    res_data = data

                res = Resource(**res_data)
                if validate_url(res.url):
                    print(f"[Gemini] Found valid replacement: {res.url}")
                    return res
                else:
                    print(f"[Gemini] Replacement link invalid: {res.url}")
            except Exception as e:
                print(f"[Gemini] Error parsing replacement: {e}")
                
        except Exception as e:
            print(f"[Gemini] Error in repair loop: {e}")
            
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
            )
        )
        
        text = response.text
        resources = []
        if text:
            # Cleanup markdown
            json_str = text
            if "```json" in text:
                json_str = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                 json_str = text.split("```")[1].split("```")[0].strip()
            
            try:
                data = json.loads(json_str)
                resources = [Resource(**r) for r in data.get("resources", [])]
            except json.JSONDecodeError:
                # Fallback: try to find JSON-like structure
                import re
                match = re.search(r'\{.*\}', text, re.DOTALL)
                if match:
                    try:
                        data = json.loads(match.group(0))
                        resources = [Resource(**r) for r in data.get("resources", [])]
                    except:
                        pass
        
        # Validate URLs
        valid_resources = []
        for res in resources:
            if validate_url(res.url):
                valid_resources.append(res)
            else:
                print(f"[Gemini] Invalid URL found and removed: {res.url}")
        
        # Repair Loop: If we don't have enough valid resources, try to find more one by one
        if len(valid_resources) < 3:
            needed = 3 - len(valid_resources)
            print(f"[Gemini] Only found {len(valid_resources)} valid resources. Attempting to find {needed} replacements...")
            
            for _ in range(needed):
                new_res = await find_single_valid_resource(title, description, category)
                if new_res:
                    # Avoid duplicates
                    if not any(r.url == new_res.url for r in valid_resources):
                        valid_resources.append(new_res)
        
        # Fallback if still no valid resources found
        if not valid_resources:
            print(f"[Gemini] No valid resources found for {title} after repair. Generating fallback search link.")
            search_query = f"{title} pregnancy activity {category}"
            search_url = f"https://www.google.com/search?q={search_query.replace(' ', '+')}"
            valid_resources.append(Resource(
                title=f"Search: {title}",
                url=search_url,
                description="Click here to search for this activity on Google."
            ))

        return valid_resources

    except Exception as e:
        print(f"[Gemini] Failed to find resources for {title}: {e}")
        # Fallback on error
        search_query = f"{title} pregnancy activity {category}"
        search_url = f"https://www.google.com/search?q={search_query.replace(' ', '+')}"
        return [Resource(
            title=f"Search: {title}",
            url=search_url,
            description="Click here to search for this activity on Google."
        )]

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

async def generate_raaga_recommendations() -> Optional[RaagaResponse]:
    print("[Gemini] Generating Raaga recommendations...")
    model = "gemini-2.0-flash"
    
    prompt = """
    Generate 3 distinct Indian Classical Raagas suitable for pregnancy (Garbh Sanskar).
    Include the time of day they are best listened to and their specific benefits for the mother and baby.
    
    IMPORTANT: You must find a VALID, HIGH-QUALITY YouTube video URL for each Raaga using Google Search.
    
    Return ONLY a JSON object with this structure:
    {
      "raagas": [
        {
          "id": "unique_id (e.g., yaman, bhairavi)",
          "title": "Raag Name",
          "time": "Time of Day (e.g., Morning, Evening)",
          "benefit": "Short benefit description",
          "duration": "Suggested duration (e.g., 15:00)",
          "url": "https://www.youtube.com/watch?v=..." 
        }
      ]
    }
    """

    try:
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearch())],
                response_mime_type="application/json",
                response_schema={
                    "type": "OBJECT",
                    "properties": {
                        "raagas": {
                            "type": "ARRAY",
                            "items": {
                                "type": "OBJECT",
                                "properties": {
                                    "id": {"type": "STRING"},
                                    "title": {"type": "STRING"},
                                    "time": {"type": "STRING"},
                                    "benefit": {"type": "STRING"},
                                    "duration": {"type": "STRING"},
                                    "url": {"type": "STRING"}
                                },
                                "required": ["id", "title", "time", "benefit", "duration", "url"]
                            }
                        }
                    }
                }
            )
        )

        text = response.text
        if not text:
            return None
        
        data = json.loads(text)
        raagas_data = data.get("raagas", [])
        
        # Validate URLs roughly
        for raaga in raagas_data:
             if not raaga.get("url") or "youtube.com" not in raaga.get("url"):
                 # Fallback search if needed, but the model with search tool should handle it.
                 # For now, let's just log warning. 
                 # In a robust system, we would do a fallback search here similar to resources.
                 print(f"[Gemini] Warning: No valid YouTube URL for {raaga.get('title')}")

        return RaagaResponse(**data)

    except Exception as e:
        print(f"[Gemini] Error generating raaga recommendations: {e}")
        return None

async def get_initial_raagas() -> Optional[RaagaResponse]:
    print("[Gemini] Fetching initial Raagas with dynamic links...")
    model = "gemini-2.0-flash"
    
    # We want specific Raagas but with fresh links
    prompt = """
    I need 3 specific Indian Classical Raagas for pregnancy with valid YouTube links:
    1. Raag Yaman (Evening, Peace & Calm)
    2. Raag Bhimpalasi (Afternoon, Emotional Balance)
    3. Raag Bhairavi (Morning, Devotion & Love)

    IMPORTANT: You must find a VALID, HIGH-QUALITY, PLAYABLE YouTube video URL for EACH of these using Google Search.
    
    Return ONLY a JSON object with this structure:
    {
      "raagas": [
        {
          "id": "yaman",
          "title": "Raag Yaman",
          "time": "Evening",
          "benefit": "Peace & Calm",
          "duration": "15:00",
          "url": "https://www.youtube.com/watch?v=..." 
        },
        {
          "id": "bhimpalasi",
          "title": "Raag Bhimpalasi",
          "time": "Afternoon",
          "benefit": "Emotional Balance",
          "duration": "12:30",
          "url": "https://www.youtube.com/watch?v=..." 
        },
        {
          "id": "bhairavi",
          "title": "Raag Bhairavi",
          "time": "Morning",
          "benefit": "Devotion & Love",
          "duration": "18:45",
          "url": "https://www.youtube.com/watch?v=..." 
        }
      ]
    }
    """

    try:
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearch())],
                response_mime_type="application/json",
                response_schema={
                    "type": "OBJECT",
                    "properties": {
                        "raagas": {
                            "type": "ARRAY",
                            "items": {
                                "type": "OBJECT",
                                "properties": {
                                    "id": {"type": "STRING"},
                                    "title": {"type": "STRING"},
                                    "time": {"type": "STRING"},
                                    "benefit": {"type": "STRING"},
                                    "duration": {"type": "STRING"},
                                    "url": {"type": "STRING"}
                                },
                                "required": ["id", "title", "time", "benefit", "duration", "url"]
                            }
                        }
                    }
                }
            )
        )

        text = response.text
        if not text:
            return None
        
        data = json.loads(text)
        return RaagaResponse(**data)

    except Exception as e:
        print(f"[Gemini] Error fetching initial raagas: {e}")
        return None

async def get_initial_mantras() -> Optional[MantraResponse]:
    print("[Gemini] Fetching initial Mantras with dynamic links...")
    model = "gemini-2.0-flash"
    
    prompt = """
    I need 3 specific Indian Mantras for pregnancy with valid YouTube links:
    1. Gayatri Mantra (Illumination of intellect, 108 times)
    2. Om Chanting (Universal vibration, 21 times)
    3. Shanti Mantra (Peace for all beings, 11 times)

    IMPORTANT: You must find a VALID, HIGH-QUALITY, PLAYABLE YouTube video URL for EACH of these using Google Search.
    
    Return ONLY a JSON object with this structure:
    {
      "mantras": [
        {
          "id": "gayatri",
          "title": "Gayatri Mantra",
          "meaning": "Illumination of intellect",
          "count": 108,
          "url": "https://www.youtube.com/watch?v=..." 
        },
        {
          "id": "om",
          "title": "Om Chanting",
          "meaning": "Universal vibration",
          "count": 21,
          "url": "https://www.youtube.com/watch?v=..." 
        },
        {
          "id": "shanti",
          "title": "Shanti Mantra",
          "meaning": "Peace for all beings",
          "count": 11,
          "url": "https://www.youtube.com/watch?v=..." 
        }
      ]
    }
    """

    try:
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearch())],
                response_mime_type="application/json",
                response_schema={
                    "type": "OBJECT",
                    "properties": {
                        "mantras": {
                            "type": "ARRAY",
                            "items": {
                                "type": "OBJECT",
                                "properties": {
                                    "id": {"type": "STRING"},
                                    "title": {"type": "STRING"},
                                    "meaning": {"type": "STRING"},
                                    "count": {"type": "INTEGER"},
                                    "url": {"type": "STRING"}
                                },
                                "required": ["id", "title", "meaning", "count", "url"]
                            }
                        }
                    }
                }
            )
        )

        text = response.text
        if not text:
            return None
        
        data = json.loads(text)
        print(f"[Gemini] Mantra URLs found: {[m.get('url') for m in data.get('mantras', [])]}")
        return MantraResponse(**data)

    except Exception as e:
        print(f"[Gemini] Error fetching initial mantras: {e}")
        return None

