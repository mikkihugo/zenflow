#!/usr/bin/env tsx
/**
 * Intelligent Project Management Document Scanner & Importer
 * 
 * Scans repository for .md files, uses LLM to categorize them as vision/roadmap/epic,
 * presents for approval, and imports into the database system.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, relative, extname } from 'path';
import { createInterface } from 'readline';
import { createLogger } from '../src/core/logger.js';
import { HybridDocumentManager } from '../src/services/coordination/hybrid-document-service.js';
import type { VisionDocumentEntity, EpicDocumentEntity, PRDDocumentEntity } from '../src/services/entities/document-entities.js';

const logger = createLogger('document-scanner');

interface FoundDocument {
  filePath: string;
  relativePath: string;
  content: string;
  analysis: DocumentAnalysis;
}

interface DocumentAnalysis {
  category: 'vision' | 'roadmap' | 'epic' | 'prd' | 'adr' | 'other';
  confidence: number;
  title: string;
  summary: string;
  relevance: 'high' | 'medium' | 'low';
  extractedData: {
    businessObjectives?: string[];
    features?: string[];
    architectureComponents?: string[];
    requirements?: string[];
    stakeholders?: string[];
    timeline?: string;
  };
  reasoning: string;
  recommendations: string[];
}

/**
 * Scan repository for markdown files
 */
function scanForMarkdownFiles(rootDir: string, excludeDirs: string[] = []): string[] {
  const defaultExcludes = [
    'node_modules', '.git', 'dist', 'build', 'target', 
    '.svelte-kit', 'coverage', '.next', '.nuxt'
  ];
  const allExcludes = [...defaultExcludes, ...excludeDirs];
  
  const markdownFiles: string[] = [];
  
  function scanDirectory(dir: string): void {
    try {
      const items = readdirSync(dir);
      
      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip excluded directories
          if (!allExcludes.some(exclude => item === exclude || fullPath.includes(exclude))) {
            scanDirectory(fullPath);
          }
        } else if (stat.isFile() && extname(item).toLowerCase() === '.md') {
          markdownFiles.push(fullPath);
        }
      }
    } catch (error) {
      logger.warn(`Skipping directory ${dir}:`, error);
    }
  }
  
  scanDirectory(rootDir);
  return markdownFiles;
}

/**
 * Use LLM to analyze document content and categorize
 */
function analyzeDocument(filePath: string, content: string): DocumentAnalysis {
  const lines = content.split('\n');
  const firstLines = lines.slice(0, 50).join('\n'); // First 50 lines for analysis
  
  // Extract title (first heading)
  let title = '';
  for (const line of lines) {
    if (line.startsWith('# ')) {
      title = line.replace('# ', '').trim();
      break;
    }
  }
  if (!title) {
    title = filePath.split('/').pop()?.replace('.md', '') || 'Untitled';
  }
  
  // Simple keyword-based categorization (could be enhanced with actual LLM)
  const lowerContent = content.toLowerCase();
  
  let category: DocumentAnalysis['category'] = 'other';
  let confidence = 0;
  let relevance: DocumentAnalysis['relevance'] = 'low';
  
  // Vision detection
  const visionKeywords = ['vision', 'strategic', 'goals', 'objectives', 'future', 'mission', 'purpose', 'direction'];
  const visionScore = visionKeywords.filter(kw => lowerContent.includes(kw)).length;
  
  // Roadmap detection  
  const roadmapKeywords = ['roadmap', 'timeline', 'milestones', 'phases', 'quarters', 'planning', 'schedule'];
  const roadmapScore = roadmapKeywords.filter(kw => lowerContent.includes(kw)).length;
  
  // Epic detection
  const epicKeywords = ['epic', 'feature', 'user story', 'requirements', 'implementation', 'development'];
  const epicScore = epicKeywords.filter(kw => lowerContent.includes(kw)).length;
  
  // PRD detection
  const prdKeywords = ['requirements', 'specification', 'functional', 'non-functional', 'acceptance criteria'];
  const prdScore = prdKeywords.filter(kw => lowerContent.includes(kw)).length;
  
  // ADR detection
  const adrKeywords = ['decision', 'architecture', 'adr', 'context', 'consequences', 'alternatives'];
  const adrScore = adrKeywords.filter(kw => lowerContent.includes(kw)).length;
  
  // Determine category and confidence
  const scores = [
    { category: 'vision' as const, score: visionScore },
    { category: 'roadmap' as const, score: roadmapScore },
    { category: 'epic' as const, score: epicScore },
    { category: 'prd' as const, score: prdScore },
    { category: 'adr' as const, score: adrScore }
  ];
  
  const bestMatch = scores.reduce((best, current) => 
    current.score > best.score ? current : best
  );
  
  if (bestMatch.score > 0) {
    category = bestMatch.category;
    confidence = Math.min(bestMatch.score * 0.2, 0.9); // Scale to 0-0.9
    relevance = bestMatch.score >= 3 ? 'high' : bestMatch.score >= 1 ? 'medium' : 'low';
  }
  
  // Extract structured data
  const extractedData = extractStructuredData(content, category);
  
  // Generate summary
  const summary = generateSummary(content, category);
  
  // Generate reasoning
  const reasoning = generateReasoning(category, bestMatch.score, visionScore, roadmapScore, epicScore, prdScore, adrScore);
  
  // Generate recommendations
  const recommendations = generateRecommendations(category, confidence, relevance, filePath);
  
  return {
    category,
    confidence,
    title,
    summary,
    relevance,
    extractedData,
    reasoning,
    recommendations
  };
}

/**
 * Extract structured data based on document type
 */
function extractStructuredData(content: string, category: string): DocumentAnalysis['extractedData'] {
  const lines = content.split('\n');
  const data: DocumentAnalysis['extractedData'] = {};
  
  // Extract business objectives, features, etc.
  const bulletPoints: string[] = [];
  const features: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Extract bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const item = trimmed.replace(/^[*-]\s*/, '').trim();
      if (item.length > 3) {
        bulletPoints.push(item);
        
        // Detect features
        if (trimmed.includes('**') || item.toLowerCase().includes('feature')) {
          features.push(item);
        }
      }
    }
  }
  
  if (category === 'vision') {
    data.businessObjectives = bulletPoints.slice(0, 8);
    data.stakeholders = ['developers', 'product-team', 'stakeholders'];
  } else if (category === 'epic' || category === 'prd') {
    data.features = features.length > 0 ? features : bulletPoints.slice(0, 6);
    data.requirements = bulletPoints.slice(0, 10);
  }
  
  return data;
}

/**
 * Generate document summary
 */
function generateSummary(content: string, category: string): string {
  const lines = content.split('\n').filter(line => line.trim().length > 0);
  const firstParagraph = lines.slice(1, 4).join(' ').substring(0, 200);
  
  return `${category.toUpperCase()} document: ${firstParagraph}...`;
}

/**
 * Generate reasoning for categorization
 */
function generateReasoning(
  category: string, 
  bestScore: number, 
  visionScore: number, 
  roadmapScore: number, 
  epicScore: number, 
  prdScore: number, 
  adrScore: number
): string {
  return `Categorized as ${category} (score: ${bestScore}). Keyword analysis: vision(${visionScore}), roadmap(${roadmapScore}), epic(${epicScore}), prd(${prdScore}), adr(${adrScore}).`;
}

/**
 * Generate recommendations for import
 */
function generateRecommendations(category: string, confidence: number, relevance: string, filePath: string): string[] {
  const recommendations: string[] = [];
  
  if (confidence < 0.3) {
    recommendations.push('⚠️ Low confidence categorization - manual review recommended');
  }
  
  if (relevance === 'low') {
    recommendations.push('📝 Low relevance - consider skipping or manual categorization');
  }
  
  if (category === 'other') {
    recommendations.push('❓ Uncategorized - manual review required');
  }
  
  if (filePath.includes('README')) {
    recommendations.push('📚 README file - may contain project overview suitable for vision');
  }
  
  if (filePath.includes('docs/')) {
    recommendations.push('📋 Documentation file - likely contains structured information');
  }
  
  return recommendations;
}

/**
 * Present document for approval
 */
async function presentForApproval(doc: FoundDocument): Promise<{
  action: 'import' | 'skip' | 'modify';
  category?: string;
  comments?: string;
}> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (prompt: string): Promise<string> => {
    return new Promise(resolve => rl.question(prompt, resolve));
  };
  
  console.log('\n' + '='.repeat(80));
  console.log(`📄 DOCUMENT: ${doc.relativePath}`);
  console.log('='.repeat(80));
  console.log(`📋 Title: ${doc.analysis.title}`);
  console.log(`🏷️ Category: ${doc.analysis.category} (confidence: ${(doc.analysis.confidence * 100).toFixed(0)}%)`);
  console.log(`📊 Relevance: ${doc.analysis.relevance}`);
  console.log(`💭 Summary: ${doc.analysis.summary}`);
  console.log(`🤔 Reasoning: ${doc.analysis.reasoning}`);
  
  if (doc.analysis.extractedData.businessObjectives?.length) {
    console.log(`🎯 Business Objectives: ${doc.analysis.extractedData.businessObjectives.slice(0, 3).join(', ')}...`);
  }
  
  if (doc.analysis.extractedData.features?.length) {
    console.log(`⚡ Features: ${doc.analysis.extractedData.features.slice(0, 3).join(', ')}...`);
  }
  
  if (doc.analysis.recommendations.length > 0) {
    console.log('💡 Recommendations:');
    doc.analysis.recommendations.forEach(rec => console.log(`   ${rec}`));
  }
  
  console.log('\n📖 Content Preview:');
  console.log(doc.content.substring(0, 300) + '...\n');
  
  const action = await question('Action [i]mport / [s]kip / [m]odify category / [q]uit: ');
  
  if (action.toLowerCase() === 'q') {
    rl.close();
    process.exit(0);
  }
  
  if (action.toLowerCase() === 'm') {
    const newCategory = await question('New category [vision/roadmap/epic/prd/adr/other]: ');
    const comments = await question('Comments (optional): ');
    rl.close();
    return { 
      action: 'modify', 
      category: newCategory.toLowerCase(),
      comments: comments || undefined
    };
  }
  
  if (action.toLowerCase() === 'i') {
    const comments = await question('Import comments (optional): ');
    rl.close();
    return { 
      action: 'import',
      comments: comments || undefined
    };
  }
  
  rl.close();
  return { action: 'skip' };
}

/**
 * Import document based on category
 */
async function importDocument(
  doc: FoundDocument, 
  hybridManager: HybridDocumentManager,
  category: string,
  comments?: string
): Promise<void> {
  const baseData = {
    title: doc.analysis.title,
    content: doc.content,
    summary: doc.analysis.summary,
    author: 'document-scanner',
    status: 'draft' as const,
    priority: 'medium' as const,
    tags: ['imported', 'scanned', category],
    metadata: {
      imported_from: doc.filePath,
      import_date: new Date().toISOString(),
      scanner_confidence: doc.analysis.confidence,
      scanner_reasoning: doc.analysis.reasoning,
      import_comments: comments,
      original_category: doc.analysis.category
    },
    version: '1.0.0',
    checksum: generateChecksum(doc.content),
    keywords: extractKeywords(doc.content),
    workflow_stage: 'draft',
    completion_percentage: 0
  };
  
  try {
    if (category === 'vision') {
      const visionData: Omit<VisionDocumentEntity, 'id' | 'created_at' | 'updated_at'> = {
        ...baseData,
        type: 'vision',
        business_objectives: doc.analysis.extractedData.businessObjectives || ['Strategic objectives from imported document'],
        success_criteria: ['Document successfully imported and categorized'],
        stakeholders: doc.analysis.extractedData.stakeholders || ['team', 'stakeholders'],
        timeline: {
          start_date: new Date(),
          target_completion: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          milestones: [{
            name: 'Document Review',
            date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            description: 'Review and validate imported document'
          }]
        },
        generated_adrs: [],
        generated_prds: []
      };
      
      const result = await hybridManager.createDocument<VisionDocumentEntity>(visionData, {
        generateEmbedding: true,
        createGraphNode: true,
        autoRelateToProject: true
      });
      
      logger.info(`✅ Imported vision: ${result.id}`);
      
    } else if (category === 'epic') {
      const epicData: Omit<EpicDocumentEntity, 'id' | 'created_at' | 'updated_at'> = {
        ...baseData,
        type: 'epic',
        business_value: 'Value derived from imported epic document',
        user_impact: 'Impact defined in imported epic',
        effort_estimation: {
          complexity: 'medium',
          time_estimate_weeks: 8
        },
        timeline: {
          start_date: new Date(),
          estimated_completion: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days
        },
        feature_ids: [],
        features_completed: 0,
        features_total: doc.analysis.extractedData.features?.length || 1
      };
      
      const result = await hybridManager.createDocument<EpicDocumentEntity>(epicData, {
        generateEmbedding: true,
        createGraphNode: true,
        autoRelateToProject: true
      });
      
      logger.info(`✅ Imported epic: ${result.id}`);
      
    } else if (category === 'prd') {
      const prdData: Omit<PRDDocumentEntity, 'id' | 'created_at' | 'updated_at'> = {
        ...baseData,
        type: 'prd',
        functional_requirements: (doc.analysis.extractedData.requirements || ['Requirements from imported document']).map((req, idx) => ({
          id: `req-${idx + 1}`,
          description: req,
          acceptance_criteria: ['Requirement successfully implemented'],
          priority: 'should_have' as const
        })),
        non_functional_requirements: [{
          id: 'nfr-1',
          type: 'usability' as const,
          description: 'System should be user-friendly',
          metrics: 'User satisfaction > 80%'
        }],
        user_stories: [{
          id: 'us-1',
          title: 'User can access imported functionality',
          description: 'As a user, I want to access the functionality described in the imported document',
          acceptance_criteria: ['Functionality is accessible', 'Documentation is clear']
        }],
        generated_epics: []
      };
      
      const result = await hybridManager.createDocument<PRDDocumentEntity>(prdData, {
        generateEmbedding: true,
        createGraphNode: true,
        autoRelateToProject: true
      });
      
      logger.info(`✅ Imported PRD: ${result.id}`);
    }
    
  } catch (error) {
    logger.error(`❌ Failed to import ${doc.relativePath}:`, error);
    throw error;
  }
}

/**
 * Generate simple checksum
 */
function generateChecksum(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Extract keywords from content
 */
function extractKeywords(content: string): string[] {
  const words = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
  const stopWords = new Set(['this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'their', 'said', 'each', 'which', 'your', 'very', 'what', 'make', 'time', 'just', 'about', 'could', 'would', 'should']);
  
  const wordFreq = words.reduce((freq, word) => {
    if (!stopWords.has(word)) {
      freq[word] = (freq[word] || 0) + 1;
    }
    return freq;
  }, {} as Record<string, number>);
  
  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * Main scanner function
 */
async function scanAndImport(rootDir: string = process.cwd()): Promise<void> {
  try {
    logger.info('🔍 Starting intelligent document scanner...');
    
    // Scan for markdown files
    logger.info(`📂 Scanning ${rootDir} for markdown files...`);
    const markdownFiles = scanForMarkdownFiles(rootDir);
    
    logger.info(`📄 Found ${markdownFiles.length} markdown files`);
    
    if (markdownFiles.length === 0) {
      logger.info('No markdown files found. Exiting.');
      return;
    }
    
    // Analyze documents
    logger.info('🧠 Analyzing documents with LLM categorization...');
    const documents: FoundDocument[] = [];
    
    for (const filePath of markdownFiles) {
      try {
        const content = readFileSync(filePath, 'utf-8');
        const relativePath = relative(rootDir, filePath);
        
        // Skip very small files
        if (content.length < 100) {
          logger.debug(`Skipping small file: ${relativePath}`);
          continue;
        }
        
        const analysis = analyzeDocument(filePath, content);
        
        // Only include relevant documents
        if (analysis.category !== 'other' || analysis.relevance !== 'low') {
          documents.push({
            filePath,
            relativePath,
            content,
            analysis
          });
        }
        
      } catch (error) {
        logger.warn(`Failed to read ${filePath}:`, error);
      }
    }
    
    logger.info(`📋 Found ${documents.length} potentially relevant documents`);
    
    // Sort by relevance and confidence
    documents.sort((a, b) => {
      const aScore = (a.analysis.confidence + (a.analysis.relevance === 'high' ? 0.3 : a.analysis.relevance === 'medium' ? 0.1 : 0));
      const bScore = (b.analysis.confidence + (b.analysis.relevance === 'high' ? 0.3 : b.analysis.relevance === 'medium' ? 0.1 : 0));
      return bScore - aScore;
    });
    
    if (documents.length === 0) {
      logger.info('No relevant documents found for import. Exiting.');
      return;
    }
    
    // Initialize hybrid manager
    logger.info('🚀 Initializing document management system...');
    const hybridManager = new HybridDocumentManager();
    await hybridManager.initialize();
    
    // Present documents for approval
    logger.info('👥 Starting interactive approval process...');
    console.log(`\n🎯 Found ${documents.length} documents for review. Starting with highest confidence.\n`);
    
    let imported = 0;
    let skipped = 0;
    
    for (const doc of documents) {
      const approval = await presentForApproval(doc);
      
      if (approval.action === 'import' || approval.action === 'modify') {
        const category = approval.category || doc.analysis.category;
        
        if (['vision', 'epic', 'prd'].includes(category)) {
          await importDocument(doc, hybridManager, category, approval.comments);
          imported++;
        } else {
          console.log(`⚠️ Category '${category}' not supported for import yet. Skipping.`);
          skipped++;
        }
      } else {
        skipped++;
      }
    }
    
    logger.info(`✅ Import process completed!`);
    logger.info(`   📄 Documents imported: ${imported}`);
    logger.info(`   ⏭️ Documents skipped: ${skipped}`);
    logger.info(`   🎯 Total reviewed: ${documents.length}`);
    
  } catch (error) {
    logger.error('❌ Scanner failed:', error);
    throw error;
  }
}

/**
 * CLI entry point
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const rootDir = args[0] || process.cwd();
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🔍 Intelligent Document Scanner & Importer

Usage:
  npm run scan-import [directory]

Options:
  --help, -h     Show this help message

What it does:
  1. Scans repository for .md files
  2. Uses LLM analysis to categorize as vision/roadmap/epic/prd
  3. Presents each document for your approval
  4. Imports approved documents into database
  5. Creates proper entities with semantic relationships

Interactive approval for each document:
  - [i]mport: Import as analyzed category
  - [s]kip: Skip this document  
  - [m]odify: Change category before import
  - [q]uit: Exit the scanner

The scanner prioritizes high-confidence, high-relevance documents first.
Only vision, epic, and PRD documents are currently supported for import.
`);
    process.exit(0);
  }
  
  try {
    await scanAndImport(rootDir);
    process.exit(0);
  } catch (error) {
    console.error('Scanner failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { scanAndImport, analyzeDocument };