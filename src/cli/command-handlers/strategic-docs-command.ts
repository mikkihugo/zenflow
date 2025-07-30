/**
 * Strategic Documents Management Commands
 * CRUD operations for strategic documents (PRDs, Roadmaps, Architecture, etc.)
 */

import { strategicDocs } from '../database/strategic-documents-manager.js';
import { printError, printInfo, printSuccess } from '../utils.js';

/**
 * Strategic documents command handler
 */
export async function strategicDocsCommand(input = input[0];
const subArgs = input.slice(1);

if (flags.help || flags.h || !subcommand) {
  showStrategicDocsHelp();
  return;
}

// Initialize database
await strategicDocs.initialize();

switch(subcommand) {
    case 'create':
      await createDocument(subArgs, flags);
      break;
    case 'list':
      await listDocuments(subArgs, flags);
      break;
    case 'view':
      await viewDocument(subArgs, flags);
      break;
    case 'edit':
      await editDocument(subArgs, flags);
      break;
    case 'delete':
      await deleteDocument(subArgs, flags);
      break;
    case 'search':
      await searchDocuments(subArgs, flags);
      break;
    case 'import':
      await importDocument(subArgs, flags);
      break;
    case 'export':
      await exportDocument(subArgs, flags);
      break;
    case 'stats':
      await showDocumentStats(flags);
      break;default = await inquirer.prompt([
        {type = > input.trim().length > 0 || 'Title is required'
        },
        {type = answers.documentType;
      title = answers.title;
      content = answers.content;
    } else {
      // Command line mode
      documentType = flags.type || args[0];
      title = flags.title || args[1];
      content = flags.content || `# ${title}\n\n## Overview\n\nTODO = extractKeywords(title + ` ' + content);

    const _doc = await strategicDocs.createDocument({
      documentType,
      title,
      content,metadata = args[0] || flags.type;
    let status = flags.status;
    
    let documents;
    
    if(documentType) {
      documents = await strategicDocs.getDocumentsByType(documentType);
    } else {
      documents = await strategicDocs.searchDocuments({
        status,limit = === 0) {
      printInfo('📝 No documents found');
      return;
    }

    if(flags.json) {
      console.warn(JSON.stringify(documents, null, 2));
      return;
    }

    printInfo(`📚 Strategic Documents (${documents.length} found)`);
    console.warn('━'.repeat(80));

    documents.forEach(doc => {
      const typeIcon = getDocumentTypeIcon(doc.document_type_id);
      const statusBadge = getStatusBadge(doc.status);
      
      console.warn(`\n${typeIcon} ${doc.title}`);
      console.warn(`   📋ID = doc.content.substring(0, 100).replace(/\n/g, ' ') + '...';
        console.warn(`   📄Preview = args[0];
    
    if(!documentId) {
      printError('Document ID is required');
      printInfo('Usage = await strategicDocs.getDocument(documentId);
    
    if(!doc) {
      printError(`Document notfound = getDocumentTypeIcon(doc.document_type_id);
    const statusBadge = getStatusBadge(doc.status);
    
    console.warn(`${typeIcon} ${doc.title} ${statusBadge}`);
    console.warn('━'.repeat(Math.min(doc.title.length + 10, 80)));
    console.warn(`📋Type = args[0];
    
    if(!documentId) {
      printError('Document ID is required');
      printInfo('Usage = await strategicDocs.getDocument(documentId);
    
    if(!doc) {
      printError(`Document not found = {};

    if(flags.title) {
      updates.title = flags.title;
    }

    if(flags.content) {
      updates.content = flags.content;
    }

    if(flags.status) {
      updates.status = flags.status;
    }

    if(flags.interactive && !flags.title && !flags.content) {
      const answers = await inquirer.prompt([
        {
          type = {title = == 0) {
      printWarning('No updates provided');
      return;
    }

    // Update keywords if content changed
    if(updates.content || updates.title) {
      const newText = (updates.title || doc.title) + ' ' + (updates.content || doc.content);
      updates.relevance_keywords = extractKeywords(newText);
    }

    printSuccess(`📄 Updateddocument = args[0];
    
    if(!documentId) {
      printError('Document ID is required');
      printInfo('Usage = await strategicDocs.getDocument(documentId);
    
    if(!doc) {
      printError(`Document notfound = await inquirer.prompt([
        {type = await strategicDocs.deleteDocument(documentId);
    
    if(success) {
      printSuccess(`🗑️ Deleteddocument = args.join(' ') || flags.query || '';
    
    if (!query.trim()) {
      printError('Search query is required');
      printInfo('Usage = await strategicDocs.searchDocuments({
      query,documentType = === 0) {
      printInfo(`🔍 No documents found for query => {
      const typeIcon = getDocumentTypeIcon(doc.document_type_id);
      const statusBadge = getStatusBadge(doc.status);
      
      console.warn(`\n${typeIcon} ${doc.title} ${statusBadge}`);
      console.warn(`   📋ID = await strategicDocs.getDocumentStats();

    printInfo('📊 Strategic Documents Statistics');
    console.warn('━'.repeat(60));

    console.warn('\n📚 Documents by Type => {
      const icon = getDocumentTypeIcon(stat.document_type);
      const approvalRate = stat.count > 0 ? Math.round((stat.approved_count / stat.count) * 100) : 0;
      console.warn(`   ${icon} ${stat.document_type}: ${stat.count} total (${stat.approved_count} approved - ${approvalRate}%)`);
    });

    console.warn('\n🏛️ Queen Council Activity => {
      console.warn(`   👑 ${queen}: ${count} decisions`);
    });

  } catch(error) {
    printError(`Failed to getstatistics = args[0];
    
    if(!filePath) {
      printError('File path is required');
      printInfo('Usage = await import('fs/promises');
    const content = await readFile(filePath, 'utf8');
    
    // Extract title from first heading or filename
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : path.basename(filePath, path.extname(filePath));
    
    const documentType = flags.type;
    if(!documentType) {
      printError('Document type is required for import');
      printInfo('Use --typeflag = extractKeywords(title + ' ' + content);

    const doc = await strategicDocs.createDocument({
      documentType,
      title,
      content,metadata = args[0];
    
    if(!documentId) {
      printError('Document ID is required');
      printInfo('Usage = await strategicDocs.getDocument(documentId);
    
    if(!doc) {
      printError(`Document notfound = args[1] || `${doc.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.md`;
    
    const { writeFile } = await import('node:fs/promises');
    await writeFile(outputFile, doc.content);
    
    printSuccess(`📤 Exported document to = {
    'prd': '📋',
    'roadmap': '🗺️',
    'architecture': '🏗️',
    'adr': '📝',
    'strategy': '🎯',
    'research': '🔬',
    'specification': '📐'
  };
  return icons[type] || '📄';
}

function getStatusBadge(status = {
    'draft': '🟡 Draft',
    'review': '🟠 Review',
    'approved': '🟢 Approved',
    'archived': '⚫ Archived'
  };
  return badges[status] || '⚪ Unknown';
}

function extractKeywords(text = > word.length > 3)
    .filter((word, index, arr) => arr.indexOf(word) === index) // unique
    .slice(0, 20); // limit keywords
}

function showStrategicDocsHelp() {
  console.warn(`
📚 STRATEGIC DOCS - Database-Driven Document Management

USAGE:
  claude-zen strategic-docs <command> [options]

COMMANDS:
  create                     Create new strategic document
  list [type]                List documents (optionally by type)
  view <document-id>         View document details
  edit <document-id>         Edit existing document
  delete <document-id>       Delete document
  search <query>             Search documents by content
  import <file> --type <t>   Import document from file
  export <id> [file]         Export document to file
  stats                      Show document statistics

DOCUMENT TYPES:
  📋 prd                     Product Requirements Document
  🗺️ roadmap                Strategic roadmap
  🏗️ architecture           Architecture documentation
  📝 adr                     Architecture Decision Record
  🎯 strategy                Strategy document
  🔬 research                Research document
  📐 specification           Technical specification

CREATE OPTIONS:
  --type <type>              Document type (required)
  --title <title>            Document title
  --content <content>        Document content (Markdown)
  --author <author>          Document author
  --priority <priority>      Priority: low, medium, high
  --status <status>          Status: draft, review, approved, archived
  --interactive, -i          Interactive creation mode
  --edit                     Open for editing after creation

LIST/SEARCH OPTIONS:
  --type <type>              Filter by document type
  --status <status>          Filter by status
  --limit <n>                Limit results (default: 20)
  --verbose, -v              Show detailed information
  --json                     Output in JSON format

EDIT OPTIONS:
  --title <title>            New title
  --content <content>        New content
  --status <status>          New status
  --interactive, -i          Interactive editing mode
  --view                     View document after editing

DELETE OPTIONS:
  --force                    Skip confirmation prompt

EXAMPLES:
  claude-zen strategic-docs create prd "User Authentication System" --interactive
  claude-zen strategic-docs list roadmap --verbose
  claude-zen strategic-docs search "multi-tenant architecture" --type architecture
  claude-zen strategic-docs view doc-abc123
  claude-zen strategic-docs edit doc-abc123 --status approved
  claude-zen strategic-docs import roadmap.md --type roadmap
  claude-zen strategic-docs stats

INTEGRATION:
  • Used by Queen Council for strategic decision making
  • Full-text search with relevance scoring
  • Document relationships and references
  • Automatic keyword extraction
  • Version tracking and audit trail
`);
}
