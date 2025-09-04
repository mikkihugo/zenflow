# @claude-zen/compliance

Comprehensive EU AI Act and regulatory compliance framework for Claude Zen AI platform.

## Overview

This package provides enterprise-grade compliance capabilities specifically designed for AI systems, with primary focus on EU AI Act compliance while maintaining extensibility for other regulatory frameworks.

## Features

### 🏛️ EU AI Act Compliance
- **Risk Assessment & Classification**: Automatic classification into risk categories (Unacceptable, High, Limited, Minimal)
- **High-Risk System Management**: Comprehensive support for high-risk AI systems per Annex III
- **Documentation Requirements**: Automated technical documentation and record keeping
- **Human Oversight**: Implementation of human-in-the-loop, human-on-the-loop, and human-in-command patterns

### 📊 Audit Trail Management
- **Comprehensive Logging**: Every AI decision, human intervention, and system change tracked
- **Regulatory Export**: Export audit trails in formats suitable for regulatory authorities
- **Event Correlation**: Link related events across the AI system lifecycle
- **Long-term Retention**: Configurable retention policies (default: 7 years)

### 👥 Human Oversight
- **Automated Triggers**: Intelligent detection of when human oversight is required
- **Priority Management**: Risk-based prioritization of oversight requests
- **Review Workflows**: Structured review processes with accountability
- **Performance Metrics**: Track oversight effectiveness and response times

### 🎯 Bias Detection & Monitoring
- **Continuous Monitoring**: Real-time bias detection in AI decisions
- **Protected Attributes**: Monitor for discrimination against protected groups
- **Corrective Actions**: Automated alerts and recommended mitigation measures
- **Compliance Reporting**: Generate bias monitoring reports for regulators

## Installation

```bash
pnpm install @claude-zen/compliance
```

## Quick Start

### Basic Setup

```typescript
import { 
  ComplianceFramework, 
  createProductionComplianceConfig 
} from '@claude-zen/compliance';

// Initialize with production configuration
const compliance = new ComplianceFramework(createProductionComplianceConfig());

// Register your AI system
const registration = await compliance.registerSystem('my-ai-system', {
  primary: 'Multi-agent task coordination and resource allocation',
  secondary: ['Automated workflow management', 'Load balancing'],
  useCases: [
    'Enterprise task automation',
    'Resource optimization',
    'Agent orchestration'
  ],
  targetUsers: ['Enterprise users', 'System administrators'],
  context: 'Enterprise AI coordination platform'
});

console.log(`System registered with risk category: ${registration.riskCategory}`);
```

### Monitoring AI Decisions

```typescript
// Monitor every AI decision for compliance
const result = await compliance.monitorDecision('my-ai-system', {
  id: 'decision-12345',
  type: 'task_allocation',
  details: {
    assignedAgent: 'worker-001',
    priority: 'high',
    estimatedDuration: '2 hours'
  },
  confidence: 0.85,
  reasoning: 'Agent has best capability match and current availability',
  inputData: {
    taskRequirements: ['nlp', 'data_analysis'],
    availableAgents: ['worker-001', 'worker-002']
  }
});

if (result.complianceChecks.humanOversightRequired) {
  console.log('Human oversight requested:', result.oversightRequestId);
}
```

### Human Oversight Management

```typescript
import { HumanOversightManager } from '@claude-zen/compliance';

// Get pending oversight requests
const pendingRequests = await oversight.getPendingRequests('reviewer-123');

// Provide human oversight decision
await oversight.provideOversight(
  'oversight-request-456',
  {
    id: 'reviewer-123',
    name: 'Dr. Jane Smith',
    role: 'AI Ethics Reviewer',
    qualifications: ['PhD Computer Science', 'AI Ethics Certification']
  },
  'approve', // or 'reject', 'modify', etc.
  'Decision logic appears sound and unbiased'
);
```

### Compliance Reporting

```typescript
// Generate comprehensive compliance report
const report = await compliance.generateComplianceReport('my-ai-system');

console.log(`Compliance Score: ${report.overallStatus.overallScore}/100`);
console.log('Recommendations:', report.recommendations);

// Export for regulatory authorities
const auditData = await compliance.exportComplianceData('my-ai-system', 'json');
```

## Configuration

### Production Configuration

```typescript
const config = {
  euAiActEnabled: true,
  gdprEnabled: true,
  auditRetentionDays: 2555, // 7 years
  humanOversightConfig: {
    enabled: true,
    requiredForHighRisk: true,
    maxReviewTimeHours: 24
  },
  biasMonitoringConfig: {
    enabled: true,
    monitoringFrequency: 'continuous',
    biasThreshold: 0.1
  },
  reportingConfig: {
    enabled: true,
    scheduledReports: true,
    reportFrequency: 'monthly'
  }
};
```

### Development Configuration

```typescript
import { createDevelopmentComplianceConfig } from '@claude-zen/compliance';

const compliance = new ComplianceFramework(createDevelopmentComplianceConfig());
```

## EU AI Act Risk Categories

The framework automatically classifies AI systems according to EU AI Act risk categories:

### Unacceptable Risk (Prohibited)
- Subliminal manipulation techniques
- Social scoring systems
- Real-time remote biometric identification
- Emotion recognition in workplace/education

### High Risk
- Multi-agent coordination systems (typically classified as high-risk)
- Employment and HR systems
- Critical infrastructure management
- Educational assessment systems
- Essential service access systems

### Limited Risk
- Systems requiring transparency obligations
- Chatbots and virtual assistants
- Emotion recognition systems (limited contexts)

### Minimal Risk
- Most other AI systems
- Voluntary compliance encouraged

## API Reference

### ComplianceFramework

Main class for compliance management.

#### Methods

- `registerSystem(systemId, purpose, userId?)` - Register AI system for compliance
- `monitorDecision(systemId, decision, userId?)` - Monitor AI decision for compliance
- `getOverallComplianceStatus()` - Get overall compliance status
- `getSystemComplianceStatus(systemId)` - Get system-specific compliance status
- `generateComplianceReport(systemId?, dateRange?)` - Generate compliance report
- `exportComplianceData(systemId, format?)` - Export compliance data

### EUAIActComplianceEngine

Specialized engine for EU AI Act compliance.

#### Methods

- `registerAISystem(systemId, purpose)` - Register system with EU AI Act engine
- `performRiskAssessment(systemId, purpose)` - Perform risk assessment
- `getComplianceStatus(systemId)` - Get EU AI Act compliance status
- `generateComplianceReport(systemId)` - Generate EU AI Act specific report

### AuditTrailManager

Manages comprehensive audit trails.

#### Methods

- `recordEvent(type, systemId, userId, description, details, context)` - Record audit event
- `recordDecision(systemId, userId, type, details, oversight, riskCategory)` - Record AI decision
- `recordHumanOversight(systemId, userId, type, original, human, rationale)` - Record human oversight
- `queryEvents(query)` - Query audit events
- `exportAuditTrail(systemId, format?)` - Export audit trail

### HumanOversightManager

Manages human oversight requirements.

#### Methods

- `requestOversight(aiDecision, trigger, context)` - Request human oversight
- `provideOversight(requestId, reviewer, decision, rationale)` - Provide oversight decision
- `getPendingRequests(reviewer?, priority?)` - Get pending oversight requests
- `getOversightMetrics(systemId, dateRange?)` - Get oversight metrics

## Integration Examples

### With Multi-Agent Systems

```typescript
// In your agent coordination code
import { ComplianceFramework } from '@claude-zen/compliance';

class AgentCoordinator {
  constructor(private compliance: ComplianceFramework) {}

  async allocateTask(task: Task): Promise<AgentAllocation> {
    // Make AI decision
    const allocation = this.decideAllocation(task);
    
    // Monitor for compliance
    const complianceResult = await this.compliance.monitorDecision(
      'agent-coordinator',
      {
        id: `allocation-${task.id}`,
        type: 'task_allocation',
        details: allocation,
        confidence: allocation.confidence,
        reasoning: allocation.reasoning,
        inputData: { task, availableAgents: this.getAvailableAgents() }
      }
    );

    // Handle human oversight if required
    if (complianceResult.complianceChecks.humanOversightRequired) {
      return this.waitForHumanOversight(complianceResult.oversightRequestId!);
    }

    return allocation;
  }
}
```

### With Neural Networks

```typescript
// In your neural network inference code
import { ComplianceFramework } from '@claude-zen/compliance';

class NeuralNetworkService {
  constructor(private compliance: ComplianceFramework) {}

  async predict(input: any): Promise<Prediction> {
    const prediction = await this.model.predict(input);
    
    // Monitor prediction for compliance
    await this.compliance.monitorDecision('neural-predictor', {
      id: `prediction-${Date.now()}`,
      type: 'neural_prediction',
      details: prediction,
      confidence: prediction.confidence,
      reasoning: 'Neural network inference',
      inputData: input
    });

    return prediction;
  }
}
```

## Compliance Best Practices

### 1. Early Registration
Register all AI systems during development, not just at deployment.

### 2. Comprehensive Monitoring
Monitor all AI decisions, not just high-risk ones, to build complete audit trails.

### 3. Regular Reviews
Conduct regular compliance reviews and update risk assessments as systems evolve.

### 4. Human Oversight Training
Ensure human reviewers are properly trained on AI systems and regulatory requirements.

### 5. Bias Monitoring
Implement continuous bias monitoring, especially for systems affecting people.

### 6. Documentation
Maintain comprehensive technical documentation for all AI systems.

## Regulatory Alignment

This framework is designed to meet:

- **EU AI Act (Regulation EU 2024/1689)**: Primary compliance target
- **GDPR**: Data protection requirements for AI systems
- **NIST AI Risk Management Framework**: Risk assessment methodology
- **ISO/IEC 23053:2022**: Framework for AI risk management
- **IEEE Standards**: Various AI ethics and governance standards

## Contributing

This compliance framework is actively maintained and updated to reflect evolving regulatory requirements. Contributions are welcome, especially for:

- Additional regulatory frameworks
- Enhanced bias detection algorithms
- Improved risk assessment methodologies
- Better integration patterns

## License

MIT License - see LICENSE file for details.

## Support

For compliance-related questions or regulatory guidance, please consult with your legal team and regulatory experts. This framework provides technical implementation but does not constitute legal advice.