"""Base classes for text formatters."""

from abc import ABC, abstractmethod


class TextFormatter(ABC):
    """Abstract base class for text formatters."""
    
    @abstractmethod
    def format(self, text: str) -> str:
        """Format the given text.
        
        Args:
            text: The text to format.
            
        Returns:
            The formatted text.
        """
        pass
    
    @property
    @abstractmethod
    def style_name(self) -> str:
        """Get the name of this formatting style."""
        pass