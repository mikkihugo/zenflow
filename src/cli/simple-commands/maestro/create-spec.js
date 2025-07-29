#!/usr/bin/env node

/**
 * Maestro Create Spec Command
 * Creates specification documents using specs-driven methodology
 */

import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

export const command = 'create-spec <feature> [request]';
export const describe = 'Create specification document for a feature';

export const builder = (yargs) => {
  return yargs
    .positional('feature', {
      describe: 'Feature name for specification',
      type: 'string'
    })
    .positional('request', {
      describe: 'Initial requirement description',
      type: 'string',
      default: 'Feature specification and requirements'
    })
    .option('output', {
      alias: 'o',
      describe: 'Output directory',
      type: 'string'
    });
};

export const handler = async (argv) => {
  const { feature, request, output } = argv;
  
  console.log(chalk.blue(`📋 Creating specification for feature: ${feature}`));
  
  try {
    // Create specs directory
    const specsDir = output || join(process.cwd(), 'docs', 'maestro', 'specs', feature);
    await mkdir(specsDir, { recursive: true });
    
    // Generate requirements document
    const requirementsContent = generateRequirementsContent(feature, request);
    const requirementsFile = join(specsDir, 'requirements.md');
    await writeFile(requirementsFile, requirementsContent);
    
    console.log(chalk.green(`✅ Requirements created: ${requirementsFile}`));
    
    // Create workflow state tracking
    const workflowState = {
      featureName: feature,
      currentPhase: 'Requirements Clarification',
      currentTaskIndex: 0,
      status: 'active',
      lastActivity: new Date().toISOString(),
      history: [{
        phase: 'Requirements Clarification',
        status: 'completed',
        timestamp: new Date().toISOString()
      }]
    };
    
    const stateFile = join(specsDir, 'workflow-state.json');
    await writeFile(stateFile, JSON.stringify(workflowState, null, 2));
    
    console.log(chalk.green(`✅ Workflow state created: ${stateFile}`));
    console.log(chalk.yellow(`📝 Next: Run 'maestro generate-design ${feature}' to continue`));
    
  } catch (error) {
    console.error(chalk.red(`❌ Failed to create spec for ${feature}:`), error.message);
    process.exit(1);
  }
};

function generateRequirementsContent(feature, request) {
  const timestamp = new Date().toISOString().split('T')[0];
  
  return `# Requirements for ${feature}

*Created: ${timestamp}*

## High-Level Request
${request}

## User Stories

### Primary User Story
As a **user**, I want **${request.toLowerCase()}**, so that **I can achieve my goals efficiently**.

### Additional User Stories
- As a developer, I want clear specifications for ${feature}, so that I can implement it correctly
- As a tester, I want comprehensive acceptance criteria, so that I can validate the implementation
- As a product owner, I want measurable outcomes, so that I can track success

## Acceptance Criteria

### Functional Requirements
- [ ] **Core Functionality**: ${feature} functions as described in the requirements
- [ ] **User Interface**: Intuitive and accessible user interface (if applicable)
- [ ] **Data Handling**: Proper data validation and error handling
- [ ] **Integration**: Seamless integration with existing systems

### Non-Functional Requirements
- [ ] **Performance**: Response times meet established benchmarks
- [ ] **Scalability**: System handles expected load volumes
- [ ] **Security**: Appropriate security measures implemented
- [ ] **Reliability**: System maintains >99% uptime
- [ ] **Maintainability**: Code follows established standards and patterns

### Quality Gates
- [ ] **Code Review**: All code reviewed and approved
- [ ] **Testing**: Unit tests pass with >95% coverage
- [ ] **Integration Testing**: All integration tests pass
- [ ] **Security Scan**: No critical security vulnerabilities
- [ ] **Performance Testing**: Meets performance benchmarks
- [ ] **Documentation**: Complete technical and user documentation

## Technical Requirements

### System Integration
- [ ] **API Compatibility**: Maintains backward compatibility with existing APIs
- [ ] **Database Changes**: Any database modifications properly versioned
- [ ] **Dependencies**: All required dependencies documented and approved
- [ ] **Configuration**: Environment-specific configurations managed properly

### Development Standards
- [ ] **Code Quality**: Follows established coding standards and best practices
- [ ] **Error Handling**: Comprehensive error handling and logging
- [ ] **Testing Strategy**: Unit, integration, and end-to-end tests implemented
- [ ] **Documentation**: Code comments and API documentation complete

### Deployment Requirements
- [ ] **CI/CD Pipeline**: Automated build and deployment process
- [ ] **Environment Setup**: Development, staging, and production environments configured
- [ ] **Monitoring**: Appropriate logging and monitoring implemented
- [ ] **Rollback Strategy**: Plan for rolling back changes if needed

## Success Metrics

### Key Performance Indicators (KPIs)
- **Functionality**: 100% of acceptance criteria met
- **Quality**: <5 bugs reported in first month post-deployment
- **Performance**: 95th percentile response time <200ms
- **User Satisfaction**: >90% positive feedback from stakeholders

### Measurement Approach
- Automated testing results and coverage reports
- Performance monitoring and alerting
- User feedback collection and analysis
- Code quality metrics and technical debt tracking

## Risk Assessment

### Identified Risks
| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|-------------------|
| Technical complexity | High | Medium | Break into smaller phases |
| Integration challenges | Medium | Medium | Early integration testing |
| Performance issues | Medium | Low | Performance testing throughout development |
| Resource constraints | High | Low | Regular resource planning and review |

### Contingency Plans
- **Technical Blockers**: Escalation path to senior technical resources
- **Timeline Delays**: Scope reduction or resource reallocation options
- **Quality Issues**: Additional testing and review phases
- **Production Issues**: Rollback procedures and hotfix processes

## Timeline and Milestones

### Development Phases
1. **Phase 1**: Requirements and Design (1-2 weeks)
   - Complete requirements analysis
   - Create detailed design specifications
   - Review and approve architectural approach

2. **Phase 2**: Core Implementation (2-4 weeks)
   - Implement core functionality
   - Unit testing and basic integration
   - Code review and quality checks

3. **Phase 3**: Integration and Testing (1-2 weeks)
   - Integration with existing systems
   - Comprehensive testing (all types)
   - Performance and security validation

4. **Phase 4**: Deployment and Validation (1 week)
   - Production deployment
   - Post-deployment validation
   - Documentation and knowledge transfer

## Stakeholder Sign-off

| Role | Name | Date | Approval |
|------|------|------|----------|
| Product Owner | | | |
| Technical Lead | | | |
| Quality Assurance | | | |
| Security Review | | | |

---

*Generated by Maestro Specs-Driven Development Framework*
*Feature: ${feature} | Created: ${timestamp}*
`;
}