from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .models import DailyCurriculum, DreamInterpretationRequest, DreamInterpretationResponse, AudioGenerationRequest, ImageGenerationRequest, FinancialWisdomResponse, RhythmicMathResponse
from .services import gemini_service
import uvicorn
import os
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

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
