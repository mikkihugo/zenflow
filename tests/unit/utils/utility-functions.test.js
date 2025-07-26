import { describe, it, expect } from '@jest/globals';

describe('Utility Functions', () => {
  describe('Security Utils', () => {
    it('should validate input sanitization', () => {
      const sanitizer = {
        sanitizeHtml: function(input) {
          return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
        },
        
        sanitizeFilePath: function(path) {
          // Remove directory traversal attempts
          return path
            .replace(/\.\./g, '')
            .replace(/\/+/g, '/')
            .replace(/^\//, '');
        },
        
        validateEmail: function(email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email);
        }
      };

      // HTML sanitization
      expect(sanitizer.sanitizeHtml('<script>alert("xss")</script>'))
        .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');

      // Path sanitization
      expect(sanitizer.sanitizeFilePath('../../../etc/passwd'))
        .toBe('etc/passwd');
      expect(sanitizer.sanitizeFilePath('/absolute/path'))
        .toBe('absolute/path');

      // Email validation
      expect(sanitizer.validateEmail('user@example.com')).toBe(true);
      expect(sanitizer.validateEmail('invalid-email')).toBe(false);
      expect(sanitizer.validateEmail('user@')).toBe(false);
    });

    it('should handle rate limiting', () => {
      const rateLimiter = {
        requests: new Map(),
        windowMs: 60000, // 1 minute
        maxRequests: 100,
        
        isAllowed: function(clientId) {
          const now = Date.now();
          const clientData = this.requests.get(clientId) || { count: 0, resetTime: now + this.windowMs };
          
          if (now > clientData.resetTime) {
            clientData.count = 0;
            clientData.resetTime = now + this.windowMs;
          }
          
          if (clientData.count >= this.maxRequests) {
            return false;
          }
          
          clientData.count++;
          this.requests.set(clientId, clientData);
          return true;
        },
        
        getRemainingRequests: function(clientId) {
          const clientData = this.requests.get(clientId) || { count: 0 };
          return Math.max(0, this.maxRequests - clientData.count);
        }
      };

      // Initial requests should be allowed
      expect(rateLimiter.isAllowed('client1')).toBe(true);
      expect(rateLimiter.getRemainingRequests('client1')).toBe(99);

      // Simulate hitting the limit
      const clientData = { count: 100, resetTime: Date.now() + 60000 };
      rateLimiter.requests.set('client2', clientData);
      expect(rateLimiter.isAllowed('client2')).toBe(false);
      expect(rateLimiter.getRemainingRequests('client2')).toBe(0);
    });
  });

  describe('File System Utils', () => {
    it('should handle path operations', () => {
      const pathUtils = {
        join: function(...segments) {
          return segments
            .filter(segment => segment && typeof segment === 'string')
            .join('/')
            .replace(/\/+/g, '/');
        },
        
        dirname: function(path) {
          const lastSlash = path.lastIndexOf('/');
          return lastSlash > 0 ? path.substring(0, lastSlash) : '.';
        },
        
        basename: function(path, ext = '') {
          const lastSlash = path.lastIndexOf('/');
          const name = lastSlash >= 0 ? path.substring(lastSlash + 1) : path;
          return ext && name.endsWith(ext) ? name.slice(0, -ext.length) : name;
        },
        
        extname: function(path) {
          const lastDot = path.lastIndexOf('.');
          const lastSlash = path.lastIndexOf('/');
          return lastDot > lastSlash ? path.substring(lastDot) : '';
        }
      };

      expect(pathUtils.join('path', 'to', 'file.txt')).toBe('path/to/file.txt');
      expect(pathUtils.join('path/', '/to/', '/file.txt')).toBe('path/to/file.txt');
      
      expect(pathUtils.dirname('/path/to/file.txt')).toBe('/path/to');
      expect(pathUtils.dirname('file.txt')).toBe('.');
      
      expect(pathUtils.basename('/path/to/file.txt')).toBe('file.txt');
      expect(pathUtils.basename('/path/to/file.txt', '.txt')).toBe('file');
      
      expect(pathUtils.extname('/path/to/file.txt')).toBe('.txt');
      expect(pathUtils.extname('/path/to/file')).toBe('');
    });

    it('should handle file filtering', () => {
      const fileFilter = {
        filters: {
          javascript: /\.(js|jsx|ts|tsx)$/,
          images: /\.(jpg|jpeg|png|gif|svg)$/,
          documents: /\.(pdf|doc|docx|txt|md)$/
        },
        
        filterByType: function(files, type) {
          const pattern = this.filters[type];
          return pattern ? files.filter(file => pattern.test(file)) : files;
        },
        
        filterBySize: function(files, maxSize) {
          return files.filter(file => !file.size || file.size <= maxSize);
        },
        
        filterByDate: function(files, since) {
          return files.filter(file => !file.mtime || file.mtime >= since);
        }
      };

      const testFiles = [
        { name: 'app.js', size: 1024 },
        { name: 'style.css', size: 2048 },
        { name: 'image.png', size: 5000 },
        { name: 'readme.md', size: 512 }
      ];

      const jsFiles = fileFilter.filterByType(testFiles.map(f => f.name), 'javascript');
      expect(jsFiles).toEqual(['app.js']);

      const smallFiles = fileFilter.filterBySize(testFiles, 2000);
      expect(smallFiles).toHaveLength(3);
      expect(smallFiles.some(f => f.name === 'image.png')).toBe(false);
    });
  });

  describe('String Utils', () => {
    it('should handle string formatting', () => {
      const stringUtils = {
        capitalize: function(str) {
          return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        },
        
        camelCase: function(str) {
          return str
            .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
            .replace(/^(.)/, (_, char) => char.toLowerCase());
        },
        
        kebabCase: function(str) {
          return str
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/[\s_]+/g, '-')
            .toLowerCase();
        },
        
        truncate: function(str, length, suffix = '...') {
          return str.length <= length ? str : str.substring(0, length - suffix.length) + suffix;
        },
        
        slugify: function(str) {
          return str
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        }
      };

      expect(stringUtils.capitalize('hello world')).toBe('Hello world');
      expect(stringUtils.camelCase('hello-world_test')).toBe('helloWorldTest');
      expect(stringUtils.kebabCase('HelloWorldTest')).toBe('hello-world-test');
      expect(stringUtils.truncate('This is a long string', 10)).toBe('This is...');
      expect(stringUtils.slugify('Hello World! 123')).toBe('hello-world-123');
    });

    it('should handle template interpolation', () => {
      const templateEngine = {
        interpolate: function(template, data) {
          return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return data.hasOwnProperty(key) ? data[key] : match;
          });
        },
        
        interpolateAdvanced: function(template, data) {
          return template.replace(/\{\{([\w.]+)\}\}/g, (match, path) => {
            const value = this.getNestedValue(data, path);
            return value !== undefined ? value : match;
          });
        },
        
        getNestedValue: function(obj, path) {
          return path.split('.').reduce((current, key) => 
            current && current.hasOwnProperty(key) ? current[key] : undefined, obj
          );
        }
      };

      const data = {
        name: 'Claude',
        version: '2.0.0',
        config: { port: 3000, debug: true }
      };

      expect(templateEngine.interpolate('Hello {{name}}!', data)).toBe('Hello Claude!');
      expect(templateEngine.interpolateAdvanced('Port: {{config.port}}', data)).toBe('Port: 3000');
      expect(templateEngine.interpolate('Missing: {{missing}}', data)).toBe('Missing: {{missing}}');
    });
  });

  describe('Validation Utils', () => {
    it('should validate data types', () => {
      const validator = {
        isString: (value) => typeof value === 'string',
        isNumber: (value) => typeof value === 'number' && !isNaN(value),
        isArray: (value) => Array.isArray(value),
        isObject: (value) => value !== null && typeof value === 'object' && !Array.isArray(value),
        isEmpty: (value) => {
          if (value === null || value === undefined) return true;
          if (typeof value === 'string' || Array.isArray(value)) return value.length === 0;
          if (typeof value === 'object') return Object.keys(value).length === 0;
          return false;
        },
        
        validateSchema: function(data, schema) {
          const errors = [];
          
          for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];
            
            if (rules.required && this.isEmpty(value)) {
              errors.push(`${field} is required`);
              continue;
            }
            
            if (!this.isEmpty(value)) {
              if (rules.type && !this[`is${rules.type}`](value)) {
                errors.push(`${field} must be of type ${rules.type.toLowerCase()}`);
              }
              
              if (rules.minLength && value.length < rules.minLength) {
                errors.push(`${field} must be at least ${rules.minLength} characters`);
              }
              
              if (rules.maxLength && value.length > rules.maxLength) {
                errors.push(`${field} must be at most ${rules.maxLength} characters`);
              }
            }
          }
          
          return errors;
        }
      };

      // Type validation
      expect(validator.isString('hello')).toBe(true);
      expect(validator.isString(123)).toBe(false);
      expect(validator.isNumber(42)).toBe(true);
      expect(validator.isNumber('42')).toBe(false);
      expect(validator.isArray([1, 2, 3])).toBe(true);
      expect(validator.isObject({ key: 'value' })).toBe(true);

      // Empty validation
      expect(validator.isEmpty('')).toBe(true);
      expect(validator.isEmpty([])).toBe(true);
      expect(validator.isEmpty({})).toBe(true);
      expect(validator.isEmpty(null)).toBe(true);
      expect(validator.isEmpty('hello')).toBe(false);

      // Schema validation
      const schema = {
        name: { required: true, type: 'String', minLength: 2, maxLength: 50 },
        age: { required: false, type: 'Number' },
        email: { required: true, type: 'String' }
      };

      const validData = { name: 'John', age: 30, email: 'john@example.com' };
      expect(validator.validateSchema(validData, schema)).toEqual([]);

      const invalidData = { name: 'A', age: 'thirty' };
      const errors = validator.validateSchema(invalidData, schema);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('name must be at least 2 characters'))).toBe(true);
      expect(errors.some(e => e.includes('email is required'))).toBe(true);
    });
  });

  describe('Event Utils', () => {
    it('should handle event emitter functionality', () => {
      const eventEmitter = {
        events: new Map(),
        
        on: function(event, listener) {
          if (!this.events.has(event)) {
            this.events.set(event, []);
          }
          this.events.get(event).push(listener);
        },
        
        off: function(event, listener) {
          if (this.events.has(event)) {
            const listeners = this.events.get(event);
            const index = listeners.indexOf(listener);
            if (index >= 0) {
              listeners.splice(index, 1);
            }
          }
        },
        
        emit: function(event, ...args) {
          if (this.events.has(event)) {
            this.events.get(event).forEach(listener => {
              try {
                listener(...args);
              } catch (error) {
                console.error('Event listener error:', error);
              }
            });
          }
        },
        
        once: function(event, listener) {
          const onceListener = (...args) => {
            this.off(event, onceListener);
            listener(...args);
          };
          this.on(event, onceListener);
        }
      };

      let callCount = 0;
      const listener = () => callCount++;
      
      eventEmitter.on('test', listener);
      eventEmitter.emit('test');
      expect(callCount).toBe(1);
      
      eventEmitter.emit('test');
      expect(callCount).toBe(2);
      
      eventEmitter.off('test', listener);
      eventEmitter.emit('test');
      expect(callCount).toBe(2); // Should not increment

      // Test once
      let onceCallCount = 0;
      eventEmitter.once('once-test', () => onceCallCount++);
      eventEmitter.emit('once-test');
      eventEmitter.emit('once-test');
      expect(onceCallCount).toBe(1); // Should only be called once
    });
  });
});