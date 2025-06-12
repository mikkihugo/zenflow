/**
 * Unit tests for validation functions
 */

import {
  validateEmail,
  validatePassword,
  validateUsername,
  validateAge,
  validateUserRegistration,
  UserRegistration
} from '../../src/validators/user';

describe('User Validators - Unit Tests', () => {
  describe('validateEmail()', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('user@example.com').isValid).toBe(true);
      expect(validateEmail('test.user@domain.co.uk').isValid).toBe(true);
      expect(validateEmail('user+tag@example.com').isValid).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid.email').isValid).toBe(false);
      expect(validateEmail('@example.com').isValid).toBe(false);
      expect(validateEmail('user@').isValid).toBe(false);
      expect(validateEmail('user @example.com').isValid).toBe(false);
    });

    it('should require email', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email is required');
    });
  });

  describe('validatePassword()', () => {
    it('should validate strong passwords', () => {
      expect(validatePassword('StrongP@ss123').isValid).toBe(true);
      expect(validatePassword('Another$ecure1').isValid).toBe(true);
    });

    it('should reject weak passwords', () => {
      const shortPass = validatePassword('Pass1!');
      expect(shortPass.isValid).toBe(false);
      expect(shortPass.errors).toContain('Password must be at least 8 characters long');

      const noUpper = validatePassword('weakpass123!');
      expect(noUpper.isValid).toBe(false);
      expect(noUpper.errors).toContain('Password must contain at least one uppercase letter');

      const noLower = validatePassword('WEAKPASS123!');
      expect(noLower.isValid).toBe(false);
      expect(noLower.errors).toContain('Password must contain at least one lowercase letter');

      const noNumber = validatePassword('WeakPass!');
      expect(noNumber.isValid).toBe(false);
      expect(noNumber.errors).toContain('Password must contain at least one number');

      const noSpecial = validatePassword('WeakPass123');
      expect(noSpecial.isValid).toBe(false);
      expect(noSpecial.errors).toContain('Password must contain at least one special character (!@#$%^&*)');
    });

    it('should require password', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });

    it('should return multiple errors for very weak passwords', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(3);
    });
  });

  describe('validateUsername()', () => {
    it('should validate correct usernames', () => {
      expect(validateUsername('john_doe').isValid).toBe(true);
      expect(validateUsername('user123').isValid).toBe(true);
      expect(validateUsername('test_user_99').isValid).toBe(true);
    });

    it('should reject invalid usernames', () => {
      const tooShort = validateUsername('ab');
      expect(tooShort.isValid).toBe(false);
      expect(tooShort.errors).toContain('Username must be at least 3 characters long');

      const tooLong = validateUsername('a'.repeat(21));
      expect(tooLong.isValid).toBe(false);
      expect(tooLong.errors).toContain('Username must not exceed 20 characters');

      const invalidChars = validateUsername('user@name');
      expect(invalidChars.isValid).toBe(false);
      expect(invalidChars.errors).toContain('Username can only contain letters, numbers, and underscores');

      const startsWithNumber = validateUsername('123user');
      expect(startsWithNumber.isValid).toBe(false);
      expect(startsWithNumber.errors).toContain('Username cannot start with a number');
    });

    it('should require username', () => {
      const result = validateUsername('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Username is required');
    });
  });

  describe('validateAge()', () => {
    it('should validate correct ages', () => {
      expect(validateAge(18).isValid).toBe(true);
      expect(validateAge(25).isValid).toBe(true);
      expect(validateAge(65).isValid).toBe(true);
    });

    it('should reject invalid ages', () => {
      const negative = validateAge(-5);
      expect(negative.isValid).toBe(false);
      expect(negative.errors).toContain('Age cannot be negative');

      const tooYoung = validateAge(10);
      expect(tooYoung.isValid).toBe(false);
      expect(tooYoung.errors).toContain('Must be at least 13 years old');

      const unrealistic = validateAge(150);
      expect(unrealistic.isValid).toBe(false);
      expect(unrealistic.errors).toContain('Age seems unrealistic');

      const decimal = validateAge(25.5);
      expect(decimal.isValid).toBe(false);
      expect(decimal.errors).toContain('Age must be a whole number');
    });

    it('should require age', () => {
      const result = validateAge(null as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Age is required');
    });
  });

  describe('validateUserRegistration()', () => {
    const validData: UserRegistration = {
      email: 'user@example.com',
      password: 'ValidP@ss123',
      confirmPassword: 'ValidP@ss123',
      username: 'valid_user',
      age: 25
    };

    it('should validate correct registration data', () => {
      const result = validateUserRegistration(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should validate all fields', () => {
      const invalidData: UserRegistration = {
        email: 'invalid.email',
        password: 'weak',
        confirmPassword: 'different',
        username: '123invalid',
        age: 10
      };

      const result = validateUserRegistration(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(5);
    });

    it('should check password confirmation', () => {
      const data = {
        ...validData,
        confirmPassword: 'DifferentPassword123!'
      };

      const result = validateUserRegistration(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Passwords do not match');
    });

    it('should collect all validation errors', () => {
      const emptyData: UserRegistration = {
        email: '',
        password: '',
        confirmPassword: '',
        username: '',
        age: null as any
      };

      const result = validateUserRegistration(emptyData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email is required');
      expect(result.errors).toContain('Password is required');
      expect(result.errors).toContain('Username is required');
      expect(result.errors).toContain('Age is required');
    });
  });
});