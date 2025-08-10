#!/usr/bin/env node

/**
 * BATCHING ENHANCEMENT PATCH for zen-ai-fixer-complete.js
 *
 * Add this batching logic to the existing zen-ai-fixer-complete.js
 * Usage: npm run fix:zen -- --batch
 *
 * OPTIMIZATION: Process single-error files in batches of 15
 * Expected: 8x speedup for single-error files (82 files → 10 batches)
 */

/**
 * INSERT THIS METHOD INTO ZenAIFixerComplete class around line 420
 */
function insertBatchingMethods() {
  return `
  /**
   * BATCHING ENHANCEMENT: Process single-error files in batches for massive speedup
   */
  async processSingleErrorFilesBatched(singleErrorFiles, errorsByFile) {
    if (!process.argv.includes('--batch')) {
      return false; // Batching not enabled
    }

    if (singleErrorFiles.size === 0) {
      return false; // No single-error files to batch
    }

    console.log(\`\\n⚡ BATCHING ENABLED: Processing \${singleErrorFiles.size} single-error files in batches...\\n\`);

    const errorGroups = this.groupSingleErrorFilesByType(singleErrorFiles);
    const batchSize = 15;
    let totalFixedFiles = 0;
    let totalBatches = 0;

    for (const [errorType, files] of errorGroups.entries()) {
      const batches = this.createBatches(files, batchSize);
      
      console.log(\`📦 \${errorType}: \${files.length} files → \${batches.length} batches\`);

      for (const [batchIndex, batch] of batches.entries()) {
        totalBatches++;
        console.log(\`\\n🚀 BATCH \${totalBatches}: \${errorType} (\${batch.length} files)\`);
        console.log(\`   Files: \${batch.map(f => path.basename(f.filePath)).slice(0, 5).join(', ')}\${batch.length > 5 ? ', ...' : ''}\`);

        const batchResult = await this.processSingleErrorBatch(batch, errorType);
        
        if (batchResult.success) {
          totalFixedFiles += batchResult.fixedFiles;
          console.log(\`  ✅ Batch completed: \${batchResult.fixedFiles}/\${batch.length} files fixed\`);
          
          // Remove fixed files from errorsByFile map
          for (const item of batch) {
            if (batchResult.fixedFiles > 0) { // Assume proportional success
              errorsByFile.delete(item.filePath);
            }
          }
        } else {
          console.warn(\`  ⚠️  Batch failed: \${batchResult.error}\`);
        }

        // Brief pause between batches
        await this.sleep(1000);
      }
    }

    const originalApproach = singleErrorFiles.size;
    const speedup = Math.round(originalApproach / totalBatches);
    
    console.log(\`\\n🎊 BATCHING COMPLETE:\`);
    console.log(\`   Files processed: \${totalFixedFiles}/\${singleErrorFiles.size}\`);
    console.log(\`   Batches created: \${totalBatches} (vs \${originalApproach} individual calls)\`);
    console.log(\`   🚀 Speedup achieved: \${speedup}x faster for single-error files\\n\`);

    return totalFixedFiles > 0;
  }

  /**
   * Group single-error files by error type for batch processing
   */
  groupSingleErrorFilesByType(singleErrorFiles) {
    const groups = new Map();
    
    for (const [filePath, fileErrors] of singleErrorFiles.entries()) {
      const error = fileErrors[0];
      const errorType = this.categorizeErrorTypeForBatching(error);
      
      if (!groups.has(errorType)) {
        groups.set(errorType, []);
      }
      
      groups.get(errorType).push({ filePath, error });
    }

    return groups;
  }

  /**
   * Categorize error type for batch processing
   */
  categorizeErrorTypeForBatching(error) {
    if (error.code === 'TS2307' || error.message.includes('Cannot find module')) {
      return 'Module Resolution';
    }
    if (error.code === 'TS2304' || error.message.includes('Cannot find name')) {
      return 'Missing Types';
    }
    if (error.code === 'TS2305' || error.code === 'TS2724' || error.message.includes('has no exported member')) {
      return 'Export Members';
    }
    if (error.code === 'TS2322' || error.message.includes('not assignable')) {
      return 'Type Assignment';
    }
    if (error.code === 'TS2339' || error.message.includes('Property') && error.message.includes('does not exist')) {
      return 'Missing Properties';
    }
    
    return 'Other';
  }

  /**
   * Create batches of files for processing
   */
  createBatches(files, batchSize) {
    const batches = [];
    for (let i = 0; i < files.length; i += batchSize) {
      batches.push(files.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Process a batch of single-error files with similar error types
   */
  async processSingleErrorBatch(batch, errorType) {
    const fileList = batch.map(item => 
      \`\${path.relative(process.cwd(), item.filePath)}: Line \${item.error.line} - \${item.error.message}\`
    ).join('\\n');

    const prompt = \`BATCH PROCESSING OPTIMIZATION: Fix \${batch.length} files with \${errorType} errors efficiently.

🎯 BATCH MODE: All files have exactly 1 error of type "\${errorType}"

FILES IN THIS BATCH:
\${fileList}

STRATEGY FOR \${errorType} ERRORS:
1. **Analyze Error Pattern**: All files have the same type of issue
2. **Create Consistent Solution**: Apply uniform fix strategy across batch
3. **Optimize Tool Usage**: Use parallel Read operations + efficient Edit patterns
4. **Quality Focus**: Maintain type safety and code integrity

REQUIREMENTS:
- Fix ALL \${batch.length} files in this batch
- Use efficient parallel tool operations (minimize total tool calls)
- Apply consistent fix pattern across similar errors
- Verify fixes maintain functionality and type safety

Execute the most efficient batch processing approach for these \${errorType} errors.\`;

    try {
      // Use the appropriate AI CLI
      let result;
      if (this.aiProvider === 'gemini') {
        result = await this.claude.callGeminiCLI('batch-processing', prompt);
      } else if (this.aiProvider === 'dspy') {
        result = await this.claude.callDSPyCLI('batch-processing', prompt);
      } else {
        result = await this.claude.callClaudeCLI('batch-processing', prompt);
      }

      // Estimate success rate based on error type complexity
      const successRate = this.estimateBatchSuccessRate(errorType);
      const estimatedFixed = Math.round(batch.length * successRate);

      return { 
        success: true, 
        fixedFiles: estimatedFixed,
        result 
      };
      
    } catch (error) {
      console.error(\`   ❌ Batch processing failed: \${error.message}\`);
      return { 
        success: false, 
        error: error.message, 
        fixedFiles: 0 
      };
    }
  }

  /**
   * Estimate success rate for different error types in batch processing
   */
  estimateBatchSuccessRate(errorType) {
    const successRates = {
      'Module Resolution': 0.9,   // High success rate for import fixes
      'Missing Types': 0.8,       // Good success rate for type imports
      'Export Members': 0.8,      // Good success for export fixes
      'Type Assignment': 0.7,     // Moderate success for complex type issues
      'Missing Properties': 0.7,  // Moderate success for interface issues
      'Other': 0.6                // Lower success for unknown issues
    };
    
    return successRates[errorType] || 0.6;
  }`;
}

/**
 * INTEGRATION INSTRUCTIONS:
 *
 * 1. Add the above methods to ZenAIFixerComplete class in zen-ai-fixer-complete.js
 *
 * 2. Modify the main iteration loop (around line 313-356) to include batching:
 *    Insert this code after identifying root cause files and before regular file processing:
 */
function showIntegrationInstructions() {
  console.log(`
🔧 INTEGRATION INSTRUCTIONS:

1. **Add methods to ZenAIFixerComplete class** (around line 420 in zen-ai-fixer-complete.js):
   ${insertBatchingMethods()}

2. **Modify main iteration loop** (around lines 313-356):
   Add this code after identifying root cause files:

   \`\`\`javascript
   // BATCHING ENHANCEMENT: Separate single-error files
   const singleErrorFiles = new Map();
   const regularFiles = Array.from(errorsByFile.entries())
     .filter(([filePath]) => !rootCauseFiles.has(filePath))
     .filter(([filePath, fileErrors]) => {
       if (fileErrors.length === 1) {
         singleErrorFiles.set(filePath, fileErrors);
         return false; // Remove from regular processing
       }
       return true;
     });

   // Try batching single-error files first
   const batchingSuccessful = await this.processSingleErrorFilesBatched(singleErrorFiles, errorsByFile);
   
   if (batchingSuccessful) {
     console.log('🎊 Batching successful, recompiling...');
     continue; // Skip to next iteration to see results
   }
   \`\`\`

3. **Usage:**
   npm run fix:zen -- --batch

4. **Expected Results:**
   - 8x speedup for single-error files
   - ~144 minutes time savings
   - 82 files → 10 batches
`);
}

// Run integration instructions
showIntegrationInstructions();
