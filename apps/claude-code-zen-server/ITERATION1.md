# 🎯 Iteration 1: SAFe-SPARC Workflow

## **GOAL**: Get the core SAFe→SPARC→Code Generation working end-to-end

This iteration focuses on proving the complete workflow works without all the complex infrastructure.

## 📋 What It Does

**End-to-End Flow:**

```
Epic Proposal → 5 SAFe Role Decisions (LLMProvider) → SPARC Code Generation (Claude SDK) → Generated Files
```

**5 SAFe Roles:**

1. **Epic Owner** - Business case analysis
2. **Lean Portfolio Manager** - Investment decision
3. **Product Manager** - Customer value assessment
4. **System Architect** - Technical feasibility
5. **Release Train Engineer** - Program capacity evaluation

**SPARC Methodology:**

1. **Specification** - Requirements analysis
2. **Architecture** - System design (with Claude SDK)
3. **Completion** - Code generation (with Claude SDK)

## 🚀 Quick Start

### 1. Validate Components

```bash
cd apps/claude-code-zen-server
npm run validate-iteration1
```

### 2. Run Full Workflow

```bash
npm run iteration1
```

## 📁 Key Files

- **`src/workflows/safe-sparc-standalone.ts`** - Complete standalone workflow
- **`src/iteration1.ts`** - Entry point and test
- **`src/validate-iteration1.ts`** - Quick validation check

## 🔧 Technical Details

### Architecture

- **LLMProvider** for simple SAFe role decisions (text-based)
- **Claude SDK** for SPARC code generation (tool-based)
- **@claude-zen/foundation** as the only required dependency

### SAFe Decision Making

```typescript
const prompt = `As a Lean Portfolio Manager in SAFe, evaluate this epic...`;
const response = await this.llmProvider.executeAsAnalyst(
  prompt,
  'safe-portfolio-decision'
);
```

### SPARC Code Generation

```typescript
const claudeMessages = await executeClaudeTask(codeGenerationPrompt, {
  model: 'sonnet',
  allowedTools: ['Write', 'MultiEdit', 'Bash'],
  permissionMode: 'acceptEdits',
});
```

## ✅ Success Criteria

1. **All 5 SAFe roles make decisions** using LLMProvider
2. **SPARC generates actual files** using Claude SDK
3. **End-to-end flow completes** without errors
4. **Real generated code files** are created

## 🐛 Troubleshooting

### Timeout Issues

The workflow takes time because:

- 5 SAFe role decisions = 5 LLM calls
- SPARC architecture + completion = 2 Claude SDK calls
- Total: ~7 AI model calls

**Expected time**: 2-5 minutes depending on model response times

### Common Issues

1. **Foundation package not found**: Run `pnpm install` in root
2. **Claude SDK not working**: Ensure Claude Code CLI is available
3. **LLM calls failing**: Check network connectivity

## 📊 Expected Output

```
🎯 ITERATION 1: SAFe-SPARC Workflow Test
=====================================

SAFe Role Decisions:
  1. epic-owner: APPROVE
     Confidence: 85%
  2. lean-portfolio-manager: APPROVE
     Confidence: 78%
  3. product-manager: APPROVE
     Confidence: 82%
  4. system-architect: APPROVE
     Confidence: 75%
  5. release-train-engineer: APPROVE
     Confidence: 80%

Overall Result: APPROVE
Consensus: Yes

SPARC Execution: completed
Generated: 8 files, 3 tests, 2 docs
🎉 REAL CODE GENERATION CONFIRMED!

✅ Iteration 1 SUCCESS!
```

## 🔄 Next Steps

When Iteration 1 works reliably:

- Add human oversight integration (AGUI)
- Add persistence and state management
- Add more sophisticated SAFe workflows
- Integrate with larger orchestration system

---

**Remember**: This is iteration 1 - focused on core functionality, not all features!
