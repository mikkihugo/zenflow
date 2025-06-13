"""Application settings and configuration."""

import os
from dataclasses import dataclass
from typing import Optional


@dataclass
class Settings:
    """Application settings container."""
    
    # Logging configuration
    log_level: str = "INFO"
    log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Application metadata
    app_name: str = "Complex Hello World"
    app_version: str = "1.0.0"
    
    # Performance settings
    enable_performance_logging: bool = True
    
    # Output settings
    default_language: str = "english"
    default_format: str = "plain"
    
    # File paths
    log_file: Optional[str] = None
    
    def __post_init__(self):
        """Validate and process settings after initialization."""
        # Ensure log level is uppercase
        self.log_level = self.log_level.upper()
        
        # Set log file path if not provided
        if self.log_file is None:
            self.log_file = os.path.join(
                os.path.dirname(os.path.dirname(__file__)),
                "logs",
                "app.log"
            )
    
    @classmethod
    def from_env(cls):
        """Create settings from environment variables."""
        return cls(
            log_level=os.getenv("HELLO_LOG_LEVEL", "INFO"),
            default_language=os.getenv("HELLO_DEFAULT_LANGUAGE", "english"),
            default_format=os.getenv("HELLO_DEFAULT_FORMAT", "plain"),
            enable_performance_logging=os.getenv(
                "HELLO_ENABLE_PERFORMANCE", "true"
            ).lower() == "true"
        )