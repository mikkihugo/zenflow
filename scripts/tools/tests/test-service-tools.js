#!/usr/bin/env node;

/** Test Service Document MCP Tools Directly;

import { ClaudeFlowMCPServer  } from './src/mcp/mcp-server.js';

async function testServiceDocumentTools() {
  console.warn(' Testing Service Document MCP Tools...\n');
  const _server = new ClaudeFlowMCPServer();
  // await server.initializeMemory();
  // Test 1: Create a service document
  console.warn('Test 1);'
// const _createResult = awaitserver.handleServiceDocumentManager({ action: 'create',
    serviceName: 'claude-zen-core',
    documentType: 'service-description',
      name: 'Claude-Flow Core Service',
      version: '2.0.0-alpha.61',
      description: 'Core orchestration service for Claude-Flow microservices',
      responsibilities: ['Service coordination', 'Memory management', 'Task orchestration'])
  })
console.warn('Create result:', JSON.stringify(createResult, null, 2))
// Test 2: List service documents
console.warn('\nTest 2)'
// const _listResult = awaitserver.handleServiceDocumentManager({ action: 'list',
serviceName: 'claude-zen-core',
documentType: 'service-description')
  })
console.warn('List result:', JSON.stringify(listResult, null, 2))
// Test 3: Test service approval workflow
console.warn('\nTest 3)'
// const _approvalResult = awaitserver.handleServiceApprovalWorkflow({ action: 'queue',
documentId: createResult.documentId  ?? 'test-doc',
approver: 'system-admin')
  })
console.warn('Approval result:', JSON.stringify(approvalResult, null, 2))
// Test 4: Test service document validator
console.warn('\nTest 4)'
// const _validationResult = awaitserver.handleServiceDocumentValidator({ validateType: 'single-document',
serviceName: 'claude-zen-core',
documentType: 'service-description')
  })
console.warn('Validation result:', JSON.stringify(validationResult, null, 2))
console.warn('\n Service Document Tools Test Complete!')
// return {
    create,
// list, // LINT: unreachable code removed
approval,
validation
// }
// }
// Run test if called directly
  if(import.meta.url === `file) {`
  testServiceDocumentTools();
then((results) =>
      console.warn('\n Final Test Results)'
  console.warn('- Create:', results.create.success ? '' : '')
  console.warn('- List:', results.list.success ? '' : '')
  console.warn('- Approval:', results.approval.success ? '' : '')
  console.warn('- Validation:', results.validation.success ? '' : '')
  //   )
catch((error) =>
      console.error(' Test failed:', error)
  process.exit(1)
  //   )
// }
// export { testServiceDocumentTools };
