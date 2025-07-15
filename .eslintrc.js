module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    // Relaxed rules for development environment
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/prefer-const': 'warn',
    'no-console': 'off', // Allow console.log in CLI tools
    'no-process-exit': 'off', // Allow process.exit in CLI
    '@typescript-eslint/no-var-requires': 'off' // Allow require() for compatibility
  },
  ignorePatterns: [
    'dist/',
    'bin/',
    'node_modules/',
    'coverage/',
    '*.js' // Ignore JS files for now, focus on TS
  ],
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.js'],
      env: {
        jest: true
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off'
      }
    }
  ]
};