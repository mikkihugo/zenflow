"""Unit tests for text formatters."""

import unittest
from src.formatters.styles import (
    PlainFormatter,
    BoldFormatter,
    ColorFormatter,
    AsciiArtFormatter
)
from src.formatters.formatter_factory import FormatterFactory


class TestTextFormatters(unittest.TestCase):
    """Test cases for text formatters."""
    
    def test_plain_formatter(self):
        """Test plain text formatter."""
        formatter = PlainFormatter()
        text = "Hello, World!"
        self.assertEqual(formatter.format(text), text)
        self.assertEqual(formatter.style_name, "Plain")
    
    def test_bold_formatter(self):
        """Test bold text formatter."""
        formatter = BoldFormatter()
        text = "Hello, World!"
        formatted = formatter.format(text)
        self.assertTrue(formatted.startswith("\033[1m"))
        self.assertTrue(formatted.endswith("\033[0m"))
        self.assertIn(text, formatted)
        self.assertEqual(formatter.style_name, "Bold")
    
    def test_color_formatter(self):
        """Test color text formatter."""
        formatter = ColorFormatter()
        text = "Hello, World!"
        formatted = formatter.format(text)
        self.assertTrue(formatted.startswith("\033[9"))
        self.assertTrue(formatted.endswith("\033[0m"))
        self.assertIn(text, formatted)
        self.assertEqual(formatter.style_name, "Color")
    
    def test_ascii_art_formatter(self):
        """Test ASCII art formatter."""
        formatter = AsciiArtFormatter()
        text = "Hello!"
        formatted = formatter.format(text)
        self.assertIn(text, formatted)
        self.assertIn("*", formatted)
        self.assertEqual(formatter.style_name, "ASCII Art")


class TestFormatterFactory(unittest.TestCase):
    """Test cases for formatter factory."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.factory = FormatterFactory()
    
    def test_get_formatter_valid_styles(self):
        """Test getting formatters for valid styles."""
        styles = ["plain", "bold", "color", "ascii_art"]
        
        for style in styles:
            formatter = self.factory.get_formatter(style)
            self.assertIsNotNone(formatter)
            self.assertTrue(hasattr(formatter, 'format'))
    
    def test_get_formatter_case_insensitive(self):
        """Test that style selection is case-insensitive."""
        formatter1 = self.factory.get_formatter("PLAIN")
        formatter2 = self.factory.get_formatter("plain")
        formatter3 = self.factory.get_formatter("Plain")
        
        self.assertEqual(type(formatter1), type(formatter2))
        self.assertEqual(type(formatter2), type(formatter3))
    
    def test_get_formatter_invalid_style(self):
        """Test getting formatter for invalid style."""
        with self.assertRaises(ValueError):
            self.factory.get_formatter("rainbow")
    
    def test_list_styles(self):
        """Test listing supported styles."""
        styles = self.factory.list_styles()
        self.assertIsInstance(styles, list)
        self.assertIn("plain", styles)
        self.assertIn("bold", styles)
        self.assertEqual(len(styles), 4)


if __name__ == '__main__':
    unittest.main()