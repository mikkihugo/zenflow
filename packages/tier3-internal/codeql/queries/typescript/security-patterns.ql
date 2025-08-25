/**
 * @name Claude Zen TypeScript Security Patterns
 * @description Custom security patterns for TypeScript/JavaScript projects
 * @kind path-problem
 * @problem.severity error
 * @security-severity 8.5
 * @precision high
 * @id claude-zen/typescript-security-patterns
 * @tags security
 *       typescript
 *       javascript
 *       claude-zen
 */

import javascript
import semmle.javascript.security.dataflow.TaintedPath
import semmle.javascript.security.dataflow.Xss
import semmle.javascript.security.dataflow.SqlInjection

/**
 * Custom taint tracking for Claude Zen specific patterns
 */
class ClaudeZenTaintTrackingConfiguration extends TaintTracking::Configuration {
  ClaudeZenTaintTrackingConfiguration() { this = "ClaudeZenTaintTracking" }

  override predicate isSource(DataFlow::Node source) {
    // User input sources
    source instanceof RemoteFlowSource or
    
    // Environment variables (potential secret leakage)
    exists(DataFlow::PropRead read |
      read = source and
      read.getBase().getALocalSource() instanceof EnvironmentVariableAccess
    ) or
    
    // File system reads
    exists(FileSystemReadAccess read |
      read.getADataFlowNode() = source
    ) or
    
    // Database query results
    exists(DatabaseAccess db |
      db.getAResult() = source
    )
  }

  override predicate isSink(DataFlow::Node sink) {
    // File system writes
    exists(FileSystemWriteAccess write |
      write.getADataFlowNode() = sink
    ) or
    
    // Process execution
    exists(SystemCommandExecution exec |
      exec.getACommandArgument() = sink
    ) or
    
    // Network requests
    exists(ClientRequest req |
      req.getUrl() = sink or
      req.getADataNode() = sink
    ) or
    
    // HTML rendering (XSS)
    exists(DomMethodCallExpr call |
      call.getMethodName() = "innerHTML" and
      call.getArgument(0).getALocalSource() = sink
    )
  }

  override predicate isSanitizer(DataFlow::Node node) {
    // Validation functions
    exists(CallExpr call |
      call.getCalleeName().matches("%validate%") and
      call.getAArgument().getALocalSource() = node
    ) or
    
    // Sanitization libraries
    exists(CallExpr call |
      call.getCalleeName().matches("%sanitize%") and
      call.getAArgument().getALocalSource() = node
    ) or
    
    // Type checking
    exists(CallExpr call |
      call.getCalleeName() = ["typeof", "instanceof"] and
      call.getAArgument().getALocalSource() = node
    )
  }

  override predicate isAdditionalTaintStep(DataFlow::Node node1, DataFlow::Node node2) {
    // Template literals
    exists(TemplateLiteral template |
      template.getAnElement() = node1.asExpr() and
      template = node2.asExpr()
    ) or
    
    // String concatenation
    exists(BinaryExpr binop |
      binop.getOperator() = "+" and
      binop.getAnOperand() = node1.asExpr() and
      binop = node2.asExpr()
    ) or
    
    // Object property assignment
    exists(AssignExpr assign |
      assign.getRhs() = node1.asExpr() and
      assign = node2.asExpr()
    )
  }
}

/**
 * Hardcoded secrets detection
 */
class HardcodedSecret extends Expr {
  HardcodedSecret() {
    exists(StringLiteral str |
      str = this and
      (
        // API keys
        str.getValue().regexpMatch(".*[aA][pP][iI][_-]?[kK][eE][yY].*") or
        str.getValue().regexpMatch(".*[aA][cC][cC][eE][sS][sS][_-]?[kK][eE][yY].*") or
        
        // Database passwords
        str.getValue().regexpMatch(".*[pP][aA][sS][sS][wW][oO][rR][dD].*") or
        str.getValue().regexpMatch(".*[pP][wW][dD].*") or
        
        // JWT tokens
        str.getValue().regexpMatch(".*[jJ][wW][tT].*") or
        str.getValue().regexpMatch(".*[tT][oO][kK][eE][nN].*") or
        
        // Private keys
        str.getValue().regexpMatch(".*-----BEGIN.*PRIVATE.*KEY-----.*") or
        
        // Common secret patterns
        str.getValue().regexpMatch(".*[sS][eE][cC][rR][eE][tT].*") or
        str.getValue().regexpMatch(".*[aA][uU][tT][hH].*") or
        
        // Long random-looking strings (potential secrets)
        (str.getValue().length() > 20 and
         str.getValue().regexpMatch(".*[a-zA-Z0-9]{20,}.*"))
      )
    )
  }
  
  string getSecretType() {
    if this.(StringLiteral).getValue().regexpMatch(".*[aA][pP][iI].*")
    then result = "API Key"
    else if this.(StringLiteral).getValue().regexpMatch(".*[pP][aA][sS][sS].*")
    then result = "Password"
    else if this.(StringLiteral).getValue().regexpMatch(".*[jJ][wW][tT].*")
    then result = "JWT Token"
    else if this.(StringLiteral).getValue().regexpMatch(".*-----BEGIN.*")
    then result = "Private Key"
    else result = "Secret"
  }
}

/**
 * Unsafe dynamic code execution
 */
class UnsafeDynamicExecution extends CallExpr {
  UnsafeDynamicExecution() {
    this.getCalleeName() = ["eval", "Function", "setTimeout", "setInterval"] and
    exists(DataFlow::Node arg |
      arg = this.getAnArgument().getALocalSource() and
      not arg instanceof StringLiteral // Only flag dynamic content
    )
  }
}

/**
 * Weak crypto usage
 */
class WeakCrypto extends CallExpr {
  WeakCrypto() {
    exists(string methodName |
      this.getCalleeName() = methodName and
      methodName in ["md5", "sha1", "des", "rc4", "md4"]
    ) or
    
    // Crypto module usage with weak algorithms
    exists(CallExpr cryptoCall |
      cryptoCall.getReceiver().getALocalSource().getAPropertyRead().getPropertyName() = "crypto" and
      cryptoCall.getCalleeName() = "createHash" and
      cryptoCall.getArgument(0).(StringLiteral).getValue() in ["md5", "sha1"]
    )
  }
  
  string getAlgorithm() {
    result = this.getCalleeName() or
    result = this.getArgument(0).(StringLiteral).getValue()
  }
}

/**
 * Insecure random number generation
 */
class InsecureRandom extends CallExpr {
  InsecureRandom() {
    this.getCalleeName() = ["random"] and
    this.getReceiver().getALocalSource().getAPropertyRead().getPropertyName() = "Math"
  }
}

/**
 * Missing HTTPS enforcement
 */
class InsecureProtocol extends Expr {
  InsecureProtocol() {
    exists(StringLiteral str |
      str = this and
      str.getValue().matches("http://%") and
      not str.getValue().matches("http://localhost%") and
      not str.getValue().matches("http://127.0.0.1%")
    )
  }
}

/**
 * SQL injection in template literals
 */
class SqlInjectionQuery extends TemplateLiteral {
  SqlInjectionQuery() {
    // Template contains SQL keywords
    exists(string content |
      content = this.getStringValue() and
      content.regexpMatch("(?i).*(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER).*")
    ) and
    
    // Has interpolated expressions (potential injection points)
    this.getAnElement() instanceof Expr
  }
}

/**
 * Prototype pollution vulnerability
 */
class PrototypePollution extends AssignExpr {
  PrototypePollution() {
    exists(PropAccess prop |
      prop = this.getLhs() and
      prop.getPropertyName() = "__proto__"
    ) or
    
    exists(CallExpr call |
      call.getCalleeName() = "hasOwnProperty" and
      this.getLhs() = call.getReceiver()
    )
  }
}

// Query results

from ClaudeZenTaintTrackingConfiguration config, DataFlow::PathNode source, DataFlow::PathNode sink
where config.hasFlowPath(source, sink)
select sink.getNode(), source, sink, 
  "Potential security vulnerability: data flows from $@ to $@",
  source.getNode(), "untrusted source",
  sink.getNode(), "sensitive sink"

// Additional security findings

from HardcodedSecret secret
select secret, 
  "Hardcoded " + secret.getSecretType() + " detected. Consider using environment variables or secure storage."

from UnsafeDynamicExecution exec
select exec,
  "Unsafe dynamic code execution. Avoid using eval() or Function() constructor with user input."

from WeakCrypto crypto
select crypto,
  "Weak cryptographic algorithm '" + crypto.getAlgorithm() + "' detected. Use stronger alternatives."

from InsecureRandom random
select random,
  "Insecure random number generation. Use crypto.randomBytes() for security-critical randomness."

from InsecureProtocol protocol
select protocol,
  "Insecure HTTP protocol detected. Use HTTPS for secure communication."

from SqlInjectionQuery query
select query,
  "Potential SQL injection in template literal. Use parameterized queries."

from PrototypePollution pollution
select pollution,
  "Potential prototype pollution vulnerability. Validate object properties."