#!/usr/bin/env python3
"""
Complex Hello World Application
Main entry point for the application
"""
import sys
import argparse
from datetime import datetime
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from config import Config
from core.greeting_generator import GreetingGenerator
from core.message_formatter import MessageFormatter
from utils.logger import Logger
from utils.decorators import timer, validate_args


class HelloWorldApp:
    """Main application class for Hello World"""
    
    def __init__(self, config: Config):
        self.config = config
        self.logger = Logger(config.log_level)
        self.greeting_generator = GreetingGenerator(config)
        self.message_formatter = MessageFormatter(config)
        
    @timer
    @validate_args
    def run(self, name: str = None, language: str = None, style: str = None):
        """Run the Hello World application"""
        self.logger.info("Starting Hello World application")
        
        # Use provided values or defaults from config
        name = name or self.config.default_name
        language = language or self.config.default_language
        style = style or self.config.default_style
        
        try:
            # Generate greeting
            greeting = self.greeting_generator.generate(name, language)
            
            # Format message
            formatted_message = self.message_formatter.format(
                greeting, 
                style=style,
                timestamp=datetime.now()
            )
            
            # Display message
            print(formatted_message)
            
            # Log success
            self.logger.info(f"Successfully generated greeting for {name} in {language}")
            
            return formatted_message
            
        except Exception as e:
            self.logger.error(f"Error generating greeting: {str(e)}")
            raise


def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(
        description="Complex Hello World Application",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py
  python main.py --name "Alice"
  python main.py --name "Bob" --language "spanish"
  python main.py --name "Charlie" --language "french" --style "fancy"
  python main.py --debug
        """
    )
    
    parser.add_argument(
        "--name", "-n",
        type=str,
        help="Name to greet (default: from config)"
    )
    
    parser.add_argument(
        "--language", "-l",
        type=str,
        choices=["english", "spanish", "french", "german", "italian", "japanese"],
        help="Language for greeting (default: from config)"
    )
    
    parser.add_argument(
        "--style", "-s",
        type=str,
        choices=["simple", "fancy", "banner", "ascii"],
        help="Message style (default: from config)"
    )
    
    parser.add_argument(
        "--debug", "-d",
        action="store_true",
        help="Enable debug logging"
    )
    
    parser.add_argument(
        "--config", "-c",
        type=str,
        help="Path to custom configuration file"
    )
    
    return parser.parse_args()


def main():
    """Main entry point"""
    args = parse_arguments()
    
    # Load configuration
    config = Config(args.config)
    
    # Override log level if debug flag is set
    if args.debug:
        config.log_level = "DEBUG"
    
    # Create and run application
    app = HelloWorldApp(config)
    
    try:
        app.run(
            name=args.name,
            language=args.language,
            style=args.style
        )
        sys.exit(0)
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()