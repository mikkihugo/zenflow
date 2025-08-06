# 📚 Claude-Zen Documentation Tools Suite

> **Comprehensive JSDoc documentation generation, validation, and deployment tools for the unified architecture**

This suite provides enterprise-grade documentation tooling for Claude-Zen's unified architecture, covering all four layers: **UACL** (Unified API Client Layer), **DAL** (Data Access Layer), **USL** (Unified Service Layer), and **UEL** (Unified Event Layer).

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Build complete documentation
npm run docs:build

# Validate JSDoc compliance
npm run docs:validate

# Generate coverage report
npm run docs:coverage

# Deploy documentation
npm run docs:deploy
```

## 🛠️ Tools Overview

### 1. **JSDoc Validator** (`jsdoc-validator.js`)
*Comprehensive JSDoc validation and quality assurance*

**Features:**
- ✅ Layer-specific validation rules (UACL, DAL, USL, UEL)
- ✅ Coverage metrics and quality scoring
- ✅ Template compliance checking
- ✅ Cross-layer integration validation
- ✅ Automated reporting with remediation guidance

**Usage:**
```bash
# Basic validation
node scripts/jsdoc-validator.js

# Validate specific layer
node scripts/jsdoc-validator.js --layer dal

# Strict validation mode
node scripts/jsdoc-validator.js --strict

# Custom source directory
node scripts/jsdoc-validator.js --root ./custom/src
```

**NPM Scripts:**
```bash
npm run docs:validate      # Validate JSDoc compliance
npm run docs:validate:fix  # Validate with auto-fix enabled
```

### 2. **Documentation Coverage Reporter** (`docs-coverage.js`)
*Advanced documentation coverage analysis and trend tracking*

**Features:**
- 📊 Layer-specific coverage metrics
- 📈 Historical trend analysis and coverage drift detection
- 🏷️ Automated badge generation for README files
- 🎯 Quality scoring with weighted metrics
- 📋 CI/CD pipeline integration

**Usage:**
```bash
# Generate coverage report
node scripts/docs-coverage.js

# Custom output directory
node scripts/docs-coverage.js --output ./custom/coverage

# Disable badge generation
node scripts/docs-coverage.js --no-badges

# Set custom thresholds
node scripts/docs-coverage.js --threshold dal:90 --threshold uacl:85
```

**NPM Scripts:**
```bash
npm run docs:coverage  # Generate comprehensive coverage report
```

### 3. **Documentation Build System** (`docs-build.js`)
*Complete documentation build pipeline with multi-format output*

**Features:**
- 🏗️ TypeDoc integration with unified architecture theming
- ✅ Pre-build JSDoc validation and quality checks
- 📊 Coverage reporting with trend analysis
- 🌐 Static site generation with cross-layer navigation
- 📄 Multi-format output (HTML, Markdown, JSON, PDF)
- 🚀 CI/CD integration and deployment preparation

**Usage:**
```bash
# Complete build pipeline
node scripts/docs-build.js

# Build with validation disabled
node scripts/docs-build.js --no-validation

# Custom output directory
node scripts/docs-build.js --output ./custom-docs

# Specific formats only
node scripts/docs-build.js --formats html,json

# Strict validation mode
node scripts/docs-build.js --strict
```

**NPM Scripts:**
```bash
npm run docs:build      # Complete documentation build
npm run docs:full       # Build + enhanced processing
```

### 4. **Template Validator** (`template-validator.js`)
*JSDoc template standardization and formatting enforcement*

**Features:**
- 📝 Template compliance checking and validation
- 🔧 Automatic template fixes and standardization
- 💻 Example code compilation and validation
- 🏗️ Layer-specific template requirements
- 📋 Cross-reference validation and link checking

**Usage:**
```bash
# Validate templates without auto-fix
node scripts/template-validator.js

# Validate with automatic fixes
node scripts/template-validator.js --auto-fix

# Validate specific layer only
node scripts/template-validator.js --layer dal

# Disable example validation
node scripts/template-validator.js --no-examples

# Custom source directory
node scripts/template-validator.js --root ./custom/src
```

**NPM Scripts:**
```bash
npm run docs:templates      # Validate JSDoc templates
npm run docs:templates:fix  # Validate with auto-fix enabled
```

### 5. **Deployment Pipeline** (`docs-deploy.js`)
*Automated documentation deployment to multiple targets*

**Features:**
- 🎯 Multi-target deployment (GitHub Pages, Netlify, AWS S3, Vercel)
- ⚡ Asset optimization and compression for production
- 🔐 SSL certificate management and security hardening
- 🔄 Rollback capabilities and deployment verification
- 📊 Performance monitoring and analytics integration
- 🔧 CI/CD integration (GitHub Actions, GitLab CI)

**Usage:**
```bash
# Deploy to all configured targets
node scripts/docs-deploy.js

# Deploy to specific target only
node scripts/docs-deploy.js --target github-pages

# Deploy with optimization disabled
node scripts/docs-deploy.js --no-optimization

# Deploy in staging environment
node scripts/docs-deploy.js --environment staging

# Deploy with rollback disabled
node scripts/docs-deploy.js --no-rollback
```

**NPM Scripts:**
```bash
npm run docs:deploy          # Deploy to production
npm run docs:deploy:staging  # Deploy to staging environment
```

## 📋 Configuration

### ESLint JSDoc Configuration
Enhanced ESLint configuration with JSDoc validation rules:

```javascript
// eslint.config.js
export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      'jsdoc': jsdocPlugin,
    },
    rules: {
      'jsdoc/require-description': ['error', {
        contexts: ['ClassDeclaration', 'FunctionDeclaration', 'MethodDefinition', 'TSInterfaceDeclaration']
      }],
      'jsdoc/require-param': 'error',
      'jsdoc/require-returns': ['error', {
        contexts: ['FunctionDeclaration', 'MethodDefinition'],
        exemptedBy: ['constructor', 'void']
      }],
      'jsdoc/require-example': ['warn', {
        contexts: ['ClassDeclaration', 'TSInterfaceDeclaration']
      }],
      // Layer-specific rules...
    }
  }
];
```

### TypeDoc Configuration
Comprehensive TypeDoc configuration for unified architecture:

```javascript
// typedoc.config.js
module.exports = {
  entryPoints: [
    // UACL - Unified API Client Layer
    'src/interfaces/clients/index.ts',
    // DAL - Data Access Layer  
    'src/database/index.ts',
    // USL - Unified Service Layer
    'src/interfaces/services/index.ts',
    // UEL - Unified Event Layer
    'src/interfaces/events/index.ts'
  ],
  out: 'docs/api',
  name: 'Claude-Zen Unified Architecture API',
  categoryOrder: [
    'UACL - Unified API Client Layer',
    'DAL - Data Access Layer',
    'USL - Unified Service Layer', 
    'UEL - Unified Event Layer'
  ]
};
```

### Layer-Specific Requirements

#### UACL (Unified API Client Layer)
- **Required Tags:** `@emits`, `@returns`, `@param`
- **Examples Required:** Yes  
- **Error Handling:** `@throws` documentation required
- **Focus Areas:** Client interface compliance, protocol specifications

#### DAL (Data Access Layer)
- **Required Tags:** `@throws`, `@template`, `@param`, `@returns`
- **Examples Required:** Yes
- **Error Handling:** Comprehensive `@throws` documentation
- **Focus Areas:** Repository patterns, transaction management, type safety

#### USL (Unified Service Layer)
- **Required Tags:** `@returns`, `@param`
- **Examples Required:** Yes
- **Error Handling:** Optional
- **Focus Areas:** Service lifecycle, dependency injection, health monitoring

#### UEL (Unified Event Layer)
- **Required Tags:** `@emits`, `@param`
- **Examples Required:** Yes  
- **Error Handling:** Optional
- **Focus Areas:** Event types, payload documentation, integration patterns

## 📊 Metrics and Reporting

### Coverage Thresholds
```javascript
const thresholds = {
  uacl: { minimum: 80, target: 90 },
  dal: { minimum: 85, target: 95 },
  usl: { minimum: 80, target: 90 },
  uel: { minimum: 75, target: 85 }
};
```

### Quality Metrics
- **Documentation Coverage:** Percentage of documented constructs
- **Quality Score:** Weighted average of documentation completeness and quality
- **Template Compliance:** Adherence to standardized JSDoc templates
- **Example Validation:** Syntactic correctness of code examples
- **Cross-Reference Integrity:** Validity of internal documentation links

### Badge Generation
Automated generation of documentation badges for README files:

```markdown
![Coverage Badge](https://img.shields.io/badge/docs%20coverage-94%25-brightgreen)
![Quality Badge](https://img.shields.io/badge/docs%20quality-87%25-green)
![Status Badge](https://img.shields.io/badge/docs%20status-excellent-brightgreen)
```

## 🔧 Integration

### GitHub Actions Integration
```yaml
name: Documentation
on: [push, pull_request]

jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Validate JSDoc
        run: npm run docs:validate
      - name: Generate coverage report
        run: npm run docs:coverage
      - name: Build documentation
        run: npm run docs:build
      - name: Deploy to GitHub Pages
        if: github.ref == 'refs/heads/main'
        run: npm run docs:deploy
```

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run docs:validate && npm run docs:templates"
    }
  }
}
```

### VSCode Integration
```json
{
  "eslint.workingDirectories": ["./"],
  "eslint.validate": ["typescript", "typescriptreact"],
  "jsdoc.completion": {
    "enabled": true,
    "tags": ["@param", "@returns", "@throws", "@example", "@since", "@version"]
  }
}
```

## 📈 Performance Optimization

### Build Performance
- **Parallel Processing:** Multi-threaded validation and processing
- **Incremental Builds:** Only process changed files
- **Caching:** Intelligent caching of validation results
- **Optimization:** Asset minification and compression

### Deployment Optimization
- **Asset Compression:** Gzip and Brotli compression
- **CDN Integration:** Optimized for content delivery networks
- **Caching Headers:** Proper HTTP caching configuration
- **Performance Monitoring:** Lighthouse integration for performance testing

## 🔍 Troubleshooting

### Common Issues

#### ESLint JSDoc Plugin Not Found
```bash
npm install --save-dev eslint-plugin-jsdoc
```

#### TypeDoc Build Fails
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Verify entry points exist
ls -la src/interfaces/clients/index.ts
```

#### Template Validation Errors
```bash
# Run with auto-fix to resolve common issues
npm run docs:templates:fix

# Check specific layer requirements
node scripts/template-validator.js --layer dal
```

#### Deployment Failures
```bash
# Validate build output first
npm run docs:validate

# Test deployment to staging
npm run docs:deploy:staging

# Check deployment logs
tail -f logs/deployment.log
```

### Debug Mode
Enable debug logging for detailed troubleshooting:

```bash
DEBUG=docs:* node scripts/docs-build.js
```

## 📚 Examples

### Basic Workflow
```bash
# 1. Validate existing documentation
npm run docs:validate

# 2. Fix any template issues
npm run docs:templates:fix

# 3. Generate coverage report
npm run docs:coverage

# 4. Build complete documentation
npm run docs:build

# 5. Deploy to production
npm run docs:deploy
```

### CI/CD Integration
```bash
# Continuous Integration
npm run docs:validate --strict
npm run docs:coverage --fail-threshold 80

# Continuous Deployment
npm run docs:build --environment production
npm run docs:deploy --target github-pages
```

### Custom Validation
```javascript
// Custom validation rules
const validator = new JSDocValidator({
  rootDir: './src',
  layers: ['uacl', 'dal'],
  rules: {
    dal: {
      requireExamples: true,
      requireThrows: true,
      requireTemplates: true
    }
  }
});

await validator.validate();
```

## 🤝 Contributing

### Development Setup
```bash
git clone https://github.com/mikkihugo/claude-code-zen.git
cd claude-code-zen
npm install
npm run docs:validate
```

### Adding New Tools
1. Create tool script in `scripts/` directory
2. Add corresponding NPM script in `package.json`
3. Update this README with usage documentation
4. Add integration tests in `src/__tests__/`

### Testing Documentation Tools
```bash
# Unit tests for documentation tools
npm test scripts/

# Integration tests with sample code
npm run test:docs-integration

# End-to-end deployment testing
npm run test:docs-e2e
```

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.

## 🙋‍♂️ Support

- **Documentation:** [Claude-Zen Wiki](https://github.com/mikkihugo/claude-code-zen/wiki)
- **Issues:** [GitHub Issues](https://github.com/mikkihugo/claude-code-zen/issues)
- **Discussions:** [GitHub Discussions](https://github.com/mikkihugo/claude-code-zen/discussions)

---

*Generated by Claude-Zen Documentation Tools Suite v2.0.0*