"""Performance monitoring utilities."""

import time
import functools
from typing import Callable, Any


def measure_performance(func: Callable) -> Callable:
    """Decorator to measure function execution time.
    
    Args:
        func: The function to measure.
        
    Returns:
        The wrapped function.
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs) -> Any:
        start_time = time.perf_counter()
        
        try:
            result = func(*args, **kwargs)
            return result
        finally:
            end_time = time.perf_counter()
            execution_time = end_time - start_time
            
            # Try to log if logger is available
            if hasattr(args[0], 'logger'):
                args[0].logger.debug(
                    f"{func.__name__} executed in {execution_time:.4f} seconds"
                )
            else:
                print(f"Performance: {func.__name__} took {execution_time:.4f}s")
    
    return wrapper


class PerformanceTimer:
    """Context manager for timing code blocks."""
    
    def __init__(self, name: str = "Operation"):
        self.name = name
        self.start_time = None
        self.end_time = None
    
    def __enter__(self):
        self.start_time = time.perf_counter()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end_time = time.perf_counter()
        self.elapsed = self.end_time - self.start_time
        print(f"{self.name} completed in {self.elapsed:.4f} seconds")
    
    @property
    def elapsed_time(self) -> float:
        """Get the elapsed time."""
        if self.end_time is None:
            return time.perf_counter() - self.start_time
        return self.elapsed