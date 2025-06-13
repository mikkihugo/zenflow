"""
Greeting generator module for Hello World application
"""
import random
from typing import Dict, List, Optional
from dataclasses import dataclass
from utils.decorators import memoize, timer
from config import Config


@dataclass
class GreetingTemplate:
    """Template for a greeting in a specific language"""
    language: str
    formal: str
    informal: str
    casual: str
    time_based: Dict[str, str]
    special: Dict[str, str]


class GreetingGenerator:
    """Generate greetings in multiple languages with various styles"""
    
    def __init__(self, config: Config):
        self.config = config
        self.templates = self._initialize_templates()
        self.emoji_map = self._initialize_emoji_map()
    
    def _initialize_templates(self) -> Dict[str, GreetingTemplate]:
        """Initialize greeting templates for all supported languages"""
        return {
            "english": GreetingTemplate(
                language="english",
                formal="Good day, {name}!",
                informal="Hello, {name}!",
                casual="Hey {name}!",
                time_based={
                    "morning": "Good morning, {name}!",
                    "afternoon": "Good afternoon, {name}!",
                    "evening": "Good evening, {name}!",
                    "night": "Good night, {name}!"
                },
                special={
                    "welcome": "Welcome, {name}!",
                    "greeting": "Greetings, {name}!",
                    "salutation": "Salutations, {name}!"
                }
            ),
            "spanish": GreetingTemplate(
                language="spanish",
                formal="Buenos días, {name}!",
                informal="¡Hola, {name}!",
                casual="¡Ey {name}!",
                time_based={
                    "morning": "¡Buenos días, {name}!",
                    "afternoon": "¡Buenas tardes, {name}!",
                    "evening": "¡Buenas tardes, {name}!",
                    "night": "¡Buenas noches, {name}!"
                },
                special={
                    "welcome": "¡Bienvenido, {name}!",
                    "greeting": "¡Saludos, {name}!",
                    "salutation": "¡Saludos cordiales, {name}!"
                }
            ),
            "french": GreetingTemplate(
                language="french",
                formal="Bonjour, {name}!",
                informal="Salut, {name}!",
                casual="Coucou {name}!",
                time_based={
                    "morning": "Bonjour, {name}!",
                    "afternoon": "Bon après-midi, {name}!",
                    "evening": "Bonsoir, {name}!",
                    "night": "Bonne nuit, {name}!"
                },
                special={
                    "welcome": "Bienvenue, {name}!",
                    "greeting": "Salutations, {name}!",
                    "salutation": "Mes salutations, {name}!"
                }
            ),
            "german": GreetingTemplate(
                language="german",
                formal="Guten Tag, {name}!",
                informal="Hallo, {name}!",
                casual="Hey {name}!",
                time_based={
                    "morning": "Guten Morgen, {name}!",
                    "afternoon": "Guten Tag, {name}!",
                    "evening": "Guten Abend, {name}!",
                    "night": "Gute Nacht, {name}!"
                },
                special={
                    "welcome": "Willkommen, {name}!",
                    "greeting": "Grüße, {name}!",
                    "salutation": "Herzliche Grüße, {name}!"
                }
            ),
            "italian": GreetingTemplate(
                language="italian",
                formal="Buongiorno, {name}!",
                informal="Ciao, {name}!",
                casual="Ehi {name}!",
                time_based={
                    "morning": "Buongiorno, {name}!",
                    "afternoon": "Buon pomeriggio, {name}!",
                    "evening": "Buonasera, {name}!",
                    "night": "Buonanotte, {name}!"
                },
                special={
                    "welcome": "Benvenuto, {name}!",
                    "greeting": "Saluti, {name}!",
                    "salutation": "Cordiali saluti, {name}!"
                }
            ),
            "japanese": GreetingTemplate(
                language="japanese",
                formal="こんにちは、{name}さん！",
                informal="やあ、{name}！",
                casual="よー、{name}！",
                time_based={
                    "morning": "おはようございます、{name}さん！",
                    "afternoon": "こんにちは、{name}さん！",
                    "evening": "こんばんは、{name}さん！",
                    "night": "おやすみなさい、{name}さん！"
                },
                special={
                    "welcome": "ようこそ、{name}さん！",
                    "greeting": "ご挨拶、{name}さん！",
                    "salutation": "よろしく、{name}さん！"
                }
            )
        }
    
    def _initialize_emoji_map(self) -> Dict[str, str]:
        """Initialize emoji map for different languages"""
        return {
            "english": "👋",
            "spanish": "🇪🇸",
            "french": "🇫🇷",
            "german": "🇩🇪",
            "italian": "🇮🇹",
            "japanese": "🇯🇵"
        }
    
    @timer
    @memoize
    def generate(self, name: str, language: str = None, 
                 style: str = "informal", variation: str = None) -> str:
        """Generate a greeting for the given name and language"""
        # Use default language if not specified
        language = language or self.config.default_language
        
        # Validate language
        if language not in self.templates:
            raise ValueError(
                f"Unsupported language: {language}. "
                f"Supported languages: {list(self.templates.keys())}"
            )
        
        template = self.templates[language]
        
        # Select greeting based on style and variation
        if variation and variation in template.time_based:
            greeting = template.time_based[variation]
        elif variation and variation in template.special:
            greeting = template.special[variation]
        elif style == "formal":
            greeting = template.formal
        elif style == "casual":
            greeting = template.casual
        else:
            greeting = template.informal
        
        # Format greeting with name
        formatted_greeting = greeting.format(name=name)
        
        # Add emoji if enabled
        if self.config.enable_emoji and language in self.emoji_map:
            formatted_greeting = f"{self.emoji_map[language]} {formatted_greeting}"
        
        return formatted_greeting
    
    def get_random_greeting(self, name: str, language: str = None) -> str:
        """Get a random greeting variation"""
        language = language or self.config.default_language
        template = self.templates[language]
        
        # Collect all available greetings
        all_greetings = [
            template.formal,
            template.informal,
            template.casual
        ] + list(template.time_based.values()) + list(template.special.values())
        
        # Select random greeting
        greeting = random.choice(all_greetings)
        formatted_greeting = greeting.format(name=name)
        
        # Add emoji if enabled
        if self.config.enable_emoji and language in self.emoji_map:
            formatted_greeting = f"{self.emoji_map[language]} {formatted_greeting}"
        
        return formatted_greeting
    
    def get_available_styles(self) -> List[str]:
        """Get list of available greeting styles"""
        return ["formal", "informal", "casual"]
    
    def get_available_variations(self, language: str = None) -> Dict[str, List[str]]:
        """Get available variations for a language"""
        language = language or self.config.default_language
        
        if language not in self.templates:
            return {}
        
        template = self.templates[language]
        return {
            "time_based": list(template.time_based.keys()),
            "special": list(template.special.keys())
        }