# Vision → Epic → Feature → Story: SAFe LPM Flow

## Overview

This document describes the enterprise SAFe Lean Portfolio Management (LPM) flow from strategic vision to actionable development tasks. claude-code-zen provides full SAFe LPM capabilities, leveraging neural intelligence and comprehensive SAFe database services for strategic portfolio coordination.

## Flow Hierarchy

```
🎯 Business Vision
    ↓
📋 Epic (Program Level)
    ↓
🎨 Feature (Program Level)  
    ↓
📝 User Story (Team Level)
    ↓
✅ Development Task (SPARC Integration)
```

## Step-by-Step Kanban Flow

### 1. Business Vision → Epic Creation

**Input**: Business vision documents, strategic objectives
**Process**: Transform vision into measurable epics
**Output**: Epic with business hypothesis and success metrics

**SAFe LPM Approach**:
- Use SAFe Epic template: "Epic: {{initiative_name}} - {{business_hypothesis}} measured by {{success_metrics}}"
- Validate required fields: initiative_name, business_hypothesis, success_metrics
- Apply SAFe guidelines for portfolio-level work
- Track business value and dependencies
- Link to comprehensive SAFe database services
- Leverage neural intelligence for strategic alignment

### 2. Epic → Feature Breakdown

**Input**: Validated epic with clear business value
**Process**: Decompose epic into deliverable features
**Output**: Multiple features that together deliver the epic

**SAFe LPM Approach**:
- Use SAFe Feature template: "Feature: {{feature_name}} enables {{user_benefit}} delivering {{business_value}}"
- Link features to parent epic via `epicId` using SAFe database services
- Validate feature-level acceptance criteria with neural intelligence
- Track program-level dependencies and architectural runway
- Apply portfolio-level governance and compliance requirements
- Ensure features fit within Program Increment scope

### 3. Feature → User Story Creation

**Input**: Well-defined feature with clear user benefit  
**Process**: Create actionable user stories
**Output**: 5-12 user stories per feature (optimal size)

**Simple Approach (Default)**:
- Write user stories in natural language
- Add acceptance criteria and story points
- Assign to team members

**Enhanced Approach (Templates + SAFe)**:
- Use SAFe User Story template: "As a {{persona}}, I want {{capability}} so that {{business_value}}"
- Apply story validation (persona, acceptance criteria, definition of done)
- Link stories to parent feature via `featureId`
- Include enabler stories for technical requirements

### 4. User Story → Development Task (SPARC Integration)

**Input**: Ready user story with clear acceptance criteria
**Process**: SPARC methodology automatically triggered
**Output**: Structured development workflow with Git integration

**Automatic SPARC Flow**:
1. **Story Status Change**: Move story to "in_progress"
2. **SPARC Initialization**: System creates development task with 5 phases
3. **Git Branch Creation**: Feature branch created automatically
4. **Phase Progression**: Specification → Pseudocode → Architecture → Refinement → Completion
5. **Git Commits**: Each SPARC phase auto-commits to feature branch
6. **Completion**: Story moves to "review" when SPARC workflow completes

## Kanban Board Configuration

### Column Mapping

| Kanban Column | Story Status | SPARC Integration |
|---------------|--------------|-------------------|
| **Backlog** | `backlog` | No SPARC workflow |
| **Ready** | `ready` | SPARC paused/not started |
| **In Progress** | `in_progress` | SPARC workflow active |
| **Review** | `review` | SPARC completed, awaiting review |
| **Done** | `done` | SPARC finalized, story complete |

### Story Types

**User Story**: Direct user-facing functionality
- Template: "As a {{persona}}, I want {{capability}} so that {{business_value}}"
- Focus: User value and experience
- SPARC: Full development workflow

**Enabler Story**: Technical foundation and infrastructure  
- Template: "Enable {{capability}} by implementing {{technical_solution}} to support {{business_objective}}"
- Focus: Technical enablement
- SPARC: Architecture-heavy workflow

## Configuration Options

### Basic Mode (Default)
```typescript
const config = {
  enableStoryTemplates: false,        // Simple story creation
  enableSAFeIntegration: true,        // SAFe LPM enabled  
  enableAdvancedFeatures: false,     // No advanced analytics
  mode: 'safe'
};
```

### Enhanced Mode (Templates Enabled)
```typescript
const config = {
  enableStoryTemplates: true,         // SAFe story templates
  availableTemplates: ['user_story', 'enabler_story', 'epic', 'feature'],
  requireAcceptanceCriteria: true,    // Enforce quality standards
  requireDefinitionOfDone: true,      // Complete story requirements
  enableEpicTracking: true,           // Epic → Feature → Story linking
  enableFeatureGrouping: true,        // Feature-based organization
  mode: 'agile'
};
```

### SAFe Mode (Full Enterprise)
```typescript
const config = {
  enableStoryTemplates: true,
  enableSAFeIntegration: true,        // Full SAFe compliance
  enableAdvancedFeatures: true,      // Flow metrics and analytics
  enableFlowMetrics: true,            // Cycle time, throughput
  enableBottleneckDetection: true,    // Performance optimization
  mode: 'safe'
};
```

## Usage Examples

### Creating an Epic (Simple)
```typescript
const epic = await projectService.createStory({
  title: "Mobile App User Experience",
  description: "Users can complete core tasks on mobile to increase engagement by 25%",
  storyType: 'user_story',
  priority: 'high',
  acceptanceCriteria: [
    "Mobile app supports core user workflows",
    "User engagement increases by 25%",
    "App maintains performance standards"
  ],
  createdBy: 'product-manager'
});
```

### Creating a User Story (Enhanced Templates)
```typescript
const story = await projectService.createStory({
  title: "User Password Reset",
  templateId: 'safe_user_story',
  storyType: 'user_story',
  persona: 'registered user',
  capability: 'reset password via email',
  business_value: 'regain access to account',
  acceptanceCriteria: [
    "User receives password reset email within 2 minutes",
    "Reset link expires after 24 hours", 
    "User can set new password successfully"
  ],
  definitionOfDone: "Feature coded, tested, reviewed, and deployed",
  visionLink: "user-account-security-initiative",
  featureId: 'user-authentication-feature',
  epicId: 'user-experience-epic',
  createdBy: 'developer'
});
```

### Moving Story Through Workflow
```typescript
// Move to development - triggers SPARC workflow
await projectService.moveStory(storyId, 'in_progress');

// SPARC workflow automatically:
// 1. Creates Git branch: feature/user-password-reset-{storyId}
// 2. Starts SPARC phases: specification → pseudocode → architecture → refinement → completion
// 3. Commits each phase to Git with structured messages
// 4. Moves story to 'review' when complete

// Manual completion
await projectService.moveStory(storyId, 'done', 'Story reviewed and deployed');
```

## Benefits

### Simple Mode Benefits
- **Quick Start**: No complex setup required
- **Flexibility**: Natural language stories
- **Low Overhead**: Minimal process constraints
- **Team Autonomy**: Teams define their own practices

### Enhanced Mode Benefits  
- **SAFe Compliance**: Industry-standard templates and validation
- **Quality Gates**: Required acceptance criteria and definition of done
- **Traceability**: Epic → Feature → Story linking
- **Consistency**: Standardized story formats across teams

### SPARC Integration Benefits
- **Systematic Development**: Proven 5-phase development methodology
- **Git Automation**: Automatic branch and commit management
- **Progress Tracking**: Clear phase progression visibility
- **Quality Assurance**: Built-in architectural and refinement phases

## Next Steps

1. **Enable Story Templates**: Toggle `enableStoryTemplates: true` for enhanced planning
2. **Add Epic Management**: Group related stories under epics for program-level tracking
3. **Add Feature Grouping**: Organize multiple stories within features for better coordination
4. **Add Vision Linking**: Connect stories back to business goals and strategic objectives
5. **Advanced Analytics**: Enable flow metrics for continuous improvement

This flow provides a clear path from vision to implementation while maintaining the flexibility to start simple and enhance as needed.