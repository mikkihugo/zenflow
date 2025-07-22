#!/usr/bin/env node
/**
 * Test script for the enhanced Hierarchical Task Manager with AI breakdown
 */

import { HierarchicalTaskManagerPlugin } from './src/coordination/meta-registry/plugins/hierarchical-task-manager.js';
import path from 'path';
import { mkdir } from 'fs/promises';

async function testHierarchicalTaskManager() {
  console.log('🧪 Testing Enhanced Hierarchical Task Manager with AI Breakdown...\n');

  // Create test database directory
  const testDbPath = './.test-swarm/hierarchy-test.db';
  await mkdir(path.dirname(testDbPath), { recursive: true });

  // Initialize the task manager
  const taskManager = new HierarchicalTaskManagerPlugin();
  
  // Mock registry object
  const mockRegistry = {
    register: async (key, value, options) => {
      console.log(`📝 Registered: ${key}`);
      return true;
    },
    pluginSystem: {
      getPlugin: (name) => {
        console.log(`🔌 Plugin requested: ${name}`);
        return null; // Mock plugins not available
      }
    }
  };

  try {
    // Initialize with test configuration
    await taskManager.initialize(mockRegistry, {
      dbPath: testDbPath,
      autoBreakdown: true,
      enableQueenCoordination: true,
      minConfidenceForSuggestion: 0.5
    });

    console.log('✅ Task Manager initialized successfully\n');

    // Test Vision Creation with AI Breakdown
    console.log('🎯 Testing Vision Creation with AI Breakdown...');
    
    const testVision = {
      title: "Build Modern E-commerce Platform",
      description: "Create a comprehensive e-commerce platform with user authentication, product catalog, shopping cart, payment processing, and admin dashboard. The platform should be scalable, secure, and provide excellent user experience.",
      objectives: [
        "Enable online product sales",
        "Provide secure payment processing", 
        "Create intuitive user interface",
        "Implement robust admin tools"
      ],
      stakeholders: ["customers", "administrators", "developers"],
      timeline: "6 months",
      priority: "high"
    };

    const visionId = await taskManager.createVision(testVision);
    console.log(`✅ Vision created with ID: ${visionId}\n`);

    // Wait a moment for async breakdown to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test querying the results
    console.log('📊 Querying breakdown results...');
    
    const visions = taskManager.db.prepare('SELECT * FROM visions').all();
    const epics = taskManager.db.prepare('SELECT * FROM epics').all();
    const assignments = taskManager.db.prepare('SELECT * FROM assignments').all();
    
    console.log(`\nResults:`);
    console.log(`- Visions: ${visions.length}`);
    console.log(`- Epics: ${epics.length}`);
    console.log(`- Assignments: ${assignments.length}`);
    
    if (epics.length > 0) {
      console.log('\n📋 Generated Epics:');
      epics.forEach((epic, index) => {
        console.log(`  ${index + 1}. ${epic.title}`);
        console.log(`     Priority: ${epic.priority}, Effort: ${epic.effort}`);
      });
    }
    
    if (assignments.length > 0) {
      console.log('\n🎯 Delegations:');
      assignments.forEach((assignment, index) => {
        const context = JSON.parse(assignment.context);
        console.log(`  ${index + 1}. Assigned to: ${assignment.queen_id}`);
        console.log(`     Epic: ${context.epic_title}`);
        console.log(`     Status: ${assignment.status}`);
      });
    }

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    // Cleanup
    await taskManager.cleanup();
  }
}

// Run the test
testHierarchicalTaskManager().catch(console.error);