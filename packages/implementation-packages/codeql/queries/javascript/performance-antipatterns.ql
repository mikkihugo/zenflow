/**
 * @name Claude Zen JavaScript Performance Anti-patterns
 * @description Detects common performance anti-patterns in JavaScript/TypeScript code
 * @kind problem
 * @problem.severity warning
 * @precision medium
 * @id claude-zen/javascript-performance
 * @tags performance
 *       javascript
 *       typescript
 *       claude-zen
 */

import javascript

/**
 * Inefficient DOM queries in loops
 */
class DomQueryInLoop extends CallExpr {
  DomQueryInLoop() {
    exists(LoopStmt loop |
      this.getEnclosingStmt().getParent*() = loop and
      this.getCalleeName() in [
        "getElementById",
        "getElementsByClassName", 
        "getElementsByTagName",
        "querySelector",
        "querySelectorAll"
      ]
    )
  }
  
  LoopStmt getLoop() {
    result = this.getEnclosingStmt().getParent*()
  }
}

/**
 * Repeated string concatenation in loops
 */
class StringConcatenationInLoop extends BinaryExpr {
  StringConcatenationInLoop() {
    this.getOperator() = "+" and
    exists(LoopStmt loop |
      this.getEnclosingStmt().getParent*() = loop and
      (this.getLeftOperand().getType().hasUnderlyingType("string") or
       this.getRightOperand().getType().hasUnderlyingType("string"))
    )
  }
}

/**
 * Inefficient array operations
 */
class InefficientArrayOperation extends CallExpr {
  InefficientArrayOperation() {
    // Array.prototype.indexOf in loops
    (this.getCalleeName() = "indexOf" and
     exists(LoopStmt loop |
       this.getEnclosingStmt().getParent*() = loop
     )) or
     
    // Multiple array iterations that could be combined
    exists(CallExpr other |
      other != this and
      this.getCalleeName() in ["map", "filter", "reduce", "forEach"] and
      other.getCalleeName() in ["map", "filter", "reduce", "forEach"] and
      this.getReceiver() = other.getReceiver() and
      this.getEnclosingStmt().getParent*() = other.getEnclosingStmt().getParent*()
    )
  }
}

/**
 * Synchronous operations in async context
 */
class SyncInAsync extends CallExpr {
  SyncInAsync() {
    exists(Function func |
      func.isAsync() and
      this.getEnclosingFunction() = func and
      this.getCalleeName() in [
        "readFileSync",
        "writeFileSync",
        "execSync",
        "readdirSync"
      ]
    )
  }
}

/**
 * Missing async/await for promises
 */
class UnawaitedPromise extends CallExpr {
  UnawaitedPromise() {
    this.getCalleeName() in ["fetch", "readFile", "writeFile", "exec"] and
    not exists(AwaitExpr await | await.getExpression() = this) and
    not exists(CallExpr then | then.getReceiver() = this and then.getCalleeName() = "then") and
    exists(Function func | 
      func.isAsync() and 
      this.getEnclosingFunction() = func
    )
  }
}

/**
 * Large object creation in loops
 */
class ObjectCreationInLoop extends NewExpr {
  ObjectCreationInLoop() {
    exists(LoopStmt loop |
      this.getEnclosingStmt().getParent*() = loop and
      // Exclude primitive objects
      not this.getCallee().getName() in ["String", "Number", "Boolean"]
    )
  }
}

/**
 * Inefficient regular expressions
 */
class InefficientRegex extends RegExpLiteral {
  InefficientRegex() {
    // Regex with catastrophic backtracking potential
    this.getValue().regexpMatch(".*\\(.*\\*.*\\+.*\\).*") or
    this.getValue().regexpMatch(".*\\(.*\\+.*\\*.*\\).*") or
    
    // Nested quantifiers
    this.getValue().regexpMatch(".*\\(.*\\*.*\\)\\*.*") or
    this.getValue().regexpMatch(".*\\(.*\\+.*\\)\\+.*") or
    
    // Alternation with overlapping patterns
    this.getValue().regexpMatch(".*\\|.*\\|.*\\|.*")
  }
}

/**
 * Memory leaks - event listeners not removed
 */
class UnremovedEventListener extends CallExpr {
  UnremovedEventListener() {
    this.getCalleeName() = "addEventListener" and
    not exists(CallExpr remove |
      remove.getCalleeName() = "removeEventListener" and
      remove.getReceiver() = this.getReceiver() and
      remove.getArgument(0) = this.getArgument(0)
    )
  }
}

/**
 * Expensive operations in render methods (React)
 */
class ExpensiveRenderOperation extends CallExpr {
  ExpensiveRenderOperation() {
    exists(Function render |
      render.getName() = "render" and
      this.getEnclosingFunction() = render and
      (
        // Date operations
        this.getCalleeName() in ["getTime", "toISOString", "toDateString"] or
        
        // Math operations
        this.getCalleeName() in ["random", "floor", "ceil", "round"] or
        
        // Array operations
        this.getCalleeName() in ["sort", "reverse", "splice"] or
        
        // JSON operations
        this.getCalleeName() in ["parse", "stringify"]
      )
    )
  }
}

/**
 * Global variable access in tight loops
 */
class GlobalAccessInLoop extends VarAccess {
  GlobalAccessInLoop() {
    exists(LoopStmt loop, GlobalVariable global |
      this.getEnclosingStmt().getParent*() = loop and
      this.getVariable() = global and
      // Exclude common globals that are usually optimized
      not global.getName() in ["console", "Math", "JSON", "undefined", "null"]
    )
  }
}

/**
 * Inline functions in JSX/templates
 */
class InlineFunction extends Function {
  InlineFunction() {
    // Arrow functions in JSX attributes
    exists(JSXAttribute attr |
      attr.getValue().getExpression() = this
    ) or
    
    // Functions in template literals
    exists(TemplateLiteral template |
      template.getAnElement() = this
    )
  }
}

/**
 * Unnecessary re-renders due to object/array literals
 */
class ObjectLiteralInRender extends ObjectExpr {
  ObjectLiteralInRender() {
    exists(Function render |
      render.getName().matches("%render%") and
      this.getEnclosingFunction() = render
    )
  }
}

// Query results

from DomQueryInLoop query
select query, 
  "DOM query inside loop at line " + query.getLocation().getStartLine() + 
  ". Consider caching the result outside the loop."

from StringConcatenationInLoop concat
select concat,
  "String concatenation in loop. Consider using Array.join() or template literals for better performance."

from InefficientArrayOperation operation
select operation,
  "Inefficient array operation. Consider combining multiple iterations or using more efficient alternatives."

from SyncInAsync syncOp
select syncOp,
  "Synchronous operation '" + syncOp.getCalleeName() + "' in async function. Use async alternatives."

from UnawaitedPromise promise
select promise,
  "Promise-returning function '" + promise.getCalleeName() + "' not awaited in async context."

from ObjectCreationInLoop obj
select obj,
  "Object creation in loop. Consider moving object creation outside the loop or using object pooling."

from InefficientRegex regex
select regex,
  "Potentially inefficient regular expression with catastrophic backtracking risk."

from UnremovedEventListener listener
select listener,
  "Event listener added but not removed. This may cause memory leaks."

from ExpensiveRenderOperation expensive
select expensive,
  "Expensive operation '" + expensive.getCalleeName() + "' in render method. Consider memoization."

from GlobalAccessInLoop global
select global,
  "Global variable access in tight loop. Consider caching in local variable."

from InlineFunction inline
select inline,
  "Inline function definition. Consider defining outside to avoid re-creation on each render."

from ObjectLiteralInRender objLiteral
select objLiteral,
  "Object literal in render method. Consider using useMemo or defining outside component."