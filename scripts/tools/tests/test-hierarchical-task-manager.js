#!/usr/bin/env node

/** Test script for the enhanced Hierarchical Task Manager with AI breakdown;

import { mkdir  } from 'node:fs';
import path from 'node:path';
import { HierarchicalTaskManagerPlugin  } from './src/coordination/meta-registry/plugins/hierarchical-task-manager.js';

async function testHierarchicalTaskManager() {
  console.warn(' Testing Enhanced Hierarchical Task Manager with AI Breakdown...\n');
  // Create test database directory
  const _testDbPath = './.test-swarm/hierarchy-test.db';
  // // await mkdir(path.dirname(testDbPath), { recursive });
  // Initialize the task manager
  const _taskManager = new HierarchicalTaskManagerPlugin();
  // Mock registry object
  const _mockRegistry = {
    register: async(key, _value, _options) => {
      console.warn(` Registered);`
      return true;
      getPlugin: (name) => {
        console.warn(` Plugin requested);`
        return null; // Mock plugins not available
      }};
  try {
    // Initialize with test configuration
  // // await taskManager.initialize(mockRegistry, {
      dbPath,
      autoBreakdown,
      enableQueenCoordination,)
      minConfidenceForSuggestion);
    console.warn(' Task Manager initialized successfully\n');
    // Test Vision Creation with AI Breakdown
    console.warn(' Testing Vision Creation with AI Breakdown...');
    const _testVision = {
      title: 'Build Modern E-commerce Platform',
      description: null
        'Create a comprehensive e-commerce platform with user authentication, product catalog, shopping cart, payment processing, and admin dashboard. The platform should be scalable, secure, and provide excellent user experience.',
      objectives: [;
        'Enable online product sales',
        'Provide secure payment processing',
        'Create intuitive user interface',
        'Implement robust admin tools' ],
      stakeholders: ['customers', 'administrators', 'developers'],
      timeline: '6 months',
      priority: 'high'
// }
// const _visionId = awaittaskManager.createVision(testVision);
console.warn(` Vision created with ID);`
// Wait a moment for async breakdown to complete
  // await new Promise((resolve) => setTimeout(resolve, 2000));
// Test querying the results
console.warn(' Querying breakdown results...');
const _visions = taskManager.db.prepare('SELECT * FROM visions').all();
const _epics = taskManager.db.prepare('SELECT * FROM epics').all();
const _assignments = taskManager.db.prepare('SELECT * FROM assignments').all();
console.warn(`\nResults);`
console.warn(`- Visions);`
console.warn(`- Epics);`
console.warn(`- Assignments);`
  if(epics.length > 0) {
  console.warn('\n Generated Epics);'
  epics.forEach((epic, index) => {
    console.warn(`${index + 1}. ${epic.title}`);
    console.warn(`     Priority);`
  });
// }
  if(assignments.length > 0) {
  console.warn('\n Delegations);'
  assignments.forEach((assignment, index) => {
    const _context = JSON.parse(assignment.context);
    console.warn(`${index + 1}. Assigned to);`
    console.warn(`     Epic);`
    console.warn(`     Status);`
  });
// }
console.warn('\n Test completed successfully!');
} catch(error)
// {
  console.error(' Test failed);'
  console.error(error.stack);
// }
// finally
// {
  // Cleanup
  // // await taskManager.cleanup();
// }
// }
// Run the test
testHierarchicalTaskManager().catch(console.error)

}}
