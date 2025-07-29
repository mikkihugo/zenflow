#!/usr/bin/env node

/**
 * Maestro Approve Phase Command
 * Approves current phase and progresses to next phase
 */

import { readFile, writeFile, access } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

export const command = 'approve-phase <feature>';
export const describe = 'Approve current phase and progress to next phase';

export const handler = async (argv) => {
  const { feature } = argv;
  
  console.log(chalk.blue(`✅ Approving current phase for feature: ${feature}`));
  
  try {
    // Check if workflow state exists
    const specsDir = join(process.cwd(), 'docs', 'maestro', 'specs', feature);
    const stateFile = join(specsDir, 'workflow-state.json');
    
    try {
      await access(stateFile);
    } catch {
      console.error(chalk.red(`❌ Workflow state not found: ${stateFile}`));
      console.log(chalk.yellow(`💡 Run 'maestro create-spec ${feature}' first`));
      process.exit(1);
    }
    
    // Read current workflow state
    const stateContent = await readFile(stateFile, 'utf-8');
    const state = JSON.parse(stateContent);
    
    console.log(chalk.gray(`📊 Current phase: ${state.currentPhase}`));
    console.log(chalk.gray(`📊 Current status: ${state.status}`));
    
    // Determine next phase
    const nextPhase = getNextPhase(state.currentPhase);
    const phaseApproval = await approveCurrentPhase(state, nextPhase);
    
    // Update workflow state
    state.currentPhase = nextPhase;
    state.status = nextPhase === 'Completed' ? 'completed' : 'active';
    state.lastActivity = new Date().toISOString();
    state.history.push({
      phase: `${state.currentPhase} (Approved)`,
      status: 'approved',
      timestamp: new Date().toISOString(),
      approver: process.env.USER || 'unknown',
      notes: phaseApproval.notes
    });
    
    await writeFile(stateFile, JSON.stringify(state, null, 2));
    
    // Create approval document
    const approvalContent = await generateApprovalContent(feature, state.currentPhase, phaseApproval);
    const approvalFile = join(specsDir, `approval-${state.currentPhase.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`);
    await writeFile(approvalFile, approvalContent);
    
    console.log(chalk.green(`✅ Phase approved: ${state.currentPhase}`));
    console.log(chalk.gray(`   📁 Approval documentation: ${approvalFile}`));
    
    if (nextPhase === 'Completed') {
      console.log(chalk.cyan(`🎉 All phases completed for '${feature}'!`));
      console.log(chalk.yellow(`📋 Run 'maestro status ${feature}' to view final summary`));
    } else {
      console.log(chalk.yellow(`📝 Next phase: ${nextPhase}`));
      console.log(chalk.yellow(`🔄 Continue with appropriate maestro commands for the next phase`));
    }
    
  } catch (error) {
    console.error(chalk.red(`❌ Failed to approve phase for ${feature}:`), error.message);
    process.exit(1);
  }
};

function getNextPhase(currentPhase) {
  const phaseSequence = {
    'Requirements Clarification': 'Research & Design',
    'Research & Design': 'Implementation Planning',
    'Implementation Planning': 'Task Execution',
    'Task Execution': 'Quality Assurance',
    'Quality Assurance': 'Deployment & Validation',
    'Deployment & Validation': 'Completed'
  };
  
  return phaseSequence[currentPhase] || 'Unknown Phase';
}

async function approveCurrentPhase(state, nextPhase) {
  const timestamp = new Date().toISOString().split('T')[0];
  
  // Phase-specific approval criteria
  const approvalCriteria = {
    'Requirements Clarification': [
      'Requirements document completed',
      'User stories defined',
      'Acceptance criteria established',
      'Stakeholder sign-off obtained'
    ],
    'Research & Design': [
      'Technical design completed',
      'Architecture decisions documented',
      'Security considerations addressed',
      'Performance requirements defined'
    ],
    'Implementation Planning': [
      'Task breakdown completed',
      'Dependencies identified',
      'Resource allocation planned',
      'Timeline established'
    ],
    'Task Execution': [
      'Core functionality implemented',
      'Code review completed',
      'Unit tests passing',
      'Integration tests successful'
    ],
    'Quality Assurance': [
      'All tests passing',
      'Performance benchmarks met',
      'Security validation completed',
      'Documentation updated'
    ],
    'Deployment & Validation': [
      'Production deployment successful',
      'Post-deployment validation completed',
      'Monitoring and alerting active',
      'User acceptance confirmed'
    ]
  };
  
  const criteria = approvalCriteria[state.currentPhase] || ['Phase requirements met'];
  
  return {
    criteria,
    approver: process.env.USER || 'system',
    timestamp,
    notes: `Phase '${state.currentPhase}' approved for progression to '${nextPhase}'`,
    nextActions: getNextPhaseActions(nextPhase)
  };
}

function getNextPhaseActions(nextPhase) {
  const actions = {
    'Research & Design': [
      'Run maestro generate-design <feature>',
      'Review and refine technical specifications',
      'Validate architectural decisions',
      'Obtain technical approval'
    ],
    'Implementation Planning': [
      'Run maestro generate-tasks <feature>',
      'Review task breakdown and dependencies',
      'Assign tasks to team members',
      'Set up development environment'
    ],
    'Task Execution': [
      'Run maestro implement-task <feature> <task-number>',
      'Follow TDD practices',
      'Conduct regular code reviews',
      'Update documentation as needed'
    ],
    'Quality Assurance': [
      'Execute comprehensive test suite',
      'Perform security assessment',
      'Validate performance requirements',
      'Complete documentation review'
    ],
    'Deployment & Validation': [
      'Deploy to production environment',
      'Execute post-deployment validation',
      'Monitor system performance',
      'Gather user feedback'
    ],
    'Completed': [
      'Archive project documentation',
      'Conduct project retrospective',
      'Document lessons learned',
      'Plan maintenance and support'
    ]
  };
  
  return actions[nextPhase] || ['Continue with next phase activities'];
}

async function generateApprovalContent(feature, currentPhase, approval) {
  return `# Phase Approval: ${currentPhase} - ${feature}

*Approved: ${approval.timestamp} | Approver: ${approval.approver}*

## Approval Summary

### Phase Completed
**${currentPhase}** has been successfully completed and approved for the **${feature}** project.

### Approval Criteria Met
${approval.criteria.map(criterion => `- [x] ${criterion}`).join('\n')}

### Approval Details
- **Approver**: ${approval.approver}
- **Approval Date**: ${approval.timestamp}
- **Notes**: ${approval.notes}

## Phase Assessment

### Quality Indicators
- **Completeness**: All phase deliverables completed
- **Quality**: Meets established quality standards
- **Compliance**: Adheres to project guidelines and standards
- **Stakeholder Satisfaction**: Meets stakeholder expectations

### Deliverables Review
- **Documentation**: All required documentation completed
- **Code Quality**: Code meets established standards (if applicable)
- **Testing**: Appropriate testing completed and passing
- **Reviews**: All necessary reviews completed and approved

## Next Phase Preparation

### Upcoming Phase Activities
${approval.nextActions.map(action => `- [ ] ${action}`).join('\n')}

### Success Criteria for Next Phase
The next phase will be considered successful when:
- All planned activities are completed
- Quality gates are passed
- Stakeholder approval is obtained
- Documentation is updated

### Resource Requirements
- **Team Members**: Assigned resources for next phase
- **Tools and Environment**: Required tools and systems ready
- **Dependencies**: External dependencies identified and managed
- **Timeline**: Realistic timeline established for completion

## Risk Assessment

### Identified Risks for Next Phase
| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|-------------------|
| Resource constraints | Medium | Low | Resource planning and allocation |
| Technical challenges | High | Medium | Early prototyping and validation |
| Timeline pressure | Medium | Medium | Agile approach and regular reviews |

### Contingency Plans
- **Resource Shortfall**: Cross-training and resource reallocation
- **Technical Blockers**: Expert consultation and alternative approaches
- **Quality Issues**: Additional review cycles and testing
- **Timeline Delays**: Scope adjustment and priority reassessment

## Stakeholder Communication

### Approval Notification
This phase approval has been communicated to:
- [ ] Project Sponsor
- [ ] Technical Lead
- [ ] Development Team
- [ ] Quality Assurance Team
- [ ] Product Owner

### Next Phase Kickoff
- **Scheduled Date**: To be determined
- **Participants**: Core team members and stakeholders
- **Agenda**: Phase objectives, activities, and timeline
- **Preparation**: Review phase deliverables and requirements

## Documentation References

### Current Phase Documents
- Requirements specification (if applicable)
- Design documentation (if applicable)
- Task breakdown (if applicable)
- Implementation documentation (if applicable)

### Standards and Guidelines
- Project coding standards
- Documentation guidelines
- Review and approval processes
- Quality assurance procedures

---

*Generated by Maestro Phase Approval Framework*
*Feature: ${feature} | Phase: ${currentPhase} | Approved: ${approval.timestamp}*

*This approval signifies that the phase meets all established criteria and the project is ready to proceed to the next phase.*
`;
}