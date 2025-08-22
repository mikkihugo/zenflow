/**
 * Test file with potential security vulnerabilities for AI linter detection
 */

// Potential security issues
function dangerousEval(userInput: string) {
  return eval(userInput); // eval() is dangerous
}

function shellExecution(command: string) {
  const { exec } = require('child_process');
  return exec(command); // shell execution
}

function sqlInjection(userId: string) {
  const query = `SELECT * FROM users WHERE id = '${userId}'`; // SQL injection risk
  return query;
}

function xssVulnerability(userInput: string) {
  document.innerHTML = userInput; // XSS vulnerability
}

// Hardcoded secrets
const API_KEY = "sk-12345abcdef"; // hardcoded secret
const PASSWORD = "admin123"; // hardcoded password

// Insecure random
function insecureRandom() {
  return Math.random(); // Not cryptographically secure
}

// File system operations
const fs = require('fs');
function unsafeFileOperation(userPath: string) {
  return fs.readFileSync(userPath); // path traversal risk
}