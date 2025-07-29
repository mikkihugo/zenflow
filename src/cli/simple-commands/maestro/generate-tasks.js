#!/usr/bin/env node

/**
 * Maestro Generate Tasks Command
 * Generates implementation tasks from design specifications
 */

import { readFile, writeFile, access } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

export const command = 'generate-tasks <feature>';
export const describe = 'Generate implementation tasks from design specifications';

export const handler = async (argv) => {
  const { feature } = argv;
  
  console.log(chalk.blue(`📋 Generating implementation tasks for feature: ${feature}`));
  
  try {
    // Check if design exists
    const specsDir = join(process.cwd(), 'docs', 'maestro', 'specs', feature);
    const designFile = join(specsDir, 'design.md');
    
    try {
      await access(designFile);
    } catch {
      console.error(chalk.red(`❌ Design not found: ${designFile}`));
      console.log(chalk.yellow(`💡 Run 'maestro generate-design ${feature}' first`));
      process.exit(1);
    }
    
    // Read design for context
    const design = await readFile(designFile, 'utf-8');
    const designLines = design.split('\n').length;
    
    console.log(chalk.gray(`🎨 Found design document (${designLines} lines)`));
    
    // Generate tasks document
    const tasksContent = await generateTasksContent(feature, design);
    const tasksFile = join(specsDir, 'tasks.md');
    await writeFile(tasksFile, tasksContent);
    
    console.log(chalk.green(`✅ Tasks generated: ${tasksFile}`));
    
    // Update workflow state
    await updateWorkflowState(specsDir, 'Implementation Planning');
    
    // Count generated tasks
    const taskCount = (tasksContent.match(/- \[ \] \d+\./g) || []).length;
    console.log(chalk.blue(`📊 Generated ${taskCount} implementation tasks`));
    console.log(chalk.yellow(`🔨 Next: Run 'maestro implement-task ${feature} 1' to start implementation`));
    
  } catch (error) {
    console.error(chalk.red(`❌ Failed to generate tasks for ${feature}:`), error.message);
    process.exit(1);
  }
};

async function generateTasksContent(feature, design) {
  const timestamp = new Date().toISOString().split('T')[0];
  
  // Analyze design content for task generation
  const hasApiDesign = design.includes('API Design') || design.includes('RESTful Endpoints');
  const hasDatabase = design.includes('Data Models') || design.includes('Database');
  const hasUI = design.includes('Interface') || design.includes('User Experience');
  const hasSecurity = design.includes('Security') || design.includes('Authentication');
  const hasPerformance = design.includes('Performance') || design.includes('Optimization');
  const hasIntegration = design.includes('Integration') || design.includes('External');
  
  return `# Implementation Tasks for ${feature}

*Generated: ${timestamp} | Based on design specifications*

## Task Breakdown Overview

This document provides a comprehensive breakdown of implementation tasks for **${feature}**, organized by development phases and dependencies.

### Summary
- **Total Tasks**: 20+ individual tasks
- **Estimated Effort**: 6-8 weeks  
- **Team Size**: 2-4 developers
- **Complexity**: Medium to High

## Phase 1: Foundation Setup (Week 1)

### Infrastructure & Environment
- [ ] 1. Set up project structure and development environment
- [ ] 2. Configure build system and dependency management
- [ ] 3. Establish CI/CD pipeline with automated testing
- [ ] 4. Set up development, staging, and production environments

${hasDatabase ? `### Database Foundation
- [ ] 5. Design and create database schema
- [ ] 6. Set up database migrations and versioning
- [ ] 7. Implement database connection and configuration
- [ ] 8. Create data access layer and repository patterns` : ''}

### Security Foundation
- [ ] ${hasDatabase ? '9' : '5'}. Implement authentication framework
- [ ] ${hasDatabase ? '10' : '6'}. Set up authorization and role-based access control
- [ ] ${hasDatabase ? '11' : '7'}. Configure security headers and HTTPS
- [ ] ${hasDatabase ? '12' : '8'}. Implement input validation and sanitization

## Phase 2: Core Implementation (Weeks 2-3)

### Core Business Logic
- [ ] ${hasDatabase ? '13' : '9'}. Implement core ${feature} functionality
- [ ] ${hasDatabase ? '14' : '10'}. Develop business rules and validation logic
- [ ] ${hasDatabase ? '15' : '11'}. Create error handling and logging systems
- [ ] ${hasDatabase ? '16' : '12'}. Implement data processing workflows

${hasApiDesign ? `### API Development
- [ ] ${hasDatabase ? '17' : '13'}. Create RESTful API endpoints
- [ ] ${hasDatabase ? '18' : '14'}. Implement request/response handling
- [ ] ${hasDatabase ? '19' : '15'}. Add API documentation (OpenAPI/Swagger)
- [ ] ${hasDatabase ? '20' : '16'}. Implement API versioning and backward compatibility` : ''}

${hasUI ? `### User Interface
- [ ] ${hasApiDesign ? (hasDatabase ? '21' : '17') : (hasDatabase ? '17' : '13')}. Design and implement user interface components
- [ ] ${hasApiDesign ? (hasDatabase ? '22' : '18') : (hasDatabase ? '18' : '14')}. Create responsive and accessible layouts
- [ ] ${hasApiDesign ? (hasDatabase ? '23' : '19') : (hasDatabase ? '19' : '15')}. Implement client-side validation and feedback
- [ ] ${hasApiDesign ? (hasDatabase ? '24' : '20') : (hasDatabase ? '20' : '16')}. Add loading states and error handling` : ''}

## Phase 3: Integration & Enhancement (Weeks 4-5)

${hasIntegration ? `### External Integrations
- [ ] ${hasUI ? (hasApiDesign ? (hasDatabase ? '25' : '21') : (hasDatabase ? '21' : '17')) : (hasApiDesign ? (hasDatabase ? '21' : '17') : (hasDatabase ? '17' : '13'))}. Implement third-party service integrations
- [ ] ${hasUI ? (hasApiDesign ? (hasDatabase ? '26' : '22') : (hasDatabase ? '22' : '18')) : (hasApiDesign ? (hasDatabase ? '22' : '18') : (hasDatabase ? '18' : '14'))}. Add webhook handling and event processing
- [ ] ${hasUI ? (hasApiDesign ? (hasDatabase ? '27' : '23') : (hasDatabase ? '23' : '19')) : (hasApiDesign ? (hasDatabase ? '23' : '19') : (hasDatabase ? '19' : '15'))}. Implement data synchronization mechanisms
- [ ] ${hasUI ? (hasApiDesign ? (hasDatabase ? '28' : '24') : (hasDatabase ? '24' : '20')) : (hasApiDesign ? (hasDatabase ? '24' : '20') : (hasDatabase ? '20' : '16'))}. Create integration monitoring and alerting` : ''}

### Testing & Quality Assurance
- [ ] Create comprehensive unit test suite (>95% coverage)
- [ ] Implement integration tests for all components
- [ ] Create end-to-end test scenarios
- [ ] Perform load testing and performance validation

### Documentation & Deployment
- [ ] Create comprehensive user documentation
- [ ] Set up production environment and deployment pipeline
- [ ] Configure monitoring, logging, and alerting systems
- [ ] Conduct production deployment and validation

## Dependencies and Critical Path

### Task Dependencies
- **Foundation tasks (1-8)** must be completed before core implementation
- **Core implementation (9-24)** can be partially parallelized by team members
- **Integration tasks (25+)** depend on core features being complete
- **Testing tasks** require all development tasks to be finished

### Critical Path Items
1. **Environment Setup** (Tasks 1-4) - Blocks all other development
2. **Core API** (Tasks ${hasApiDesign ? (hasDatabase ? '17-20' : '13-16') : 'N/A'}) - Required for UI and integrations
3. **Security Implementation** (Tasks ${hasDatabase ? '9-12' : '5-8'}) - Needed throughout system

## Quality Gates and Acceptance Criteria

### Phase Completion Criteria
- **Phase 1**: All infrastructure and security foundation completed
- **Phase 2**: Core functionality implemented with basic testing
- **Phase 3**: All integrations working with performance targets met

### Definition of Done
Each task must meet the following criteria:
- [ ] Implementation completed according to design specifications
- [ ] Unit tests written and passing (>95% coverage for core features)
- [ ] Code reviewed and approved by team lead
- [ ] Integration tests passing
- [ ] Documentation updated (code comments, API docs, user guides)
- [ ] Security review completed (if applicable)
- [ ] Performance benchmarks met (if applicable)

---

*Generated by Maestro Task Planning Framework*
*Feature: ${feature} | Planning Phase | Generated: ${timestamp}*

*This task breakdown follows agile development principles and incorporates industry best practices for ${feature} implementation.*
`;
}

async function updateWorkflowState(specsDir, newPhase) {
  try {
    const stateFile = join(specsDir, 'workflow-state.json');
    const stateContent = await readFile(stateFile, 'utf-8');
    const state = JSON.parse(stateContent);
    
    state.currentPhase = newPhase;
    state.lastActivity = new Date().toISOString();
    state.history.push({
      phase: newPhase,
      status: 'completed',
      timestamp: new Date().toISOString()
    });
    
    await writeFile(stateFile, JSON.stringify(state, null, 2));
    console.log(chalk.gray(`📊 Workflow state updated to: ${newPhase}`));
  } catch (error) {
    console.log(chalk.yellow(`⚠️  Could not update workflow state: ${error.message}`));
  }
}