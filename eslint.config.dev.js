import antfu from '@antfu/eslint-config';

export default antfu({
  typescript: true,
  vue: false,
  react: false,

  // Development-friendly rules - warnings instead of errors for style
  rules: {
    // Critical errors only - keep these strict
    'no-undef': 'error',
    'prefer-const': 'error',

    // Development-friendly warnings
    'no-console': 'off', // Allow console during dev
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'unused-imports/no-unused-imports': 'warn',

    // Google style adaptations - as warnings for dev speed
    'style/indent': ['warn', 2], // Google uses 2-space indent
    'style/quotes': ['warn', 'single'], // Google prefers single quotes
    'style/semi': ['warn', 'always'], // Google requires semicolons
    'style/comma-dangle': ['warn', 'always-multiline'],
    'style/max-len': ['warn', { code: 120 }], // Google uses 80, relaxed to 120

    // JSDoc - encourage but don't block development
    'jsdoc/require-jsdoc': [
      'warn',
      {
        require: {
          FunctionDeclaration: true,
          ClassDeclaration: true,
          MethodDefinition: false, // Don't require for every method during dev
        },
      },
    ],
    'jsdoc/require-param': 'warn',
    'jsdoc/require-returns': 'warn',

    // Disable TypeScript naming convention rule that requires type info
    '@typescript-eslint/naming-convention': 'off',

    // Use basic camelcase rule instead
    camelcase: ['warn', { properties: 'never' }],
  },

  ignores: [
    'scripts/**/*',
    'dist/**/*',
    'coverage/**/*',
    'node_modules/**/*',
    '*.config.*',
    'test-results.json',
    '.eslintcache',
    'gts.json',
  ],
});
