module.exports = {
  extends: ['../../../eslint.config.js'],
  rules: {
    // Interface implementations may have unused parameters
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        // Allow unused parameters in interface implementations
        args: 'after-used',
      },
    ],
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        args: 'after-used',
      },
    ],
    // Allow any types in interface type definitions (not implementations)
    '@typescript-eslint/no-explicit-any': [
      'error',
      {
        // Allow any in type definitions for external API compatibility
        ignoreRestArgs: true,
      },
    ],
  },
  overrides: [
    {
      // Interface implementation files can have unused parameters
      files: ['**/adapters/*.ts', '**/storage/*.ts'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        'no-unused-vars': 'off',
        // Allow any types in adapter implementations for external library compatibility
        '@typescript-eslint/no-explicit-any': 'warn',
      },
    },
    {
      // Type definition files can have any types
      files: ['**/types/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'no-unused-vars': 'off',
      },
    },
    {
      // Test files have more relaxed rules
      files: ['**/__tests__/**/*.ts', '**/*.test.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': 'warn',
        'no-unused-vars': 'warn',
      },
    },
  ],
};