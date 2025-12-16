from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .models import DailyCurriculum, DreamInterpretationRequest, DreamInterpretationResponse, AudioGenerationRequest, ImageGenerationRequest, FinancialWisdomResponse, RhythmicMathResponse, RaagaResponse, MantraResponse, AppConfig, ConfigUpdateRequest
from .services import gemini_service
import uvicorn
import os
import json
from pathlib import Path
from fastapi.responses import Response

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:5173",  # Vite default
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "GarbhVeda Backend is running"}

from typing import Optional

@app.get("/api/curriculum/{week}", response_model=DailyCurriculum)
async def get_curriculum(week: int, mood: Optional[str] = None):
    curriculum = await gemini_service.generate_daily_curriculum(week, mood)
    if not curriculum:
        raise HTTPException(status_code=500, detail="Failed to generate curriculum")
    return curriculum

@app.post("/api/dream/interpret", response_model=DreamInterpretationResponse)
async def interpret_dream(request: DreamInterpretationRequest):
    interpretation = await gemini_service.interpret_dream(request.dreamText)
    if not interpretation:
        raise HTTPException(status_code=500, detail="Failed to interpret dream")
    return interpretation

@app.post("/api/generate/audio")
async def generate_audio(request: AudioGenerationRequest):
    audio_bytes = await gemini_service.generate_audio(request.text)
    if not audio_bytes:
        raise HTTPException(status_code=500, detail="Failed to generate audio")
    
    return Response(content=audio_bytes, media_type="audio/wav") # Assuming WAV or MP3, browser usually handles it

@app.post("/api/generate/image")
async def generate_image(request: ImageGenerationRequest):
    image_url = await gemini_service.generate_image(request.prompt)
    if not image_url:
        raise HTTPException(status_code=500, detail="Failed to generate image")
    return {"url": image_url}

@app.get("/api/financial-wisdom", response_model=FinancialWisdomResponse)
async def get_financial_wisdom():
    wisdom = await gemini_service.generate_financial_wisdom()
    if not wisdom:
        raise HTTPException(status_code=500, detail="Failed to generate financial wisdom")
    return wisdom

@app.get("/api/rhythmic-math", response_model=RhythmicMathResponse)
async def get_rhythmic_math():
    math_activities = await gemini_service.generate_rhythmic_math()
    if not math_activities:
        raise HTTPException(status_code=500, detail="Failed to generate rhythmic math")
    return math_activities

@app.get("/api/raaga-recommendations", response_model=RaagaResponse)
async def get_raaga_recommendations():
    raagas = await gemini_service.generate_raaga_recommendations()
    if not raagas:
        raise HTTPException(status_code=500, detail="Failed to generate raaga recommendations")
    return raagas

@app.get("/api/raagas/defaults", response_model=RaagaResponse)
async def get_initial_raagas():
    raagas = await gemini_service.get_initial_raagas()
    if not raagas:
        raise HTTPException(status_code=500, detail="Failed to fetch initial raagas")
    return raagas

@app.get("/api/mantras/defaults", response_model=MantraResponse)
async def get_initial_mantras():
    mantras = await gemini_service.get_initial_mantras()
    if not mantras:
        raise HTTPException(status_code=500, detail="Failed to fetch initial mantras")
    return mantras

@app.get("/api/dad-joke")
async def get_dad_joke():
    jokes = await gemini_service.generate_dad_joke()
    if not jokes:
        raise HTTPException(status_code=500, detail="Failed to generate jokes")
    return {"jokes": jokes}

class NameRequest(BaseModel):
    gender: str
    starting_letter: Optional[str] = None
    preference: Optional[str] = None

@app.post("/api/vedic-names")
async def get_vedic_names(request: NameRequest):
    names = await gemini_service.generate_vedic_names(request.gender, request.starting_letter, request.preference)
    if not names:
        # Return empty list instead of error to handle gracefully
        return {"names": []}
    return {"names": names}

# Config Persistence
CONFIG_FILE = Path(__file__).parent / "backend_config.json"

def load_config_from_file() -> AppConfig:
    if CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE, "r") as f:
                data = json.load(f)
            print(f"[Config] Loaded config from file: provider={data.get('model_provider')}")
            return AppConfig(**data)
        except Exception as e:
            print(f"[Config] Failed to load config file: {e}")
    return AppConfig()

def save_config_to_file(config: AppConfig):
    try:
        with open(CONFIG_FILE, "w") as f:
            # Use .dict() method from Pydantic models
            json.dump(config.dict(), f, indent=2)
        print(f"[Config] Persistent config saved to {CONFIG_FILE.name}")
    except Exception as e:
        print(f"[Config] Failed to save config: {e}")

# Initialize config from file on startup
_app_config = load_config_from_file()

# Apply loaded config to service immediately
gemini_service.set_model_config(_app_config.model_provider, _app_config.model_name)
if _app_config.groq_api_key:
    gemini_service.set_groq_api_key(_app_config.groq_api_key)

@app.get("/api/config", response_model=AppConfig)
async def get_config():
    """Get current application configuration"""
    # Don't return the API key for security
    config_copy = AppConfig(
        model_provider=_app_config.model_provider,
        model_name=_app_config.model_name,
        groq_api_key=None,  # Never send API key back
        mother_name=_app_config.mother_name,
        father_name=_app_config.father_name,
        pregnancy_week=_app_config.pregnancy_week
    )
    return config_copy

@app.post("/api/config", response_model=AppConfig)
async def update_config(request: ConfigUpdateRequest):
    """Update application configuration"""
    global _app_config
    
    print(f"[Config API] Received update request: provider={request.model_provider}, model={request.model_name}, has_api_key={request.groq_api_key is not None and len(request.groq_api_key or '') > 0}")
    
    if request.model_provider is not None:
        _app_config.model_provider = request.model_provider
    if request.model_name is not None:
        _app_config.model_name = request.model_name
    if request.groq_api_key is not None:
        # If empty string sent, clear it? Or just update. 
        # Assuming empty string means clear or update.
        _app_config.groq_api_key = request.groq_api_key
        # Update the gemini_service with the new API key
        gemini_service.set_groq_api_key(request.groq_api_key)
        
    # User details updates
    if request.mother_name is not None:
        _app_config.mother_name = request.mother_name
    if request.father_name is not None:
        _app_config.father_name = request.father_name
    if request.pregnancy_week is not None:
        _app_config.pregnancy_week = request.pregnancy_week
    
    # Update model provider in gemini_service
    gemini_service.set_model_config(_app_config.model_provider, _app_config.model_name)
    
    # Save to file
    save_config_to_file(_app_config)
    
    print(f"[Config API] Config updated and saved: provider={_app_config.model_provider}, model={_app_config.model_name}")
    
    return AppConfig(
        model_provider=_app_config.model_provider,
        model_name=_app_config.model_name,
        groq_api_key=None,  # Never send API key back
        mother_name=_app_config.mother_name,
        father_name=_app_config.father_name,
        pregnancy_week=_app_config.pregnancy_week
    )

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)

