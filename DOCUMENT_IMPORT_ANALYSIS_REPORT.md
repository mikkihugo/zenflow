# Document Import from Repositories - Analysis Report

**Date**: 2025-08-12  
**Status**: 📄 **LOCAL DOCUMENT SCANNING OPERATIONAL** - Repository Import Needs Implementation  
**Project**: claude-code-zen v1.0.0-alpha.43

## Current Document Processing Capabilities

The claude-code-zen project has a robust **local document processing system** but lacks direct **repository import functionality**. Here's the current state and how to extend it:

### 🔍 **Current Document Processing Architecture**

#### 1. **DocumentProcessor** (`src/core/document-processor.ts`)
- **Purpose**: Unified document processing system for local workspaces
- **Document Types Supported**: vision, ADRs, PRDs, epics, features, tasks, specs
- **Current Scan Method**: Local directory scanning only

**Key Features:**
```typescript
// Document Types Supported
type DocumentType = 'vision' | 'adr' | 'prd' | 'epic' | 'feature' | 'task' | 'spec';

// Current scanning method
async scanDocuments(workspaceId: string) {
  // Scans local directories like:
  // - 01-vision/
  // - 02-adrs/ 
  // - 03-prds/
  // - 04-epics/
  // - 05-features/
  // - 06-tasks/
  // - 07-specs/
  
  // Only processes .md files in these directories
}
```

#### 2. **GitHub Code Analyzer** (`src/fact-integration/github-code-analyzer.ts`)
- **Purpose**: Analyzes GitHub repositories for code patterns
- **Current Focus**: Code snippets and patterns, NOT documentation
- **Integration**: FACT system knowledge base

### 📋 **Current Workflow for Document Processing**

```bash
# Step 1: Load local workspace
const workspaceId = await documentProcessor.loadWorkspace('./my-project');

# Step 2: Auto-scan existing documents
# - Scans predefined directory structure
# - Processes all .md files found
# - Extracts metadata and content
# - Stores in memory system

# Step 3: Enable real-time watching (optional)
# - Monitors file changes
# - Auto-processes new/modified documents
```

## 🚫 **Missing: Repository Import Functionality**

### **What's NOT Currently Available:**
1. **Git Repository Cloning** - No automatic repo cloning
2. **Remote Document Scanning** - Can't scan GitHub/GitLab repos directly  
3. **Batch Repository Import** - No bulk import from multiple repos
4. **Documentation Detection** - No smart detection of docs in various repo structures
5. **Repository Metadata Integration** - No integration of repo info with documents

### **Current Limitations:**
- Must manually clone repositories locally first
- No automatic discovery of documentation in repos
- No handling of different documentation structures (README.md, docs/, wiki/, etc.)
- No repository metadata (stars, contributors, last updated) integration

## 🚀 **How to Import Documents from Repositories Today**

### **Method 1: Manual Clone + Process (Current Approach)**

```bash
# Step 1: Clone repository manually
git clone https://github.com/owner/repo.git ./temp-repo

# Step 2: Restructure documents to expected format
mkdir -p docs/{01-vision,02-adrs,03-prds,04-epics,05-features,06-tasks,07-specs}

# Step 3: Copy/move documentation files
cp ./temp-repo/README.md docs/01-vision/
cp ./temp-repo/docs/*.md docs/02-adrs/
# ... manual file organization

# Step 4: Process with DocumentProcessor
await documentProcessor.loadWorkspace('./docs');
```

### **Method 2: Using Domain Discovery Bridge (Recommended)**

```typescript
import { DomainDiscoveryBridge } from './src/coordination/discovery/domain-discovery-bridge.ts';

// The bridge can work with any document structure
const bridge = new DomainDiscoveryBridge(
  documentProcessor,
  domainAnalyzer, 
  projectAnalyzer,
  intelligenceCoordinator
);

// Process a cloned repository
await bridge.initialize();
const domains = await bridge.discoverDomains();
// Bridge will find and classify documents regardless of structure
```

## 🔧 **Implementing Repository Import (Recommended Extensions)**

### **Extension 1: Repository Import Service**

```typescript
// Proposed: src/services/repository-import-service.ts
class RepositoryImportService {
  async importFromGitHub(repoUrl: string, options?: ImportOptions) {
    // 1. Clone repository to temp location
    // 2. Scan for documentation files (.md, .rst, .txt)
    // 3. Detect documentation structure (README, docs/, wiki/)
    // 4. Classify documents by type using ML/patterns
    // 5. Import into document processor with proper categorization
  }

  async importBulk(repoList: string[]) {
    // Bulk import from multiple repositories
  }

  async detectDocumentStructure(repoPath: string) {
    // Smart detection of documentation patterns
  }
}
```

### **Extension 2: Enhanced DocumentProcessor**

```typescript
// Enhanced loadWorkspace method
async loadWorkspace(workspacePath: string, options?: {
  source?: 'local' | 'git' | 'github' | 'gitlab';
  repoUrl?: string;
  autoDetectStructure?: boolean;
  importDocuments?: boolean; // from config
}) {
  if (options?.source === 'git' && options.repoUrl) {
    return this.loadFromRepository(options.repoUrl, options);
  }
  // ... existing local logic
}

private async loadFromRepository(repoUrl: string, options: any) {
  // 1. Clone repository
  // 2. Detect documentation structure
  // 3. Process documents with flexible classification
  // 4. Import into workspace
}
```

### **Extension 3: Smart Document Classification**

```typescript
// Enhanced getDocumentType method
private getDocumentType(path: string, content?: string): DocumentType {
  // Current: Only checks directory structure
  // Enhanced: Also analyzes content, filename patterns, metadata
  
  const filename = basename(path).toLowerCase();
  
  // Smart classification based on multiple factors
  if (filename.includes('vision') || content?.includes('# Vision')) return 'vision';
  if (filename.includes('adr-') || filename.includes('decision')) return 'adr';
  if (filename.includes('prd') || content?.includes('Product Requirements')) return 'prd';
  // ... more intelligent classification
  
  return this.classifyByContent(content); // ML-based classification
}
```

## 🎯 **Recommended Implementation Plan**

### **Phase 1: Basic Repository Import (2-3 days)**
1. Create `RepositoryImportService` class
2. Add git cloning functionality (using `simple-git` package)
3. Extend `DocumentProcessor.loadWorkspace()` to accept repository URLs
4. Basic document detection and classification

### **Phase 2: Smart Document Detection (3-5 days)**  
1. Implement content-based document classification
2. Add support for various documentation structures
3. Integrate repository metadata (stars, contributors, etc.)
4. Add bulk import capabilities

### **Phase 3: Advanced Integration (5-7 days)**
1. TUI interface for repository import
2. Progress tracking and error handling
3. Caching and incremental updates
4. Integration with Domain Discovery Bridge

## 🚀 **Quick Implementation Example**

Here's a minimal implementation you could add today:

```typescript
// src/services/simple-repo-importer.ts
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

export class SimpleRepoImporter {
  async importRepository(repoUrl: string, targetDir: string): Promise<string[]> {
    const tempDir = `/tmp/repo-import-${Date.now()}`;
    
    try {
      // Clone repository
      execSync(`git clone ${repoUrl} ${tempDir}`, { stdio: 'inherit' });
      
      // Find all markdown files
      const mdFiles = await this.findMarkdownFiles(tempDir);
      
      // Create workspace structure
      await this.createWorkspaceStructure(targetDir);
      
      // Copy and classify documents
      const importedFiles = await this.classifyAndCopyDocuments(mdFiles, targetDir);
      
      // Clean up
      execSync(`rm -rf ${tempDir}`);
      
      return importedFiles;
    } catch (error) {
      console.error('Repository import failed:', error);
      throw error;
    }
  }

  private async findMarkdownFiles(repoPath: string): Promise<string[]> {
    // Recursively find all .md files
    const result: string[] = [];
    
    const scan = async (dir: string) => {
      const files = await readdir(dir, { withFileTypes: true });
      
      for (const file of files) {
        const fullPath = join(dir, file.name);
        
        if (file.isDirectory() && !file.name.startsWith('.')) {
          await scan(fullPath);
        } else if (file.name.endsWith('.md')) {
          result.push(fullPath);
        }
      }
    };
    
    await scan(repoPath);
    return result;
  }

  private async classifyAndCopyDocuments(files: string[], targetDir: string): Promise<string[]> {
    const imported: string[] = [];
    
    for (const file of files) {
      const content = await readFile(file, 'utf8');
      const docType = this.classifyDocument(file, content);
      const targetSubdir = this.getTargetDirectory(docType);
      
      // Copy to appropriate directory
      const filename = basename(file);
      const targetPath = join(targetDir, targetSubdir, filename);
      
      await copyFile(file, targetPath);
      imported.push(targetPath);
    }
    
    return imported;
  }
}

// Usage:
const importer = new SimpleRepoImporter();
const imported = await importer.importRepository(
  'https://github.com/owner/repo.git',
  './docs'
);

// Then process with existing system:
const workspaceId = await documentProcessor.loadWorkspace('./docs');
```

## 🎉 **Summary**

### **Current State:**
- ✅ **Excellent local document processing** - Full-featured system for local docs
- ✅ **Smart document classification** - Handles vision, ADRs, PRDs, epics, features, tasks
- ✅ **Real-time monitoring** - File watching and auto-processing
- ✅ **Domain discovery integration** - Maps documents to code domains
- ❌ **No direct repository import** - Must manually clone and organize

### **To Import Documents from Repos:**

**Option A (Manual - Works Today):**
1. Clone repository locally
2. Organize docs into expected directory structure
3. Use existing `documentProcessor.loadWorkspace()`

**Option B (Recommended Enhancement):**
1. Implement `RepositoryImportService` 
2. Add git cloning and smart document detection
3. Extend `DocumentProcessor` with repository support
4. Integrate with existing domain discovery system

### **Implementation Effort:**
- **Basic functionality**: 2-3 days
- **Production-ready**: 1-2 weeks
- **Full TUI integration**: 2-3 weeks

The document processing system is **excellent** and **ready to be extended** with repository import capabilities. The architecture is well-designed to handle this enhancement without major changes.

---

*Analysis completed by Claude Code on 2025-08-12*