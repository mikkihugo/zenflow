#!/usr/bin/env node
/**
 * Test Service Document MCP Tools Directly
 */

import { ClaudeFlowMCPServer } from './src/mcp/mcp-server.js';

async function testServiceDocumentTools() {
  console.log('🧪 Testing Service Document MCP Tools...\n');
  
  const server = new ClaudeFlowMCPServer();
  await server.initializeMemory();
  
  // Test 1: Create a service document
  console.log('Test 1: Creating service document...');
  const createResult = await server.handleServiceDocumentManager({
    action: 'create',
    serviceName: 'claude-zen-core',
    documentType: 'service-description',
    content: {
      name: 'Claude-Flow Core Service',
      version: '2.0.0-alpha.61',
      description: 'Core orchestration service for Claude-Flow microservices',
      responsibilities: ['Service coordination', 'Memory management', 'Task orchestration']
    }
  });
  console.log('Create result:', JSON.stringify(createResult, null, 2));
  
  // Test 2: List service documents
  console.log('\nTest 2: Listing service documents...');
  const listResult = await server.handleServiceDocumentManager({
    action: 'list',
    serviceName: 'claude-zen-core',
    documentType: 'service-description'
  });
  console.log('List result:', JSON.stringify(listResult, null, 2));
  
  // Test 3: Test service approval workflow
  console.log('\nTest 3: Testing approval workflow...');
  const approvalResult = await server.handleServiceApprovalWorkflow({
    action: 'queue',
    documentId: createResult.documentId || 'test-doc',
    approver: 'system-admin'
  });
  console.log('Approval result:', JSON.stringify(approvalResult, null, 2));
  
  // Test 4: Test service document validator
  console.log('\nTest 4: Testing document validator...');
  const validationResult = await server.handleServiceDocumentValidator({
    validateType: 'single-document',
    serviceName: 'claude-zen-core',
    documentType: 'service-description'
  });
  console.log('Validation result:', JSON.stringify(validationResult, null, 2));
  
  console.log('\n✅ Service Document Tools Test Complete!');
  
  return {
    create: createResult,
    list: listResult,
    approval: approvalResult,
    validation: validationResult
  };
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testServiceDocumentTools()
    .then(results => {
      console.log('\n📊 Final Test Results:');
      console.log('- Create:', results.create.success ? '✅' : '❌');
      console.log('- List:', results.list.success ? '✅' : '❌');
      console.log('- Approval:', results.approval.success ? '✅' : '❌');
      console.log('- Validation:', results.validation.success ? '✅' : '❌');
    })
    .catch(error => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

export { testServiceDocumentTools };