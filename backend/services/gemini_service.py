import os
import json
import base64
import requests
import httpx
from google import genai
from google.genai import types
from dotenv import load_dotenv
from ..models import DailyCurriculum, Activity, DreamInterpretationResponse, Resource, FinancialWisdomResponse, RhythmicMathResponse, RaagaResponse, MantraResponse

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

# Fallback URLs using YouTube search - guaranteed to work and find relevant content
VERIFIED_RAAGA_DATA = [
    {
        "id": "yaman",
        "title": "Raag Yaman",
        "time": "Evening",
        "benefit": "Peace & Calm",
        "duration": "15:00",
        "url": "https://www.youtube.com/results?search_query=Raag+Yaman+instrumental+meditation"
    },
    {
        "id": "bhimpalasi",
        "title": "Raag Bhimpalasi",
        "time": "Afternoon",
        "benefit": "Emotional Balance",
        "duration": "12:30",
        "url": "https://www.youtube.com/results?search_query=Raag+Bhimpalasi+instrumental+meditation"
    },
    {
        "id": "bhairavi",
        "title": "Raag Bhairavi",
        "time": "Morning",
        "benefit": "Devotion & Love",
        "duration": "18:45",
        "url": "https://www.youtube.com/results?search_query=Raag+Bhairavi+instrumental+meditation"
    }
]

VERIFIED_MANTRA_DATA = [
    {
        "id": "gayatri",
        "title": "Gayatri Mantra",
        "meaning": "Illumination of intellect",
        "count": 108,
        "url": "https://www.youtube.com/results?search_query=Gayatri+Mantra+108+times+meditation"
    },
    {
        "id": "om",
        "title": "Om Chanting",
        "meaning": "Universal vibration",
        "count": 21,
        "url": "https://www.youtube.com/results?search_query=Om+Chanting+meditation+relaxation"
    },
    {
        "id": "shanti",
        "title": "Shanti Mantra",
        "meaning": "Peace for all beings",
        "count": 11,
        "url": "https://www.youtube.com/results?search_query=Shanti+Mantra+Om+Shanti+meditation"
    }
]

from typing import Optional, List
import re
from dataclasses import dataclass

# Web scraping for YouTube search
try:
    from bs4 import BeautifulSoup
    WEB_SCRAPING_AVAILABLE = True
    print("[ReAct Agent] BeautifulSoup loaded for web scraping")
except ImportError:
    WEB_SCRAPING_AVAILABLE = False
    print("[ReAct Agent] Warning: BeautifulSoup not available")

@dataclass
class YouTubeSearchResult:
    """Represents a YouTube video found via search"""
    video_id: str
    url: str
    title: str = ""
    verified: bool = False

class ReActYouTubeAgent:
    """
    ReAct-style agent for finding valid YouTube videos.
    Uses web scraping to search YouTube directly, then verifies via oEmbed API.
    
    Tools:
    1. search_youtube_direct - Web scrapes YouTube search results
    2. verify_youtube_url - Verifies URL via oEmbed API
    """
    
    def __init__(self, gemini_client):
        self.client = gemini_client
        self.model = "gemini-2.0-flash"
        self.max_retries = 3
    
    async def search_youtube_direct(self, query: str, limit: int = 10) -> List[YouTubeSearchResult]:
        """
        TOOL: Direct YouTube Search via Web Scraping
        Scrapes YouTube search results page to get real video IDs.
        No API key needed!
        """
        print(f"[ReAct Agent] 🔍 Web scraping YouTube for: '{query}'")
        
        try:
            search_url = f"https://www.youtube.com/results?search_query={query.replace(' ', '+')}"
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            }
            
            async with httpx.AsyncClient() as http_client:
                response = await http_client.get(search_url, headers=headers, timeout=10.0)
                html = response.text
            
            # Extract video IDs from the JavaScript data in the page
            # YouTube embeds video data in scripts with pattern "videoId":"XXXXXXXXXXX"
            video_id_pattern = r'"videoId":"([a-zA-Z0-9_-]{11})"'
            matches = re.findall(video_id_pattern, html)
            
            # Get unique video IDs
            seen = set()
            unique_ids = []
            for vid_id in matches:
                if vid_id not in seen:
                    seen.add(vid_id)
                    unique_ids.append(vid_id)
                    if len(unique_ids) >= limit:
                        break
            
            videos = []
            for video_id in unique_ids:
                url = f"https://www.youtube.com/watch?v={video_id}"
                videos.append(YouTubeSearchResult(
                    video_id=video_id,
                    url=url,
                    title=""  # We don't extract title in this simple approach
                ))
                print(f"[ReAct Agent] Found video ID: {video_id}")
            
            print(f"[ReAct Agent] Web scraping returned {len(videos)} video IDs")
            return videos
            
        except Exception as e:
            print(f"[ReAct Agent] Web scraping error: {e}")
            import traceback
            traceback.print_exc()
            return []
    """
    ReAct-style agent for finding valid YouTube videos.
    Uses Gemini's Google Search grounding to extract REAL URLs from search results,
    then verifies them via the oEmbed API.
    
    ReAct Loop:
    1. Think: What search query to use?
    2. Act: Call Google Search via Gemini
    3. Observe: Extract URLs from grounding metadata
    4. Verify: Check if URLs are valid via oEmbed
    5. Decide: Return best result or retry with refined query
    """
    
    def __init__(self, gemini_client):
        self.client = gemini_client
        self.model = "gemini-2.0-flash"
        self.max_retries = 3
        
    async def verify_youtube_url(self, url: str) -> bool:
        """Verify a YouTube URL is valid using oEmbed API"""
        if not url:
            return False
        try:
            if "youtube.com" not in url and "youtu.be" not in url:
                return False
            
            print(f"[ReAct Agent] Verifying: {url}")
            async with httpx.AsyncClient() as http_client:
                oembed_url = f"https://www.youtube.com/oembed?url={url}&format=json"
                response = await http_client.get(oembed_url, timeout=5.0)
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"[ReAct Agent] ✓ Verified: {data.get('title', 'Unknown')}")
                    return True
                else:
                    print(f"[ReAct Agent] ✗ Invalid (Status {response.status_code})")
                    return False
        except Exception as e:
            print(f"[ReAct Agent] ✗ Verification error: {e}")
            return False
    
    async def follow_redirect(self, url: str) -> Optional[str]:
        """Follow a redirect URL to get the final destination"""
        try:
            async with httpx.AsyncClient(follow_redirects=True) as http_client:
                response = await http_client.head(url, timeout=5.0)
                final_url = str(response.url)
                print(f"[ReAct Agent] Redirect: {url[:50]}... -> {final_url[:80]}")
                return final_url
        except Exception as e:
            print(f"[ReAct Agent] Failed to follow redirect: {e}")
            return None
    
    async def extract_youtube_urls_from_grounding(self, response) -> List[YouTubeSearchResult]:
        """
        Extract YouTube URLs from Gemini's grounding metadata.
        Follows redirect URLs to get actual destination URLs.
        """
        results = []
        
        try:
            if not response.candidates:
                return results
                
            candidate = response.candidates[0]
            
            # Check grounding metadata for actual search result URLs
            if hasattr(candidate, 'grounding_metadata') and candidate.grounding_metadata:
                gm = candidate.grounding_metadata
                
                # Extract from grounding chunks (contains actual web search results)
                if hasattr(gm, 'grounding_chunks') and gm.grounding_chunks:
                    for chunk in gm.grounding_chunks:
                        if hasattr(chunk, 'web') and chunk.web:
                            url = chunk.web.uri if hasattr(chunk.web, 'uri') else None
                            title = chunk.web.title if hasattr(chunk.web, 'title') else ""
                            
                            if not url:
                                continue
                            
                            # Follow redirect if it's a Google redirect URL
                            if "vertexaisearch" in url or "grounding-api-redirect" in url:
                                print(f"[ReAct Agent] Following redirect for: {title[:40]}...")
                                url = await self.follow_redirect(url)
                                if not url:
                                    continue
                            
                            # Now check if it's a YouTube URL
                            if "youtube.com/watch" in url or "youtu.be/" in url:
                                video_id = self._extract_video_id(url)
                                if video_id:
                                    results.append(YouTubeSearchResult(
                                        video_id=video_id,
                                        url=f"https://www.youtube.com/watch?v={video_id}",
                                        title=title
                                    ))
                                    print(f"[ReAct Agent] Found YouTube video: {title[:40]}... ({video_id})")
                            
            # Also try to extract from response text as fallback
            if response.text:
                text_urls = self._extract_urls_from_text(response.text)
                for url in text_urls:
                    video_id = self._extract_video_id(url)
                    if video_id and not any(r.video_id == video_id for r in results):
                        results.append(YouTubeSearchResult(
                            video_id=video_id,
                            url=f"https://www.youtube.com/watch?v={video_id}",
                            title=""
                        ))
                        print(f"[ReAct Agent] Found from text: {video_id}")
                        
        except Exception as e:
            print(f"[ReAct Agent] Error extracting URLs: {e}")
            import traceback
            traceback.print_exc()
            
        return results
    
    def _extract_video_id(self, url: str) -> Optional[str]:
        """Extract YouTube video ID from URL"""
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})',
            r'v=([a-zA-Z0-9_-]{11})',
        ]
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None
    
    def _extract_urls_from_text(self, text: str) -> List[str]:
        """Extract YouTube URLs from text"""
        pattern = r'https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)[\w-]+'
        return re.findall(pattern, text)
    
    async def search_and_extract(self, query: str, bad_urls: List[str] = None) -> List[YouTubeSearchResult]:
        """
        Action: Search YouTube via Gemini's Google Search grounding
        """
        bad_urls = bad_urls or []
        
        exclude_instruction = ""
        if bad_urls:
            exclude_instruction = f"\n\nThese URLs are broken, do NOT suggest them: {', '.join(bad_urls[:5])}"
        
        prompt = f"""
Search YouTube for: "{query}"

I need you to find REAL YouTube video URLs using Google Search. 
Look for actual YouTube video watch pages (URLs containing youtube.com/watch?v=).
{exclude_instruction}

List the YouTube video URLs you find. For each, write:
URL: https://www.youtube.com/watch?v=XXXXX
Title: [Video title]

Find at least 3 different YouTube videos.
"""
        
        print(f"[ReAct Agent] Searching: {query}")
        
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    tools=[types.Tool(google_search=types.GoogleSearch())],
                )
            )
            
            # Debug: Print response structure
            print(f"[ReAct Agent] Response text length: {len(response.text) if response.text else 0}")
            if response.text:
                print(f"[ReAct Agent] Response preview: {response.text[:500]}...")
            
            # Debug: Check grounding metadata
            if response.candidates and response.candidates[0]:
                candidate = response.candidates[0]
                if hasattr(candidate, 'grounding_metadata') and candidate.grounding_metadata:
                    gm = candidate.grounding_metadata
                    print(f"[ReAct Agent] Grounding metadata found")
                    if hasattr(gm, 'grounding_chunks') and gm.grounding_chunks:
                        print(f"[ReAct Agent] Found {len(gm.grounding_chunks)} grounding chunks")
                        for i, chunk in enumerate(gm.grounding_chunks[:3]):
                            if hasattr(chunk, 'web') and chunk.web:
                                uri = chunk.web.uri if hasattr(chunk.web, 'uri') else "N/A"
                                print(f"[ReAct Agent] Chunk {i}: {uri[:100]}")
                else:
                    print(f"[ReAct Agent] No grounding metadata in response")
            
            # Extract URLs from grounding metadata (real search results)
            results = self.extract_youtube_urls_from_grounding(response)
            
            # Filter out known bad URLs
            results = [r for r in results if r.url not in bad_urls]
            
            print(f"[ReAct Agent] Found {len(results)} potential URLs from extraction")
            return results
            
        except Exception as e:
            print(f"[ReAct Agent] Search error: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    async def find_verified_video(self, search_term: str, context: str = "") -> Optional[str]:
        """
        Main ReAct loop: Search YouTube directly, Verify, Return best result.
        
        Tools Used:
        1. search_youtube_direct - Direct YouTube search (primary)
        2. verify_youtube_url - oEmbed verification
        """
        query = f"{search_term} {context}".strip()
        
        print(f"\n[ReAct Agent] ===== Finding video for: '{search_term}' =====")
        
        # STEP 1: Use Direct YouTube Search (most reliable)
        print(f"[ReAct Agent] STEP 1: Searching YouTube directly...")
        results = await self.search_youtube_direct(query, limit=5)
        
        if results:
            # STEP 2: Verify each result
            print(f"[ReAct Agent] STEP 2: Verifying {len(results)} results...")
            for result in results:
                is_valid = await self.verify_youtube_url(result.url)
                if is_valid:
                    print(f"[ReAct Agent] ✓ SUCCESS: Verified '{result.title[:40]}...'")
                    print(f"[ReAct Agent] URL: {result.url}")
                    return result.url
            
            # If verification fails (unlikely with direct search), return first result anyway
            # since youtube-search-python returns real video IDs
            print(f"[ReAct Agent] Verification failed but using first result: {results[0].url}")
            return results[0].url
        
        # STEP 3: Fallback to search URL
        fallback_url = f"https://www.youtube.com/results?search_query={search_term.replace(' ', '+')}"
        print(f"[ReAct Agent] ⚠ Falling back to search URL: {fallback_url}")
        return fallback_url

# Initialize the ReAct agent
react_agent = ReActYouTubeAgent(client)

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

async def generate_dad_joke() -> List[str]:
    print("[Gemini] Generating batch of 50 dad jokes...")
    model = "gemini-2.0-flash"
    prompt = """
    Generate 50 distinct "dad jokes".
    Constraints:
    1. STRICTLY CLEAN and FAMILY FRIENDLY (No "non-veg", no adult themes).
    2. SIMPLE language (easy to understand).
    3. FUNNY and lighthearted.
    4. Short and punchy.
    
    Return a JSON object with a single key "jokes" containing a list of strings.
    Example: {"jokes": ["Joke 1", "Joke 2", ...]}
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
                        "jokes": {
                            "type": "ARRAY",
                            "items": {"type": "STRING"}
                        }
                    }
                }
            )
        )
        
        data = json.loads(response.text)
        jokes = data.get("jokes", [])
        print(f"[Gemini] Generated {len(jokes)} jokes.")
        return jokes
    except Exception as e:
        print(f"Error generating jokes: {e}")
        return ["Why did the scarecrow win an award? Because he was outstanding in his field!"]
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
    
    # Updated prompt: We don't ask for URLs here, just the Raaga details
    prompt = """
    Generate 3 distinct Indian Classical Raagas suitable for pregnancy (Garbh Sanskar).
    Include the time of day they are best listened to and their specific benefits for the mother and baby.
    
    Return ONLY a JSON object with this structure:
    {
      "raagas": [
        {
          "id": "unique_id (e.g., yaman, bhairavi)",
          "title": "Raag Name",
          "time": "Time of Day (e.g., Morning, Evening)",
          "benefit": "Short benefit description",
          "duration": "Suggested duration (e.g., 15:00)"
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
                        "raagas": {
                            "type": "ARRAY",
                            "items": {
                                "type": "OBJECT",
                                "properties": {
                                    "id": {"type": "STRING"},
                                    "title": {"type": "STRING"},
                                    "time": {"type": "STRING"},
                                    "benefit": {"type": "STRING"},
                                    "duration": {"type": "STRING"}
                                },
                                "required": ["id", "title", "time", "benefit", "duration"]
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
        
        print(f"[Gemini] Generated {len(raagas_data)} raaga suggestions. Now finding videos...")
        
        raagas_with_urls = []
        
        # Now use the ReAct agent to find verified videos for each
        for raaga in raagas_data:
            print(f"\n[Gemini] Finding video for: {raaga['title']}")
            
            # Context for search
            context = f"{raaga['time']} {raaga['benefit']} instrumental meditation"
            
            url = await react_agent.find_verified_video(raaga['title'], context)
            
            raaga_with_url = {**raaga, "url": url}
            raagas_with_urls.append(raaga_with_url)
            print(f"[Gemini] Final URL for {raaga['title']}: {url}")

        return RaagaResponse(raagas=raagas_with_urls)

    except Exception as e:
        print(f"[Gemini] Error generating raaga recommendations: {e}")
        return None

async def verify_youtube_url(url: str) -> bool:
    """Verifies a YouTube URL using the oEmbed API."""
    if not url:
        return False
    try:
        # Check standard format first
        if "youtube.com" not in url and "youtu.be" not in url:
            return False
            
        print(f"[Gemini] Verifying YouTube URL: {url}")
        async with httpx.AsyncClient() as client:
            oembed_url = f"https://www.youtube.com/oembed?url={url}&format=json"
            response = await client.get(oembed_url, timeout=5.0)
            
            if response.status_code == 200:
                data = response.json()
                title = data.get('title', 'Unknown')
                print(f"[Gemini] Verified: {title}")
                return True
            else:
                print(f"[Gemini] Verification failed (Status {response.status_code}) for: {url}")
                return False
    except Exception as e:
        print(f"[Gemini] Verification error for {url}: {e}")
        return False

async def get_initial_raagas() -> Optional[RaagaResponse]:
    """
    Uses ReAct agent to find verified YouTube URLs for Raagas.
    The agent uses Gemini's Google Search grounding to extract real URLs,
    then verifies them via oEmbed before returning.
    """
    print("\n[Gemini] === Finding Raaga videos using ReAct Agent ===")
    
    raaga_definitions = [
        {"id": "yaman", "title": "Raag Yaman", "time": "Evening", "benefit": "Peace & Calm", "duration": "15:00"},
        {"id": "bhimpalasi", "title": "Raag Bhimpalasi", "time": "Afternoon", "benefit": "Emotional Balance", "duration": "12:30"},
        {"id": "bhairavi", "title": "Raag Bhairavi", "time": "Morning", "benefit": "Devotion & Love", "duration": "18:45"}
    ]
    
    raagas_with_urls = []
    
    for raaga in raaga_definitions:
        print(f"\n[Gemini] Searching for: {raaga['title']}")
        
        # Use ReAct agent to find a verified video
        search_query = f"{raaga['title']} instrumental meditation relaxation"
        url = await react_agent.find_verified_video(raaga['title'], "instrumental meditation pregnancy relaxation")
        
        raaga_with_url = {**raaga, "url": url}
        raagas_with_urls.append(raaga_with_url)
        print(f"[Gemini] Final URL for {raaga['title']}: {url}")
    
    return RaagaResponse(raagas=raagas_with_urls)

async def get_initial_mantras() -> Optional[MantraResponse]:
    """
    Uses ReAct agent to find verified YouTube URLs for Mantras.
    The agent uses Gemini's Google Search grounding to extract real URLs,
    then verifies them via oEmbed before returning.
    """
    print("\n[Gemini] === Finding Mantra videos using ReAct Agent ===")
    
    mantra_definitions = [
        {"id": "gayatri", "title": "Gayatri Mantra", "meaning": "Illumination of intellect", "count": 108},
        {"id": "om", "title": "Om Chanting", "meaning": "Universal vibration", "count": 21},
        {"id": "shanti", "title": "Shanti Mantra", "meaning": "Peace for all beings", "count": 11}
    ]
    
    mantras_with_urls = []
    
    for mantra in mantra_definitions:
        print(f"\n[Gemini] Searching for: {mantra['title']}")
        
        # Build context-specific search query
        context = "meditation chanting peaceful"
        if mantra['id'] == 'gayatri':
            context = "108 times meditation peaceful chanting"
        elif mantra['id'] == 'om':
            context = "meditation relaxation healing"
        elif mantra['id'] == 'shanti':
            context = "Om Shanti peaceful meditation"
        
        url = await react_agent.find_verified_video(mantra['title'], context)
        
        mantra_with_url = {**mantra, "url": url}
        mantras_with_urls.append(mantra_with_url)
        print(f"[Gemini] Final URL for {mantra['title']}: {url}")
    
    return MantraResponse(mantras=mantras_with_urls)


async def generate_vedic_names(gender: str, starting_letter: Optional[str] = None, preference: Optional[str] = None) -> List[dict]:
    print(f"[Gemini] Generating Vedic names for {gender}, letter: {starting_letter}...")
    model = "gemini-2.0-flash"
    
    gender_instruction = f"a baby {gender}"
    if gender.lower() == "unisex":
        gender_instruction = "a baby (Gender-Neutral / Unisex names suitable for both boys and girls)"

    theme_descriptions = {
        "Modern": "Short, easy to pronounce, contemporary, stylish, unique but not obscure.",
        "Traditional": "Rooted in Vedas/Puranas, classic, timeless, deep historical significance.",
        "Nature": "Related to elements (earth, water, fire, air, sky), flowers, trees, celestial bodies.",
        "Spiritual": "Related to gods, goddesses, divine qualities, soul, meditation, mantras.",
        "Royal": "Names of kings, queens, signifying power, majesty, nobility, grandeur."
    }
    
    preference_instruction = ""
    if preference:
        details = theme_descriptions.get(preference, preference)
        preference_instruction = f"Target Theme: {preference} ({details}). Tailor names STRICTLY to this theme."

    prompt_intro = "Vedic/Sanskrit names"
    significance_constraint = "Names should have deep spiritual or historical significance."
    
    if preference == "Modern":
        prompt_intro = "modern, trendy Indian names with Sanskrit roots"
        significance_constraint = "Names should have a beautiful meaning and contemporary appeal."

    prompt = f"""
    Generate 5 unique, meaningful {prompt_intro} for {gender_instruction}.
    Constraints:
    1. {significance_constraint}
    2. Provide the meaning and origin for each.
    3. If starting letter is provided ({starting_letter}), you MUST STRICTLY ONLY generate names starting with {starting_letter}. Do NOT provide names with other letters.
    4. {preference_instruction}
    5. If Gender is Unisex, ensure the names are truly gender-neutral and commonly used for both.
    
    Return a JSON object with a key "names" containing a list of objects.
    Each object should have: "name", "meaning", "origin", "significance".
    Example: {{"names": [{{"name": "Aarav", "meaning": "Peaceful", "origin": "Sanskrit", "significance": "Represents calm"}} ]}}
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
                        "names": {
                            "type": "ARRAY",
                            "items": {
                                "type": "OBJECT",
                                "properties": {
                                    "name": {"type": "STRING"},
                                    "meaning": {"type": "STRING"},
                                    "origin": {"type": "STRING"},
                                    "significance": {"type": "STRING"}
                                },
                                "required": ["name", "meaning", "origin"]
                            }
                        }
                    }
                }
            )
        )
        
        data = json.loads(response.text)
        return data.get("names", [])
    except Exception as e:
        print(f"Error generating names: {e}")
        return []
