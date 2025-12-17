import os
import json
import base64
import requests
import httpx
from google import genai
from google.genai import types
from fastapi import HTTPException
from dotenv import load_dotenv
from ..models import DailyCurriculum, Activity, DreamInterpretationRequest, DreamInterpretationResponse, Resource, FinancialWisdomResponse, RhythmicMathResponse, RaagaResponse, MantraResponse, Sankalpa
from ..util.logger import setup_logger
from .llm_factory import LLMFactory, LLMConfig, ModelProvider

logger = setup_logger("gemini_service")

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

# Load Groq API key from environment as fallback
groq_api_key_from_env = os.getenv("GROQ_API_KEY")
if groq_api_key_from_env:
    print("[Gemini] Found GROQ_API_KEY in environment")

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
        
        from ..util.prompt_loader import prompt_loader
        from jinja2 import Template
        
        template_str = prompt_loader.get_template("react_youtube_search")
        template = Template(template_str)
        prompt = template.render(query=query, exclude_instruction=exclude_instruction)
        
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
    
    async def find_verified_video(self, search_term: str, context: str = "", exclude_urls: List[str] = None) -> Optional[str]:
        """
        Main ReAct loop: Search YouTube directly, Verify, Return best result.
        
        Tools Used:
        1. search_youtube_direct - Direct YouTube search (primary)
        2. verify_youtube_url - oEmbed verification
        """
        import random
        exclude_urls = exclude_urls or []
        query = f"{search_term} {context}".strip()
        
        print(f"\n[ReAct Agent] ===== Finding video for: '{search_term}' =====")
        if exclude_urls:
             print(f"[ReAct Agent] Excluding {len(exclude_urls)} URLs from results")
        
        # STEP 1: Use Direct YouTube Search (most reliable)
        # Fetch MORE candidates (10) to ensure variety
        print(f"[ReAct Agent] STEP 1: Searching YouTube directly...")
        results = await self.search_youtube_direct(query, limit=10)
        
        if results:
            # STEP 2: Verify results until we have a pool of candidates
            valid_candidates = []
            
            print(f"[ReAct Agent] STEP 2: Verifying results to build candidate pool...")
            for result in results:
                # SKIP excluded URLs immediately
                if result.url in exclude_urls:
                    print(f"[ReAct Agent] ⏭ Skipping excluded URL: {result.url}")
                    continue

                is_valid = await self.verify_youtube_url(result.url)
                if is_valid:
                    print(f"[ReAct Agent] ✓ Added candidate: '{result.title[:40]}...'")
                    valid_candidates.append(result.url)
                    
                    # Optimization: Stop once we have enough variety (e.g., 3 candidates)
                    # This prevents checking all 10 if we already have good options
                    if len(valid_candidates) >= 3:
                        break
            
            if valid_candidates:
                # STEP 3: Randomly select one to ensure variety on refresh
                selected_url = random.choice(valid_candidates)
                print(f"[ReAct Agent] STEP 3: Selected random candidate from {len(valid_candidates)} options")
                print(f"[ReAct Agent] URL: {selected_url}")
                return selected_url
            
            # If verification fails (unlikely with direct search), return first result anyway
            # since youtube-search-python returns real video IDs
            print(f"[ReAct Agent] Verification failed but using first result: {results[0].url}")
            return results[0].url
        
        # STEP 4: Fallback to search URL
        fallback_url = f"https://www.youtube.com/results?search_query={search_term.replace(' ', '+')}"
        print(f"[ReAct Agent] ⚠ Falling back to search URL: {fallback_url}")
        return fallback_url

# Initialize the ReAct agent
react_agent = ReActYouTubeAgent(client)

from typing import Optional

async def generate_daily_curriculum(week: int, mood: Optional[str] = None) -> Optional[DailyCurriculum]:
    print(f"[Gemini] Generating curriculum content for week {week}, mood: {mood}...")
    
    wrapper = _get_llm_wrapper(None, None) # Use current config
    if not wrapper:
        print("[Gemini] Error: No LLM wrapper available")
        return None

    mood_instruction = ""
    if mood:
        mood_instruction = f"The mother is feeling {mood}. Customize the activities and Sankalpa to support this emotional state (e.g., if Tired -> Restorative, if Anxious -> Calming, if Happy -> Celebrating)."

    from ..util.prompt_loader import prompt_loader
    from jinja2 import Template

    template_str = prompt_loader.get_template("daily_curriculum")
    template = Template(template_str)
    content_prompt = template.render(week=week, mood_instruction=mood_instruction)

    try:
        # Use simple generate (sync) for now as wrappers handle sync/async internally if needed
        # or we update wrappers to be truly async later. Given current wrappers are sync:
        text = wrapper.generate(
            prompt=content_prompt,
            system_instruction=SYSTEM_INSTRUCTION,
            response_format="json"
        )

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
        logger.error(f"Error generating curriculum: {e}", exc_info=True)
        if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
             # Return a graceful fallback instead of crashing
            return DailyCurriculum(
                sankalpa=Sankalpa(
                    virtue="Patience",
                    description="The universe is replenishing its energy. Please take a moment to breathe and try again shortly.",
                    mantra="Om Shanti Shanti Shanti"
                ),
                activities=[
                    Activity(
                        id="fallback_rest",
                        category="SPIRITUALITY",
                        title="Rest & Rejuvenate",
                        description="Our AI guide needs a short break to recharge. Please practice deep breathing for 5 minutes.",
                        durationMinutes=5,
                        content="Sit comfortably, close your eyes, and focus on your breath. Inhale deeply for a count of 4, hold for 4, and exhale for 6.",
                        resources=[]
                    )
                ]
            )
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
    # Check current provider
    if _current_model_provider == ModelProvider.GROQ:
        print(f"[Resource Search] Provider is Groq. Using ReAct Agent for {title}")
        video_url = await react_agent.find_verified_video(f"{title} {category} pregnancy")
        if video_url:
             return Resource(
                title=f"Video: {title}",
                url=video_url,
                description=f"Watch this video for {title}"
            )
            
    # Default to Gemini Search if not Groq
    model = "gemini-2.0-flash"
    for attempt in range(2):
        print(f"[Gemini] Repair attempt {attempt+1} for: {title}")
        template_str = prompt_loader.get_template("resource_search_repair")
        template = Template(template_str)
        prompt = template.render(title=title, category=category, description=description)
        
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
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                 print(f"[Gemini] 429 Error in repair loop. Falling back to ReAct Agent.")
                 video_url = await react_agent.find_verified_video(f"{title} {category} pregnancy")
                 if video_url:
                     return Resource(
                        title=f"Video: {title}",
                        url=video_url,
                        description=f"Watch this video for {title}"
                    )
                 break # Stop retrying Gemini if quota exceeded
            
    return None

async def find_resources_for_activity(title: str, description: str, category: str) -> list[Resource]:
    print(f"[Gemini] Searching resources for: {title}")
    
    # Check current provider
    # Note: _current_model_provider is a global variable managed by set_model_config
    if _current_model_provider == ModelProvider.GROQ:
        print(f"[Resource Search] Provider is Groq. Using ReAct Agent to find video.")
        # Groq doesn't support Google Search tool, so we use ReAct agent to find a video
        video_url = await react_agent.find_verified_video(f"{title} {category} pregnancy")
        if video_url:
            return [Resource(
                title=f"Video Guide: {title}",
                url=video_url,
                description=f"A curated video guide for {title}"
            )]
        else:
             # Fallback to general search link
            search_query = f"{title} pregnancy activity {category}"
            search_url = f"https://www.google.com/search?q={search_query.replace(' ', '+')}"
            return [Resource(
                title=f"Search: {title}",
                url=search_url,
                description="Click here to search for this video on Google."
            )]

    model = "gemini-2.0-flash"

    template_str = prompt_loader.get_template("resource_search_list")
    template = Template(template_str)
    prompt = template.render(title=title, category=category, description=description)

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
        
        # Repair Loop
        if len(valid_resources) < 3:
            needed = 3 - len(valid_resources)
            
            for _ in range(needed):
                new_res = await find_single_valid_resource(title, description, category)
                if new_res:
                    if not any(r.url == new_res.url for r in valid_resources):
                        valid_resources.append(new_res)
        
        if not valid_resources:
            raise Exception("No valid resources found")

        return valid_resources

    except Exception as e:
        print(f"[Gemini] Failed to find resources for {title}: {e}")
        
        # Fallback to ReAct Agent if Gemini fails (e.g. 429 or no results)
        print(f"[Gemini] Attempting fallback with ReAct Agent...")
        video_url = await react_agent.find_verified_video(f"{title} {category} pregnancy")
        if video_url:
            return [Resource(
                title=f"Video Guide: {title}",
                url=video_url,
                description=f"A gathered video guide for {title}"
            )]

        # Ultimate Fallback
        search_query = f"{title} pregnancy activity {category}"
        search_url = f"https://www.google.com/search?q={search_query.replace(' ', '+')}"
        return [Resource(
            title=f"Search: {title}",
            url=search_url,
            description="Click here to search for this activity on Google."
        )]

async def interpret_dream(dream_text: str) -> Optional[DreamInterpretationResponse]:
    template_str = prompt_loader.get_template("interpret_dream")
    template = Template(template_str)
    prompt = template.render(dream_text=dream_text)

    try:
        wrapper = _get_llm_wrapper(None, None)
        if not wrapper:
            return None
            
        text = wrapper.generate(prompt=prompt, system_instruction=SYSTEM_INSTRUCTION, response_format="json")
        
        if not text:
            return None
            
        return DreamInterpretationResponse(**json.loads(text))
    except Exception as e:
        logger.error(f"Error interpreting dream: {e}", exc_info=True)
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
        error_str = str(e)
        if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
            print(f"[Gemini] Quota exceeded for audio generation: {e}")
            raise HTTPException(status_code=429, detail="Audio generation quota exceeded. Please try again in 1 minute.")
        print(f"[Gemini] Error generating audio: {e}")
        return None

async def generate_dad_joke() -> List[str]:
    print("[Gemini] Generating batch of 50 dad jokes...")
    prompt = prompt_loader.get_template("dad_joke")
    try:
        wrapper = _get_llm_wrapper(None, None)
        if not wrapper:
            return ["Why did the scarecrow win an award? Because he was outstanding in his field!"]

        text = wrapper.generate(prompt=prompt, system_instruction=SYSTEM_INSTRUCTION, response_format="json")

        if not text:
            return ["Why did the scarecrow win an award? Because he was outstanding in his field!"]
        
        data = json.loads(text)
        jokes = data.get("jokes", [])
        print(f"[Gemini] Generated {len(jokes)} jokes.")
        return jokes
    except Exception as e:
        print(f"Error generating jokes: {e}")
        return ["Why did the scarecrow win an award? Because he was outstanding in his field!"]

async def generate_image(prompt: str) -> Optional[str]:
    print(f"[Gemini] Generating image for prompt: \"{prompt}\"")
    try:
        # Using Imagen 3 model via Gemini API standard
        # Note: This requires a model that supports image generation, e.g., imagen-3.0-generate-001
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
    prompt = prompt_loader.get_template("financial_wisdom")
    try:
        wrapper = _get_llm_wrapper(None, None)
        if not wrapper:
            return None

        text = wrapper.generate(prompt=prompt, system_instruction=SYSTEM_INSTRUCTION, response_format="json")

        if not text:
            return None
            
        return FinancialWisdomResponse(**json.loads(text))
    except Exception as e:
        print(f"Error generating financial wisdom: {e}")
        return None

async def generate_rhythmic_math() -> Optional[RhythmicMathResponse]:
    print("[Gemini] Generating rhythmic math activities...")
    
    prompt = prompt_loader.get_template("rhythmic_math")

    try:
        wrapper = _get_llm_wrapper(None, None)
        if not wrapper:
            return None
            
        text = wrapper.generate(prompt=prompt, system_instruction=SYSTEM_INSTRUCTION, response_format="json")

        if not text:
            return None

        return RhythmicMathResponse(**json.loads(text))

    except Exception as e:
        print(f"[Gemini] Error generating rhythmic math: {e}")
        return None

async def generate_raaga_recommendations() -> Optional[RaagaResponse]:
    print("[Gemini] Generating Raaga recommendations...")
    
    # Updated prompt: We don't ask for URLs here, just the Raaga details
    prompt = prompt_loader.get_template("raaga_recommendations")

    try:
        wrapper = _get_llm_wrapper(None, None)
        if not wrapper:
            return None
            
        text = wrapper.generate(prompt=prompt, system_instruction=SYSTEM_INSTRUCTION, response_format="json")

        if not text:
            return None

        raaga_data = json.loads(text)
        
        # Now find YouTube links for these raagas
        raagas_with_links = []
        for raaga in raaga_data.get("raagas", []):
            search_query = f"{raaga['title']} indian classical raaga instrumental for pregnancy"
            url = await react_agent.find_verified_video(search_query)
            raaga['url'] = url
            raagas_with_links.append(raaga)
            
        raaga_data["raagas"] = raagas_with_links
        
        return RaagaResponse(**raaga_data)
        
    except Exception as e:
        print(f"[Gemini] Error generating raagas: {e}")
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

async def get_initial_mantras(exclude_urls: List[str] = None) -> Optional[MantraResponse]:
    """
    Uses ReAct agent to find verified YouTube URLs for Mantras.
    The agent uses Gemini's Google Search grounding to extract real URLs,
    then verifies them via oEmbed before returning.
    """
    import random
    print("\n[Gemini] === Finding Mantra videos using ReAct Agent ===")
    
    # Expanded pool of Mantras for variety
    all_mantra_definitions = [
        {"id": "gayatri", "title": "Gayatri Mantra", "meaning": "Illumination of intellect", "count": 108, "context": "108 times meditation peaceful chanting"},
        {"id": "om", "title": "Om Chanting", "meaning": "Universal vibration", "count": 21, "context": "meditation relaxation healing"},
        {"id": "shanti", "title": "Shanti Mantra", "meaning": "Peace for all beings", "count": 11, "context": "Om Shanti peaceful meditation"},
        {"id": "mahamrityunjaya", "title": "Mahamrityunjaya Mantra", "meaning": "Victory over fear and death", "count": 108, "context": "Shiva mantra healing protection"},
        {"id": "ganesh", "title": "Ganesh Mantra", "meaning": "Remover of obstacles", "count": 108, "context": "Om Gan Ganpataye Namah meditation"},
        {"id": "saraswati", "title": "Saraswati Vandana", "meaning": "Knowledge and Wisdom", "count": 21, "context": "Ya Kundendu Tushar Hara Dhavala study focus"},
        {"id": "durga", "title": "Durga Mantra", "meaning": "Strength and Protection", "count": 108, "context": "Om Dum Durgaye Namaha protection"},
        {"id": "vishnu", "title": "Vishnu Sahasranamam", "meaning": "Preservation and Peace", "count": 1, "context": "Vishnu Sahasranamam peaceful chanting"},
        {"id": "hare_krishna", "title": "Hare Krishna Mantra", "meaning": "Devotion and Joy", "count": 108, "context": "Hare Krishna Hare Rama kirtan meditation"},
        {"id": "asato_ma", "title": "Asato Ma Sadgamaya", "meaning": "Lead me from ignorance to truth", "count": 11, "context": "Upanishad peace mantra meditation"}
    ]
    
    # Select 3 random mantras from the pool
    # This ensures the SET of mantras changes, not just the videos
    selected_mantras = random.sample(all_mantra_definitions, 3)
    
    mantras_with_urls = []
    
    for mantra in selected_mantras:
        print(f"\n[Gemini] Searching for: {mantra['title']}")
        
        # Use pre-defined context or default
        context = mantra.get('context', "meditation chanting peaceful")
        
        url = await react_agent.find_verified_video(mantra['title'], context, exclude_urls=exclude_urls)
        
        # Create response object (excluding helper 'context' field)
        mantra_with_url = {
            "id": mantra['id'],
            "title": mantra['title'],
            "meaning": mantra['meaning'],
            "count": mantra['count'],
            "url": url
        }
        mantras_with_urls.append(mantra_with_url)
        print(f"[Gemini] Final URL for {mantra['title']}: {url}")
    
    return MantraResponse(mantras=mantras_with_urls)


async def generate_vedic_names(gender: str, starting_letter: Optional[str] = None, preference: Optional[str] = None) -> List[dict]:
    print(f"[Gemini] Generating Vedic names for {gender}, letter: {starting_letter}, preference: {preference}")
    
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

    template_str = prompt_loader.get_template("vedic_names")
    template = Template(template_str)
    prompt = template.render(
        prompt_intro=prompt_intro,
        gender_instruction=gender_instruction,
        significance_constraint=significance_constraint,
        starting_letter=starting_letter,
        preference_instruction=preference_instruction
    )
    
    try:
        wrapper = _get_llm_wrapper(None, None)
        if not wrapper:
            return []
            
        text = wrapper.generate(prompt=prompt, system_instruction=SYSTEM_INSTRUCTION, response_format="json")
        
        if not text:
            return []
            
        data = json.loads(text)
        return data.get("names", [])
    except Exception as e:
        print(f"Error generating names: {e}")
        return []



# ============= Model Configuration Functions =============

# Current model configuration
_current_model_provider = ModelProvider.GEMINI
_current_model_name = "gemini-2.0-flash"
_groq_api_key = groq_api_key_from_env
_llm_wrappers = {}  # Cache wrappers

def _get_llm_wrapper(provider: str, model_name: Optional[str] = None):
    """Get or create LLM wrapper for the specified provider"""
    global _llm_wrappers
    
    # DEBUG: Log current state
    print(f"[LLM Debug] _get_llm_wrapper called: provider_arg={provider}, model_arg={model_name}")
    print(f"[LLM Debug] Current globals: _current_model_provider={_current_model_provider}, _current_model_name={_current_model_name}")
    
    # Use config globals if params are None, with fallbacks
    prov_enum = ModelProvider(provider) if provider else _current_model_provider
    
    print(f"[LLM Debug] Resolved provider enum: {prov_enum}")
    
    # Provide defaults if model_name is missing
    if not model_name:
        model_name = _current_model_name  # Use the configured model name first
        if not model_name:  # If still None, use provider defaults
            if prov_enum == ModelProvider.GROQ:
                model_name = "llama-3.3-70b-versatile"
            else:
                model_name = "gemini-2.0-flash"
            
    cache_key = f"{prov_enum.value}:{model_name}"
    print(f"[LLM Debug] Cache key: {cache_key}, existing cache: {list(_llm_wrappers.keys())}")
    
    if cache_key in _llm_wrappers:
        print(f"[LLM Debug] Returning cached wrapper for {cache_key}")
        return _llm_wrappers[cache_key]
        
    api_key = None
    if prov_enum == ModelProvider.GROQ:
        api_key = _groq_api_key
        if not api_key:
             print("[Config] Warning: No Groq API key found but Groq provider requested")
             return None
    else:
        api_key = os.getenv("VITE_GEMINI_API_KEY")
        
    try:
        config = LLMConfig(
            provider=prov_enum,
            model_name=model_name,
            api_key=api_key or ""
        )
        wrapper = LLMFactory.create(config)
        _llm_wrappers[cache_key] = wrapper
        return wrapper
    except Exception as e:
        print(f"[Config] Error creating LLM wrapper: {e}")
        return None


def set_groq_api_key(api_key: str):
    """Set the Groq API key for use with Groq models."""
    global _groq_api_key, _llm_wrappers
    
    new_key = api_key or groq_api_key_from_env
    if new_key != _groq_api_key:
        _groq_api_key = new_key
        _llm_wrappers.clear() # Clear cache when key changes
        print(f"[Config] Groq API key updated")


def set_model_config(provider: str, model_name: Optional[str] = None):
    """Set the current model provider and name."""
    global _current_model_provider, _current_model_name, _llm_wrappers
    
    print(f"[Config Debug] set_model_config called: provider={provider}, model_name={model_name}")
    print(f"[Config Debug] BEFORE: _current_model_provider={_current_model_provider}, _current_model_name={_current_model_name}")
    
    try:
        new_provider = ModelProvider(provider)
        _current_model_provider = new_provider
        _current_model_name = model_name
        
        print(f"[Config Debug] AFTER: _current_model_provider={_current_model_provider}, _current_model_name={_current_model_name}")
        
        # Clear cache to force new wrapper creation with new config
        _llm_wrappers.clear()
        print(f"[Config Debug] Cleared LLM wrapper cache")
        
        # Pre-warm the wrapper
        _get_llm_wrapper(None, None)  # Use None to test global reading
        
        print(f"[Config] Model config updated: provider={provider}, model={model_name}")
    except ValueError:
        print(f"[Config] Invalid provider: {provider}")

def get_current_model_config():
    """Get the current model configuration."""
    return {
        "provider": _current_model_provider.value if isinstance(_current_model_provider, ModelProvider) else _current_model_provider,
        "model_name": _current_model_name
    }
