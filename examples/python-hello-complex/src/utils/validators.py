"""Input validation utilities."""

import re
from typing import Optional


class InputValidator:
    """Validator for user inputs."""
    
    @staticmethod
    def validate_name(name: str) -> bool:
        """Validate that a name contains only valid characters.
        
        Args:
            name: The name to validate.
            
        Returns:
            True if valid, False otherwise.
        """
        if not name or not name.strip():
            return False
        
        # Allow letters, spaces, hyphens, and apostrophes
        pattern = r"^[a-zA-Z\s\-']+$"
        return bool(re.match(pattern, name))
    
    @staticmethod
    def sanitize_name(name: str) -> str:
        """Sanitize a name by removing invalid characters.
        
        Args:
            name: The name to sanitize.
            
        Returns:
            The sanitized name.
        """
        # Remove any characters that aren't letters, spaces, hyphens, or apostrophes
        sanitized = re.sub(r"[^a-zA-Z\s\-']", "", name)
        
        # Collapse multiple spaces
        sanitized = re.sub(r'\s+', ' ', sanitized)
        
        return sanitized.strip()
    
    @staticmethod
    def validate_language_code(code: str, supported_languages: list) -> bool:
        """Validate that a language code is supported.
        
        Args:
            code: The language code to validate.
            supported_languages: List of supported language codes.
            
        Returns:
            True if valid, False otherwise.
        """
        return code.lower() in [lang.lower() for lang in supported_languages]