/**
 * ESLint Configuration for Export Restrictions
 * 
 * Enforces clean export patterns and prevents namespace pollution
 * by restricting problematic export patterns like 'export *'.
 */

module.exports = {
  rules: {
    // Disallow export * from modules 
    'import/no-export-star': 'error',
    
    // Prefer named exports over default exports for better tree-shaking
    'import/prefer-default-export': 'off',
    'import/no-default-export': 'warn',
    
    // Ensure all exports are explicitly named
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
  },
  
  // Custom rule to catch export * patterns
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        // Custom rule via regex to catch export * patterns
        'no-restricted-syntax': [
          'error',
          {
            selector: 'ExportAllDeclaration',
            message: 'export * is restricted. Use explicit named exports instead for better maintainability and tree-shaking.'
          },
          {
            selector: 'ExportAllDeclaration[source.value=/^\\./]',
            message: 'export * from local modules is not allowed. Use explicit named exports: export { Type1, Type2 } from "./module"'
          }
        ]
      }
    }
  ]
};