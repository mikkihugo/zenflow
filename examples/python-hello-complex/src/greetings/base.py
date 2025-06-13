"""Base classes for greeting strategies."""

from abc import ABC, abstractmethod


class GreetingStrategy(ABC):
    """Abstract base class for greeting strategies."""
    
    @abstractmethod
    def greet(self, name: str) -> str:
        """Generate a greeting message.
        
        Args:
            name: The name to include in the greeting.
            
        Returns:
            The greeting message.
        """
        pass
    
    @property
    @abstractmethod
    def language(self) -> str:
        """Get the language name for this greeting."""
        pass