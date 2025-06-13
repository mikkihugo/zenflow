#!/usr/bin/env python3
"""
Complex Hello World Application
A sophisticated multi-module Python application demonstrating advanced patterns.
"""

import sys
import argparse
from datetime import datetime
from src.greetings.greeting_factory import GreetingFactory
from src.formatters.formatter_factory import FormatterFactory
from src.utils.logger import Logger
from src.utils.performance import measure_performance
from config.settings import Settings


class HelloWorldApplication:
    """Main application class for the complex Hello World system."""
    
    def __init__(self, settings: Settings):
        self.settings = settings
        self.logger = Logger(settings.log_level)
        self.greeting_factory = GreetingFactory()
        self.formatter_factory = FormatterFactory()
    
    @measure_performance
    def run(self, args):
        """Execute the main application logic."""
        try:
            self.logger.info("Starting Hello World Application")
            
            # Get appropriate greeting
            greeting_strategy = self.greeting_factory.get_greeting(args.language)
            message = greeting_strategy.greet(args.name)
            
            # Apply formatting
            formatter = self.formatter_factory.get_formatter(args.format)
            formatted_message = formatter.format(message)
            
            # Add timestamp if requested
            if args.timestamp:
                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                formatted_message = f"[{timestamp}] {formatted_message}"
            
            # Output the result
            print(formatted_message)
            
            # Log success
            self.logger.info(f"Successfully greeted {args.name} in {args.language}")
            
            return 0
            
        except Exception as e:
            self.logger.error(f"Application error: {str(e)}")
            return 1


def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="A complex Hello World application with multiple features"
    )
    
    parser.add_argument(
        "name",
        nargs="?",
        default="World",
        help="Name to greet (default: World)"
    )
    
    parser.add_argument(
        "-l", "--language",
        choices=["english", "spanish", "french", "german", "japanese"],
        default="english",
        help="Language for greeting (default: english)"
    )
    
    parser.add_argument(
        "-f", "--format",
        choices=["plain", "bold", "color", "ascii_art"],
        default="plain",
        help="Output format (default: plain)"
    )
    
    parser.add_argument(
        "-t", "--timestamp",
        action="store_true",
        help="Include timestamp in output"
    )
    
    parser.add_argument(
        "--log-level",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        default="INFO",
        help="Logging level (default: INFO)"
    )
    
    return parser.parse_args()


def main():
    """Main entry point for the application."""
    args = parse_arguments()
    
    # Initialize settings
    settings = Settings(log_level=args.log_level)
    
    # Create and run application
    app = HelloWorldApplication(settings)
    return app.run(args)


if __name__ == "__main__":
    sys.exit(main())