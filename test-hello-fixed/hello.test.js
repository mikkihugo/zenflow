const { exec } = require('child_process');
const path = require('path');

describe('Hello World Application', () => {
  const scriptPath = path.join(__dirname, 'hello.js');

  test('should output "Hello, World!"', (done) => {
    exec(`node ${scriptPath}`, (error, stdout, stderr) => {
      expect(error).toBe(null);
      expect(stderr).toBe('');
      expect(stdout.trim()).toBe('Hello, World!');
      done();
    });
  });

  test('script should be executable', (done) => {
    exec(`${scriptPath}`, (error, stdout, stderr) => {
      expect(error).toBe(null);
      expect(stderr).toBe('');
      expect(stdout.trim()).toBe('Hello, World!');
      done();
    });
  });

  test('npm start should work correctly', (done) => {
    exec('npm start', { cwd: __dirname }, (error, stdout, stderr) => {
      expect(error).toBe(null);
      expect(stdout).toContain('Hello, World!');
      done();
    });
  });
});