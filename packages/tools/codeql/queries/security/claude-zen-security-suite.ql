/**
 * @name Claude Zen Comprehensive Security Suite
 * @description Comprehensive security analysis tailored for Claude Zen projects
 * @kind path-problem
 * @problem.severity error
 * @security-severity 9.0
 * @precision high
 * @id claude-zen/comprehensive-security
 * @tags security
 *       owasp-top-10
 *       claude-zen
 *       enterprise
 */

import javascript
import semmle.javascript.security.dataflow.TaintedPath
import semmle.javascript.security.dataflow.NosqlInjection
import semmle.javascript.security.dataflow.CommandInjection
import semmle.javascript.security.dataflow.CodeInjection

/**
 * Claude Zen specific security configuration
 */
class ClaudeZenSecurityConfiguration extends TaintTracking::Configuration {
  ClaudeZenSecurityConfiguration() { this = "ClaudeZenSecurity" }

  override predicate isSource(DataFlow::Node source) {
    // HTTP request data
    source instanceof RemoteFlowSource or
    
    // File uploads
    exists(CallExpr upload |
      upload.getCalleeName().matches("%upload%") and
      upload.getADataFlowNode() = source
    ) or
    
    // Environment variables (can contain secrets)
    exists(PropAccess env |
      env.getPropertyName() = "env" and
      env.getBase().getALocalSource().getAPropertyRead().getPropertyName() = "process" and
      env.getALocalSource() = source
    ) or
    
    // URL parameters
    exists(CallExpr urlParse |
      urlParse.getCalleeName().matches("%parse%") and
      urlParse.getADataFlowNode() = source
    ) or
    
    // Database query results (can contain sensitive data)
    exists(CallExpr dbQuery |
      dbQuery.getCalleeName().matches("%query%") and
      dbQuery.getADataFlowNode() = source
    )
  }

  override predicate isSink(DataFlow::Node sink) {
    // File system operations
    exists(CallExpr fsOp |
      fsOp.getCalleeName() in [
        "readFile", "writeFile", "appendFile", "createReadStream", 
        "createWriteStream", "mkdir", "rmdir", "unlink"
      ] and
      fsOp.getAnArgument().getALocalSource() = sink
    ) or
    
    // Process execution
    exists(CallExpr processOp |
      processOp.getCalleeName() in ["exec", "execSync", "spawn", "fork"] and
      processOp.getAnArgument().getALocalSource() = sink
    ) or
    
    // Database operations
    exists(CallExpr dbOp |
      dbOp.getCalleeName().matches("%query%") and
      dbOp.getAnArgument().getALocalSource() = sink
    ) or
    
    // HTTP response
    exists(CallExpr httpResponse |
      httpResponse.getCalleeName() in ["send", "json", "write", "end"] and
      httpResponse.getAnArgument().getALocalSource() = sink
    ) or
    
    // Logging (potential sensitive data exposure)
    exists(CallExpr logOp |
      logOp.getCalleeName() in ["log", "info", "debug", "warn", "error"] and
      logOp.getAnArgument().getALocalSource() = sink
    )
  }

  override predicate isSanitizer(DataFlow::Node node) {
    // Input validation
    exists(CallExpr validate |
      validate.getCalleeName().regexpMatch(".*[vV]alidat.*") and
      validate.getAResult() = node
    ) or
    
    // Sanitization functions
    exists(CallExpr sanitize |
      sanitize.getCalleeName().regexpMatch(".*[sS]anitiz.*") and
      sanitize.getAResult() = node
    ) or
    
    // Escape functions
    exists(CallExpr escape |
      escape.getCalleeName().regexpMatch(".*[eE]scape.*") and
      escape.getAResult() = node
    ) or
    
    // Type checking and conversion
    exists(CallExpr typeCheck |
      typeCheck.getCalleeName() in ["parseInt", "parseFloat", "Number", "String"] and
      typeCheck.getAResult() = node
    )
  }
}

/**
 * Authentication bypass vulnerabilities
 */
class AuthenticationBypass extends IfStmt {
  AuthenticationBypass() {
    exists(BinaryExpr condition |
      condition = this.getCondition() and
      condition.getOperator() in ["==", "!="] and
      
      // Check for weak authentication conditions
      (
        // Hardcoded credentials comparison
        condition.getAnOperand() instanceof StringLiteral or
        
        // Simple true/false checks
        condition.getAnOperand().(BooleanLiteral).getValue() = "true" or
        
        // Null/undefined checks without proper validation
        condition.getAnOperand() instanceof NullLiteral
      )
    )
  }
}

/**
 * JWT token vulnerabilities
 */
class JWTVulnerability extends CallExpr {
  JWTVulnerability() {
    // JWT verification without secret
    this.getCalleeName().matches("%verify%") and
    exists(StringLiteral jwt |
      jwt.getValue().regexpMatch(".*[jJ][wW][tT].*") and
      this.getAnArgument() = jwt
    ) and
    
    // Missing or weak secret
    (
      this.getNumArgument() < 2 or
      exists(StringLiteral secret |
        secret = this.getArgument(1) and
        secret.getValue().length() < 32
      )
    )
  }
}

/**
 * Insecure session management
 */
class InsecureSession extends CallExpr {
  InsecureSession() {
    // Session configuration issues
    this.getCalleeName().matches("%session%") and
    exists(ObjectExpr config |
      config = this.getAnArgument() and
      
      // Missing secure flags
      not exists(Property secure |
        secure.getName() = "secure" and
        secure.getInit().(BooleanLiteral).getValue() = "true"
      ) and
      
      // Missing httpOnly flags  
      not exists(Property httpOnly |
        httpOnly.getName() = "httpOnly" and
        httpOnly.getInit().(BooleanLiteral).getValue() = "true"
      )
    )
  }
}

/**
 * CORS misconfiguration
 */
class CORSMisconfiguration extends CallExpr {
  CORSMisconfiguration() {
    this.getCalleeName().matches("%cors%") and
    exists(ObjectExpr config |
      config = this.getAnArgument() and
      exists(Property origin |
        origin.getName() = "origin" and
        origin.getInit().(StringLiteral).getValue() = "*"
      )
    )
  }
}

/**
 * Insecure direct object references
 */
class InsecureDirectObjectReference extends PropAccess {
  InsecureDirectObjectReference() {
    // Direct access to user-controlled properties
    exists(VarAccess userInput |
      userInput.getVariable().getName().matches("%req%") and
      this.getBase() = userInput and
      this.getPropertyName().matches("%id%")
    ) and
    
    // Used in database queries or file operations
    exists(CallExpr operation |
      operation.getCalleeName().matches("%query%") or
      operation.getCalleeName().matches("%find%") or
      operation.getCalleeName().matches("%read%") or
      operation.getCalleeName().matches("%write%")
    )
  }
}

/**
 * Weak password policies
 */
class WeakPasswordPolicy extends CallExpr {
  WeakPasswordPolicy() {
    // Password validation that's too weak
    this.getCalleeName().matches("%password%") and
    exists(StringLiteral pattern |
      pattern = this.getAnArgument() and
      (
        // No minimum length requirement
        not pattern.getValue().matches(".*\\{[0-9]+,\\}.*") or
        
        // No complexity requirements
        not pattern.getValue().matches(".*\\[.*\\].*") or
        
        // Very short minimum length
        pattern.getValue().regexpMatch(".*\\{[1-7],.*")
      )
    )
  }
}

/**
 * Information disclosure in error messages
 */
class InformationDisclosure extends CallExpr {
  InformationDisclosure() {
    // Error responses that might leak information
    this.getCalleeName() in ["send", "json", "write"] and
    exists(VarAccess error |
      error.getVariable().getName().matches("%error%") and
      this.getAnArgument().getALocalSource() = error
    ) and
    
    // In production code (not test files)
    not this.getFile().getBaseName().matches("%test%") and
    not this.getFile().getBaseName().matches("%spec%")
  }
}

/**
 * Rate limiting bypass
 */
class RateLimitingBypass extends IfStmt {
  RateLimitingBypass() {
    // Missing rate limiting checks
    exists(CallExpr endpoint |
      endpoint.getCalleeName() in ["post", "put", "delete", "patch"] and
      not exists(CallExpr rateLimit |
        rateLimit.getCalleeName().matches("%limit%") and
        rateLimit.getEnclosingStmt().getParent*() = endpoint.getEnclosingStmt().getParent*()
      )
    )
  }
}

// Query results

from ClaudeZenSecurityConfiguration config, DataFlow::PathNode source, DataFlow::PathNode sink
where config.hasFlowPath(source, sink)
select sink.getNode(), source, sink,
  "Security vulnerability: untrusted data flows from $@ to $@",
  source.getNode(), "source",
  sink.getNode(), "sink"

from AuthenticationBypass bypass
select bypass,
  "Potential authentication bypass with weak credential checking."

from JWTVulnerability jwt
select jwt,
  "JWT vulnerability: weak or missing secret in token verification."

from InsecureSession session
select session,
  "Insecure session configuration: missing secure or httpOnly flags."

from CORSMisconfiguration cors
select cors,
  "CORS misconfiguration: wildcard origin allows any domain."

from InsecureDirectObjectReference idor
select idor,
  "Insecure direct object reference: user input directly accessing object properties."

from WeakPasswordPolicy password
select password,
  "Weak password policy: insufficient complexity requirements."

from InformationDisclosure disclosure
select disclosure,
  "Information disclosure: error details exposed in response."

from RateLimitingBypass rateLimit
select rateLimit,
  "Missing rate limiting on API endpoint."