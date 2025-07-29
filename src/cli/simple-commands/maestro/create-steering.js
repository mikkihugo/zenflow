#!/usr/bin/env node

/**
 * Maestro Create Steering Command
 * Creates comprehensive steering documents with AI assistance
 */

import { mkdir, writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

export const command = 'create-steering <feature> [options]';
export const describe = 'Create comprehensive steering document for a feature';

export const builder = (yargs) => {
  return yargs
    .positional('feature', {
      describe: 'Feature name for steering document',
      type: 'string'
    })
    .option('domain', {
      alias: 'd',
      describe: 'Domain for the steering document',
      type: 'string',
      default: 'general'
    })
    .option('template', {
      alias: 't',
      describe: 'Template type to use',
      type: 'string',
      choices: ['product', 'technical', 'workflow', 'security'],
      default: 'technical'
    })
    .option('output', {
      alias: 'o',
      describe: 'Output directory',
      type: 'string'
    });
};

export const handler = async (argv) => {
  const { feature, domain, template, output } = argv;
  
  console.log(chalk.blue(`🎯 Creating steering document for feature: ${feature}`));
  console.log(chalk.gray(`   Domain: ${domain}, Template: ${template}`));
  
  try {
    // Determine output directory
    const outputDir = output || join(process.cwd(), 'docs', 'maestro', 'steering', domain);
    await mkdir(outputDir, { recursive: true });
    
    // Generate comprehensive steering content based on template
    const steeringContent = await generateSteeringContent(feature, domain, template);
    
    // Write steering document
    const fileName = `${feature.toLowerCase().replace(/[^a-z0-9]/g, '-')}-steering.md`;
    const filePath = join(outputDir, fileName);
    await writeFile(filePath, steeringContent);
    
    console.log(chalk.green(`✅ Steering document created: ${filePath}`));
    console.log(chalk.yellow(`📋 Review and customize the generated content as needed`));
    
    // Show summary of what was created
    const lines = steeringContent.split('\n').length;
    const sections = (steeringContent.match(/^##/gm) || []).length;
    console.log(chalk.blue(`📊 Generated ${lines} lines with ${sections} sections`));
    
  } catch (error) {
    console.error(chalk.red(`❌ Failed to create steering for ${feature}:`), error.message);
    process.exit(1);
  }
};

async function generateSteeringContent(feature, domain, template) {
  const timestamp = new Date().toISOString().split('T')[0];
  
  // Template-specific content generation
  const templateSections = {
    product: {
      focus: 'product requirements and user experience',
      sections: ['User Stories', 'Acceptance Criteria', 'Product Requirements', 'UX Guidelines']
    },
    technical: {
      focus: 'technical implementation and architecture',
      sections: ['Technical Requirements', 'Architecture Decisions', 'Implementation Guidelines', 'Testing Strategy']
    },
    workflow: {
      focus: 'development process and team coordination',
      sections: ['Process Guidelines', 'Team Coordination', 'Quality Gates', 'Release Process']
    },
    security: {
      focus: 'security requirements and compliance',
      sections: ['Security Requirements', 'Compliance Guidelines', 'Risk Assessment', 'Security Testing']
    }
  };
  
  const templateConfig = templateSections[template] || templateSections.technical;
  
  return `# ${feature} Steering Document

*Created: ${timestamp} | Domain: ${domain} | Template: ${template}*

## Overview
This steering document provides comprehensive guidance for the **${feature}** initiative, focusing on ${templateConfig.focus}.

## Executive Summary
The ${feature} project aims to deliver high-quality functionality that aligns with our architectural principles and development standards.

### Key Objectives
- Implement ${feature} according to established patterns
- Maintain consistency with existing system architecture
- Ensure proper testing and documentation
- Follow security and performance best practices

## ${templateConfig.sections[0]}

### Core Requirements
- **Functionality**: Deliver the specified ${feature} capabilities
- **Quality**: Maintain high code quality standards
- **Performance**: Meet or exceed performance benchmarks
- **Security**: Implement appropriate security measures

### Implementation Approach
1. **Analysis Phase**: Review existing patterns and dependencies
2. **Design Phase**: Create detailed technical specifications
3. **Implementation Phase**: Develop according to standards
4. **Validation Phase**: Comprehensive testing and review

## ${templateConfig.sections[1]}

### Architectural Considerations
- **Integration**: How ${feature} integrates with existing systems
- **Dependencies**: Required components and services
- **Scalability**: Growth and load considerations
- **Maintainability**: Long-term support requirements

### Design Principles
- Follow SOLID principles
- Maintain separation of concerns
- Implement proper error handling
- Use dependency injection where appropriate

## ${templateConfig.sections[2]}

### Development Standards
- **Code Style**: Follow established coding conventions
- **Documentation**: Include comprehensive inline and API documentation
- **Testing**: Implement unit, integration, and end-to-end tests
- **Review Process**: All code must pass review before merge

### Quality Gates
- [ ] Code review completed
- [ ] Unit tests passing (>95% coverage)
- [ ] Integration tests passing
- [ ] Performance benchmarks met
- [ ] Security scan passed
- [ ] Documentation updated

## ${templateConfig.sections[3]}

### Test Strategy
- **Unit Testing**: Test individual components and functions
- **Integration Testing**: Test component interactions
- **End-to-End Testing**: Test complete user workflows
- **Performance Testing**: Validate performance requirements

### Validation Criteria
- All tests must pass in CI/CD pipeline
- Code coverage must meet minimum thresholds
- Performance must meet established benchmarks
- Security scans must show no critical issues

## Decision Log

### Key Decisions
| Date | Decision | Rationale | Impact |
|------|----------|-----------|---------|
| ${timestamp} | Initial steering created | Establish guidance framework | Project direction |

### Pending Decisions
- [ ] Final implementation approach
- [ ] Deployment strategy
- [ ] Monitoring and alerting setup

## Resources and References

### Documentation
- [Architecture Principles](../architecture-principles.md)
- [Development Standards](../development-standards.md)
- [Workflow Standards](../workflow-standards.md)

### Tools and Frameworks
- Development environment setup
- Testing frameworks and tools
- CI/CD pipeline configuration
- Monitoring and logging tools

## Next Steps

1. **Review this steering document** with the development team
2. **Refine requirements** based on team feedback
3. **Create detailed specifications** for the ${feature}
4. **Begin implementation** following this guidance

## Approval and Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | |
| Tech Lead | | | |
| Architecture Review | | | |

---

*This steering document was generated using the Maestro Steering Framework. It should be reviewed and customized to fit specific project needs.*

*Domain: ${domain} | Template: ${template} | Generated: ${timestamp}*
`;
}