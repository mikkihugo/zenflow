"""Unit tests for utility modules."""

import unittest
import time
from src.utils.validators import InputValidator
from src.utils.performance import measure_performance, PerformanceTimer


class TestInputValidator(unittest.TestCase):
    """Test cases for input validator."""
    
    def test_validate_name_valid(self):
        """Test validation of valid names."""
        valid_names = [
            "John",
            "Mary Jane",
            "Jean-Pierre",
            "O'Connor",
            "Anne-Marie"
        ]
        
        for name in valid_names:
            self.assertTrue(
                InputValidator.validate_name(name),
                f"'{name}' should be valid"
            )
    
    def test_validate_name_invalid(self):
        """Test validation of invalid names."""
        invalid_names = [
            "",
            "   ",
            "John123",
            "User@Name",
            "Name!",
            "Test#Name"
        ]
        
        for name in invalid_names:
            self.assertFalse(
                InputValidator.validate_name(name),
                f"'{name}' should be invalid"
            )
    
    def test_sanitize_name(self):
        """Test name sanitization."""
        test_cases = [
            ("John123", "John"),
            ("Mary@Jane", "MaryJane"),
            ("Test!Name#", "TestName"),
            ("Jean   Pierre", "Jean Pierre"),
            ("  Space  Test  ", "Space Test")
        ]
        
        for input_name, expected in test_cases:
            result = InputValidator.sanitize_name(input_name)
            self.assertEqual(result, expected)
    
    def test_validate_language_code(self):
        """Test language code validation."""
        supported = ["en", "es", "fr", "de", "ja"]
        
        # Valid codes
        self.assertTrue(InputValidator.validate_language_code("en", supported))
        self.assertTrue(InputValidator.validate_language_code("ES", supported))
        
        # Invalid codes
        self.assertFalse(InputValidator.validate_language_code("ru", supported))
        self.assertFalse(InputValidator.validate_language_code("xyz", supported))


class TestPerformanceUtilities(unittest.TestCase):
    """Test cases for performance utilities."""
    
    def test_performance_timer(self):
        """Test performance timer context manager."""
        with PerformanceTimer("Test Operation") as timer:
            time.sleep(0.1)
        
        self.assertIsNotNone(timer.elapsed)
        self.assertGreater(timer.elapsed, 0.09)
        self.assertLess(timer.elapsed, 0.2)
    
    def test_measure_performance_decorator(self):
        """Test performance measurement decorator."""
        
        class MockObject:
            def __init__(self):
                self.call_count = 0
            
            @measure_performance
            def slow_method(self, duration):
                self.call_count += 1
                time.sleep(duration)
                return self.call_count
        
        obj = MockObject()
        result = obj.slow_method(0.05)
        
        self.assertEqual(result, 1)
        self.assertEqual(obj.call_count, 1)


if __name__ == '__main__':
    unittest.main()