"""
Configuration module for Hello World application
"""
import json
import os
from dataclasses import dataclass, asdict
from typing import Dict, Any
from pathlib import Path


@dataclass
class Config:
    """Configuration class for Hello World application"""
    
    # Default values
    default_name: str = "World"
    default_language: str = "english"
    default_style: str = "simple"
    log_level: str = "INFO"
    
    # Feature flags
    enable_emoji: bool = True
    enable_colors: bool = True
    enable_sound: bool = False
    
    # Formatting options
    max_line_length: int = 80
    indent_size: int = 4
    
    # Language settings
    supported_languages: tuple = (
        "english", "spanish", "french", 
        "german", "italian", "japanese"
    )
    
    # Style settings
    supported_styles: tuple = (
        "simple", "fancy", "banner", "ascii"
    )
    
    def __init__(self, config_file: str = None):
        """Initialize configuration from file or defaults"""
        if config_file and Path(config_file).exists():
            self._load_from_file(config_file)
        else:
            self._load_from_env()
    
    def _load_from_file(self, config_file: str):
        """Load configuration from JSON file"""
        try:
            with open(config_file, 'r') as f:
                config_data = json.load(f)
                self._update_from_dict(config_data)
        except Exception as e:
            print(f"Warning: Could not load config file {config_file}: {e}")
    
    def _load_from_env(self):
        """Load configuration from environment variables"""
        env_mappings = {
            'HELLO_DEFAULT_NAME': 'default_name',
            'HELLO_DEFAULT_LANGUAGE': 'default_language',
            'HELLO_DEFAULT_STYLE': 'default_style',
            'HELLO_LOG_LEVEL': 'log_level',
            'HELLO_ENABLE_EMOJI': 'enable_emoji',
            'HELLO_ENABLE_COLORS': 'enable_colors',
        }
        
        for env_var, attr in env_mappings.items():
            value = os.environ.get(env_var)
            if value is not None:
                # Handle boolean conversion
                if attr.startswith('enable_'):
                    value = value.lower() in ('true', '1', 'yes')
                setattr(self, attr, value)
    
    def _update_from_dict(self, data: Dict[str, Any]):
        """Update configuration from dictionary"""
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert configuration to dictionary"""
        return asdict(self)
    
    def save(self, config_file: str):
        """Save configuration to JSON file"""
        with open(config_file, 'w') as f:
            json.dump(self.to_dict(), f, indent=2)
    
    def validate(self) -> bool:
        """Validate configuration values"""
        validations = [
            self.default_language in self.supported_languages,
            self.default_style in self.supported_styles,
            self.log_level in ("DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"),
            self.max_line_length > 0,
            self.indent_size > 0
        ]
        return all(validations)
    
    def __str__(self) -> str:
        """String representation of configuration"""
        return json.dumps(self.to_dict(), indent=2)


# Create default configuration instance
default_config = Config()