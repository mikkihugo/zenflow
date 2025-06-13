"""Concrete text formatter implementations."""

import random
from .base import TextFormatter


class PlainFormatter(TextFormatter):
    """Plain text formatter (no formatting)."""
    
    def format(self, text: str) -> str:
        return text
    
    @property
    def style_name(self) -> str:
        return "Plain"


class BoldFormatter(TextFormatter):
    """Bold text formatter using ANSI escape codes."""
    
    def format(self, text: str) -> str:
        return f"\033[1m{text}\033[0m"
    
    @property
    def style_name(self) -> str:
        return "Bold"


class ColorFormatter(TextFormatter):
    """Colorful text formatter using ANSI escape codes."""
    
    def __init__(self):
        self.colors = [
            '\033[91m',  # Red
            '\033[92m',  # Green
            '\033[93m',  # Yellow
            '\033[94m',  # Blue
            '\033[95m',  # Magenta
            '\033[96m',  # Cyan
        ]
    
    def format(self, text: str) -> str:
        color = random.choice(self.colors)
        return f"{color}{text}\033[0m"
    
    @property
    def style_name(self) -> str:
        return "Color"


class AsciiArtFormatter(TextFormatter):
    """ASCII art text formatter."""
    
    def format(self, text: str) -> str:
        # Simple ASCII art border
        border = "*" * (len(text) + 4)
        return f"""
{border}
* {text} *
{border}
        """.strip()
    
    @property
    def style_name(self) -> str:
        return "ASCII Art"