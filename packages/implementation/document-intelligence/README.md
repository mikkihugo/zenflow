# @claude-zen/document-intelligence

Unified document intelligence service providing semantic analysis, strategic vision coordination, and intelligent document processing.

## 🧠 **Core Capabilities**

### **Document Intelligence**
- **Semantic Content Classification**: DeepCode-style algorithm/concept/technical pattern recognition
- **Pattern Recognition**: Multi-pattern content analysis with confidence scoring
- **Content Density Analysis**: Algorithm density, concept complexity measurement
- **Intelligent Segmentation**: Context-aware document segmentation strategies

### **Strategic Vision & Coordination** 
- **Strategic Vision Service**: Database-driven strategic analysis and goal extraction
- **Document Task Coordinator**: Vision + documents + tasks integration 
- **Vision Coordination**: Multi-system orchestration and dashboard generation
- **Swarm Integration**: Task generation from document analysis

### **Enhanced Document Processing**
- **Document Workflow System**: Vision → ADRs → PRDs → Epics → Features → Tasks → Code
- **Enhanced Scanner**: Pattern recognition with swarm task generation
- **File Operations**: Intelligent document processing and workflow execution
- **Multi-Database Integration**: SQLite, LanceDB, Kuzu graph support

## 🚀 **Quick Start**

```typescript
import { getDocumentIntelligenceService } from '@claude-zen/document-intelligence';

// Get the unified service
const service = await getDocumentIntelligenceService();

// Semantic analysis
const analysis = await service.analyzeSemantics({
  content: documentContent,
  enablePatternRecognition: true,
  enableDensityAnalysis: true
});

// Strategic vision coordination  
const vision = await service.coordinateVision({
  projectId: 'my-project',
  includeTaskGeneration: true
});

// Intelligent document processing
const result = await service.processDocument({
  path: './docs/vision.md',
  enableWorkflow: true,
  generateTasks: true
});
```

## 📦 **Architecture**

```
@claude-zen/document-intelligence/
├── core/                    # Document processing infrastructure
├── services/                # Strategic services and coordination  
├── intelligence/            # DeepCode-style semantic analysis
├── scanning/               # Enhanced document and code scanning
├── utils/                  # Query-aware retrieval and utilities
└── types/                  # Unified type system
```

## 🎯 **Strategic Integration**

Access through strategic facade:

```typescript
import { getDocumentIntelligence } from '@claude-zen/enterprise';

const service = await getDocumentIntelligence();
// Full document intelligence capabilities available
```

## 🧠 **DeepCode Integration**

Includes vision-like document parsing capabilities inspired by DeepCode:

- **Weighted Semantic Indicators**: Multi-level content importance scoring
- **Document Type Detection**: Research paper vs technical spec classification
- **Algorithm Block Preservation**: Keep related algorithm content together
- **Query-Aware Retrieval**: Attention mechanisms for context-specific analysis

## 🔧 **Configuration**

```typescript
const service = await getDocumentIntelligenceService({
  enableSemanticAnalysis: true,
  enableStrategicVision: true, 
  enableWorkflowProcessing: true,
  enableSwarmIntegration: true,
  confidenceThreshold: 0.8
});
```