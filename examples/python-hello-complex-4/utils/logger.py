"""
Logger module for Hello World application
"""
import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional


class ColoredFormatter(logging.Formatter):
    """Custom formatter with color support"""
    
    COLORS = {
        'DEBUG': '\033[36m',    # Cyan
        'INFO': '\033[32m',     # Green
        'WARNING': '\033[33m',  # Yellow
        'ERROR': '\033[31m',    # Red
        'CRITICAL': '\033[35m', # Magenta
    }
    RESET = '\033[0m'
    
    def __init__(self, fmt: str = None, enable_colors: bool = True):
        super().__init__(fmt)
        self.enable_colors = enable_colors
    
    def format(self, record):
        if self.enable_colors and record.levelname in self.COLORS:
            record.levelname = (
                f"{self.COLORS[record.levelname]}"
                f"{record.levelname}"
                f"{self.RESET}"
            )
        return super().format(record)


class Logger:
    """Custom logger class for Hello World application"""
    
    def __init__(self, level: str = "INFO", log_file: Optional[str] = None):
        self.logger = logging.getLogger("HelloWorld")
        self.logger.setLevel(getattr(logging, level.upper()))
        
        # Remove existing handlers
        self.logger.handlers.clear()
        
        # Console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_formatter = ColoredFormatter(
            fmt='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            enable_colors=sys.stdout.isatty()
        )
        console_handler.setFormatter(console_formatter)
        self.logger.addHandler(console_handler)
        
        # File handler (optional)
        if log_file:
            file_handler = logging.FileHandler(log_file)
            file_formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            file_handler.setFormatter(file_formatter)
            self.logger.addHandler(file_handler)
    
    def debug(self, message: str, *args, **kwargs):
        """Log debug message"""
        self.logger.debug(message, *args, **kwargs)
    
    def info(self, message: str, *args, **kwargs):
        """Log info message"""
        self.logger.info(message, *args, **kwargs)
    
    def warning(self, message: str, *args, **kwargs):
        """Log warning message"""
        self.logger.warning(message, *args, **kwargs)
    
    def error(self, message: str, *args, **kwargs):
        """Log error message"""
        self.logger.error(message, *args, **kwargs)
    
    def critical(self, message: str, *args, **kwargs):
        """Log critical message"""
        self.logger.critical(message, *args, **kwargs)
    
    def log_separator(self, char: str = "-", length: int = 50):
        """Log a separator line"""
        self.info(char * length)
    
    def log_banner(self, message: str, char: str = "="):
        """Log a banner message"""
        padding = 2
        banner_length = len(message) + (padding * 2)
        
        self.info(char * banner_length)
        self.info(f"{char}{' ' * padding}{message}{' ' * padding}{char}")
        self.info(char * banner_length)


# Singleton logger instance
_logger_instance = None


def get_logger(level: str = "INFO", log_file: Optional[str] = None) -> Logger:
    """Get or create logger instance"""
    global _logger_instance
    if _logger_instance is None:
        _logger_instance = Logger(level, log_file)
    return _logger_instance