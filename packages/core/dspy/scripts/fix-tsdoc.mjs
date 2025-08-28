#!/usr/bin/env node

/**
 * @fileoverview TSDoc Auto-Fix Script
 *
 * Automatically improves TypeScript documentation using Claude CLI for files
 * that don't meet 100% TSDoc coverage requirements. Uses the TSDoc check script
 * to identify files needing documentation improvements and feeds them to Claude
 * for automatic enhancement.
 *
 * Features:
 * - Scans for TypeScript files with incomplete documentation
 * - Uses Claude CLI with bypass permissions for automated fixes
 * - Provides detailed prompts for high-quality TSDoc generation
 * - Supports batch processing and individual file targeting
 * - Validates improvements after Claude processes files
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuration for TSDoc auto-fix operations
 */
const CONFIG = {
	/** Minimum coverage threshold to trigger fixes */
	COVERAGE_THRESHOLD: 100,
	/** Maximum files to process in one batch */
	MAX_BATCH_SIZE: 5,
	/** Claude CLI model to use */
	CLAUDE_MODEL: "sonnet",
	/** Prompt enhancement options */
	PROMPT: {
		includeAnalysisReport: true,
		includeSystemInstructions: true,
		includeContextGuidelines: true,
		enhancedMode: true,
	},
	/** Output options */
	OUTPUT: {
		verbose: false,
		showProgress: true,
		colorOutput: true,
		generateReport: true,
		maxReportExports: 100,
	},
};

/**
 * ANSI color codes for terminal output
 */
const COLORS = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
};

/**
 * Colorizes text for terminal output
 */
function colorize(text, color) {
	if (!CONFIG.OUTPUT.colorOutput) return text;
	return `${COLORS[color]}${text}${COLORS.reset}`;
}

/**
 * Runs the TSDoc check script and returns analysis results
 */
async function runTSDocCheck(filePath = ".") {
	return new Promise((resolve, reject) => {
		const checkScript = path.join(__dirname, "check-tsdoc.mjs");
		const args = ["--threshold", "100", "--no-color"];

		if (filePath !== ".") {
			args.push(filePath);
		}

		const child = spawn("node", [checkScript, ...args], {
			cwd: path.dirname(__dirname),
			stdio: ["pipe", "pipe", "pipe"],
		});

		let stdout = "";
		let _stderr = "";

		child.stdout.on("data", (data) => {
			stdout += data.toString();
		});

		child.stderr.on("data", (data) => {
			_stderr += data.toString();
		});

		child.on("close", (code) => {
			// Parse the output to extract file analysis
			const files = [];
			const lines = stdout.split("\n");

			let currentFile = null;
			let currentCoverage = 0;
			let undocumentedExports = [];

			for (const line of lines) {
				const fileMatch = line.match(/📄\s+(.+\.ts)/);
				if (fileMatch) {
					if (currentFile && currentCoverage < 100) {
						files.push({
							path: currentFile,
							coverage: currentCoverage,
							undocumented: [...undocumentedExports],
						});
					}
					currentFile = fileMatch[1];
					undocumentedExports = [];
				}

				const coverageMatch = line.match(/Coverage:\s+(\d+)%/);
				if (coverageMatch) {
					currentCoverage = parseInt(coverageMatch[1], 10);
				}

				const undocumentedMatch = line.match(
					/•\s+(\w+)\s+\((\w+),\s+line\s+(\d+)\)/,
				);
				if (undocumentedMatch) {
					undocumentedExports.push({
						name: undocumentedMatch[1],
						type: undocumentedMatch[2],
						line: parseInt(undocumentedMatch[3], 10),
					});
				}
			}

			// Add the last file if it needs fixes
			if (currentFile && currentCoverage < 100) {
				files.push({
					path: currentFile,
					coverage: currentCoverage,
					undocumented: [...undocumentedExports],
				});
			}

			resolve({ files, exitCode: code });
		});

		child.on("error", (error) => {
			reject(new Error(`Failed to run TSDoc check: ${error.message}`));
		});
	});
}

/**
 * Generates a comprehensive prompt for Claude to improve TSDoc
 */
function generateTSDocPrompt(
	filePath,
	undocumentedExports,
	analysisReport = null,
) {
	const exportsList = undocumentedExports
		.map((exp) => `- ${exp.name} (${exp.type}) at line ${exp.line}`)
		.join("\n");

	// Use enhanced mode or simple prompts based on configuration
	if (!CONFIG.PROMPT.enhancedMode) {
		// Simple prompt mode
		return `Please add comprehensive TSDoc documentation to this TypeScript file. The following exports need documentation:

${exportsList}

Requirements:
1. Add proper JSDoc comments (/** */) above each undocumented export
2. Include clear descriptions of what each function/class/interface does
3. Add @param tags for all parameters with descriptions
4. Add @returns tags for functions with return value descriptions
5. Include @example tags showing realistic usage when helpful
6. Add @since tags for version information (use 1.0.0)
7. For errors/exceptions, add @throws tags when applicable
8. Keep descriptions concise but informative
9. Use consistent style matching existing documentation in the file

Please analyze the file and add high-quality TSDoc documentation for all missing exports. Maintain the existing code structure and only add documentation comments.`;
	}

	// Enhanced mode with full context and instructions
	const fileContext = `
📁 File: ${filePath}
📊 Missing Documentation: ${undocumentedExports.length} exports
🎯 Target: 100% TSDoc coverage
🏗️ Project: claude-code-zen (AI swarm orchestration platform)`;

	// Add analysis report if enabled and provided
	const reportSection =
		CONFIG.PROMPT.includeAnalysisReport && analysisReport
			? `

📋 ANALYSIS REPORT:
${analysisReport}`
			: "";

	// System instructions section
	const systemInstructions = CONFIG.PROMPT.includeSystemInstructions
		? `SYSTEM INSTRUCTIONS:
You are a technical documentation expert specializing in TypeScript and TSDoc/JSDoc standards.
Your task is to add comprehensive, professional-grade documentation to TypeScript exports.

CRITICAL REQUIREMENTS:
1. ONLY add documentation comments - DO NOT modify any existing code
2. Follow TSDoc/JSDoc standards exactly (/** */ syntax)
3. Place documentation immediately above each export
4. Maintain existing code formatting and structure
5. Use consistent style with any existing documentation in the file

DOCUMENTATION STANDARDS:
- Use /** */ for all documentation blocks
- Start descriptions with capital letters, end with periods
- Use present tense ("Creates a..." not "Will create a...")
- Be specific about functionality, constraints, and side effects
- Include @param, @returns, @throws, @example, @since tags as appropriate
- Use @see tags to reference related functions/classes
- Add realistic @example blocks for complex functionality

`
		: "";

	// Context guidelines section
	const contextGuidelines = CONFIG.PROMPT.includeContextGuidelines
		? `
CONTEXT GUIDELINES:
- This is part of the claude-code-zen AI swarm orchestration platform
- Focus on practical usage and integration points
- Mention important performance, security, or architectural considerations
- Use domain-appropriate terminology (agents, swarms, coordination, etc.)
- Link related exports using @see tags when helpful

`
		: "";

	const userPrompt = `USER TASK:
Add comprehensive TSDoc documentation to this TypeScript file for the following undocumented exports:

${exportsList}

QUALITY REQUIREMENTS:
1. ✅ Clear, concise descriptions of what each export does
2. ✅ Complete @param documentation with types and descriptions
3. ✅ Accurate @returns documentation for all functions
4. ✅ @throws documentation for functions that can throw errors
5. ✅ @example blocks for complex or important functionality
6. ✅ @since 1.0.0 tags for version tracking
7. ✅ Professional tone suitable for API documentation
8. ✅ Consistency with existing documentation style in the file
${contextGuidelines}
Please analyze the file context and add high-quality TSDoc documentation that meets professional standards.`;

	return `${fileContext}${reportSection}

${systemInstructions}${userPrompt}`;
}

/**
 * Generates an analysis report for a file needing documentation
 */
function generateAnalysisReport(_filePath, fileAnalysis) {
	const { coverage, undocumented } = fileAnalysis;

	const typeBreakdown = undocumented.reduce((acc, exp) => {
		acc[exp.type] = (acc[exp.type] || 0) + 1;
		return acc;
	}, {});

	const typesList = Object.entries(typeBreakdown)
		.map(([type, count]) => `${count} ${type}${count > 1 ? "s" : ""}`)
		.join(", ");

	return `Current Coverage: ${coverage}% (${undocumented.length} undocumented exports)
Export Types: ${typesList}
Priority: ${coverage < 50 ? "HIGH" : coverage < 80 ? "MEDIUM" : "LOW"}
File Complexity: ${undocumented.length > 20 ? "Complex" : undocumented.length > 10 ? "Moderate" : "Simple"}
Recommendation: Focus on ${undocumented
		.slice(0, 3)
		.map((e) => e.name)
		.join(
			", ",
		)}${undocumented.length > 3 ? ` and ${undocumented.length - 3} others` : ""}`;
}

/**
 * Uses Claude CLI to improve documentation for a file
 */
async function fixFileWithClaude(
	filePath,
	undocumentedExports,
	fileAnalysis = null,
) {
	return new Promise((resolve, reject) => {
		// Generate analysis report if file analysis is provided
		const analysisReport = fileAnalysis
			? generateAnalysisReport(filePath, fileAnalysis)
			: null;
		const prompt = generateTSDocPrompt(
			filePath,
			undocumentedExports,
			analysisReport,
		);

    // eslint-disable-next-line no-console
		console.log(
			colorize(
				`🔧 Fixing documentation in ${path.basename(filePath)}...`,
				"blue",
			),
		);

		if (CONFIG.OUTPUT.verbose) {
    // eslint-disable-next-line no-console
			console.log(colorize("📝 Enhanced Prompt Preview:", "cyan"));
    // eslint-disable-next-line no-console
			console.log(`${prompt.substring(0, 300)}...\n`);
			if (analysisReport) {
    // eslint-disable-next-line no-console
				console.log(colorize("📊 Analysis Report:", "magenta"));
    // eslint-disable-next-line no-console
				console.log(analysisReport);
    // eslint-disable-next-line no-console
				console.log("");
			}
		}

		const args = [
			"--dangerously-skip-permissions",
			"--print",
			"--model",
			CONFIG.CLAUDE_MODEL,
			"--add-dir",
			path.dirname(path.resolve(filePath)),
			prompt,
		];

		const child = spawn("claude", args, {
			stdio: ["pipe", "pipe", "pipe"],
		});

		let stdout = "";
		let stderr = "";

		child.stdout.on("data", (data) => {
			stdout += data.toString();
		});

		child.stderr.on("data", (data) => {
			stderr += data.toString();
		});

		child.on("close", (code) => {
			if (code === 0) {
    // eslint-disable-next-line no-console
				console.log(
					colorize(
						`✅ Claude completed documentation improvements for ${path.basename(filePath)}`,
						"green",
					),
				);
				resolve({ success: true, output: stdout });
			} else {
    // eslint-disable-next-line no-console
				console.error(
					colorize(
						`❌ Claude failed to process ${path.basename(filePath)}`,
						"red",
					),
				);
				if (stderr) {
    // eslint-disable-next-line no-console
					console.error(colorize("Error details:", "red"));
    // eslint-disable-next-line no-console
					console.error(stderr);
				}
				resolve({ success: false, error: stderr });
			}
		});

		child.on("error", (error) => {
			reject(new Error(`Failed to run Claude CLI: ${error.message}`));
		});
	});
}

/**
 * Validates that fixes were applied successfully
 */
async function validateFixes(filePath) {
	try {
		const result = await runTSDocCheck(filePath);
		const fileResult = result.files.find(
			(f) => f.path === path.basename(filePath),
		);

		if (!fileResult) {
			// File not found in results means 100% coverage
			return { success: true, coverage: 100 };
		}

		return {
			success: fileResult.coverage === 100,
			coverage: fileResult.coverage,
			remaining: fileResult.undocumented.length,
		};
	} catch (error) {
		return { success: false, error: error.message };
	}
}

/**
 * Processes a batch of files for documentation improvements
 */
async function processBatch(files) {
    // eslint-disable-next-line no-console
	console.log(
		colorize(
			`\n🚀 Processing ${files.length} files for documentation improvements...`,
			"bright",
		),
	);

	const results = [];

	for (const file of files) {
		try {
    // eslint-disable-next-line no-console
			console.log(`\n${"─".repeat(50)}`);
    // eslint-disable-next-line no-console
			console.log(colorize(`📁 Processing: ${file.path}`, "cyan"));
    // eslint-disable-next-line no-console
			console.log(colorize(`📊 Current coverage: ${file.coverage}%`, "yellow"));
    // eslint-disable-next-line no-console
			console.log(
				colorize(
					`📝 Undocumented exports: ${file.undocumented.length}`,
					"yellow",
				),
			);

			// Fix with Claude (include analysis data for enhanced prompts)
			const claudeResult = await fixFileWithClaude(
				file.path,
				file.undocumented,
				file,
			);

			if (claudeResult.success) {
				// Validate improvements
    // eslint-disable-next-line no-console
				console.log(colorize("🔍 Validating improvements...", "blue"));
				const validation = await validateFixes(file.path);

				if (validation.success) {
    // eslint-disable-next-line no-console
					console.log(
						colorize(
							`🎉 SUCCESS: ${file.path} now has 100% coverage!`,
							"green",
						),
					);
					results.push({ file: file.path, success: true, finalCoverage: 100 });
				} else {
    // eslint-disable-next-line no-console
					console.log(
						colorize(
							`⚠️  PARTIAL: ${file.path} improved to ${validation.coverage}% (${validation.remaining} exports remaining)`,
							"yellow",
						),
					);
					results.push({
						file: file.path,
						success: false,
						finalCoverage: validation.coverage,
						remaining: validation.remaining,
					});
				}
			} else {
    // eslint-disable-next-line no-console
				console.log(
					colorize(`❌ FAILED: Could not improve ${file.path}`, "red"),
				);
				results.push({
					file: file.path,
					success: false,
					error: claudeResult.error,
				});
			}
		} catch (error) {
    // eslint-disable-next-line no-console
			console.error(
				colorize(`💥 ERROR processing ${file.path}: ${error.message}`, "red"),
			);
			results.push({ file: file.path, success: false, error: error.message });
		}
	}

	return results;
}

/**
 * Generates a detailed documentation report file
 */
async function generateDetailedReport(results, checkResult) {
	if (!CONFIG.OUTPUT.generateReport) return null;

	const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
	const reportPath = `tsdoc-fix-report-${timestamp}.md`;

	const successful = results.filter((r) => r.success);
	const failed = results.filter((r) => !r.success);
	const partial = results.filter((r) => !r.success && r.finalCoverage);

	const totalExportsBefore = checkResult.files.reduce(
		(sum, f) => sum + f.undocumented.length,
		0,
	);
	const totalExportsFixed = successful.reduce((sum, r) => {
		const originalFile = checkResult.files.find((f) => f.path === r.file);
		return sum + (originalFile ? originalFile.undocumented.length : 0);
	}, 0);

	const reportContent = `# TSDoc Auto-Fix Report

## Summary
- **Generated**: ${new Date().toISOString()}
- **Total Files Processed**: ${results.length}
- **Successfully Fixed**: ${successful.length} (${((successful.length / results.length) * 100).toFixed(1)}%)
- **Partially Improved**: ${partial.length}
- **Failed**: ${failed.length}
- **Total Exports Fixed**: ${totalExportsFixed} / ${totalExportsBefore}

## Configuration Used
- **Claude Model**: ${CONFIG.CLAUDE_MODEL}
- **Batch Size**: ${CONFIG.MAX_BATCH_SIZE}
- **Enhanced Prompts**: ${CONFIG.PROMPT.enhancedMode ? "✅ Enabled" : "❌ Disabled"}
- **Analysis Reports**: ${CONFIG.PROMPT.includeAnalysisReport ? "✅ Included" : "❌ Not included"}

## Successful Fixes
${
	successful.length > 0
		? successful
				.map((r) => {
					const originalFile = checkResult.files.find((f) => f.path === r.file);
					const exportCount = originalFile
						? originalFile.undocumented.length
						: 0;
					return `- **${r.file}** - Fixed ${exportCount} exports (100% coverage achieved)`;
				})
				.join("\n")
		: "_No files were completely fixed._"
}

## Partial Improvements
${
	partial.length > 0
		? partial
				.map((r) => {
					const originalFile = checkResult.files.find((f) => f.path === r.file);
					const originalCount = originalFile
						? originalFile.undocumented.length
						: 0;
					const remaining = r.remaining || 0;
					const fixed = originalCount - remaining;
					return `- **${r.file}** - Fixed ${fixed}/${originalCount} exports (${r.finalCoverage}% coverage, ${remaining} remaining)`;
				})
				.join("\n")
		: "_No files were partially improved._"
}

## Failed Files
${
	failed.length > 0
		? failed
				.map((r) => {
					const error = r.error ? ` - Error: ${r.error}` : "";
					return `- **${r.file}**${error}`;
				})
				.join("\n")
		: "_No files failed to process._"
}

## Original Analysis
${checkResult.files
	.map((f) => {
		const types = f.undocumented.reduce((acc, exp) => {
			acc[exp.type] = (acc[exp.type] || 0) + 1;
			return acc;
		}, {});
		const typesList = Object.entries(types)
			.map(([type, count]) => `${count} ${type}${count > 1 ? "s" : ""}`)
			.join(", ");

		// Limit exports shown in report to prevent massive files
		const exportsToShow = f.undocumented.slice(
			0,
			CONFIG.OUTPUT.maxReportExports,
		);
		const hasMore = f.undocumented.length > CONFIG.OUTPUT.maxReportExports;

		return `### ${f.path}
- **Coverage**: ${f.coverage}%
- **Missing Documentation**: ${f.undocumented.length} exports
- **Export Types**: ${typesList}
- **Exports Needing Documentation**${hasMore ? ` (showing first ${CONFIG.OUTPUT.maxReportExports} of ${f.undocumented.length})` : ""}:
${exportsToShow.map((exp) => `  - \`${exp.name}\` (${exp.type}) at line ${exp.line}`).join("\n")}${hasMore ? `\n  - ... and ${f.undocumented.length - CONFIG.OUTPUT.maxReportExports} more exports` : ""}`;
	})
	.join("\n\n")}

## Recommendations
${
	results.length === successful.length
		? "🎉 **All files successfully documented!** Your project now has excellent TSDoc coverage."
		: `### Next Steps
${partial.length > 0 ? "1. **Review Partially Improved Files**: Re-run the fix script on files that didn't reach 100% coverage\n" : ""}${failed.length > 0 ? "2. **Address Failed Files**: Check error messages and manually review files that failed processing\n" : ""}3. **Quality Review**: Manually review generated documentation for accuracy and completeness
4. **Integration**: Run \`pnpm docs:check-strict\` to verify all documentation meets requirements
5. **Maintenance**: Set up CI/CD checks to maintain documentation quality over time`
}

---
*Generated by claude-code-zen TSDoc Auto-Fix System*
`;

	try {
		await fs.promises.writeFile(reportPath, reportContent, "utf8");
		return reportPath;
	} catch (error) {
    // eslint-disable-next-line no-console
		console.warn(
			colorize(
				`⚠️  Could not generate detailed report: ${error.message}`,
				"yellow",
			),
		);
		return null;
	}
}

/**
 * Generates a summary report of the fix operations
 */
function generateSummaryReport(results) {
    // eslint-disable-next-line no-console
	console.log(`\n${"═".repeat(60)}`);
    // eslint-disable-next-line no-console
	console.log(colorize("📊 TSDOC FIX SUMMARY", "bright"));
    // eslint-disable-next-line no-console
	console.log("═".repeat(60));

	const successful = results.filter((r) => r.success);
	const failed = results.filter((r) => !r.success);
	const partial = results.filter((r) => !r.success && r.finalCoverage);

    // eslint-disable-next-line no-console
	console.log(`Total files processed: ${results.length}`);
    // eslint-disable-next-line no-console
	console.log(colorize(`✅ Successfully fixed: ${successful.length}`, "green"));
    // eslint-disable-next-line no-console
	console.log(colorize(`⚠️  Partially improved: ${partial.length}`, "yellow"));
    // eslint-disable-next-line no-console
	console.log(colorize(`❌ Failed: ${failed.length}`, "red"));

	if (successful.length > 0) {
    // eslint-disable-next-line no-console
		console.log(colorize("\n🎉 Successfully fixed files:", "green"));
    // eslint-disable-next-line no-console
		successful.forEach((r) => console.log(`   • ${r.file}`));
	}

	if (partial.length > 0) {
    // eslint-disable-next-line no-console
		console.log(colorize("\n⚠️  Partially improved files:", "yellow"));
		partial.forEach((r) =>
    // eslint-disable-next-line no-console
			console.log(
				`   • ${r.file} (${r.finalCoverage}%, ${r.remaining} exports remaining)`,
			),
		);
	}

	if (failed.length > 0) {
    // eslint-disable-next-line no-console
		console.log(colorize("\n❌ Failed files:", "red"));
    // eslint-disable-next-line no-console
		failed.forEach((r) => console.log(`   • ${r.file}`));
	}

	const overallSuccess = (successful.length / results.length) * 100;
    // eslint-disable-next-line no-console
	console.log(
		`\n${colorize("Overall success rate:", "bright")} ${overallSuccess.toFixed(1)}%`,
	);

	return {
		total: results.length,
		successful: successful.length,
		partial: partial.length,
		failed: failed.length,
		successRate: overallSuccess,
	};
}

/**
 * Main execution function
 */
async function main() {
	const args = process.argv.slice(2);

	// Parse command line arguments
	if (args.includes("--help") || args.includes("-h")) {
    // eslint-disable-next-line no-console
		console.log(`
${colorize("TSDoc Auto-Fix with Claude CLI", "bright")}
${colorize("Enhanced prompts with system instructions and analysis reports", "cyan")}

${colorize("Usage:", "blue")} node fix-tsdoc.mjs [options] [files...]

${colorize("Options:", "blue")}
  --model <model>           Claude model to use (default: ${CONFIG.CLAUDE_MODEL})
  --batch-size <number>     Maximum files per batch (default: ${CONFIG.MAX_BATCH_SIZE})
  --verbose                 Enable verbose output with enhanced prompt preview
  --no-color                Disable colored output
  --no-report               Disable detailed markdown report generation
  --simple-prompts          Use basic prompts without enhanced instructions
  --no-analysis             Disable analysis reports in prompts
  --help, -h                Show this help message

${colorize("Enhanced Features:", "blue")}
  ✅ System instructions with TSDoc standards
  ✅ Analysis reports with file context
  ✅ Professional documentation guidelines
  ✅ Project-specific context (claude-code-zen)
  ✅ Detailed markdown reports with recommendations

${colorize("Examples:", "blue")}
  node fix-tsdoc.mjs                    # Fix all files with enhanced prompts
  node fix-tsdoc.mjs src/index.ts       # Fix specific file with full enhancement
  node fix-tsdoc.mjs --model opus       # Use Claude Opus model for highest quality
  node fix-tsdoc.mjs --verbose          # Show enhanced prompt previews and analysis
  node fix-tsdoc.mjs --simple-prompts   # Use basic prompts without enhancements
  node fix-tsdoc.mjs --no-report        # Skip detailed report generation
    `);
		process.exit(0);
	}

	// Parse options
	if (args.includes("--verbose")) {
		CONFIG.OUTPUT.verbose = true;
	}
	if (args.includes("--no-color")) {
		CONFIG.OUTPUT.colorOutput = false;
	}
	if (args.includes("--no-report")) {
		CONFIG.OUTPUT.generateReport = false;
	}
	if (args.includes("--simple-prompts")) {
		CONFIG.PROMPT.enhancedMode = false;
		CONFIG.PROMPT.includeSystemInstructions = false;
		CONFIG.PROMPT.includeContextGuidelines = false;
	}
	if (args.includes("--no-analysis")) {
		CONFIG.PROMPT.includeAnalysisReport = false;
	}

	const modelIndex = args.indexOf("--model");
	if (modelIndex !== -1 && args[modelIndex + 1]) {
		CONFIG.CLAUDE_MODEL = args[modelIndex + 1];
	}

	const batchIndex = args.indexOf("--batch-size");
	if (batchIndex !== -1 && args[batchIndex + 1]) {
		CONFIG.MAX_BATCH_SIZE = parseInt(args[batchIndex + 1], 10);
	}

    // eslint-disable-next-line no-console
	console.log(colorize("🔍 TSDoc Auto-Fix with Claude CLI", "bright"));
    // eslint-disable-next-line no-console
	console.log(colorize(`Using model: ${CONFIG.CLAUDE_MODEL}`, "blue"));

	try {
		// Get files to analyze
		const fileArgs = args.filter(
			(arg) =>
				!arg.startsWith("--") &&
				!arg.match(/^\d+$/) &&
				arg !== CONFIG.CLAUDE_MODEL,
		);
		const targetPath = fileArgs.length > 0 ? fileArgs[0] : ".";

    // eslint-disable-next-line no-console
		console.log(colorize("🔍 Analyzing TSDoc coverage...", "blue"));
		const checkResult = await runTSDocCheck(targetPath);

		if (checkResult.files.length === 0) {
    // eslint-disable-next-line no-console
			console.log(
				colorize(
					"🎉 No files need documentation improvements! All files have 100% coverage.",
					"green",
				),
			);
			process.exit(0);
		}

    // eslint-disable-next-line no-console
		console.log(
			colorize(
				`📋 Found ${checkResult.files.length} files needing documentation improvements`,
				"yellow",
			),
		);

		// Process files in batches
		const batches = [];
		for (let i = 0; i < checkResult.files.length; i += CONFIG.MAX_BATCH_SIZE) {
			batches.push(checkResult.files.slice(i, i + CONFIG.MAX_BATCH_SIZE));
		}

		const allResults = [];

		for (let i = 0; i < batches.length; i++) {
    // eslint-disable-next-line no-console
			console.log(
				colorize(
					`\n📦 Processing batch ${i + 1}/${batches.length}...`,
					"magenta",
				),
			);
			const batchResults = await processBatch(batches[i]);
			allResults.push(...batchResults);
		}

		// Generate summary and detailed report
		const summary = generateSummaryReport(allResults);

		// Generate detailed markdown report
		const reportPath = await generateDetailedReport(allResults, checkResult);
		if (reportPath) {
    // eslint-disable-next-line no-console
			console.log(
				colorize(`\n📄 Detailed report generated: ${reportPath}`, "blue"),
			);
    // eslint-disable-next-line no-console
			console.log(
				colorize(
					"   Use this report for documentation reviews and project tracking",
					"cyan",
				),
			);
		}

		// Exit with appropriate code
		process.exit(summary.successful === summary.total ? 0 : 1);
	} catch (error) {
    // eslint-disable-next-line no-console
		console.error(colorize(`💥 Fatal error: ${error.message}`, "red"));
		process.exit(1);
	}
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch((error) => {
    // eslint-disable-next-line no-console
		console.error(colorize(`💥 Unhandled error: ${error.message}`, "red"));
		process.exit(1);
	});
}

export { runTSDocCheck, fixFileWithClaude, validateFixes, CONFIG };
