# llm_groq.py
from groq import Groq
from typing import List, Dict, Any, Optional

class GroqLlmService:
    """
    Minimal adapter that exposes a `chat(messages)` method returning text.
    Compatible with Vanna's expectation for an LLM service.
    """
    def __init__(self, model: str = "llama3-8b-8192", api_key: Optional[str] = None, temperature: float = 0.0):
        self.client = Groq(api_key=api_key)
        self.model = model
        self.temperature = temperature

    def chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        resp = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=self.temperature,
            **kwargs
        )
        content = resp.choices[0].message.content
        return content if content else ""