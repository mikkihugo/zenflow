"""Factory for creating text formatters."""

from typing import Dict, Type
from .base import TextFormatter
from .styles import (
    PlainFormatter,
    BoldFormatter,
    ColorFormatter,
    AsciiArtFormatter
)


class FormatterFactory:
    """Factory class for creating text formatters."""
    
    def __init__(self):
        self._formatters: Dict[str, Type[TextFormatter]] = {
            "plain": PlainFormatter,
            "bold": BoldFormatter,
            "color": ColorFormatter,
            "ascii_art": AsciiArtFormatter
        }
    
    def get_formatter(self, style: str) -> TextFormatter:
        """Get a text formatter for the specified style.
        
        Args:
            style: The formatting style identifier.
            
        Returns:
            An instance of the appropriate text formatter.
            
        Raises:
            ValueError: If the style is not supported.
        """
        style = style.lower()
        if style not in self._formatters:
            raise ValueError(f"Unsupported formatting style: {style}")
        
        return self._formatters[style]()
    
    def list_styles(self) -> list:
        """Get a list of supported formatting styles."""
        return list(self._formatters.keys())