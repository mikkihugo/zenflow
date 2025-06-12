/**
 * User validation functions
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*)');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateUsername(username: string): ValidationResult {
  const errors: string[] = [];
  
  if (!username) {
    errors.push('Username is required');
  } else {
    if (username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }
    if (username.length > 20) {
      errors.push('Username must not exceed 20 characters');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }
    if (/^[0-9]/.test(username)) {
      errors.push('Username cannot start with a number');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateAge(age: number): ValidationResult {
  const errors: string[] = [];
  
  if (age === null || age === undefined) {
    errors.push('Age is required');
  } else {
    if (!Number.isInteger(age)) {
      errors.push('Age must be a whole number');
    }
    if (age < 0) {
      errors.push('Age cannot be negative');
    }
    if (age < 13) {
      errors.push('Must be at least 13 years old');
    }
    if (age > 120) {
      errors.push('Age seems unrealistic');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export interface UserRegistration {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  age: number;
}

export function validateUserRegistration(data: UserRegistration): ValidationResult {
  const errors: string[] = [];
  
  // Validate individual fields
  const emailResult = validateEmail(data.email);
  const passwordResult = validatePassword(data.password);
  const usernameResult = validateUsername(data.username);
  const ageResult = validateAge(data.age);
  
  // Collect all errors
  errors.push(...emailResult.errors);
  errors.push(...passwordResult.errors);
  errors.push(...usernameResult.errors);
  errors.push(...ageResult.errors);
  
  // Check password confirmation
  if (data.password !== data.confirmPassword) {
    errors.push('Passwords do not match');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}