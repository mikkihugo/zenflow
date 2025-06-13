"""Unit tests for greeting strategies."""

import unittest
from src.greetings.strategies import (
    EnglishGreeting,
    SpanishGreeting,
    FrenchGreeting,
    GermanGreeting,
    JapaneseGreeting
)
from src.greetings.greeting_factory import GreetingFactory


class TestGreetingStrategies(unittest.TestCase):
    """Test cases for greeting strategies."""
    
    def test_english_greeting(self):
        """Test English greeting."""
        greeting = EnglishGreeting()
        self.assertEqual(greeting.greet("Alice"), "Hello, Alice!")
        self.assertEqual(greeting.language, "English")
    
    def test_spanish_greeting(self):
        """Test Spanish greeting."""
        greeting = SpanishGreeting()
        self.assertEqual(greeting.greet("Carlos"), "¡Hola, Carlos!")
        self.assertEqual(greeting.language, "Spanish")
    
    def test_french_greeting(self):
        """Test French greeting."""
        greeting = FrenchGreeting()
        self.assertEqual(greeting.greet("Marie"), "Bonjour, Marie!")
        self.assertEqual(greeting.language, "French")
    
    def test_german_greeting(self):
        """Test German greeting."""
        greeting = GermanGreeting()
        self.assertEqual(greeting.greet("Hans"), "Hallo, Hans!")
        self.assertEqual(greeting.language, "German")
    
    def test_japanese_greeting(self):
        """Test Japanese greeting."""
        greeting = JapaneseGreeting()
        self.assertEqual(greeting.greet("Yuki"), "こんにちは、Yukiさん!")
        self.assertEqual(greeting.language, "Japanese")


class TestGreetingFactory(unittest.TestCase):
    """Test cases for greeting factory."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.factory = GreetingFactory()
    
    def test_get_greeting_valid_languages(self):
        """Test getting greetings for valid languages."""
        languages = ["english", "spanish", "french", "german", "japanese"]
        
        for lang in languages:
            greeting = self.factory.get_greeting(lang)
            self.assertIsNotNone(greeting)
            self.assertTrue(hasattr(greeting, 'greet'))
    
    def test_get_greeting_case_insensitive(self):
        """Test that language selection is case-insensitive."""
        greeting1 = self.factory.get_greeting("ENGLISH")
        greeting2 = self.factory.get_greeting("english")
        greeting3 = self.factory.get_greeting("English")
        
        self.assertEqual(type(greeting1), type(greeting2))
        self.assertEqual(type(greeting2), type(greeting3))
    
    def test_get_greeting_invalid_language(self):
        """Test getting greeting for invalid language."""
        with self.assertRaises(ValueError):
            self.factory.get_greeting("klingon")
    
    def test_list_languages(self):
        """Test listing supported languages."""
        languages = self.factory.list_languages()
        self.assertIsInstance(languages, list)
        self.assertIn("english", languages)
        self.assertIn("spanish", languages)
        self.assertEqual(len(languages), 5)


if __name__ == '__main__':
    unittest.main()