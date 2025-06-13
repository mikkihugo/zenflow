"""Concrete greeting strategy implementations."""

from .base import GreetingStrategy


class EnglishGreeting(GreetingStrategy):
    """English greeting implementation."""
    
    def greet(self, name: str) -> str:
        return f"Hello, {name}!"
    
    @property
    def language(self) -> str:
        return "English"


class SpanishGreeting(GreetingStrategy):
    """Spanish greeting implementation."""
    
    def greet(self, name: str) -> str:
        return f"¡Hola, {name}!"
    
    @property
    def language(self) -> str:
        return "Spanish"


class FrenchGreeting(GreetingStrategy):
    """French greeting implementation."""
    
    def greet(self, name: str) -> str:
        return f"Bonjour, {name}!"
    
    @property
    def language(self) -> str:
        return "French"


class GermanGreeting(GreetingStrategy):
    """German greeting implementation."""
    
    def greet(self, name: str) -> str:
        return f"Hallo, {name}!"
    
    @property
    def language(self) -> str:
        return "German"


class JapaneseGreeting(GreetingStrategy):
    """Japanese greeting implementation."""
    
    def greet(self, name: str) -> str:
        return f"こんにちは、{name}さん!"
    
    @property
    def language(self) -> str:
        return "Japanese"