"""
Unit tests for the Hello World application
"""
import sys
import pytest
from pathlib import Path
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import Config
from core.greeting_generator import GreetingGenerator
from core.message_formatter import MessageFormatter
from utils.logger import Logger
from main import HelloWorldApp


class TestConfig:
    """Test configuration module"""
    
    def test_default_config(self):
        """Test default configuration values"""
        config = Config()
        assert config.default_name == "World"
        assert config.default_language == "english"
        assert config.default_style == "simple"
        assert config.log_level == "INFO"
    
    def test_config_validation(self):
        """Test configuration validation"""
        config = Config()
        assert config.validate() is True
        
        # Test invalid language
        config.default_language = "klingon"
        assert config.validate() is False


class TestGreetingGenerator:
    """Test greeting generator module"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.config = Config()
        self.generator = GreetingGenerator(self.config)
    
    def test_english_greeting(self):
        """Test English greeting generation"""
        greeting = self.generator.generate("Alice", "english")
        assert "Alice" in greeting
        assert "Hello" in greeting or "Hi" in greeting
    
    def test_spanish_greeting(self):
        """Test Spanish greeting generation"""
        greeting = self.generator.generate("Carlos", "spanish")
        assert "Carlos" in greeting
        assert "Hola" in greeting or "Buenos" in greeting
    
    def test_french_greeting(self):
        """Test French greeting generation"""
        greeting = self.generator.generate("Marie", "french")
        assert "Marie" in greeting
        assert "Bonjour" in greeting or "Salut" in greeting
    
    def test_formal_greeting(self):
        """Test formal greeting style"""
        greeting = self.generator.generate("Dr. Smith", "english", style="formal")
        assert "Dr. Smith" in greeting
        assert "Good day" in greeting
    
    def test_casual_greeting(self):
        """Test casual greeting style"""
        greeting = self.generator.generate("Bob", "english", style="casual")
        assert "Bob" in greeting
        assert "Hey" in greeting
    
    def test_time_based_greeting(self):
        """Test time-based greeting variation"""
        greeting = self.generator.generate("Alice", "english", variation="morning")
        assert "Alice" in greeting
        assert "Good morning" in greeting
    
    def test_invalid_language(self):
        """Test invalid language handling"""
        with pytest.raises(ValueError):
            self.generator.generate("Test", "klingon")
    
    def test_emoji_support(self):
        """Test emoji support when enabled"""
        self.config.enable_emoji = True
        greeting = self.generator.generate("Test", "english")
        assert "👋" in greeting
    
    def test_random_greeting(self):
        """Test random greeting generation"""
        greetings = set()
        for _ in range(10):
            greeting = self.generator.get_random_greeting("Test", "english")
            greetings.add(greeting)
        
        # Should have at least 2 different greetings
        assert len(greetings) >= 2


class TestMessageFormatter:
    """Test message formatter module"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.config = Config()
        self.formatter = MessageFormatter(self.config)
    
    def test_simple_format(self):
        """Test simple formatting style"""
        message = "Hello, World!"
        formatted = self.formatter.format(message, style="simple")
        assert formatted == message
    
    def test_fancy_format(self):
        """Test fancy formatting style"""
        message = "Hello, World!"
        formatted = self.formatter.format(message, style="fancy")
        assert "╔" in formatted
        assert "╗" in formatted
        assert message in formatted
    
    def test_banner_format(self):
        """Test banner formatting style"""
        message = "Hello, World!"
        formatted = self.formatter.format(message, style="banner")
        assert "*" in formatted
        assert message in formatted
        lines = formatted.split('\n')
        assert len(lines) >= 5
    
    def test_ascii_format(self):
        """Test ASCII art formatting style"""
        message = "Hello, World!"
        formatted = self.formatter.format(message, style="ascii")
        assert message in formatted
        assert "_    _" in formatted  # Part of ASCII art
    
    def test_format_with_timestamp(self):
        """Test formatting with timestamp"""
        message = "Hello, World!"
        timestamp = datetime.now()
        formatted = self.formatter.format(
            message, 
            style="fancy", 
            timestamp=timestamp
        )
        assert message in formatted
        assert timestamp.strftime("%Y-%m-%d") in formatted
    
    def test_invalid_style(self):
        """Test invalid style handling"""
        with pytest.raises(ValueError):
            self.formatter.format("Test", style="invalid")
    
    def test_progress_bar(self):
        """Test progress bar creation"""
        progress = self.formatter.create_progress_bar(50, 100)
        assert "[" in progress
        assert "]" in progress
        assert "50.0%" in progress
    
    def test_table_creation(self):
        """Test table creation"""
        headers = ["Name", "Language", "Style"]
        rows = [
            ["Alice", "English", "Formal"],
            ["Bob", "Spanish", "Casual"]
        ]
        table = self.formatter.create_table(headers, rows)
        assert "Name" in table
        assert "Alice" in table
        assert "+" in table
        assert "|" in table


class TestHelloWorldApp:
    """Test main application"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.config = Config()
        self.app = HelloWorldApp(self.config)
    
    def test_app_initialization(self):
        """Test app initialization"""
        assert self.app.config is not None
        assert self.app.logger is not None
        assert self.app.greeting_generator is not None
        assert self.app.message_formatter is not None
    
    def test_run_default(self):
        """Test running app with defaults"""
        result = self.app.run()
        assert result is not None
        assert "World" in result
    
    def test_run_with_name(self):
        """Test running app with custom name"""
        result = self.app.run(name="Alice")
        assert "Alice" in result
    
    def test_run_with_language(self):
        """Test running app with custom language"""
        result = self.app.run(name="Carlos", language="spanish")
        assert "Carlos" in result
    
    def test_run_with_style(self):
        """Test running app with custom style"""
        result = self.app.run(name="Test", style="banner")
        assert "Test" in result
        assert "*" in result  # Banner style marker


class TestDecorators:
    """Test utility decorators"""
    
    def test_timer_decorator(self):
        """Test timer decorator functionality"""
        from utils.decorators import timer
        
        @timer
        def slow_function():
            import time
            time.sleep(0.1)
            return "done"
        
        result = slow_function()
        assert result == "done"
    
    def test_validate_args_decorator(self):
        """Test validate_args decorator"""
        from utils.decorators import validate_args
        
        @validate_args
        def test_function(self, name=None):
            return f"Hello, {name}!"
        
        # Valid call
        result = test_function(None, name="Alice")
        assert result == "Hello, Alice!"
        
        # Invalid name type
        with pytest.raises(TypeError):
            test_function(None, name=123)
        
        # Name too long
        with pytest.raises(ValueError):
            test_function(None, name="A" * 51)
    
    def test_memoize_decorator(self):
        """Test memoize decorator"""
        from utils.decorators import memoize
        
        call_count = 0
        
        @memoize
        def expensive_function(x):
            nonlocal call_count
            call_count += 1
            return x * 2
        
        # First call
        result1 = expensive_function(5)
        assert result1 == 10
        assert call_count == 1
        
        # Second call with same argument (should use cache)
        result2 = expensive_function(5)
        assert result2 == 10
        assert call_count == 1  # Should not increment
        
        # Call with different argument
        result3 = expensive_function(10)
        assert result3 == 20
        assert call_count == 2


if __name__ == "__main__":
    pytest.main([__file__, "-v"])