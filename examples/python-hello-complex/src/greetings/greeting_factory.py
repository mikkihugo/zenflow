"""Factory for creating greeting strategies."""

from typing import Dict, Type
from .base import GreetingStrategy
from .strategies import (
    EnglishGreeting,
    SpanishGreeting,
    FrenchGreeting,
    GermanGreeting,
    JapaneseGreeting
)


class GreetingFactory:
    """Factory class for creating greeting strategies."""
    
    def __init__(self):
        self._strategies: Dict[str, Type[GreetingStrategy]] = {
            "english": EnglishGreeting,
            "spanish": SpanishGreeting,
            "french": FrenchGreeting,
            "german": GermanGreeting,
            "japanese": JapaneseGreeting
        }
    
    def get_greeting(self, language: str) -> GreetingStrategy:
        """Get a greeting strategy for the specified language.
        
        Args:
            language: The language identifier.
            
        Returns:
            An instance of the appropriate greeting strategy.
            
        Raises:
            ValueError: If the language is not supported.
        """
        language = language.lower()
        if language not in self._strategies:
            raise ValueError(f"Unsupported language: {language}")
        
        return self._strategies[language]()
    
    def list_languages(self) -> list:
        """Get a list of supported languages."""
        return list(self._strategies.keys())