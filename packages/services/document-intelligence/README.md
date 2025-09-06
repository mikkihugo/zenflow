# @claude-zen/document-intelligence

**External Document Import Service** - Imports and processes external stakeholder documents into existing SAFe projects. This service is designed specifically for importing external documents (vision statements, requirements, stakeholder content) rather than creating primary artifacts from scratch.

## 🧠 **Core Import Capabilities**

### **External Document Intelligence**

- **Stakeholder Content Classification**: Import and classify external vision documents, requirements, and business content
- **External Pattern Recognition**: Analyze imported documents for SAFe-compatible patterns and structures
- **Content Transformation Analysis**: Transform external document formats into project-compatible structures
- **Import-Aware Segmentation**: Context-aware segmentation for integrating external content

### **External Document Coordination**

- **External Vision Import Service**: Import external vision documents into existing SAFe project structures
- **Stakeholder Document Coordinator**: Integrate external stakeholder documents with existing project tasks
- **External Content Integration**: Multi-system coordination for importing external documents
- **Import Task Generation**: Generate integration tasks from external document analysis

### **External Document Import Processing**

- **External Document Import Workflows**: External Vision → Import to PRDs → Integration with Epics → Existing Project Integration
- **External Content Scanner**: Pattern recognition specialized for importing external documents
- **Import File Operations**: Specialized processing for external document import and integration
- **Multi-Database Integration**: Store imported external content in SQLite, LanceDB, Kuzu graph databases

## 🚀 **External Document Import Quick Start**

```typescript
import { getDocumentIntelligenceService } from '@claude-zen/document-intelligence';

// Get the external document import service
const service = await getDocumentIntelligenceService();

// Import external stakeholder document for analysis
const importAnalysis = await service.analyzeSemantics({
  content: externalStakeholderDocument,
  enablePatternRecognition: true,
  enableImportTransformation: true,
});

// Import external vision into existing project
const importResult = await service.coordinateVision({
  projectId: 'existing-project',
  externalVisionContent: stakeholderVision,
  importMode: true,
  includeIntegrationTasks: true,
});

// Process external document for import into existing workflows
const importProcessing = await service.processDocument({
  path: './external-docs/stakeholder-vision.md',
  importMode: true,
  targetProjectId: 'existing-project',
  enableImportWorkflows: true,
  generateIntegrationTasks: true,
});
```

## 📦 **External Document Import Architecture**

```
@claude-zen/document-intelligence/
├── core/                    # External document import processing infrastructure
├── services/                # External document import services and coordination
├── intelligence/            # External document analysis and transformation
├── scanning/               # External document scanning and pattern recognition
├── utils/                  # Import-aware retrieval and transformation utilities
└── types/                  # External document import type system
```

## 🎯 **External Document Import Integration**

Access external document import capabilities through strategic facade:

```typescript
import { getDocumentIntelligence } from '@claude-zen/enterprise';

const importService = await getDocumentIntelligence();
// External document import capabilities for existing SAFe projects
// NOT for primary artifact creation - only for importing stakeholder content
```

## 🧠 **External Document Import Intelligence**

Includes specialized parsing capabilities for importing external stakeholder documents:

- **External Content Semantic Indicators**: Multi-level importance scoring for imported stakeholder content
- **External Document Type Detection**: Business vision vs technical requirements classification for import
- **Stakeholder Content Block Preservation**: Keep related external content together during import
- **Import-Aware Retrieval**: Attention mechanisms for integrating external content into existing projects

## 🔧 **External Document Import Configuration**

```typescript
const importService = await getDocumentIntelligenceService({
  enableExternalDocumentAnalysis: true,
  enableStakeholderVisionImport: true,
  enableImportWorkflowProcessing: true,
  enableIntegrationTaskGeneration: true,
  importConfidenceThreshold: 0.8,
  targetProjectMode: true, // Always import into existing projects
});
```
