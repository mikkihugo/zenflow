/**
 * Tests for argument parsing utilities
 * Implements Google's testing best practices
 */

import { describe, it, expect } from '@jest/globals';
import {
  parseCommandLineArguments,
  validatePositionalArguments,
  parseCommandStructure,
  normalizeFlags,
  FlagValidator
} from '../argument-parser.js';
import { ValidationError } from '../cli-error.js';

describe('Argument Parser', () => {
  describe('parseCommandLineArguments', () => {
    it('should parse basic flags and arguments', () => {
      const args = ['command', 'arg1', '--flag1', 'value1', '--flag2'];
      const result = parseCommandLineArguments(args);
      
      expect(result.positionalArgs).toEqual(['command', 'arg1']);
      expect(result.flags).toEqual({
        flag1: 'value1',
        flag2: true
      });
    });
    
    it('should parse equals-style flags', () => {
      const args = ['--config=file.json', '--verbose=true'];
      const result = parseCommandLineArguments(args);
      
      expect(result.flags).toEqual({
        config: 'file.json',
        verbose: 'true'
      });
      expect(result.positionalArgs).toEqual([]);
    });
    
    it('should parse short flags', () => {
      const args = ['-v', '-f', 'file.txt', '-h'];
      const result = parseCommandLineArguments(args);
      
      expect(result.flags).toEqual({
        v: true,
        f: 'file.txt',
        h: true
      });
    });
    
    it('should provide helper methods', () => {
      const args = ['--flag1', 'value1', '--flag2'];
      const result = parseCommandLineArguments(args);
      
      expect(result.hasFlag('flag1')).toBe(true);
      expect(result.hasFlag('flag3')).toBe(false);
      expect(result.getFlag('flag1')).toBe('value1');
      expect(result.getFlag('flag3', 'default')).toBe('default');
      expect(result.getBooleanFlag('flag2')).toBe(true);
    });
    
    it('should throw error for required flag', () => {
      const args = ['--flag1', 'value1'];
      const result = parseCommandLineArguments(args);
      
      expect(() => result.requireFlag('flag2')).toThrow(ValidationError);
      expect(() => result.requireFlag('flag2', 'Custom error')).toThrow('Custom error');
      expect(result.requireFlag('flag1')).toBe('value1');
    });
  });
  
  describe('validatePositionalArguments', () => {
    it('should validate sufficient arguments', () => {
      const args = ['arg1', 'arg2', 'arg3'];
      expect(() => validatePositionalArguments(args, 2, 'usage')).not.toThrow();
    });
    
    it('should throw error for insufficient arguments', () => {
      const args = ['arg1'];
      expect(() => validatePositionalArguments(args, 2, 'test usage'))
        .toThrow(ValidationError);
      expect(() => validatePositionalArguments(args, 2, 'test usage'))
        .toThrow('Insufficient arguments. Usage: test usage');
    });
  });
  
  describe('parseCommandStructure', () => {
    it('should parse full command structure', () => {
      const argv = ['node', 'script.js', 'command', 'subcommand', 'arg1', '--flag1', 'value1'];
      const result = parseCommandStructure(argv);
      
      expect(result.command).toBe('command');
      expect(result.subcommand).toBe('subcommand');
      expect(result.args).toEqual(['arg1']);
      expect(result.flags).toEqual({ flag1: 'value1' });
    });
    
    it('should handle empty arguments', () => {
      const argv = ['node', 'script.js'];
      const result = parseCommandStructure(argv);
      
      expect(result.command).toBe(null);
      expect(result.subcommand).toBe(null);
      expect(result.args).toEqual([]);
      expect(result.flags).toEqual({});
    });
    
    it('should handle only command', () => {
      const argv = ['node', 'script.js', 'command', '--flag'];
      const result = parseCommandStructure(argv);
      
      expect(result.command).toBe('command');
      expect(result.subcommand).toBe(null);
      expect(result.args).toEqual([]);
      expect(result.flags).toEqual({ flag: true });
    });
  });
  
  describe('normalizeFlags', () => {
    it('should normalize kebab-case to camelCase', () => {
      const flags = {
        'max-agents': 5,
        'verbose-mode': true,
        'simple': 'value',
        'multi-word-flag': 'test'
      };
      
      const normalized = normalizeFlags(flags);
      
      expect(normalized).toEqual({
        maxAgents: 5,
        verboseMode: true,
        simple: 'value',
        multiWordFlag: 'test'
      });
    });
    
    it('should handle empty flags object', () => {
      const normalized = normalizeFlags({});
      expect(normalized).toEqual({});
    });
  });
  
  describe('FlagValidator', () => {
    let validator;
    
    beforeEach(() => {
      validator = new FlagValidator({
        stringFlag: 'test',
        numberFlag: '42',
        booleanFlag: true,
        enumFlag: 'option1',
        emptyFlag: ''
      });
    });
    
    describe('requireString', () => {
      it('should return valid string', () => {
        expect(validator.requireString('stringFlag')).toBe('test');
      });
      
      it('should throw error for missing flag', () => {
        expect(() => validator.requireString('missingFlag')).toThrow(ValidationError);
      });
      
      it('should throw error for empty string', () => {
        expect(() => validator.requireString('emptyFlag')).toThrow(ValidationError);
      });
    });
    
    describe('requireNumber', () => {
      it('should return valid number', () => {
        expect(validator.requireNumber('numberFlag')).toBe(42);
      });
      
      it('should throw error for invalid number', () => {
        expect(() => validator.requireNumber('stringFlag')).toThrow(ValidationError);
      });
    });
    
    describe('requireOneOf', () => {
      it('should return valid option', () => {
        expect(validator.requireOneOf('enumFlag', ['option1', 'option2'])).toBe('option1');
      });
      
      it('should throw error for invalid option', () => {
        expect(() => validator.requireOneOf('enumFlag', ['option2', 'option3']))
          .toThrow(ValidationError);
      });
    });
    
    describe('getter methods', () => {
      it('should get string flag with default', () => {
        expect(validator.getStringFlag('stringFlag')).toBe('test');
        expect(validator.getStringFlag('missingFlag', 'default')).toBe('default');
      });
      
      it('should get boolean flag', () => {
        expect(validator.getBooleanFlag('booleanFlag')).toBe(true);
        expect(validator.getBooleanFlag('missingFlag')).toBe(false);
      });
      
      it('should get number flag with default', () => {
        expect(validator.getNumberFlag('numberFlag')).toBe(42);
        expect(validator.getNumberFlag('missingFlag', 10)).toBe(10);
      });
    });
  });
});