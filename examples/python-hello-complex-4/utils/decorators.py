"""
Utility decorators for Hello World application
"""
import functools
import time
from typing import Callable, Any
from utils.logger import get_logger


def timer(func: Callable) -> Callable:
    """Decorator to measure function execution time"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        logger = get_logger()
        start_time = time.time()
        
        logger.debug(f"Starting {func.__name__}...")
        result = func(*args, **kwargs)
        
        end_time = time.time()
        execution_time = end_time - start_time
        
        logger.debug(
            f"Completed {func.__name__} in {execution_time:.4f} seconds"
        )
        
        return result
    return wrapper


def validate_args(func: Callable) -> Callable:
    """Decorator to validate function arguments"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        logger = get_logger()
        
        # Log function call with arguments
        logger.debug(
            f"Calling {func.__name__} with args={args[1:]} kwargs={kwargs}"
        )
        
        # Basic validation example
        if 'name' in kwargs and kwargs['name']:
            if not isinstance(kwargs['name'], str):
                raise TypeError(f"Name must be a string, got {type(kwargs['name'])}")
            if len(kwargs['name']) > 50:
                raise ValueError("Name must be 50 characters or less")
        
        return func(*args, **kwargs)
    return wrapper


def retry(max_attempts: int = 3, delay: float = 1.0):
    """Decorator to retry function on failure"""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            logger = get_logger()
            attempts = 0
            last_error = None
            
            while attempts < max_attempts:
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    attempts += 1
                    last_error = e
                    
                    if attempts < max_attempts:
                        logger.warning(
                            f"Attempt {attempts} failed for {func.__name__}: {str(e)}. "
                            f"Retrying in {delay} seconds..."
                        )
                        time.sleep(delay)
                    else:
                        logger.error(
                            f"All {max_attempts} attempts failed for {func.__name__}"
                        )
            
            raise last_error
        return wrapper
    return decorator


def memoize(func: Callable) -> Callable:
    """Decorator to cache function results"""
    cache = {}
    
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        # Create a cache key from arguments
        cache_key = str(args) + str(sorted(kwargs.items()))
        
        if cache_key not in cache:
            cache[cache_key] = func(*args, **kwargs)
        
        return cache[cache_key]
    
    # Add method to clear cache
    wrapper.clear_cache = lambda: cache.clear()
    
    return wrapper


def singleton(cls):
    """Decorator to make a class a singleton"""
    instances = {}
    
    @functools.wraps(cls)
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]
    
    return get_instance


def deprecated(message: str = ""):
    """Decorator to mark functions as deprecated"""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            logger = get_logger()
            warning_msg = f"{func.__name__} is deprecated"
            if message:
                warning_msg += f": {message}"
            logger.warning(warning_msg)
            return func(*args, **kwargs)
        return wrapper
    return decorator