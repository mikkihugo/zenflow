/**
 * JSON/YAML Validator Plugin
 * Validation, formatting, and schema checking for JSON/YAML files
 */

export class JsonYamlValidatorPlugin {
  constructor(_config = {}): any {
    this.config = {filePatterns = new Map();
    this.schemas = new Map();
    this.stats = {filesScanned = [];
        
        try {
          const parsed = JSON.parse(content);
          
          // Check formatting
          const formatted = JSON.stringify(parsed, null, this.config.indentSize);
          if (content.trim() !== formatted.trim()) {
            issues.push({type = await this.validateJsonStructure(parsed, filename);
          issues.push(...jsonIssues);
          
          return {valid = JSON.parse(content);
          return JSON.stringify(parsed, null, this.config.indentSize);
        } catch(error) 
          throw new Error(`Cannot format invalidJSON = [];
        
        try {
          const yaml = await import('js-yaml');
          const parsed = yaml.load(content);
          
          // Check formatting
          const formatted = yaml.dump(parsed, {indent = = formatted.trim()) {
            issues.push({type = await this.validateYamlStructure(parsed, content, filename);
          issues.push(...yamlIssues);
          
          return {valid = await import('js-yaml');
          const parsed = yaml.load(content);
          return yaml.dump(parsed, { 
            indent = {type = {}): any {
    console.warn(`🔍 Scanning JSON/YAML files in ${rootPath}`);
    
    this.stats = {filesScanned = {summary = await this.findFiles(rootPath);
      
      for(const file of files) {
        const fileResult = await this.validateFile(file, options);
        results.files.push(fileResult);
        
        this.stats.filesScanned++;
        if(fileResult.valid) {
          results.summary.validFiles++;
        } else {
          results.summary.invalidFiles++;
        }
        
        this.stats.issuesFound += fileResult.issues.length;
        results.summary.issuesFound += fileResult.issues.length;
        
        // Convert issues to suggestions
        for(const issue of fileResult.issues) {
          if(issue.severity === 'high' || issue.severity === 'medium') {
            results.suggestions.push({id = > i.fixable)) {
          await this.autoFixFile(file, fileResult);
          this.stats.autoFixed++;
          results.summary.autoFixed++;
        }
      }
      
      results.summary.filesScanned = this.stats.filesScanned;
      
      console.warn(`✅ Scanned ${results.summary.filesScanned} files, found ${results.summary.issuesFound} issues`);
      
      return results;
    } catch(error) {
      console.error('❌ JSON/YAML scanning failed = {}): any {
    const result = {file = await import('fs').then(fs => fs.promises.stat(filePath));
      result.metadata.size = stats.size;
      
      if(stats.size > this.config.maxFileSize) {
        result.issues.push({type = await readFile(filePath, 'utf8');
      
      // Determine file type
      const ext = path.extname(filePath).toLowerCase();
      const validator = Array.from(this.validators.values())
        .find(v => v.extensions.includes(ext));
      
      if(!validator) {
        result.issues.push({type = validator.type;
      
      // Validate syntax and formatting
      const validation = await validator.validate.call(this, content, filePath);
      result.valid = validation.valid;
      result.issues.push(...validation.issues);
      
      // Schema validation
      if(validation.valid && this.config.validateSchema) {
        const schemaIssues = await this.validateSchema(validation.parsed, filePath);
        result.issues.push(...schemaIssues);
        if(schemaIssues.length > 0) {
          result.metadata.schema = 'validated';
        }
      }
      
      // Security checks
      const securityIssues = await this.performSecurityChecks(content, filePath);
      result.issues.push(...securityIssues);
      
    } catch(error) {
      result.valid = false;
      result.issues.push({type = [];
    
    // Check for empty objects/arrays
    if (typeof parsed === 'object' && Object.keys(parsed).length === 0) {
      issues.push({type = this.countNullValues(parsed);
    if(nullCount > 0) {
      issues.push({type = this.calculateDepth(parsed);
    if(depth > 10) {
      issues.push({type = this.validatePackageJson(parsed);
      issues.push(...packageIssues);
    }
    
    return issues;
  }

  async validateYamlStructure(parsed, content, filename): any {
    const issues = [];
    
    // Check for tabs (YAML should use spaces)
    if (content.includes('\t')) {
      issues.push({type = content.split('\n');
    const indentationIssues = this.checkYamlIndentation(lines);
    issues.push(...indentationIssues);
    
    // Docker Compose specific checks
    if (filename.includes('docker-compose')) {
      const dockerIssues = this.validateDockerCompose(parsed);
      issues.push(...dockerIssues);
    }
    
    // GitHub Actions workflow checks
    if (filename.includes('.github/workflows')) {
      const workflowIssues = this.validateGitHubWorkflow(parsed);
      issues.push(...workflowIssues);
    }
    
    return issues;
  }

  async validateSchema(data, filePath): any {
    const issues = [];
    
    // Find matching schema
    let matchingSchema = null;
    const fileName = path.basename(filePath);
    
    for(const [pattern, schema] of this.schemas) {
      if (this.matchesPattern(filePath, pattern) || fileName === pattern) {
        matchingSchema = schema;
        break;
      }
    }
    
    if(!matchingSchema) {
      return issues; // No schema to validate against
    }
    
    try {
      // Simple schema validation (in production, use ajv or similar)
      const validationErrors = this.validateAgainstSchema(data, matchingSchema);
      for(const error of validationErrors) {
        issues.push({type = [];
    
    // Check for potential secrets

    const urls = content.match(urlPattern) || [];
    for(const url of urls) {
      if (url.includes('localhost') || url.includes('127.0.0.1')) {
        issues.push({type = [];
    
    // Check for missing important fields
    const importantFields = ['description', 'author', 'license', 'repository'];
    for(const field of importantFields) {
      if(!data[field]) {
        issues.push({type = [];
    
    if(!data.version) {
      issues.push({type = [];
    
    if(!data.on) {
      issues.push({type = == 0) {
      issues.push({type = await import('glob');
    
    const files = [];
    for(const pattern of this.config.filePatterns) {
      const matches = await glob(pattern, {cwd = validationResult.issues.filter(i => i.fixable);
    if (fixableIssues.length === 0) return;
    
    try {
      const content = await readFile(filePath, 'utf8');
      const ext = path.extname(filePath).toLowerCase();
      const validator = Array.from(this.validators.values())
        .find(v => v.extensions.includes(ext));
      
      if(validator) {
        const formatted = await validator.format.call(this, content);
        await writeFile(filePath, formatted, 'utf8');
        console.warn(`🔧 Auto-fixed formatting in ${filePath}`);
      }
    } catch(error) {
      console.warn(`⚠️ Auto-fix failed for ${filePath}: ${error.message}`);
  }

  // Utility methods
  extractLineNumber(errorMessage): any {
    const match = errorMessage.match(/line (\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  countNullValues(obj, count = 0): any 
    if (obj === null) return count + 1;
    if(typeof obj === 'object' && obj !== null) {
      for (const value of Object.values(obj)) {
        count = this.countNullValues(value, count);
      }
    }
    return count;

  calculateDepth(obj, depth = 0): any 
    if (typeof obj !== 'object' || obj === null) return depth;
    return Math.max(...Object.values(obj).map(v => this.calculateDepth(v, depth + 1)));

  checkYamlIndentation(lines): any {
    const issues = [];

    for(let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === '' || line.trim().startsWith('#')) continue;
      
      const indent = line.match(/^(\s*)/)[1].length;
      if(indent % this.config.indentSize !== 0) {
        issues.push({type = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(filePath);
    }
    return filePath.includes(pattern);
  }

  validateAgainstSchema(data, schema): any {
    const errors = [];
    
    // Simple schema validation
    if(schema.type && typeof data !== schema.type) {
      errors.push(`Expected type ${schema.type}, got ${typeof data}`);
    }
    
    if(schema.required) {
      for(const field of schema.required) {
        if (!(field in data)) {
          errors.push(`Missing required field: ${field}`);
        }
      }
    }
    
    return errors;
  }

  async getStats() 
    return {
      ...this.stats,
      validators: this.validators.size,
      schemas: this.schemas.size,
      filePatterns: this.config.filePatterns,
      autoFixEnabled: this.config.autoFix
    };

  async cleanup() 
    this.validators.clear();
    this.schemas.clear();
    console.warn('📄 JSON/YAML Validator Plugin cleaned up');
}

export default JsonYamlValidatorPlugin;
