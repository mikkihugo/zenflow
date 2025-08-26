#!/usr/bin/env npx tsx
import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { getLogger } from "@claude-zen/foundation";
/**
 * @fileoverview Intelligent Document Import with Swarm Analysis
 *
 * LLM-powered workflow that:
 * 1. Scans repository documents and code files
 * 2. Analyzes TSDoc/JSDoc completeness
 * 3. Uses swarm "ultrathink" for deep analysis
 * 4. Suggests improvements via approval workflow
 * 5. Stores directly in database (not file system)
 *
 * @example
 * ```typescript
 * const workflow = new IntelligentDocImport({
 *   swarmConfig: { maxAgents: 5, topology: 'mesh' },
 *   databaseConfig: { type: 'postgresql' }
 * });
 *
 * const result = await workflow.importAndAnalyze('/path/to/repo');
 * // Returns: { suggestions: [...], approvalRequired: true }
 * ```
 */
import { EventEmitter } from "eventemitter3";

// Mock DocumentManager until we have a proper document service
class DocumentManager {
	async saveDocument(doc) {
		// Mock implementation
		console.log("Saving document:", doc.id);
	}
	async getDocument(id) {
		// Mock implementation
		return { id, content: "Mock content" };
	}
}
const logger = getLogger("IntelligentDocImport");
/**
 * Intelligent Document Import Workflow
 *
 * Orchestrates LLM-powered analysis of repository documentation
 * and code with human-in-the-loop approval workflows.
 */
/**
 * Intelligent Document Import Workflow
 *
 * Orchestrates LLM-powered analysis of repository documentation
 * and code with human-in-the-loop approval workflows.
 *
 * @example
 * ```typescript
 * const workflow = new IntelligentDocImport({
 *   repositoryPath: '/path/to/repo',
 *   swarmConfig: { maxAgents: 5, topology: 'mesh' },
 *   databaseConfig: { type: 'postgresql' },
 *   analysisConfig: { checkDocumentation: true }
 * });
 *
 * const result = await workflow.importAndAnalyze();
 * ```
 */
export class IntelligentDocImport extends EventEmitter {
	config;
	documentManager;
	workflowGates = [];
	/**
	 * Create a new intelligent document import workflow.
	 *
	 * @param config - Configuration for the import workflow
	 */
	constructor(config) {
		super();
		this.config = config;
		// Initialize document manager for database storage
		this.documentManager = {
			async saveDocument(doc) {
				// Simple implementation - in real use this would use a database
				logger.info("Saving document", { docType: doc.type, title: doc.title });
			},
			async getDocument(id) {
				logger.info("Getting document", { id });
				return null;
			},
		};
	}
	/**
	 * Main workflow: Import and analyze repository with swarm intelligence.
	 */
	/**
	 * Main workflow: Import and analyze repository with swarm intelligence.
	 *
	 * Executes a comprehensive 5-phase workflow:
	 * 1. Discovery - Scan repository for relevant files
	 * 2. Analysis - Apply swarm intelligence to analyze files
	 * 3. Classification - Group files by recommendation type
	 * 4. Approval Gates - Create human review workflows
	 * 5. Recommendations - Generate overall insights
	 *
	 * @returns Promise resolving to complete workflow results
	 * @throws Error if workflow fails at any phase
	 *
	 * @example
	 * ```typescript
	 * const result = await workflow.importAndAnalyze();
	 * console.log(`Found ${result.totalFiles} files`);
	 * console.log(`Ready for import: ${result.readyForImport.length}`);
	 * ```
	 */
	async importAndAnalyze() {
		logger.info("🚀 Starting intelligent document import workflow");
		logger.info(`Repository: ${this.config.repositoryPath}`);
		try {
			// Phase 1: Repository Discovery
			this.emit("phase", "discovery");
			const discoveredFiles = await this.discoverFiles();
			logger.info(`📁 Discovered ${discoveredFiles.length} files`);
			// Phase 2: Swarm Analysis
			this.emit("phase", "analysis");
			const analyses = await this.performSwarmAnalysis(discoveredFiles);
			logger.info(
				`🧠 Analyzed ${analyses.length} files with swarm intelligence`,
			);
			// Phase 3: Classification & Recommendations
			this.emit("phase", "classification");
			const classified = await this.classifyAndRecommend(analyses);
			logger.info(
				`📋 Classified files: ${classified.readyForImport.length} ready, ${classified.requiresApproval.length} need approval`,
			);
			// Phase 4: Create Approval Workflows
			this.emit("phase", "approval_gates");
			const approvalGates = await this.createApprovalGates(classified);
			logger.info(`🔒 Created ${approvalGates.length} approval gates`);
			// Phase 5: Generate Overall Recommendations
			this.emit("phase", "recommendations");
			const overallRecommendations =
				await this.generateOverallRecommendations(classified);
			const result = {
				totalFiles: discoveredFiles.length,
				analyses,
				readyForImport: classified.readyForImport,
				requiresApproval: classified.requiresApproval,
				needsImprovement: classified.needsImprovement,
				overallRecommendations,
				approvalGates,
			};
			this.emit("completed", result);
			logger.info("✅ Intelligent import workflow completed");
			return result;
		} catch (error) {
			logger.error("❌ Workflow failed:", error);
			this.emit("error", error);
			throw error;
		}
	}
	/**
	 * Phase 1: Discover all relevant files in repository.
	 */
	/**
	 * Phase 1: Discover all relevant files in repository.
	 *
	 * Recursively scans the repository directory to find files that are
	 * relevant for documentation analysis (documents, code files, configs).
	 * Skips common ignore patterns like node_modules, dist, build directories.
	 *
	 * @returns Promise resolving to array of file paths for analysis
	 * @private
	 */
	async discoverFiles() {
		const files = [];
		/**
		 * Recursively scan directory for relevant files.
		 *
		 * @param dir - Directory path to scan
		 */
		const scanDirectory = async (dir) => {
			const entries = await readdir(dir, { withFileTypes: true });
			for (const entry of entries) {
				const fullPath = join(dir, entry.name);
				if (entry.isDirectory()) {
					// Skip common ignore patterns
					if (
						!entry.name.startsWith(".") &&
						!entry.name.includes("node_modules") &&
						!entry.name.includes("target") &&
						!entry.name.includes("dist") &&
						!entry.name.includes("build")
					) {
						await scanDirectory(fullPath);
					}
				} else if (this.isRelevantFile(entry.name)) {
					files.push(fullPath);
				}
			}
		};
		await scanDirectory(this.config.repositoryPath);
		return files;
	}
	/**
	 * Check if file is relevant for documentation analysis.
	 */
	/**
	 * Check if file is relevant for documentation analysis.
	 *
	 * Determines if a file should be included in the analysis based on:
	 * - File extension (documents, code files)
	 * - Filename patterns (README, CHANGELOG, etc.)
	 * - Content type expectations
	 *
	 * @param filename - Name of the file to check
	 * @returns True if file should be analyzed, false otherwise
	 * @private
	 */
	isRelevantFile(filename) {
		const ext = extname(filename).toLowerCase();
		// Documentation files
		if (ext === ".md" || ext === ".rst" || ext === ".txt") return true;
		// Code files that should have documentation
		if (
			[
				"",
				"",
				".tsx",
				".jsx",
				".py",
				".rs",
				".go",
				".java",
				".cpp",
				".hpp",
			].includes(ext)
		) {
			return true;
		}
		// Configuration files
		if (
			filename.toLowerCase().includes("readme") ||
			filename.toLowerCase().includes("changelog") ||
			filename.toLowerCase().includes("todo")
		) {
			return true;
		}
		return false;
	}
	/**
	 * Phase 2: Perform swarm-based analysis with LLM intelligence.
	 */
	/**
	 * Phase 2: Perform swarm-based analysis with LLM intelligence.
	 *
	 * Processes files in batches using multiple analysis agents.
	 * Each file gets comprehensive analysis including:
	 * - Content classification and quality assessment
	 * - Documentation completeness (for code files)
	 * - LLM-powered insights and recommendations
	 *
	 * @param files - Array of file paths to analyze
	 * @returns Promise resolving to analysis results for each file
	 * @private
	 */
	async performSwarmAnalysis(files) {
		const results = [];
		logger.info("🐝 Initializing analysis swarm...");
		// Process files in batches for efficiency
		const batchSize = 10;
		for (let i = 0; i < files.length; i += batchSize) {
			const batch = files.slice(i, i + batchSize);
			const batchResults = await Promise.all(
				batch.map((file) => this.analyzeFile(file)),
			);
			results.push(...batchResults);
			// Emit progress
			this.emit("progress", {
				phase: "analysis",
				completed: i + batch.length,
				total: files.length,
			});
		}
		return results;
	}
	/**
	 * Analyze a single file with comprehensive intelligence.
	 */
	/**
	 * Analyze a single file with comprehensive intelligence.
	 *
	 * Performs multi-layered analysis:
	 * - File type detection (document/code/config)
	 * - Document classification (vision/adr/prd/epic/feature/task/spec)
	 * - Documentation completeness analysis (for code)
	 * - LLM quality assessment
	 * - Recommendation generation
	 *
	 * @param filePath - Absolute path to file for analysis
	 * @returns Promise resolving to comprehensive analysis result
	 * @private
	 */
	async analyzeFile(filePath) {
		const relativePath = relative(this.config.repositoryPath, filePath);
		const ext = extname(filePath).toLowerCase();
		const content = await readFile(filePath, "utf8");
		logger.debug(`🔍 Analyzing: ${relativePath}`);
		// Determine file type
		const fileType = this.determineFileType(filePath, content);
		const result = {
			filePath: relativePath,
			fileType,
			recommendations: {
				action: "manual_review",
				reasoning: "Analysis in progress",
				confidence: 0.5,
			},
		};
		// Document analysis
		if (fileType === "document") {
			result.documentType = this.classifyDocument(filePath, content);
			if (this.config.analysisConfig.analyzeDocuments) {
				result.llmAnalysis = await this.performLLMDocumentAnalysis(
					content,
					result.documentType,
				);
			}
		}
		// Code documentation analysis
		if (fileType === "code" && this.config.analysisConfig.checkDocumentation) {
			result.documentationScore = await this.analyzeDocumentationCompleteness(
				content,
				ext,
			);
		}
		// Generate recommendations
		result.recommendations = await this.generateRecommendations(result);
		return result;
	}
	/**
	 * Determine file type from path and content.
	 */
	/**
	 * Determine file type from path and content.
	 *
	 * Analyzes file extension and path patterns to classify files into:
	 * - document: Markdown, RST, text files
	 * - code: Source code files (TS, JS, Python, Rust, etc.)
	 * - config: Configuration files (JSON, YAML, TOML, etc.)
	 * - other: Unclassified files
	 *
	 * @param filePath - Path to the file
	 * @param content - File content for additional analysis
	 * @returns File type classification
	 * @private
	 */
	determineFileType(filePath, _content) {
		const ext = extname(filePath).toLowerCase();
		const filename = filePath.toLowerCase();
		// Documentation
		if (ext === ".md" || ext === ".rst" || ext === ".txt") return "document";
		// Code files
		if (
			[
				"",
				"",
				".tsx",
				".jsx",
				".py",
				".rs",
				".go",
				".java",
				".cpp",
				".hpp",
			].includes(ext)
		) {
			return "code";
		}
		// Configuration
		if (
			[".json", ".yaml", ".yml", ".toml", ".ini"].includes(ext) ||
			filename.includes("package.json") ||
			filename.includes("tsconfig") ||
			filename.includes("config")
		) {
			return "config";
		}
		return "other";
	}
	/**
	 * Classify document type using content analysis.
	 */
	/**
	 * Classify document type using content analysis.
	 *
	 * Uses both filename patterns and content analysis to determine
	 * the document type according to standard documentation taxonomy:
	 * - vision: Project vision, README files
	 * - adr: Architectural Decision Records
	 * - prd: Product Requirements Documents
	 * - epic: Epic-level requirements
	 * - feature: Feature specifications
	 * - task: Task lists, TODO files
	 * - spec: Technical specifications
	 *
	 * @param filePath - Path to the document file
	 * @param content - Document content for pattern matching
	 * @returns Classified document type
	 * @private
	 */
	classifyDocument(filePath, content) {
		const filename = filePath.toLowerCase();
		const contentLower = content.toLowerCase();
		// Filename patterns
		if (filename.includes("readme") || filename.includes("vision"))
			return "vision";
		if (filename.includes("adr-") || filename.includes("decision"))
			return "adr";
		if (filename.includes("prd") || filename.includes("requirements"))
			return "prd";
		if (filename.includes("epic")) return "epic";
		if (filename.includes("feature")) return "feature";
		if (filename.includes("todo") || filename.includes("task")) return "task";
		if (filename.includes("spec") || filename.includes("specification"))
			return "spec";
		// Content analysis
		if (
			contentLower.includes("# vision") ||
			contentLower.includes("product vision")
		)
			return "vision";
		if (
			contentLower.includes("architectural decision") ||
			contentLower.includes("# adr")
		)
			return "adr";
		if (
			contentLower.includes("product requirements") ||
			contentLower.includes("# prd")
		)
			return "prd";
		if (contentLower.includes("# epic") || contentLower.includes("user story"))
			return "epic";
		if (contentLower.includes("# feature") || contentLower.includes("feature:"))
			return "feature";
		if (contentLower.includes("# todo") || contentLower.includes("- [ ]"))
			return "task";
		if (
			contentLower.includes("specification") ||
			contentLower.includes("# spec")
		)
			return "spec";
		return "task"; // default
	}
	/**
	 * Perform LLM-powered document analysis.
	 */
	/**
	 * Perform LLM-powered document analysis.
	 *
	 * Analyzes document quality using language model insights:
	 * - Structure and formatting quality
	 * - Content comprehensiveness
	 * - Presence of examples and usage information
	 * - Readability and clarity
	 * - Risk factors and improvement suggestions
	 *
	 * @param content - Document content to analyze
	 * @param documentType - Optional document type for context
	 * @returns Promise resolving to LLM analysis results
	 * @private
	 */
	async performLLMDocumentAnalysis(content, _documentType) {
		// This would integrate with actual LLM service
		// For now, return simulated analysis
		const qualityFactors = {
			hasIntroduction: content.includes("# ") || content.includes("## "),
			hasStructure: (content.match(/^#+/gm) || []).length >= 3,
			hasExamples: content.includes("```") || content.includes("example"),
			isComprehensive: content.length > 500,
			isWellFormatted: content.includes("\n") && !content.includes("\t\t\t"),
		};
		const qualityScore =
			Object.values(qualityFactors).filter(Boolean).length /
			Object.keys(qualityFactors).length;
		return {
			qualityScore,
			completenessScore: content.length > 1000 ? 0.8 : content.length / 1250,
			suggestions: [
				...(qualityScore < 0.7
					? ["Improve document structure with clear headings"]
					: []),
				...(content.length < 500 ? ["Add more comprehensive content"] : []),
				...(!content.includes("```")
					? ["Add code examples or usage samples"]
					: []),
			],
			riskFactors: [
				...(content.length < 200
					? ["Document too short for comprehensive understanding"]
					: []),
				...(qualityScore < 0.5
					? ["Poor document structure may confuse readers"]
					: []),
			],
			confidence: 0.8,
		};
	}
	/**
	 * Analyze TSDoc/JSDoc completeness in code files.
	 */
	/**
	 * Analyze TSDoc/JSDoc completeness in code files.
	 *
	 * Examines source code to determine documentation coverage:
	 * - Extracts functions, classes, and interfaces
	 * - Checks for presence of JSDoc/TSDoc comments
	 * - Calculates coverage percentages
	 * - Identifies missing documentation items
	 *
	 * @param content - Source code content
	 * @param fileExt - File extension for language-specific parsing
	 * @returns Promise resolving to documentation completeness analysis
	 * @private
	 */
	async analyzeDocumentationCompleteness(content, fileExt) {
		const functions = this.extractFunctions(content, fileExt);
		const classes = this.extractClasses(content, fileExt);
		const interfaces = this.extractInterfaces(content, fileExt);
		const functionDocumentation =
			functions.filter((f) => f.hasDocumentation).length /
			Math.max(functions.length, 1);
		const classDocumentation =
			classes.filter((c) => c.hasDocumentation).length /
			Math.max(classes.length, 1);
		const interfaceDocumentation =
			interfaces.filter((i) => i.hasDocumentation).length /
			Math.max(interfaces.length, 1);
		const overall =
			(functionDocumentation + classDocumentation + interfaceDocumentation) / 3;
		const missing = [
			...functions
				.filter((f) => !f.hasDocumentation)
				.map((f) => `Function: ${f.name}`),
			...classes
				.filter((c) => !c.hasDocumentation)
				.map((c) => `Class: ${c.name}`),
			...interfaces
				.filter((i) => !i.hasDocumentation)
				.map((i) => `Interface: ${i.name}`),
		];
		return {
			overall,
			functions: functionDocumentation,
			classes: classDocumentation,
			interfaces: interfaceDocumentation,
			missing,
		};
	}
	/**
	 * Extract functions from code content.
	 */
	/**
	 * Extract functions from code content.
	 *
	 * Parses source code to find function definitions and checks
	 * for associated documentation comments. Supports multiple
	 * function declaration patterns including regular functions,
	 * arrow functions, and class methods.
	 *
	 * @param content - Source code content
	 * @param fileExt - File extension for language-specific patterns
	 * @returns Array of functions with documentation status
	 * @private
	 */
	extractFunctions(content, fileExt) {
		const functions = [];
		if (fileExt === "" || fileExt === "") {
			// TypeScript/JavaScript function patterns
			const functionRegex =
				/(?:export\s+)?(?:async\s+)?function\s+(\w+)|(\w+)\s*=\s*(?:async\s+)?\(/g;
			const lines = content.split("\n");
			let match;
			while ((match = functionRegex.exec(content)) !== null) {
				const functionName = match[1] || match[2];
				const lineIndex =
					content.substring(0, match.index).split("\n").length - 1;
				// Check for JSDoc/TSDoc comment above
				const hasDocumentation =
					lineIndex > 0 &&
					(lines[lineIndex - 1]?.trim().includes("*/") ||
						lines[lineIndex - 1]?.trim().startsWith("//") ||
						lines[lineIndex - 2]?.trim().includes("/**"));
				functions.push({
					name: functionName || "unknown",
					hasDocumentation: hasDocumentation || false,
				});
			}
		}
		return functions;
	}
	/**
	 * Extract classes from code content.
	 */
	/**
	 * Extract classes from code content.
	 *
	 * Identifies class declarations in source code and checks for
	 * associated JSDoc/TSDoc comments. Handles export patterns
	 * and various class declaration styles.
	 *
	 * @param content - Source code content
	 * @param fileExt - File extension for language-specific patterns
	 * @returns Array of classes with documentation status
	 * @private
	 */
	extractClasses(content, fileExt) {
		const classes = [];
		if (fileExt === "" || fileExt === "") {
			const classRegex = /(?:export\s+)?class\s+(\w+)/g;
			const lines = content.split("\n");
			let match;
			while ((match = classRegex.exec(content)) !== null) {
				const className = match[1];
				const lineIndex =
					content.substring(0, match.index).split("\n").length - 1;
				const hasDocumentation =
					lineIndex > 0 &&
					(lines[lineIndex - 1]?.trim().includes("*/") ||
						lines[lineIndex - 2]?.trim().includes("/**"));
				classes.push({
					name: className || "unknown",
					hasDocumentation: hasDocumentation || false,
				});
			}
		}
		return classes;
	}
	/**
	 * Extract interfaces from code content.
	 */
	/**
	 * Extract interfaces from code content.
	 *
	 * Finds TypeScript interface declarations and checks for
	 * documentation comments. Essential for maintaining type
	 * definition documentation in TypeScript projects.
	 *
	 * @param content - Source code content
	 * @param fileExt - File extension (should be .ts for interfaces)
	 * @returns Array of interfaces with documentation status
	 * @private
	 */
	extractInterfaces(content, fileExt) {
		const interfaces = [];
		if (fileExt === "") {
			const interfaceRegex = /(?:export\s+)?interface\s+(\w+)/g;
			const lines = content.split("\n");
			let match;
			while ((match = interfaceRegex.exec(content)) !== null) {
				const interfaceName = match[1];
				const lineIndex =
					content.substring(0, match.index).split("\n").length - 1;
				const hasDocumentation =
					lineIndex > 0 &&
					(lines[lineIndex - 1]?.trim().includes("*/") ||
						lines[lineIndex - 2]?.trim().includes("/**"));
				interfaces.push({
					name: interfaceName || "unknown",
					hasDocumentation: hasDocumentation || false,
				});
			}
		}
		return interfaces;
	}
	/**
	 * Generate recommendations based on analysis.
	 */
	/**
	 * Generate recommendations based on analysis.
	 *
	 * Synthesizes analysis results to provide actionable recommendations:
	 * - Determines appropriate action (import/improve/reject/manual_review)
	 * - Calculates confidence scores based on quality metrics
	 * - Generates specific improvement suggestions
	 * - Applies auto-approval thresholds
	 *
	 * @param analysis - File analysis results
	 * @returns Promise resolving to recommendation object
	 * @private
	 */
	async generateRecommendations(analysis) {
		let confidence = 0.5;
		let action = "manual_review";
		let reasoning = "Requires manual review";
		const improvements = [];
		// Document recommendations
		if (analysis.fileType === "document" && analysis.llmAnalysis) {
			const llmAnalysis = analysis.llmAnalysis;
			confidence = llmAnalysis.confidence;
			if (
				llmAnalysis.qualityScore >= 0.8 &&
				llmAnalysis.completenessScore >= 0.8
			) {
				action = "import";
				reasoning = "High quality document ready for import";
			} else if (llmAnalysis.qualityScore >= 0.6) {
				action = "improve";
				reasoning = "Good document that could benefit from improvements";
				improvements.push(...llmAnalysis.suggestions);
			} else {
				action = "manual_review";
				reasoning = "Document quality below threshold, needs manual review";
			}
		}
		// Code documentation recommendations
		if (analysis.fileType === "code" && analysis.documentationScore) {
			const docScore = analysis.documentationScore;
			const score = docScore.overall;
			if (score >= 0.9) {
				action = "import";
				reasoning = "Well-documented code ready for import";
				confidence = 0.9;
			} else if (score >= 0.6) {
				action = "improve";
				reasoning = "Code partially documented, improvements recommended";
				confidence = 0.7;
				improvements.push(
					`Add documentation for ${docScore.missing.length} missing items`,
				);
			} else {
				action = "manual_review";
				reasoning = "Poor documentation coverage, manual review required";
				confidence = 0.6;
			}
		}
		// Auto-approval check
		if (confidence >= this.config.analysisConfig.autoApprovalThreshold) {
			if (action === "manual_review") {
				action = "import";
				reasoning += " (auto-approved due to high confidence)";
			}
		}
		return {
			action,
			reasoning,
			improvements: improvements.length > 0 ? improvements : undefined,
			confidence,
		};
	}
	/**
	 * Phase 3: Classify analysis results and group by recommendation.
	 */
	/**
	 * Phase 3: Classify analysis results and group by recommendation.
	 *
	 * Organizes analyzed files into three categories based on their
	 * recommendation status:
	 * - readyForImport: High-confidence files for automatic import
	 * - needsImprovement: Files that would benefit from enhancements
	 * - requiresApproval: Files needing manual human review
	 *
	 * @param analyses - Array of file analysis results
	 * @returns Promise resolving to classified file groups
	 * @private
	 */
	async classifyAndRecommend(analyses) {
		const readyForImport = analyses.filter(
			(a) => a.recommendations.action === "import",
		);
		const needsImprovement = analyses.filter(
			(a) => a.recommendations.action === "improve",
		);
		const requiresApproval = analyses.filter(
			(a) =>
				a.recommendations.action === "manual_review" ||
				a.recommendations.confidence <
					this.config.analysisConfig.autoApprovalThreshold,
		);
		return { readyForImport, requiresApproval, needsImprovement };
	}
	/**
	 * Phase 4: Create approval workflow gates for manual review items.
	 */
	/**
	 * Phase 4: Create approval workflow gates for manual review items.
	 *
	 * Generates human-in-the-loop workflow gates for files that require
	 * manual approval or improvement review. Each gate includes:
	 * - Contextual analysis information
	 * - Specific validation questions
	 * - Recommended actions and alternatives
	 * - Escalation policies for timeout handling
	 *
	 * @param classified - Classified file groups from previous phase
	 * @returns Promise resolving to array of created workflow gates
	 * @private
	 */
	async createApprovalGates(classified) {
		const gates = [];
		// Create gates for files requiring approval
		for (const analysis of classified.requiresApproval) {
			const gateId = `doc-approval-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
			const gate = {
				// ValidationQuestion base properties
				id: gateId,
				type: "approval",
				gateType: "approval",
				workflowContext: {
					workflowId: "intelligent-doc-import",
					stepName: "approval",
				},
				question: `Should we import "${analysis.filePath}" as a ${analysis.documentType || analysis.fileType}?`,
				context: {
					fileAnalysis: analysis,
					recommendations: analysis.recommendations,
					workflowType: "document_import_approval",
				},
				// Required fields
				data: {
					filePath: analysis.filePath,
					documentType: analysis.documentType,
					fileType: analysis.fileType,
					recommendations: analysis.recommendations,
				},
				requester: "intelligent-doc-import-workflow",
				timestamp: new Date(),
			};
			gates.push(gate);
			this.workflowGates.push(gate);
		}
		// Create improvement review gates
		for (const analysis of classified.needsImprovement) {
			const gateId = `doc-improve-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
			const gate = {
				// ValidationQuestion base properties
				id: gateId,
				type: "approval",
				gateType: "approval",
				workflowContext: {
					workflowId: "intelligent-doc-import",
					stepName: "improvement",
				},
				question: `Apply suggested improvements to "${analysis.filePath}"?`,
				context: {
					fileAnalysis: analysis,
					improvements: analysis.recommendations.improvements,
					workflowType: "document_improvement_review",
				},
				// Required fields
				data: {
					filePath: analysis.filePath,
					improvements: analysis.recommendations.improvements,
					documentType: analysis.documentType,
					fileType: analysis.fileType,
				},
				requester: "intelligent-doc-import-workflow",
				timestamp: new Date(),
			};
			gates.push(gate);
			this.workflowGates.push(gate);
		}
		logger.info(`🔒 Created ${gates.length} approval gates`);
		return gates;
	}
	/**
	 * Phase 5: Generate overall recommendations and insights.
	 */
	/**
	 * Phase 5: Generate overall recommendations and insights.
	 *
	 * Synthesizes individual file analyses into repository-wide insights:
	 * - Summary statistics and percentages
	 * - Key findings and patterns
	 * - Actionable recommendations for improvement
	 * - Effort estimation for completion
	 *
	 * @param classified - Classified file groups
	 * @returns Promise resolving to overall recommendations object
	 * @private
	 */
	async generateOverallRecommendations(classified) {
		const total =
			classified.readyForImport.length +
			classified.requiresApproval.length +
			classified.needsImprovement.length;
		const readyPercent = (classified.readyForImport.length / total) * 100;
		const summary = `Repository analysis complete. ${readyPercent.toFixed(0)}% of files ready for immediate import.`;
		const keyFindings = [
			`${classified.readyForImport.length} files ready for automatic import`,
			`${classified.requiresApproval.length} files require manual approval`,
			`${classified.needsImprovement.length} files would benefit from improvements`,
		];
		const suggestedActions = [
			"Import ready files immediately to database",
			"Review approval gates for manual validation",
			"Apply suggested improvements to enhance quality",
			"Consider establishing documentation standards",
		];
		let estimatedEffort = "low";
		if (classified.requiresApproval.length > total * 0.3)
			estimatedEffort = "medium";
		if (classified.requiresApproval.length > total * 0.6)
			estimatedEffort = "high";
		return {
			summary,
			keyFindings,
			suggestedActions,
			estimatedEffort,
		};
	}
	/**
	 * Store approved files in database.
	 */
	/**
	 * Store approved files in database.
	 *
	 * Executes the final import step for files that have been approved
	 * through the workflow process. Files are stored in the database
	 * with full metadata including analysis results, confidence scores,
	 * and traceability information.
	 *
	 * @param approvedFiles - Array of files approved for import
	 * @returns Promise that resolves when all files are stored
	 *
	 * @example
	 * ```typescript
	 * const approvedFiles = result.readyForImport;
	 * await workflow.executeApprovedImports(approvedFiles);
	 * console.log(`Imported ${approvedFiles.length} files`);
	 * ```
	 */
	async executeApprovedImports(approvedFiles) {
		logger.info(
			`💾 Storing ${approvedFiles.length} approved files in database`,
		);
		for (const analysis of approvedFiles) {
			try {
				const fullPath = join(this.config.repositoryPath, analysis.filePath);
				const content = await readFile(fullPath, "utf8");
				// Store in database using DocumentManager
				await this.documentManager.saveDocument({
					type: analysis.documentType || "task",
					title: analysis.filePath,
					content: content,
					metadata: {
						originalPath: analysis.filePath,
						analysisResults: analysis,
						importDate: new Date(),
						source: "intelligent_import",
					},
				});
				logger.debug(`✅ Stored: ${analysis.filePath}`);
			} catch (error) {
				logger.error(`❌ Failed to store ${analysis.filePath}:`, error);
			}
		}
		logger.info("💾 Database import completed");
	}
	/**
	 * Get approval workflow status.
	 */
	/**
	 * Get approval workflow status.
	 *
	 * Provides current status of all approval gates created during
	 * the workflow process. Useful for monitoring progress and
	 * identifying pending manual reviews.
	 *
	 * @returns Array of approval gate status objects
	 *
	 * @example
	 * ```typescript
	 * const status = workflow.getApprovalStatus();
	 * const pending = status.filter(s => s.status === 'pending');
	 * console.log(`${pending.length} gates awaiting approval`);
	 * ```
	 */
	getApprovalStatus() {
		return this.workflowGates.map((gate) => ({
			gateId: gate.id,
			status: gate.status || "pending",
			filePath: gate.context?.fileAnalysis?.filePath || "unknown",
		}));
	}
}
