from pydantic import BaseModel
from typing import List, Optional, Literal

class Resource(BaseModel):
    title: str
    url: str
    description: str

class Activity(BaseModel):
    id: str
    category: Literal["MATH", "ART", "SPIRITUALITY", "BONDING"]
    title: str
    description: str
    durationMinutes: int
    content: str
    solution: Optional[str] = None
    resources: List[Resource] = []
    isCompleted: bool = False

class Sankalpa(BaseModel):
    virtue: str
    description: str
    mantra: str

class DailyCurriculum(BaseModel):
    sankalpa: Sankalpa
    activities: List[Activity]

class DreamInterpretationRequest(BaseModel):
    dreamText: str

class DreamInterpretationResponse(BaseModel):
    interpretation: str
    affirmation: str

class AudioGenerationRequest(BaseModel):
    text: str

class ImageGenerationRequest(BaseModel):
    prompt: str

class FinancialTip(BaseModel):
    id: str
    title: str
    content: str
    icon: Literal["PiggyBank", "TrendingUp", "DollarSign", "Wallet", "CreditCard"]

class FinancialWisdomResponse(BaseModel):
    tips: List[FinancialTip]

class RhythmicMathActivity(BaseModel):
    id: str
    title: str
    duration: str
    bpm: int

class RhythmicMathResponse(BaseModel):
    activities: List[RhythmicMathActivity]

class Raaga(BaseModel):
    id: str
    title: str
    time: str
    benefit: str
    duration: str
    url: Optional[str] = None

class RaagaResponse(BaseModel):
    raagas: List[Raaga]

class Mantra(BaseModel):
    id: str
    title: str
    meaning: str
    count: int
    url: Optional[str] = None

class MantraResponse(BaseModel):
    mantras: List[Mantra]

class AppConfig(BaseModel):
    """Application configuration for model selection and user settings"""
    model_provider: Literal["gemini", "groq"] = "gemini"
    model_name: Optional[str] = None  # If None, use default for provider
    groq_api_key: Optional[str] = None  # Stored in backend_config.json
    mother_name: Optional[str] = None
    father_name: Optional[str] = None
    pregnancy_week: Optional[int] = None

class ConfigUpdateRequest(BaseModel):
    """Request to update configuration"""
    model_provider: Optional[Literal["gemini", "groq"]] = None
    model_name: Optional[str] = None
    groq_api_key: Optional[str] = None
    mother_name: Optional[str] = None
    father_name: Optional[str] = None
    pregnancy_week: Optional[int] = None

