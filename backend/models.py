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
