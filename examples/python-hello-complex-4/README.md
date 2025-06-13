# Complex Hello World Application

A sophisticated multi-file Python hello world application demonstrating advanced software engineering practices including modular architecture, configuration management, logging, testing, and multiple output styles.

## Features

- **Multi-language support**: English, Spanish, French, German, Italian, and Japanese
- **Multiple greeting styles**: Simple, Fancy, Banner, and ASCII art
- **Configurable settings**: JSON file or environment variables
- **Advanced logging**: Colored console output with multiple log levels
- **Comprehensive testing**: Unit tests with pytest
- **Modular architecture**: Separated concerns with core, utils, and config modules
- **CLI interface**: Full command-line argument support
- **Decorators**: Timer, validation, retry, memoization, and more
- **Multiple formatting options**: Progress bars, tables, and styled messages

## Project Structure

```
python-hello-complex-4/
├── main.py                 # Main entry point
├── config.py              # Configuration management
├── core/                  # Core business logic
│   ├── __init__.py
│   ├── greeting_generator.py  # Multi-language greeting generation
│   └── message_formatter.py   # Message formatting with styles
├── utils/                 # Utility modules
│   ├── __init__.py
│   ├── logger.py         # Custom logging with colors
│   └── decorators.py     # Helpful decorators
├── tests/                # Unit tests
│   ├── __init__.py
│   └── test_greeting.py  # Comprehensive test suite
├── requirements.txt      # Python dependencies
├── config.json          # Sample configuration file
└── README.md           # This file
```

## Installation

1. Clone or download this directory
2. Install dependencies (optional, for development):
   ```bash
   pip install -r requirements.txt
   ```

## Usage

### Basic Usage

```bash
# Simple hello world
python main.py

# Greet a specific person
python main.py --name "Alice"

# Use a different language
python main.py --name "Carlos" --language spanish

# Use fancy formatting
python main.py --name "Marie" --language french --style fancy

# Enable debug logging
python main.py --debug
```

### Command Line Options

- `--name, -n`: Name to greet (default: "World")
- `--language, -l`: Language for greeting (choices: english, spanish, french, german, italian, japanese)
- `--style, -s`: Message style (choices: simple, fancy, banner, ascii)
- `--debug, -d`: Enable debug logging
- `--config, -c`: Path to custom configuration file

### Examples

```bash
# ASCII art style
python main.py --name "World" --style ascii

# Spanish greeting with banner style
python main.py --name "Amigo" --language spanish --style banner

# Japanese greeting
python main.py --name "Tanaka" --language japanese

# Using custom configuration
python main.py --config custom_config.json
```

## Configuration

### Configuration File (config.json)

```json
{
  "default_name": "World",
  "default_language": "english",
  "default_style": "simple",
  "log_level": "INFO",
  "enable_emoji": true,
  "enable_colors": true,
  "max_line_length": 80
}
```

### Environment Variables

- `HELLO_DEFAULT_NAME`: Default name to greet
- `HELLO_DEFAULT_LANGUAGE`: Default language
- `HELLO_DEFAULT_STYLE`: Default formatting style
- `HELLO_LOG_LEVEL`: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
- `HELLO_ENABLE_EMOJI`: Enable emoji support (true/false)
- `HELLO_ENABLE_COLORS`: Enable colored output (true/false)

## Development

### Running Tests

```bash
# Run all tests
python -m pytest tests/

# Run with coverage
python -m pytest tests/ --cov=. --cov-report=html

# Run specific test file
python tests/test_greeting.py
```

### Code Style

```bash
# Format code with black
black .

# Check style with flake8
flake8 .

# Type checking with mypy
mypy .
```

## API Documentation

### GreetingGenerator

Generates greetings in multiple languages with various styles.

```python
from core.greeting_generator import GreetingGenerator
from config import Config

config = Config()
generator = GreetingGenerator(config)

# Generate a greeting
greeting = generator.generate("Alice", "english", style="formal")

# Get random greeting
random_greeting = generator.get_random_greeting("Bob", "spanish")
```

### MessageFormatter

Formats messages with different visual styles.

```python
from core.message_formatter import MessageFormatter
from config import Config

config = Config()
formatter = MessageFormatter(config)

# Format with style
formatted = formatter.format("Hello, World!", style="banner")

# Create progress bar
progress = formatter.create_progress_bar(50, 100)

# Create table
table = formatter.create_table(
    ["Name", "Language"],
    [["Alice", "English"], ["Carlos", "Spanish"]]
)
```

## License

This is a demonstration project created for educational purposes.