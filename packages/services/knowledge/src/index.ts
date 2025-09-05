/**
 * @fileoverview Knowledge Package - Semantic Context & Decision Memory
 *
 * **PURE EVENT-DRIVEN - NO PUBLIC API**
 *
 * Provides semantic context and decision memory via events only:
 * - knowledge:record-decision - Record architectural decisions
 * - knowledge:find-similar-decisions - Find similar past decisions
 * - knowledge:store-semantics - Store project semantic context
 * - knowledge:get-semantics - Retrieve project context
 * - knowledge:record-compliance - Record methodology compliance
 * - knowledge:get-compliance-history - Get compliance tracking
 *
 * UNIQUE VALUE: Captures reasoning, intent, and context - not code analysis
 * 
 * Does NOT overlap with:
 * - @claude-zen/code-analyzer (analyzes WHAT code exists)
 * - @claude-zen/language-parsers (parses syntax)
 * - @claude-zen/ai-linter (provides code quality insights)
 *
 * Domain: Decision memory, semantic context, methodology compliance
 * Usage: Event-driven communication via foundation EventBus ONLY
 *
 * @author Claude Code Zen Team
 * @version 1.0.0
 * @requires @claude-zen/foundation - EventBus and logging
 */

// Initialize event-driven handlers - NO EXPORTS
import './knowledge-event-handler';

// Pure event-driven package - no public API surface