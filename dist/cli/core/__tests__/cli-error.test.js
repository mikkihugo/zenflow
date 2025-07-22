/**
 * Tests for CLI error handling system
 * Implements Google's testing best practices
 */

import { describe, it, expect } from '@jest/globals';
import {
  CliError,
  ValidationError,
  ConfigurationError,
  CommandExecutionError,
  formatErrorMessage,
  handleError
} from '../cli-error.js';

describe('CLI Error System', () => {
  describe('CliError', () => {
    it('should create a basic CLI error', () => {
      const error = new CliError('Test error message');
      
      expect(error.name).toBe('CliError');
      expect(error.message).toBe('Test error message');
      expect(error.code).toBe('GENERIC_ERROR');
      expect(error.exitCode).toBe(1);
    });
    
    it('should create a CLI error with custom code and exit code', () => {
      const error = new CliError('Custom error', 'CUSTOM_CODE', 2);
      
      expect(error.code).toBe('CUSTOM_CODE');
      expect(error.exitCode).toBe(2);
    });
    
    it('should have proper stack trace', () => {
      const error = new CliError('Stack trace test');
      
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('Stack trace test');
    });
  });
  
  describe('ValidationError', () => {
    it('should create a validation error', () => {
      const error = new ValidationError('Invalid input');
      
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.field).toBe(null);
    });
    
    it('should create a validation error with field', () => {
      const error = new ValidationError('Invalid input', 'username');
      
      expect(error.field).toBe('username');
    });
  });
  
  describe('ConfigurationError', () => {
    it('should create a configuration error', () => {
      const error = new ConfigurationError('Config failed');
      
      expect(error.name).toBe('ConfigurationError');
      expect(error.code).toBe('CONFIG_ERROR');
      expect(error.configPath).toBe(null);
    });
    
    it('should create a configuration error with path', () => {
      const error = new ConfigurationError('Config failed', '/path/to/config');
      
      expect(error.configPath).toBe('/path/to/config');
    });
  });
  
  describe('CommandExecutionError', () => {
    it('should create a command execution error', () => {
      const error = new CommandExecutionError('Command failed');
      
      expect(error.name).toBe('CommandExecutionError');
      expect(error.code).toBe('COMMAND_ERROR');
      expect(error.command).toBe(null);
      expect(error.originalError).toBe(null);
    });
    
    it('should create a command execution error with details', () => {
      const originalError = new Error('Original error');
      const error = new CommandExecutionError('Command failed', 'test-command', originalError);
      
      expect(error.command).toBe('test-command');
      expect(error.originalError).toBe(originalError);
    });
  });
  
  describe('formatErrorMessage', () => {
    it('should format validation error', () => {
      const error = new ValidationError('Invalid input', 'username');
      const formatted = formatErrorMessage(error);
      
      expect(formatted).toBe('❌ Validation Error: Invalid input (Field: username)');
    });
    
    it('should format configuration error', () => {
      const error = new ConfigurationError('Config failed', '/config/path');
      const formatted = formatErrorMessage(error);
      
      expect(formatted).toBe('❌ Configuration Error: Config failed (Config: /config/path)');
    });
    
    it('should format command execution error', () => {
      const error = new CommandExecutionError('Command failed', 'test-cmd');
      const formatted = formatErrorMessage(error);
      
      expect(formatted).toBe('❌ Command Failed: Command failed (Command: test-cmd)');
    });
    
    it('should format generic CLI error', () => {
      const error = new CliError('Generic error');
      const formatted = formatErrorMessage(error);
      
      expect(formatted).toBe('❌ Generic error');
    });
    
    it('should format unexpected error', () => {
      const error = new Error('Unexpected error');
      const formatted = formatErrorMessage(error);
      
      expect(formatted).toBe('❌ Unexpected Error: Unexpected error');
    });
  });
  
  describe('handleError', () => {
    let mockLogger;
    
    beforeEach(() => {
      mockLogger = {
        error: jest.fn()
      };
    });
    
    it('should handle CLI error and return exit code', () => {
      const error = new CliError('Test error', 'TEST_CODE', 42);
      const exitCode = handleError(error, mockLogger);
      
      expect(exitCode).toBe(42);
      expect(mockLogger.error).toHaveBeenCalledWith('❌ Test error');
    });
    
    it('should handle unexpected error and return exit code 1', () => {
      const error = new Error('Unexpected error');
      const exitCode = handleError(error, mockLogger);
      
      expect(exitCode).toBe(1);
      expect(mockLogger.error).toHaveBeenCalledWith('❌ Unexpected Error: Unexpected error');
      expect(mockLogger.error).toHaveBeenCalledWith('Stack trace:', error.stack);
    });
    
    it('should use console as default logger', () => {
      const originalError = console.error;
      console.error = jest.fn();
      
      const error = new CliError('Test error');
      const exitCode = handleError(error);
      
      expect(exitCode).toBe(1);
      expect(console.error).toHaveBeenCalledWith('❌ Test error');
      
      console.error = originalError;
    });
  });
});