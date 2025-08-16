#!/usr/bin/env ts-node

/**
 * AGUI Library Demo - Demonstrates the complete AGUI library capabilities
 * 
 * This demo shows how to use the AGUI library for human-in-the-loop interactions
 * including task approval workflows, rich terminal interactions, and batch processing.
 */

import { 
  createAGUI, 
  createTaskApprovalSystem, 
  AGUIType,
  type ValidationQuestion,
  type GeneratedSwarmTask,
  type ScanResults 
} from './index';

/**
 * Demo the AGUI library capabilities
 */
async function demoAGUILibrary() {
  console.log('🚀 AGUI Library Demo\n');

  // 1. Create AGUI adapter
  console.log('📋 Creating Terminal AGUI...');
  const agui = createAGUI('terminal');
  
  // 2. Demonstrate basic question asking
  console.log('\n🤔 Testing basic question asking...');
  
  const simpleQuestion: ValidationQuestion = {
    id: 'demo-1',
    type: 'approval',
    question: 'Would you like to continue with the AGUI demo?',
    options: ['Yes, continue', 'No, stop here'],
    confidence: 0.9,
    priority: 'medium',
    context: {
      source: 'AGUI Demo',
      description: 'Demonstrating basic AGUI capabilities'
    }
  };

  const response = await agui.askQuestion(simpleQuestion);
  console.log(`✅ User response: ${response}\n`);

  if (response.toLowerCase().includes('no') || response === '2') {
    await agui.showMessage('Demo stopped by user. Thank you! 👋', 'info');
    return;
  }

  // 3. Demonstrate rich formatting and progress
  console.log('📊 Testing progress display...');
  
  await agui.showProgress({
    current: 3,
    total: 10,
    percentage: 30,
    description: 'Setting up AGUI demo environment...',
    estimatedRemaining: 5000,
    status: 'active',
    metadata: { demoStep: 'progress-test' }
  });

  // 4. Demonstrate message types
  console.log('\n💬 Testing different message types...');
  
  await agui.showMessage('This is an info message', 'info');
  await agui.showMessage('This is a success message', 'success');
  await agui.showMessage('This is a warning message', 'warning');
  await agui.showMessage('This is an error message', 'error');

  // 5. Demonstrate structured info display
  console.log('\n📋 Testing structured info display...');
  
  await agui.showInfo('AGUI Demo Status', {
    version: '1.0.0',
    features: ['Terminal UI', 'Rich formatting', 'Progress tracking', 'Task approval'],
    capabilities: {
      batchProcessing: true,
      progressTracking: true,
      richFormatting: true,
      contextDisplay: true
    },
    timestamp: new Date().toISOString()
  });

  // 6. Create and demo task approval system
  console.log('\n🎯 Creating Task Approval System...');
  
  const taskApproval = createTaskApprovalSystem(agui, {
    enableRichDisplay: true,
    enableBatchMode: true,
    batchSize: 3,
    autoApproveLowSeverity: false,
    requireRationale: true,
    enableModification: true
  });

  // 7. Demo task approval with mock scan results
  console.log('\n📋 Demonstrating task approval workflow...');
  
  const mockScanResults: ScanResults = {
    scannedFiles: 15,
    totalIssues: 8,
    scanDuration: 12500,
    severityCounts: {
      critical: 1,
      high: 2,
      medium: 3,
      low: 2
    },
    patternCounts: {
      'todo-comments': 4,
      'code-debt': 2,
      'missing-tests': 2
    },
    generatedTasks: [
      {
        id: 'task-001',
        title: 'Fix critical security vulnerability in authentication',
        description: 'Address SQL injection vulnerability in user login endpoint',
        type: 'bug',
        priority: 'critical',
        estimatedHours: 4,
        suggestedSwarmType: 'security-focused',
        requiredAgentTypes: ['security-expert', 'backend-developer'],
        acceptanceCriteria: [
          'Vulnerability patched and tested',
          'Security audit passed',
          'Unit tests added for fix'
        ],
        sourceAnalysis: {
          filePath: '/src/auth/login.ts',
          lineNumber: 45,
          type: 'security-vulnerability',
          severity: 'critical',
          codeSnippet: 'const query = `SELECT * FROM users WHERE email = "${email}"`',
          tags: ['sql-injection', 'authentication', 'security']
        }
      },
      {
        id: 'task-002', 
        title: 'Add unit tests for user service',
        description: 'Increase test coverage for user management functionality',
        type: 'improvement',
        priority: 'medium',
        estimatedHours: 6,
        suggestedSwarmType: 'testing-focused',
        requiredAgentTypes: ['test-engineer', 'backend-developer'],
        acceptanceCriteria: [
          'Test coverage above 80%',
          'All edge cases covered',
          'Integration tests included'
        ],
        sourceAnalysis: {
          filePath: '/src/services/user.service.ts',
          lineNumber: 1,
          type: 'missing-tests',
          severity: 'medium',
          codeSnippet: 'export class UserService {',
          tags: ['testing', 'coverage', 'quality']
        }
      }
    ]
  };

  // Run task approval workflow
  const approvalResults = await taskApproval.reviewGeneratedTasks(mockScanResults);
  
  // 8. Show final demo results
  console.log('\n🎉 Demo Complete! Here are the final results:');
  
  await agui.showInfo('AGUI Demo Results', {
    totalTasksReviewed: approvalResults.totalTasks,
    approvedTasks: approvalResults.approved,
    rejectedTasks: approvalResults.rejected,
    modifiedTasks: approvalResults.modified,
    deferredTasks: approvalResults.deferred,
    processingTimeMs: approvalResults.processingTime,
    approvalRate: `${Math.round((approvalResults.approved / approvalResults.totalTasks) * 100)}%`,
    statistics: taskApproval.getStatistics()
  });

  await agui.showMessage('AGUI Library demo completed successfully! 🚀', 'success');
  
  // Cleanup
  agui.close?.();
}

/**
 * Run the demo if this file is executed directly
 */
if (require.main === module) {
  demoAGUILibrary()
    .then(() => {
      console.log('\n✅ Demo finished successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Demo failed:', error);
      process.exit(1);
    });
}

export { demoAGUILibrary };