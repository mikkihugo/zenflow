#!/usr/bin/env npx tsx

/**
 * @fileoverview Demo: Intelligent Document Import Workflow
 * 
 * Demonstrates the LLM-powered swarm workflow that:
 * 1. Scans repository for documents AND code files
 * 2. Analyzes TSDoc/JSDoc completeness in TypeScript files
 * 3. Uses "ultrathink" analysis for deep insights
 * 4. Creates approval gates for human review
 * 5. Stores directly in database (not file system)
 */

import { IntelligentDocImport } from './src/workflows/intelligent-doc-import.js';

async function demonstrateIntelligentWorkflow() {
  console.log('🚀 Claude Code Zen - Intelligent Document Import Demo');
  console.log('====================================================\n');
  
  // Configure the intelligent workflow
  const workflow = new IntelligentDocImport({
    repositoryPath: '../singularity-engine', // Use existing repo
    
    swarmConfig: {
      maxAgents: 5,
      topology: 'mesh',
      enableUltraThink: true
    },
    
    databaseConfig: {
      type: 'postgresql',
      connectionString: process.env.DATABASE_URL
    },
    
    analysisConfig: {
      checkDocumentation: true,        // 📝 Scan TSDoc/JSDoc
      analyzeDocuments: true,          // 📄 Analyze document quality  
      enableLLMAnalysis: true,         // 🧠 Deep LLM reasoning
      autoApprovalThreshold: 0.8       // 🔒 Auto-approve high confidence
    }
  });
  
  // Listen for workflow events
  workflow.on('phase', (phase) => {
    const phaseLabels = {
      'discovery': '🔍 Discovering files in repository...',
      'analysis': '🧠 Performing swarm intelligence analysis...',
      'classification': '📋 Classifying and generating recommendations...',
      'approval_gates': '🔒 Creating approval workflows...',
      'recommendations': '💡 Generating overall insights...'
    };
    
    console.log(phaseLabels[phase] || `📊 Phase: ${phase}`);
  });
  
  workflow.on('progress', (progress) => {
    const percent = Math.round((progress.completed / progress.total) * 100);
    console.log(`   Progress: ${progress.completed}/${progress.total} files (${percent}%)`);
  });
  
  try {
    // Execute the intelligent workflow
    const result = await workflow.importAndAnalyze();
    
    // Display results
    console.log('\n📊 Workflow Results');
    console.log('===================');
    console.log(`📁 Total files analyzed: ${result.totalFiles}`);
    console.log(`✅ Ready for import: ${result.readyForImport.length}`);
    console.log(`🔒 Require approval: ${result.requiresApproval.length}`);
    console.log(`🔧 Need improvement: ${result.needsImprovement.length}`);
    console.log(`🚪 Approval gates created: ${result.approvalGates.length}`);
    
    // Show detailed analysis examples
    console.log('\n🔍 Analysis Examples');
    console.log('====================');
    
    // Show a few ready-for-import files
    if (result.readyForImport.length > 0) {
      console.log('\n✅ Ready for Import:');
      result.readyForImport.slice(0, 3).forEach(file => {
        console.log(`   📄 ${file.filePath} (${file.fileType})`);
        console.log(`      Type: ${file.documentType || 'N/A'}`);
        console.log(`      Confidence: ${(file.recommendations.confidence * 100).toFixed(0)}%`);
        console.log(`      Reasoning: ${file.recommendations.reasoning}`);
        if (file.documentationScore) {
          console.log(`      Documentation: ${(file.documentationScore.overall * 100).toFixed(0)}%`);
        }
        console.log('');
      });
    }
    
    // Show approval required files
    if (result.requiresApproval.length > 0) {
      console.log('🔒 Require Manual Approval:');
      result.requiresApproval.slice(0, 3).forEach(file => {
        console.log(`   📄 ${file.filePath} (${file.fileType})`);
        console.log(`      Issue: ${file.recommendations.reasoning}`);
        console.log(`      Confidence: ${(file.recommendations.confidence * 100).toFixed(0)}%`);
        if (file.documentationScore?.missing?.length) {
          console.log(`      Missing docs: ${file.documentationScore.missing.length} items`);
        }
        console.log('');
      });
    }
    
    // Show improvement suggestions
    if (result.needsImprovement.length > 0) {
      console.log('🔧 Improvement Suggestions:');
      result.needsImprovement.slice(0, 3).forEach(file => {
        console.log(`   📄 ${file.filePath} (${file.fileType})`);
        if (file.recommendations.improvements) {
          file.recommendations.improvements.forEach(improvement => {
            console.log(`      • ${improvement}`);
          });
        }
        if (file.llmAnalysis?.suggestions) {
          file.llmAnalysis.suggestions.forEach(suggestion => {
            console.log(`      • ${suggestion}`);
          });
        }
        console.log('');
      });
    }
    
    // Overall recommendations
    console.log('💡 Overall Recommendations');
    console.log('===========================');
    console.log(`${result.overallRecommendations.summary}\n`);
    
    console.log('🔑 Key Findings:');
    result.overallRecommendations.keyFindings.forEach(finding => {
      console.log(`   • ${finding}`);
    });
    
    console.log('\n📋 Suggested Actions:');
    result.overallRecommendations.suggestedActions.forEach(action => {
      console.log(`   • ${action}`);
    });
    
    console.log(`\n⏱️  Estimated effort: ${result.overallRecommendations.estimatedEffort}`);
    
    // Show approval workflow status
    console.log('\n🔒 Approval Workflows');
    console.log('=====================');
    
    const approvalStatus = workflow.getApprovalStatus();
    if (approvalStatus.length > 0) {
      approvalStatus.forEach(status => {
        console.log(`   🚪 ${status.gateId} - ${status.filePath} (${status.status})`);
      });
      
      console.log('\n💡 Next Steps:');
      console.log('   1. Review approval gates in TUI interface');
      console.log('   2. Approve/reject files based on analysis');
      console.log('   3. Apply suggested improvements where needed');
      console.log('   4. Execute approved imports to database');
      console.log('   5. Monitor documentation completeness over time');
    }
    
    // Simulate executing approved imports
    if (result.readyForImport.length > 0) {
      console.log('\n💾 Database Import Simulation');
      console.log('==============================');
      console.log(`Would import ${result.readyForImport.length} files to database:`);
      
      result.readyForImport.slice(0, 5).forEach(file => {
        const table = file.documentType ? `${file.documentType}_documents` : 'documents';
        console.log(`   INSERT INTO ${table} (title, content, metadata) VALUES ('${file.filePath}', ..., ...)`);
      });
      
      console.log('\n✅ All approved files would be stored in database with:');
      console.log('   • Full content and metadata');
      console.log('   • Analysis results and confidence scores');
      console.log('   • TSDoc/JSDoc completeness data');
      console.log('   • LLM quality assessments');
      console.log('   • Traceability to original files');
    }
    
    console.log('\n🎉 Intelligent Document Import Demo Complete!');
    console.log('\n💡 This workflow demonstrates:');
    console.log('   ✅ Database-first document storage (not file system)');
    console.log('   ✅ TSDoc/JSDoc completeness analysis for code files');
    console.log('   ✅ LLM-powered "ultrathink" document analysis');
    console.log('   ✅ Human-in-the-loop approval workflows');
    console.log('   ✅ Intelligent recommendations and improvements');
    console.log('   ✅ Integration with existing swarm coordination systems');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
    
    // Show what would happen with a simulated workflow
    console.log('\n🎭 Simulated Workflow Results');
    console.log('=============================');
    console.log('(Since full integration needs database setup)\n');
    
    console.log('📊 Example Analysis Results:');
    console.log('   📄 README.md → ✅ Ready (vision document, 85% confidence)');
    console.log('   📄 TODO.md → 🔒 Needs approval (task document, large file, 65% confidence)');
    console.log('   📝 src/main.ts → 🔧 Needs improvement (42% documented, missing 23 TSDoc comments)');
    console.log('   📝 src/types.ts → ✅ Ready (95% documented, excellent TSDoc coverage)');
    console.log('   📄 ARCHITECTURE.md → 🔧 Improve (good structure but needs examples)');
    
    console.log('\n🔒 Example Approval Gates:');
    console.log('   🚪 Gate-001: Approve large TODO.md import?');
    console.log('      - File: TODO.md (152KB, 3,847 lines)');
    console.log('      - Analysis: Comprehensive task list but very large');
    console.log('      - Recommendation: Review for potential splitting');
    console.log('');
    console.log('   🚪 Gate-002: Apply TSDoc improvements to main.ts?');
    console.log('      - File: src/main.ts (42% documented)');
    console.log('      - Missing: 23 function comments, 5 interface docs');
    console.log('      - Recommendation: Add TSDoc before import');
    
    console.log('\n💾 Example Database Storage:');
    console.log('   INSERT INTO vision_documents (title, content, metadata) VALUES');
    console.log('     (\'README.md\', \'# Singularity Engine...\', \'{"confidence": 0.85, "analysis": {...}}\')');
    console.log('');
    console.log('   INSERT INTO code_documentation (file_path, completeness_score, missing_docs) VALUES');
    console.log('     (\'src/main.ts\', 0.42, \'["function main", "interface Config", ...]\')');
  }
}

// Run the demonstration
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateIntelligentWorkflow().catch(console.error);
}

export { demonstrateIntelligentWorkflow };