# Import Utilities for Claude Code Zen

This directory contains CLI utilities for importing legacy project management files into the database-driven document system.

## 🔍 Intelligent Document Scanner

**✨ NEW: File-by-file presentation with LLM analysis**

### Usage

```bash
# Demo version (shows first 3 documents, no database required)
npm run demo-scanner

# Full version (imports to database)
npm run import-scanner
```

### What it does

1. **Scans** repository for all `.md` files automatically
2. **Analyzes** each document with LLM-style categorization  
3. **Presents** documents **file-by-file** for your approval
4. **Categorizes** as vision/roadmap/epic/prd/adr based on content
5. **Imports** approved documents into database with relationships

### File-by-File Interactive Approval

**Perfect for managing large repositories** - you see each document individually:

```
📄 DOCUMENT: ARCHITECTURE.md
🏷️ Category: vision (confidence: 90%)
📊 Relevance: high
💭 Summary: System architecture and strategic overview...
🎯 Business Objectives: Strategic-level workflow management...
💡 Recommendations: High-confidence categorization
📖 Content Preview: (first 300 chars)

Action [i]mport / [s]kip / [m]odify category / [q]uit:
```

**Interactive Options:**
- **[i]mport** - Import as analyzed category
- **[s]kip** - Skip this document  
- **[m]odify** - Change category before import
- **[q]uit** - Exit the scanner

### Features

- ✅ **Intelligent Analysis** - LLM-style content categorization
- ✅ **File-by-File Approval** - Never overwhelming, always in control
- ✅ **Smart Filtering** - Skips small/irrelevant files automatically
- ✅ **Confidence Scoring** - Shows categorization confidence levels
- ✅ **Content Extraction** - Identifies business objectives, features, requirements
- ✅ **Database Integration** - Uses existing HybridDocumentManager
- ✅ **Semantic Relationships** - Auto-generates document relationships
- ✅ **Repository-Wide** - Scans entire codebase automatically

### Demo Mode

Use `npm run demo-scanner` to see the workflow without database setup:

- Shows first 3 highest-confidence documents
- Demonstrates interactive approval flow
- No actual imports (demo only)
- Perfect for understanding the workflow

### Example Workflow

```
🔍 Starting intelligent document scanner...
📂 Scanning /project for markdown files...
📄 Found 255 markdown files
🧠 Analyzing documents with LLM categorization...
📋 Found 238 potentially relevant documents
👥 Starting interactive approval process...

🎯 Found 238 documents. Starting with highest confidence.

📑 Document 1/238
📄 DOCUMENT: ARCHITECTURE.md
[Interactive approval for each document...]

✅ Import process completed!
   📄 Documents imported: 15
   ⏭️ Documents skipped: 8  
   🎯 Total reviewed: 23
```

### Smart Categorization

**Vision Documents**: Strategic plans, business objectives, platform overviews
**Epic Documents**: Large features, user stories, implementation plans  
**PRD Documents**: Product requirements, specifications, acceptance criteria
**Roadmap Documents**: Timelines, milestones, planning documents
**ADR Documents**: Architecture decisions, technical choices

### Repository Scanning

**Automatically scans:**
- All `.md` files in the repository
- Excludes: `node_modules`, `.git`, `dist`, `build`, etc.
- Filters: Skips small files (<100 chars) and low-relevance content
- Prioritizes: High-confidence, high-relevance documents first

### Database Import

**Creates proper entities:**
- `VisionDocumentEntity` for vision documents
- `EpicDocumentEntity` for epic documents  
- `PRDDocumentEntity` for PRD documents
- Full metadata tracking and import history
- Semantic embeddings for vector search
- Graph relationships for document connections

## Adding New Document Types

1. Update `analyzeDocument()` function in `import-scanner.ts`
2. Add new category to the analysis keywords
3. Create import handler in `importDocument()` function
4. Update entity type mappings
5. Test with `demo-scanner` first