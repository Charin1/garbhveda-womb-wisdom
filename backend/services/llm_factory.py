"""
LLM Factory Module

This module provides a unified interface for creating language model clients.
Supports multiple providers: Gemini (Google) and Groq.
"""

import os
from typing import Optional, Any, Dict
from enum import Enum
from dataclasses import dataclass

class ModelProvider(Enum):
    GEMINI = "gemini"
    GROQ = "groq"

@dataclass
class LLMConfig:
    """Configuration for LLM instantiation"""
    provider: ModelProvider
    model_name: str
    api_key: str
    temperature: float = 0.7
    max_tokens: int = 4096

class LLMFactory:
    """
    Factory class for creating LLM clients.
    
    Usage:
        config = LLMConfig(
            provider=ModelProvider.GROQ,
            model_name="llama-3.1-70b-versatile",
            api_key="your-api-key"
        )
        client = LLMFactory.create(config)
    """
    
    @staticmethod
    def create(config: LLMConfig) -> Any:
        """Create an LLM client based on the provider configuration."""
        if config.provider == ModelProvider.GEMINI:
            return LLMFactory._create_gemini_client(config)
        elif config.provider == ModelProvider.GROQ:
            return LLMFactory._create_groq_client(config)
        else:
            raise ValueError(f"Unsupported provider: {config.provider}")
    
    @staticmethod
    def _create_gemini_client(config: LLMConfig) -> Any:
        """Create a Gemini (Google) client."""
        from google import genai
        client = genai.Client(api_key=config.api_key)
        return GeminiWrapper(client, config.model_name)
    
    @staticmethod
    def _create_groq_client(config: LLMConfig) -> Any:
        """Create a Groq client."""
        from groq import Groq
        client = Groq(api_key=config.api_key)
        return GroqWrapper(client, config.model_name, config.temperature, config.max_tokens)


class GeminiWrapper:
    """Wrapper for Gemini client to provide unified interface."""
    
    def __init__(self, client: Any, model_name: str):
        self.client = client
        self.model_name = model_name
    
    def generate(self, prompt: str, system_instruction: Optional[str] = None, 
                 response_format: Optional[str] = None) -> str:
        """Generate text using Gemini."""
        from google.genai import types
        
        config_kwargs = {}
        if system_instruction:
            config_kwargs["system_instruction"] = system_instruction
        if response_format == "json":
            config_kwargs["response_mime_type"] = "application/json"
        
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config=types.GenerateContentConfig(**config_kwargs) if config_kwargs else None
        )
        return response.text
    
    async def generate_async(self, prompt: str, system_instruction: Optional[str] = None,
                            response_format: Optional[str] = None) -> str:
        """Async generate text using Gemini."""
        # Gemini SDK may not have native async, so we run sync in this case
        return self.generate(prompt, system_instruction, response_format)


class GroqWrapper:
    """Wrapper for Groq client to provide unified interface."""
    
    def __init__(self, client: Any, model_name: str, temperature: float = 0.7, max_tokens: int = 4096):
        self.client = client
        self.model_name = model_name
        self.temperature = temperature
        self.max_tokens = max_tokens
    
    def generate(self, prompt: str, system_instruction: Optional[str] = None,
                 response_format: Optional[str] = None) -> str:
        """Generate text using Groq."""
        messages = []
        
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        
        messages.append({"role": "user", "content": prompt})
        
        kwargs = {
            "model": self.model_name,
            "messages": messages,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
        }
        
        if response_format == "json":
            kwargs["response_format"] = {"type": "json_object"}
        
        response = self.client.chat.completions.create(**kwargs)
        return response.choices[0].message.content
    
    async def generate_async(self, prompt: str, system_instruction: Optional[str] = None,
                            response_format: Optional[str] = None) -> str:
        """Async generate text using Groq."""
        # Groq SDK may not have native async, so we run sync in this case
        return self.generate(prompt, system_instruction, response_format)


# Default model names per provider
DEFAULT_MODELS = {
    ModelProvider.GEMINI: "gemini-2.0-flash",
    ModelProvider.GROQ: "llama-3.3-70b-versatile"
}

def get_default_model(provider: ModelProvider) -> str:
    """Get the default model name for a provider."""
    return DEFAULT_MODELS.get(provider, "")
