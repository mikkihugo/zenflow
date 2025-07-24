/**
 * Strategic Documents Management Commands
 * CRUD operations for strategic documents (PRDs, Roadmaps, Architecture, etc.)
 */

import { strategicDocs } from '../database/strategic-documents-manager.js';
import { printSuccess, printError, printWarning, printInfo } from '../utils.js';
import inquirer from 'inquirer';

/**
 * Strategic documents command handler
 */
export async function strategicDocsCommand(input, flags) {
  const subcommand = input[0];
  const subArgs = input.slice(1);

  if (flags.help || flags.h || !subcommand) {
    showStrategicDocsHelp();
    return;
  }

  // Initialize database
  await strategicDocs.initialize();

  switch (subcommand) {
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
      break;
    default:
      printError(`Unknown strategic-docs command: ${subcommand}`);
      showStrategicDocsHelp();
  }
}

/**
 * Create a new strategic document
 */
async function createDocument(args, flags) {
  try {
    let documentType, title, content;

    if (flags.interactive || (!args[0] && !flags.type)) {
      // Interactive mode
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'documentType',
          message: 'Select document type:',
          choices: [
            { name: '📋 Product Requirements Document (PRD)', value: 'prd' },
            { name: '🗺️ Roadmap', value: 'roadmap' },
            { name: '🏗️ Architecture Documentation', value: 'architecture' },
            { name: '📝 Strategy Document', value: 'strategy' },
            { name: '🔬 Research Document', value: 'research' },
            { name: '📐 Technical Specification', value: 'specification' }
          ]
        },
        {
          type: 'input',
          name: 'title',
          message: 'Document title:',
          validate: input => input.trim().length > 0 || 'Title is required'
        },
        {
          type: 'editor',
          name: 'content',
          message: 'Document content (Markdown):',
          default: '# Title\n\n## Overview\n\n## Requirements\n\n## Implementation Notes\n'
        }
      ]);

      documentType = answers.documentType;
      title = answers.title;
      content = answers.content;
    } else {
      // Command line mode
      documentType = flags.type || args[0];
      title = flags.title || args[1];
      content = flags.content || '# ' + title + '\n\n## Overview\n\nTODO: Add content\n';
    }

    if (!documentType || !title) {
      printError('Document type and title are required');
      printInfo('Usage: claude-zen strategic-docs create <type> <title> [options]');
      return;
    }

    // Parse keywords from title and content
    const keywords = extractKeywords(title + ' ' + content);

    const doc = await strategicDocs.createDocument({
      documentType,
      title,
      content,
      metadata: {
        author: flags.author || 'claude-zen',
        priority: flags.priority || 'medium',
        status: flags.status || 'draft'
      },
      relevanceKeywords: keywords
    });

    printSuccess(`📄 Created ${documentType.toUpperCase()}: ${doc.title}`);
    printInfo(`📋 Document ID: ${doc.id}`);
    
    if (flags.edit) {
      printInfo('Opening document for editing...');
      await editDocument([doc.id], flags);
    }

  } catch (error) {
    printError(`Failed to create document: ${error.message}`);
  }
}

/**
 * List strategic documents
 */
async function listDocuments(args, flags) {
  try {
    const documentType = args[0] || flags.type;
    const status = flags.status;
    
    let documents;
    
    if (documentType) {
      documents = await strategicDocs.getDocumentsByType(documentType);
    } else {
      documents = await strategicDocs.searchDocuments({
        status,
        limit: flags.limit || 20
      });
    }

    if (documents.length === 0) {
      printInfo('📝 No documents found');
      return;
    }

    if (flags.json) {
      console.log(JSON.stringify(documents, null, 2));
      return;
    }

    printInfo(`📚 Strategic Documents (${documents.length} found)`);
    console.log('━'.repeat(80));

    documents.forEach(doc => {
      const typeIcon = getDocumentTypeIcon(doc.document_type_id);
      const statusBadge = getStatusBadge(doc.status);
      
      console.log(`\n${typeIcon} ${doc.title}`);
      console.log(`   📋 ID: ${doc.id} | Type: ${doc.document_type_name} ${statusBadge}`);
      console.log(`   📅 Updated: ${new Date(doc.updated_at).toLocaleDateString()}`);
      
      if (flags.verbose) {
        const preview = doc.content.substring(0, 100).replace(/\n/g, ' ') + '...';
        console.log(`   📄 Preview: ${preview}`);
        
        if (doc.relevance_keywords.length > 0) {
          console.log(`   🏷️ Keywords: ${doc.relevance_keywords.slice(0, 5).join(', ')}`);
        }
      }
    });

  } catch (error) {
    printError(`Failed to list documents: ${error.message}`);
  }
}

/**
 * View a strategic document
 */
async function viewDocument(args, flags) {
  try {
    const documentId = args[0];
    
    if (!documentId) {
      printError('Document ID is required');
      printInfo('Usage: claude-zen strategic-docs view <document-id>');
      return;
    }

    const doc = await strategicDocs.getDocument(documentId);
    
    if (!doc) {
      printError(`Document not found: ${documentId}`);
      return;
    }

    if (flags.json) {
      console.log(JSON.stringify(doc, null, 2));
      return;
    }

    const typeIcon = getDocumentTypeIcon(doc.document_type_id);
    const statusBadge = getStatusBadge(doc.status);
    
    console.log(`${typeIcon} ${doc.title} ${statusBadge}`);
    console.log('━'.repeat(Math.min(doc.title.length + 10, 80)));
    console.log(`📋 Type: ${doc.document_type_name}`);
    console.log(`📅 Created: ${new Date(doc.created_at).toLocaleString()}`);
    console.log(`📅 Updated: ${new Date(doc.updated_at).toLocaleString()}`);
    console.log(`👤 Author: ${doc.author_id || 'Unknown'}`);
    
    if (doc.relevance_keywords.length > 0) {
      console.log(`🏷️ Keywords: ${doc.relevance_keywords.join(', ')}`);
    }
    
    console.log('\n📄 Content:');
    console.log('━'.repeat(40));
    console.log(doc.content);

  } catch (error) {
    printError(`Failed to view document: ${error.message}`);
  }
}

/**
 * Edit a strategic document
 */
async function editDocument(args, flags) {
  try {
    const documentId = args[0];
    
    if (!documentId) {
      printError('Document ID is required');
      printInfo('Usage: claude-zen strategic-docs edit <document-id>');
      return;
    }

    const doc = await strategicDocs.getDocument(documentId);
    
    if (!doc) {
      printError(`Document not found: ${documentId}`);
      return;
    }

    let updates = {};

    if (flags.title) {
      updates.title = flags.title;
    }

    if (flags.content) {
      updates.content = flags.content;
    }

    if (flags.status) {
      updates.status = flags.status;
    }

    if (flags.interactive && !flags.title && !flags.content) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'title',
          message: 'Title:',
          default: doc.title
        },
        {
          type: 'editor',
          name: 'content',
          message: 'Content (Markdown):',
          default: doc.content
        },
        {
          type: 'list',
          name: 'status',
          message: 'Status:',
          default: doc.status,
          choices: ['draft', 'review', 'approved', 'archived']
        }
      ]);

      updates = {
        title: answers.title,
        content: answers.content,
        status: answers.status
      };
    }

    if (Object.keys(updates).length === 0) {
      printWarning('No updates provided');
      return;
    }

    // Update keywords if content changed
    if (updates.content || updates.title) {
      const newText = (updates.title || doc.title) + ' ' + (updates.content || doc.content);
      updates.relevance_keywords = extractKeywords(newText);
    }

    const updatedDoc = await strategicDocs.updateDocument(documentId, updates);
    
    printSuccess(`📄 Updated document: ${updatedDoc.title}`);
    
    if (flags.view) {
      await viewDocument([documentId], flags);
    }

  } catch (error) {
    printError(`Failed to edit document: ${error.message}`);
  }
}

/**
 * Delete a strategic document
 */
async function deleteDocument(args, flags) {
  try {
    const documentId = args[0];
    
    if (!documentId) {
      printError('Document ID is required');
      printInfo('Usage: claude-zen strategic-docs delete <document-id>');
      return;
    }

    const doc = await strategicDocs.getDocument(documentId);
    
    if (!doc) {
      printError(`Document not found: ${documentId}`);
      return;
    }

    if (!flags.force) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Are you sure you want to delete "${doc.title}"?`,
          default: false
        }
      ]);

      if (!confirm) {
        printInfo('Deletion cancelled');
        return;
      }
    }

    const success = await strategicDocs.deleteDocument(documentId);
    
    if (success) {
      printSuccess(`🗑️ Deleted document: ${doc.title}`);
    } else {
      printError('Failed to delete document');
    }

  } catch (error) {
    printError(`Failed to delete document: ${error.message}`);
  }
}

/**
 * Search strategic documents
 */
async function searchDocuments(args, flags) {
  try {
    const query = args.join(' ') || flags.query || '';
    
    if (!query.trim()) {
      printError('Search query is required');
      printInfo('Usage: claude-zen strategic-docs search <query> [options]');
      return;
    }

    const documents = await strategicDocs.searchDocuments({
      query,
      documentType: flags.type,
      status: flags.status,
      limit: flags.limit || 10
    });

    if (documents.length === 0) {
      printInfo(`🔍 No documents found for query: "${query}"`);
      return;
    }

    printInfo(`🔍 Search Results (${documents.length} found)`);
    console.log('━'.repeat(60));

    documents.forEach(doc => {
      const typeIcon = getDocumentTypeIcon(doc.document_type_id);
      const statusBadge = getStatusBadge(doc.status);
      
      console.log(`\n${typeIcon} ${doc.title} ${statusBadge}`);
      console.log(`   📋 ID: ${doc.id} | Type: ${doc.document_type_name}`);
      console.log(`   📅 Updated: ${new Date(doc.updated_at).toLocaleDateString()}`);
      
      if (doc.content_snippet) {
        console.log(`   🔍 Match: ${doc.content_snippet}`);
      }
    });

  } catch (error) {
    printError(`Failed to search documents: ${error.message}`);
  }
}

/**
 * Show document statistics
 */
async function showDocumentStats(flags) {
  try {
    const stats = await strategicDocs.getDocumentStats();
    const analytics = await strategicDocs.getDecisionAnalytics();

    printInfo('📊 Strategic Documents Statistics');
    console.log('━'.repeat(60));

    console.log('\n📚 Documents by Type:');
    stats.forEach(stat => {
      const icon = getDocumentTypeIcon(stat.document_type);
      const approvalRate = stat.count > 0 ? Math.round((stat.approved_count / stat.count) * 100) : 0;
      console.log(`   ${icon} ${stat.document_type}: ${stat.count} total (${stat.approved_count} approved - ${approvalRate}%)`);
    });

    console.log('\n🏛️ Queen Council Activity:');
    console.log(`   📋 Total Decisions: ${analytics.total_decisions}`);
    console.log(`   ✅ Success Rate: ${Math.round(analytics.success_rate)}%`);
    console.log(`   🎯 Avg Confidence: ${Math.round(analytics.avg_confidence * 100)}%`);
    
    if (analytics.most_active_queen) {
      console.log(`   👑 Most Active Queen: ${analytics.most_active_queen}`);
    }

    console.log('\n📈 Queen Participation:');
    Object.entries(analytics.queen_participation).forEach(([queen, count]) => {
      console.log(`   👑 ${queen}: ${count} decisions`);
    });

  } catch (error) {
    printError(`Failed to get statistics: ${error.message}`);
  }
}

/**
 * Import document from file
 */
async function importDocument(args, flags) {
  try {
    const filePath = args[0];
    
    if (!filePath) {
      printError('File path is required');
      printInfo('Usage: claude-zen strategic-docs import <file-path> --type <type>');
      return;
    }

    const { readFile } = await import('fs/promises');
    const content = await readFile(filePath, 'utf8');
    
    // Extract title from first heading or filename
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : path.basename(filePath, path.extname(filePath));
    
    const documentType = flags.type;
    if (!documentType) {
      printError('Document type is required for import');
      printInfo('Use --type flag: prd, roadmap, architecture, strategy, research, specification');
      return;
    }

    const keywords = extractKeywords(title + ' ' + content);

    const doc = await strategicDocs.createDocument({
      documentType,
      title,
      content,
      metadata: {
        imported_from: filePath,
        import_date: new Date().toISOString()
      },
      relevanceKeywords: keywords
    });

    printSuccess(`📥 Imported document: ${doc.title}`);
    printInfo(`📋 Document ID: ${doc.id}`);

  } catch (error) {
    printError(`Failed to import document: ${error.message}`);
  }
}

/**
 * Export document to file
 */
async function exportDocument(args, flags) {
  try {
    const documentId = args[0];
    
    if (!documentId) {
      printError('Document ID is required');
      printInfo('Usage: claude-zen strategic-docs export <document-id> [output-file]');
      return;
    }

    const doc = await strategicDocs.getDocument(documentId);
    
    if (!doc) {
      printError(`Document not found: ${documentId}`);
      return;
    }

    const outputFile = args[1] || `${doc.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.md`;
    
    const { writeFile } = await import('fs/promises');
    await writeFile(outputFile, doc.content);
    
    printSuccess(`📤 Exported document to: ${outputFile}`);

  } catch (error) {
    printError(`Failed to export document: ${error.message}`);
  }
}

// Helper functions
function getDocumentTypeIcon(type) {
  const icons = {
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

function getStatusBadge(status) {
  const badges = {
    'draft': '🟡 Draft',
    'review': '🟠 Review',
    'approved': '🟢 Approved',
    'archived': '⚫ Archived'
  };
  return badges[status] || '⚪ Unknown';
}

function extractKeywords(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter((word, index, arr) => arr.indexOf(word) === index) // unique
    .slice(0, 20); // limit keywords
}

function showStrategicDocsHelp() {
  console.log(`
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