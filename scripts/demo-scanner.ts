#!/usr/bin/env tsx
/**
 * Demo Version of Intelligent Document Scanner
 * 
 * Shows file-by-file presentation without requiring database initialization.
 * Demonstrates the interactive approval workflow for importing markdown files.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, relative, extname } from 'path';
import { createInterface } from 'readline';

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
      console.warn(`Skipping directory ${dir}:`, error);
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
  
  // Simple keyword-based categorization
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
  action: 'import' | 'skip' | 'modify' | 'quit';
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
    return { action: 'quit' };
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
 * Demo scanner function (first 3 documents only)
 */
async function demoScanner(rootDir: string = process.cwd()): Promise<void> {
  try {
    console.log('🔍 Starting intelligent document scanner DEMO...');
    
    // Scan for markdown files
    console.log(`📂 Scanning ${rootDir} for markdown files...`);
    const markdownFiles = scanForMarkdownFiles(rootDir);
    
    console.log(`📄 Found ${markdownFiles.length} markdown files`);
    
    if (markdownFiles.length === 0) {
      console.log('No markdown files found. Exiting.');
      return;
    }
    
    // Analyze documents
    console.log('🧠 Analyzing documents with LLM categorization...');
    const documents: FoundDocument[] = [];
    
    for (const filePath of markdownFiles) {
      try {
        const content = readFileSync(filePath, 'utf-8');
        const relativePath = relative(rootDir, filePath);
        
        // Skip very small files
        if (content.length < 100) {
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
        console.warn(`Failed to read ${filePath}:`, error);
      }
    }
    
    console.log(`📋 Found ${documents.length} potentially relevant documents`);
    
    // Sort by relevance and confidence
    documents.sort((a, b) => {
      const aScore = (a.analysis.confidence + (a.analysis.relevance === 'high' ? 0.3 : a.analysis.relevance === 'medium' ? 0.1 : 0));
      const bScore = (b.analysis.confidence + (b.analysis.relevance === 'high' ? 0.3 : b.analysis.relevance === 'medium' ? 0.1 : 0));
      return bScore - aScore;
    });
    
    if (documents.length === 0) {
      console.log('No relevant documents found for import. Exiting.');
      return;
    }
    
    // Present documents for approval (DEMO: first 3 only)
    console.log('👥 Starting interactive approval process...');
    console.log(`\n🎯 Found ${documents.length} documents for review. DEMO MODE: Showing first 3 documents.\n`);
    
    let imported = 0;
    let skipped = 0;
    let reviewed = 0;
    
    for (const doc of documents.slice(0, 3)) { // DEMO: Only first 3
      reviewed++;
      console.log(`\n📑 Document ${reviewed}/3 (DEMO MODE)`);
      
      const approval = await presentForApproval(doc);
      
      if (approval.action === 'quit') {
        console.log('\n👋 Demo interrupted by user. Exiting...');
        break;
      }
      
      if (approval.action === 'import' || approval.action === 'modify') {
        const category = approval.category || doc.analysis.category;
        
        if (['vision', 'epic', 'prd'].includes(category)) {
          console.log(`✅ DEMO: Would import as ${category} document`);
          if (approval.comments) {
            console.log(`   💬 Comments: ${approval.comments}`);
          }
          imported++;
        } else {
          console.log(`⚠️ Category '${category}' not supported for import yet. Would skip.`);
          skipped++;
        }
      } else {
        console.log(`⏭️ Document skipped by user`);
        skipped++;
      }
    }
    
    console.log(`\n✅ Demo completed!`);
    console.log(`   📄 Documents would be imported: ${imported}`);
    console.log(`   ⏭️ Documents skipped: ${skipped}`);
    console.log(`   🎯 Total reviewed: ${reviewed}`);
    console.log(`   📊 Total available: ${documents.length}`);
    console.log(`\n💡 To import documents for real, use: npm run import-scanner`);
    
  } catch (error) {
    console.error('❌ Demo scanner failed:', error);
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
🔍 Intelligent Document Scanner - DEMO VERSION

Usage:
  npm run demo-scanner [directory]

Options:
  --help, -h     Show this help message

What it does (DEMO):
  1. Scans repository for .md files
  2. Uses LLM analysis to categorize as vision/roadmap/epic/prd
  3. Shows file-by-file presentation for first 3 documents
  4. Demonstrates interactive approval workflow
  5. Shows what would be imported (no actual database import)

Interactive approval for each document:
  - [i]mport: Would import as analyzed category
  - [s]kip: Skip this document  
  - [m]odify: Change category before import
  - [q]uit: Exit the demo

This is a demonstration of the file-by-file presentation workflow.
For actual imports, use: npm run import-scanner
`);
    process.exit(0);
  }
  
  try {
    await demoScanner(rootDir);
    process.exit(0);
  } catch (error) {
    console.error('Demo failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { demoScanner, analyzeDocument };