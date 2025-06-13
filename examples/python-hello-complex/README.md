# Complex Hello World Application

A sophisticated multi-module Python application demonstrating advanced software engineering patterns and best practices.

## Features

- **Multi-language Support**: Greet in English, Spanish, French, German, and Japanese
- **Multiple Output Formats**: Plain text, bold, colored, and ASCII art
- **Modular Architecture**: Clean separation of concerns with factory patterns
- **Performance Monitoring**: Built-in performance measurement decorators
- **Comprehensive Logging**: Configurable logging with file and console output
- **Input Validation**: Robust input sanitization and validation
- **Extensive Testing**: Unit tests with high code coverage
- **Command-line Interface**: Rich CLI with argparse

## Project Structure

```
python-hello-complex/
├── main.py                 # Application entry point
├── config/                 # Configuration module
│   ├── __init__.py
│   └── settings.py         # Application settings
├── src/                    # Source code modules
│   ├── __init__.py
│   ├── greetings/          # Greeting strategies
│   │   ├── __init__.py
│   │   ├── base.py         # Abstract base class
│   │   ├── strategies.py   # Concrete implementations
│   │   └── greeting_factory.py
│   ├── formatters/         # Text formatting
│   │   ├── __init__.py
│   │   ├── base.py         # Abstract base class
│   │   ├── styles.py       # Formatting styles
│   │   └── formatter_factory.py
│   └── utils/              # Utility modules
│       ├── __init__.py
│       ├── logger.py       # Logging utilities
│       ├── performance.py  # Performance monitoring
│       └── validators.py   # Input validation
├── tests/                  # Unit tests
│   ├── __init__.py
│   ├── test_greetings.py
│   ├── test_formatters.py
│   └── test_utils.py
├── requirements.txt        # Project dependencies
├── setup.py               # Package configuration
└── README.md              # This file
```

## Installation

### From source:
```bash
# Clone the repository
git clone <repository-url>
cd python-hello-complex

# Install in development mode
pip install -e .

# Or install with all extras
pip install -e ".[dev,color,env]"
```

### Using pip:
```bash
pip install complex-hello-world
```

## Usage

### Basic usage:
```bash
python main.py
# Output: Hello, World!
```

### With custom name:
```bash
python main.py Alice
# Output: Hello, Alice!
```

### Different language:
```bash
python main.py --language spanish Maria
# Output: ¡Hola, Maria!
```

### With formatting:
```bash
python main.py --format bold John
# Output: **Hello, John!** (in bold)

python main.py --format color --language french Pierre
# Output: Bonjour, Pierre! (in color)

python main.py --format ascii_art World
# Output:
# ******************
# * Hello, World! *
# ******************
```

### With timestamp:
```bash
python main.py --timestamp Alice
# Output: [2024-01-15 10:30:45] Hello, Alice!
```

### Full example:
```bash
python main.py --language japanese --format color --timestamp --log-level DEBUG Yuki
```

## Command-line Arguments

- `name` (positional): Name to greet (default: "World")
- `-l, --language`: Language for greeting (choices: english, spanish, french, german, japanese)
- `-f, --format`: Output format (choices: plain, bold, color, ascii_art)
- `-t, --timestamp`: Include timestamp in output
- `--log-level`: Logging level (choices: DEBUG, INFO, WARNING, ERROR)

## Development

### Running tests:
```bash
# Run all tests
python -m pytest

# Run with coverage
python -m pytest --cov=src --cov-report=html

# Run specific test file
python -m pytest tests/test_greetings.py
```

### Code quality:
```bash
# Format code
black .

# Sort imports
isort .

# Lint code
flake8 .

# Type checking
mypy .
```

## Design Patterns

This application demonstrates several design patterns:

1. **Strategy Pattern**: Different greeting implementations for each language
2. **Factory Pattern**: Creation of greeting and formatter objects
3. **Decorator Pattern**: Performance measurement decorator
4. **Template Method**: Abstract base classes for greetings and formatters
5. **Singleton Pattern**: Logger instance management
6. **Dependency Injection**: Settings injection into application

## Extending the Application

### Adding a new language:
1. Create a new class in `src/greetings/strategies.py` inheriting from `GreetingStrategy`
2. Implement the `greet()` method and `language` property
3. Register it in `GreetingFactory` in `src/greetings/greeting_factory.py`
4. Add it to the CLI choices in `main.py`

### Adding a new format:
1. Create a new class in `src/formatters/styles.py` inheriting from `TextFormatter`
2. Implement the `format()` method and `style_name` property
3. Register it in `FormatterFactory` in `src/formatters/formatter_factory.py`
4. Add it to the CLI choices in `main.py`

## License

MIT License - see LICENSE file for details.