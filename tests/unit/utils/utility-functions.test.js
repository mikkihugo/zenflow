import { describe, expect } from '@jest/globals';

describe('Utility Functions', () => {
  describe('Security Utils', () => {
    it('should validate input sanitization', () => {
      const _sanitizer = {
        sanitizeHtml: (_input) =>;
      input;
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
            .replace(/'/g, '&#x27
      ');
            .replace(/\//g, '&#x2F;'),

        sanitizeFilePath: (path) =>
      // Remove directory traversal attempts
      return path.replace(/\.\./g, '').replace(/\/+/g, '/').replace(/^\//, '');
      //   // LINT: unreachable code removed},
      validateEmail: (email) => {
        const _emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
        //   // LINT: unreachable code removed},
      };
      // HTML sanitization
      expect(sanitizer.sanitizeHtml('<script>alert("xss")</script>')).toBe(;
      ('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
      )
      // Path sanitization
      expect(sanitizer.sanitizeFilePath('../../../etc/passwd')).toBe('etc/passwd')
      expect(sanitizer.sanitizeFilePath('/absolute/path')).toBe('absolute/path')
      // Email validation
      expect(sanitizer.validateEmail('user@example.com')).toBe(true)
      expect(sanitizer.validateEmail('invalid-email')).toBe(false)
      expect(sanitizer.validateEmail('user@')).toBe(false)
      )
      it('should handle rate limiting', () =>
      {
        const _rateLimiter = {
        requests: new Map(),
        windowMs: 60000, // 1 minute
          maxRequests;
        : 100,
        isAllowed:
        function (clientId) {
          const _now = Date.now();
          const _clientData = this.requests.get(clientId)  ?? {
            count: 0,
            resetTime: now + this.windowMs
}
        if (now > clientData.resetTime) {
          clientData.count = 0;
          clientData.resetTime = now + this.windowMs;
        }
        if (clientData.count >= this.maxRequests) {
          return false;
          //   // LINT: unreachable code removed}
          clientData.count++;
          this.requests.set(clientId, clientData);
          return true;
          //   // LINT: unreachable code removed},
          getRemainingRequests: function (clientId) {
          const _clientData = this.requests.get(clientId)  ?? { count: 0 };
          return Math.max(0, this.maxRequests - clientData.count);
    //   // LINT: unreachable code removed}
}
          // Initial requests should be allowed
          expect(rateLimiter.isAllowed('client1')).toBe(true);
          expect(rateLimiter.getRemainingRequests('client1')).toBe(99);
          // Simulate hitting the limit
          const _clientData = { count: 100, resetTime: Date.now() + 60000 };
          rateLimiter.requests.set('client2', clientData);
          expect(rateLimiter.isAllowed('client2')).toBe(false);
          expect(rateLimiter.getRemainingRequests('client2')).toBe(0);
        })
      })
      describe('File System Utils', () => 
        it('should handle path operations', () =>
      {
        const _pathUtils = {
        join: (..._segments) =>;
        segments;
        .filter((segment) => segment && typeof segment === 'string')
          .join('/')
          .replace(/\/+/g, '/'),
          dirname: (path) =>
        {
          const _lastSlash = path.lastIndexOf('/');
          return lastSlash > 0 ? path.substring(0, lastSlash) : '.';
          //   // LINT: unreachable code removed},
          basename: (path, ext = '') => {
            const _lastSlash = path.lastIndexOf('/');
            const _name = lastSlash >= 0 ? path.substring(lastSlash + 1) : path;
            return ext && name.endsWith(ext) ? name.slice(0, -ext.length) : name;
            //   // LINT: unreachable code removed},
            extname: (path) => {
              const _lastDot = path.lastIndexOf('.');
              const _lastSlash = path.lastIndexOf('/');
              return lastDot > lastSlash ? path.substring(lastDot) : '';
              //   // LINT: unreachable code removed},
            };
            expect(pathUtils.join('path', 'to', 'file.txt')).toBe('path/to/file.txt');
            expect(pathUtils.join('path/', '/to/', '/file.txt')).toBe('path/to/file.txt');
            expect(pathUtils.dirname('/path/to/file.txt')).toBe('/path/to');
            expect(pathUtils.dirname('file.txt')).toBe('.');
            expect(pathUtils.basename('/path/to/file.txt')).toBe('file.txt');
            expect(pathUtils.basename('/path/to/file.txt', '.txt')).toBe('file');
            expect(pathUtils.extname('/path/to/file.txt')).toBe('.txt');
            expect(pathUtils.extname('/path/to/file')).toBe('');
          };
          )
            it('should handle file filtering', () =>
          {
            const _fileFilter = {
        filters: {
          javascript: /\.(js|jsx|ts|tsx)$/,
            images: /\.(jpg|jpeg|png|gif|svg)$/,
            documents: /\.(pdf|doc|docx|txt|md)$/
}
          ,
            filterByType:
          function (files, /* type */) {
          const _pattern = this.filters[type];
          return pattern ? files.filter((file) => pattern.test(file)) : files;
    //   // LINT: unreachable code removed},
        filterBySize: (_files, _maxSize) =>;
          files.filter((file) => !file.size  ?? file.size <= maxSize),
        filterByDate: (files, since) => files.filter((file) => !file.mtime  ?? file.mtime >= since)
}
          const _testFiles = [
            ;
        { name: 'app.js', size: 1024 },
        { name: 'style.css', size: 2048 },
        { name: 'image.png', size: 5000 },
        { name: 'readme.md', size: 512 },,,,,,,,
          ];
          const _jsFiles = fileFilter.filterByType(;
          testFiles.map((f) => f.name),
          ('javascript');
          )
            expect(jsFiles).toEqual(['app.js'])
          const _smallFiles = fileFilter.filterBySize(testFiles, 2000);
          expect(smallFiles).toHaveLength(3);
          expect(smallFiles.some((f) => f.name === 'image.png')).toBe(false);
        })
      })
      describe('String Utils', () => 
        it('should handle string formatting', () =>
      {
        const _stringUtils = {
        capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(),
        camelCase: (_str) =>;
        str;
        .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
        .replace(/^(.)/, (_, char) => char.toLowerCase()),
        kebabCase: (_str) =>
        str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase(),
        truncate: (_str, _length, _suffix = '...') =>
        str.length <= length ? str : str.substring(0, length - suffix.length) + suffix,
        slugify: (_str) =>
        str;
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}
      expect(stringUtils.capitalize('hello world')).toBe('Hello world');
      expect(stringUtils.camelCase('hello-world_test')).toBe('helloWorldTest');
      expect(stringUtils.kebabCase('HelloWorldTest')).toBe('hello-world-test');
      expect(stringUtils.truncate('This is a long string', 10)).toBe('This is...');
      expect(stringUtils.slugify('Hello World! 123')).toBe('hello-world-123');
      )
      it('should handle template interpolation', () =>
      {
        const _templateEngine = {
        interpolate: (_template, _data) =>;
        template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return Object.hasOwn(data, key) ? data[key] : match;
    //   // LINT: unreachable code removed}),
        interpolateAdvanced: function (template, /* data */) {
          return template.replace(/\{\{([\w.]+)\}\}/g, (_match, path) => {
            const _value = this.getNestedValue(data, path);
    // return value !== undefined ? value : match; // LINT: unreachable code removed
          });
        },
        getNestedValue: (_obj, _path) =>;
          path;
            .split('.');
            .reduce(;
              (current, key) => (current && Object.hasOwn(current, key) ? current[key] : undefined),
              obj;
            ),
      };
        const _data = {
        name: 'Claude',
        version: '2.0.0',
        port: 3000, debug;
        : true 
}
      expect(templateEngine.interpolate('Hello {{name}}!', data)).toBe('Hello Claude!');
      expect(templateEngine.interpolateAdvanced('Port: {{config.port}}', data)).toBe('Port: 3000');
      expect(templateEngine.interpolate('Missing: {{missing}}', data)).toBe('Missing: {{missing}}');
      )
    });
    describe('Validation Utils', () => {
      it('should validate data types', () => {
      const _validator = {
        isString: (value) => typeof value === 'string',
        isNumber: (value) => typeof value === 'number' && !Number.isNaN(value),
        isArray: (value) => Array.isArray(value),
        isObject: (value) => value !== null && typeof value === 'object' && !Array.isArray(value),
        isEmpty: (value) => {
          if (value === null  ?? value === undefined) return true;
    // if (typeof value === 'string'  ?? Array.isArray(value)) return value.length === 0; // LINT: unreachable code removed
          if (typeof value === 'object') return Object.keys(value).length === 0;
    // return false; // LINT: unreachable code removed
        },
        validateSchema: function (data, /* schema */) {
          const _errors = [];
          for (const [field, rules] of Object.entries(schema)) {
            const _value = data[field];
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
    //   // LINT: unreachable code removed},
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
      const _schema = {
        name: { required: true, type: 'String', minLength: 2, maxLength: 50 },required: false, type: 'Number' ,required: true, type: 'String' ,
      };
      const _validData = { name: 'John', age: 30, email: 'john@example.com' };
      expect(validator.validateSchema(validData, schema)).toEqual([]);
      const _invalidData = { name: 'A', age: 'thirty' };
      const _errors = validator.validateSchema(invalidData, schema);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.includes('name must be at least 2 characters'))).toBe(true);
      expect(errors.some((e) => e.includes('email is required'))).toBe(true);
    });
  });
  describe('Event Utils', () => {
    it('should handle event emitter functionality', () => {
      const _eventEmitter = {
        events: new Map(),
        on: function (event, /* listener */) {
          if (!this.events.has(event)) {
            this.events.set(event, []);
          }
          this.events.get(event).push(listener);
        },
        off: function (event, /* listener */) {
          if (this.events.has(event)) {
            const _listeners = this.events.get(event);
            const _index = listeners.indexOf(listener);
            if (index >= 0) {
              listeners.splice(index, 1);
            }
          }
        },
        emit: function (event, ...args) {
          if (this.events.has(event)) {
            this.events.get(event).forEach((listener) => {
              try {
                listener(...args);
              } catch (error) {
                console.error('Event listener error:', error);
              }
            });
          }
        },
        once: function (event, /* listener */) {
          const _onceListener = (): unknown => {
            this.off(event, onceListener);
            listener(...args);
          };
          this.on(event, onceListener);
        },
      };
    const _callCount = 0;
    const _listener = () => callCount++;
    eventEmitter.on('test', listener);
    eventEmitter.emit('test');
    expect(callCount).toBe(1);
    eventEmitter.emit('test');
    expect(callCount).toBe(2);
    eventEmitter.off('test', listener);
    eventEmitter.emit('test');
    expect(callCount).toBe(2); // Should not increment

    // Test once
    const _onceCallCount = 0;
    eventEmitter.once('once-test', () => onceCallCount++);
    eventEmitter.emit('once-test');
    eventEmitter.emit('once-test');
    expect(onceCallCount).toBe(1); // Should only be called once
  });
});
})