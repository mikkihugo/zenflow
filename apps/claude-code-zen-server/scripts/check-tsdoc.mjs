#!/usr/bin/env node

/**
 * @fileoverview TSDoc Coverage Checker
 *
 * Comprehensive TypeScript documentation coverage checker for @claude-zen packages.
 * Analyzes TypeScript files for JSDoc/TSDoc coverage and provides detailed reports.
 *
 * Features:
 * - Detects exports (functions, classes, interfaces, types, constants)
 * - Validates JSDoc presence and quality
 * - Generates coverage reports with actionable insights
 * - Supports multiple file analysis
 * - Configurable coverage thresholds
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuration for TSDoc coverage checking
 */
const CONFIG = {
	/** Minimum coverage threshold for success */
	COVERAGE_THRESHOLD: 90,
	/** File patterns to include */
	INCLUDE_PATTERNS: ["**/*.ts", "**/*.tsx"],
	/** File patterns to exclude */
	EXCLUDE_PATTERNS: [
		"**/*.test.ts",
		"**/*.test.tsx",
		"**/dist/**",
		"**/node_modules/**",
	],
	/** Directories to scan by default */
	DEFAULT_SCAN_DIRS: ["."],
	/** Output formatting options */
	OUTPUT: {
		showUndocumented: true,
		showDocumented: false,
		colorOutput: true,
		verbose: false,
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
 * Export detection result
 */
class ExportInfo {
	constructor(name, type, line, hasJSDoc = false, jsdocQuality = "none") {
		this.name = name;
		this.type = type;
		this.line = line;
		this.hasJSDoc = hasJSDoc;
		this.jsdocQuality = jsdocQuality;
	}
}

/**
 * File analysis result
 */
class FileAnalysis {
	constructor(filePath) {
		this.filePath = filePath;
		this.exports = [];
		this.documented = [];
		this.undocumented = [];
		this.coverage = 0;
		this.quality = "unknown";
	}

	/**
	 * Calculates coverage percentage
	 */
	calculateCoverage() {
		if (this.exports.length === 0) {
			this.coverage = 100;
			return this.coverage;
		}
		this.coverage = Math.round(
			(this.documented.length / this.exports.length) * 100,
		);
		return this.coverage;
	}

	/**
	 * Determines documentation quality rating
	 */
	assessQuality() {
		const coverage = this.calculateCoverage();
		if (coverage === 100) this.quality = "excellent";
		else if (coverage >= 90) this.quality = "good";
		else if (coverage >= 75) this.quality = "fair";
		else if (coverage >= 50) this.quality = "poor";
		else this.quality = "critical";
		return this.quality;
	}
}

/**
 * Checks if a line contains JSDoc documentation
 */
function hasJSDocAbove(lines, exportLineIndex) {
	let hasJSDoc = false;
	let jsdocStart = -1;
	let jsdocEnd = -1;

	// Look backwards from export line to find JSDoc
	for (
		let j = exportLineIndex - 1;
		j >= Math.max(0, exportLineIndex - 100);
		j--
	) {
		const line = lines[j].trim();

		if (line.endsWith("*/") && jsdocEnd === -1) {
			jsdocEnd = j;
		}

		if (line.startsWith("/**") && jsdocEnd !== -1) {
			jsdocStart = j;
			hasJSDoc = true;
			break;
		}

		// Stop if we hit non-comment, non-empty line
		if (
			line !== "" &&
			!line.startsWith("*") &&
			!line.startsWith("//") &&
			!line.startsWith("/**") &&
			!line.endsWith("*/")
		) {
			break;
		}
	}

	let quality = "none";
	if (hasJSDoc && jsdocStart !== -1 && jsdocEnd !== -1) {
		const jsdocLines = lines.slice(jsdocStart, jsdocEnd + 1);
		const jsdocContent = jsdocLines.join("\n");

		// Assess JSDoc quality
		if (
			jsdocContent.includes("@param") ||
			jsdocContent.includes("@returns") ||
			jsdocContent.includes("@example")
		) {
			quality = "comprehensive";
		} else if (jsdocContent.length > 100) {
			quality = "detailed";
		} else {
			quality = "basic";
		}
	}

	return { hasJSDoc, quality };
}

/**
 * Analyzes a TypeScript file for documentation coverage
 */
function analyzeFile(filePath) {
	const analysis = new FileAnalysis(filePath);

	if (!fs.existsSync(filePath)) {
    // eslint-disable-next-line no-console
		console.warn(colorize(`⚠️  File not found: ${filePath}`, "yellow"));
		return analysis;
	}

	const content = fs.readFileSync(filePath, "utf8");
	const lines = content.split("\n");

	// Regex patterns for different export types
	const exportPatterns = [
		{ type: "interface", regex: /^export\s+interface\s+(\w+)/ },
		{ type: "type", regex: /^export\s+type\s+(\w+)/ },
		{ type: "class", regex: /^export\s+class\s+(\w+)/ },
		{ type: "function", regex: /^export\s+function\s+(\w+)/ },
		{ type: "const", regex: /^export\s+const\s+(\w+)/ },
		{ type: "let", regex: /^export\s+let\s+(\w+)/ },
		{ type: "var", regex: /^export\s+var\s+(\w+)/ },
		{ type: "enum", regex: /^export\s+enum\s+(\w+)/ },
		{ type: "namespace", regex: /^export\s+namespace\s+(\w+)/ },
	];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();

		for (const pattern of exportPatterns) {
			const match = line.match(pattern.regex);
			if (match) {
				const exportName = match[1];
				const { hasJSDoc, quality } = hasJSDocAbove(lines, i);

				const exportInfo = new ExportInfo(
					exportName,
					pattern.type,
					i + 1,
					hasJSDoc,
					quality,
				);
				analysis.exports.push(exportInfo);

				if (hasJSDoc) {
					analysis.documented.push(exportInfo);
				} else {
					analysis.undocumented.push(exportInfo);
				}
				break;
			}
		}
	}

	analysis.calculateCoverage();
	analysis.assessQuality();

	return analysis;
}

/**
 * Generates a detailed report for a single file
 */
function generateFileReport(analysis) {
	const fileName = path.basename(analysis.filePath);
	const coverage = analysis.coverage;
	const quality = analysis.quality;

    // eslint-disable-next-line no-console
		console.log(`\n📄 ${colorize(fileName, "cyan")}`);
    // eslint-disable-next-line no-console
		console.log("─".repeat(50));
    // eslint-disable-next-line no-console
		console.log(`Total exports: ${analysis.exports.length}`);
    // eslint-disable-next-line no-console
		console.log(`Documented: ${colorize(analysis.documented.length, "green")}`);
    // eslint-disable-next-line no-console
		console.log(
		`Coverage: ${colorize(`${coverage}%`, coverage >= CONFIG.COVERAGE_THRESHOLD ? "green" : "red")}`,
	);
    // eslint-disable-next-line no-console
		console.log(
		`Quality: ${colorize(quality, quality === "excellent" ? "green" : quality === "good" ? "blue" : "yellow")}`,
	);

	// Show undocumented exports
	if (CONFIG.OUTPUT.showUndocumented && analysis.undocumented.length > 0) {
    // eslint-disable-next-line no-console
		console.log(
			`\n${colorize(`❌ Missing TSDoc (${analysis.undocumented.length}):`, "red")}`,
		);
		analysis.undocumented.forEach((exp) => {
    // eslint-disable-next-line no-console
		console.log(
				`   • ${colorize(exp.name, "yellow")} (${exp.type}, line ${exp.line})`,
			);
		});
	}

	// Show documented exports if requested
	if (CONFIG.OUTPUT.showDocumented && analysis.documented.length > 0) {
    // eslint-disable-next-line no-console
		console.log(
			`\n${colorize(`✅ Documented exports (${analysis.documented.length}):`, "green")}`,
		);
		analysis.documented.forEach((exp) => {
			const qualityColor =
				exp.jsdocQuality === "comprehensive"
					? "green"
					: exp.jsdocQuality === "detailed"
						? "blue"
						: "yellow";
    // eslint-disable-next-line no-console
		console.log(
				`   • ${exp.name} (${colorize(exp.jsdocQuality, qualityColor)})`,
			);
		});
	}

	return analysis;
}

/**
 * Generates overall summary report
 */
function generateSummaryReport(analyses) {
	const totalFiles = analyses.length;
	const totalExports = analyses.reduce((sum, a) => sum + a.exports.length, 0);
	const totalDocumented = analyses.reduce(
		(sum, a) => sum + a.documented.length,
		0,
	);
	const overallCoverage =
		totalExports > 0 ? Math.round((totalDocumented / totalExports) * 100) : 100;

    // eslint-disable-next-line no-console
		console.log(`\n${"═".repeat(60)}`);
    // eslint-disable-next-line no-console
		console.log(colorize("📊 TSDOC COVERAGE SUMMARY", "bright"));
    // eslint-disable-next-line no-console
		console.log("═".repeat(60));
    // eslint-disable-next-line no-console
		console.log(`Files analyzed: ${totalFiles}`);
    // eslint-disable-next-line no-console
		console.log(`Total exports: ${totalExports}`);
    // eslint-disable-next-line no-console
		console.log(`Total documented: ${colorize(totalDocumented, "green")}`);
    // eslint-disable-next-line no-console
		console.log(
		`Overall coverage: ${colorize(`${overallCoverage}%`, overallCoverage >= CONFIG.COVERAGE_THRESHOLD ? "green" : "red")}`,
	);

	// Quality assessment
	let qualityRating;
	let emoji;
	if (overallCoverage === 100) {
		qualityRating = "PERFECT";
		emoji = "🏆";
	} else if (overallCoverage >= 95) {
		qualityRating = "EXCELLENT";
		emoji = "🥇";
	} else if (overallCoverage >= 90) {
		qualityRating = "VERY GOOD";
		emoji = "🥈";
	} else if (overallCoverage >= 75) {
		qualityRating = "GOOD";
		emoji = "🥉";
	} else if (overallCoverage >= 50) {
		qualityRating = "NEEDS IMPROVEMENT";
		emoji = "📝";
	} else {
		qualityRating = "CRITICAL";
		emoji = "🚨";
	}

    // eslint-disable-next-line no-console
		console.log(
		`\n${emoji} ${colorize(qualityRating, "bright")} DOCUMENTATION COVERAGE! ${emoji}`,
	);

	// File breakdown by quality
	const qualityBreakdown = {};
	analyses.forEach((analysis) => {
		qualityBreakdown[analysis.quality] =
			(qualityBreakdown[analysis.quality] || 0) + 1;
	});

	if (Object.keys(qualityBreakdown).length > 1) {
    // eslint-disable-next-line no-console
		console.log(`\n📈 File Quality Breakdown:`);
		Object.entries(qualityBreakdown).forEach(([quality, count]) => {
			const color =
				quality === "excellent"
					? "green"
					: quality === "good"
						? "blue"
						: quality === "fair"
							? "yellow"
							: "red";
    // eslint-disable-next-line no-console
		console.log(`   ${colorize(quality, color)}: ${count} files`);
		});
	}

	return {
		totalFiles,
		totalExports,
		totalDocumented,
		overallCoverage,
		qualityRating,
		meetsThreshold: overallCoverage >= CONFIG.COVERAGE_THRESHOLD,
	};
}

/**
 * Gets TypeScript files to analyze
 */
function getFilesToAnalyze(directories = CONFIG.DEFAULT_SCAN_DIRS) {
	const files = [];

	for (const dir of directories) {
		if (fs.existsSync(dir)) {
			const entries = fs.readdirSync(dir, { withFileTypes: true });

			for (const entry of entries) {
				const fullPath = path.join(dir, entry.name);

				if (
					entry.isDirectory() &&
					!entry.name.startsWith(".") &&
					entry.name !== "node_modules"
				) {
					// Recursively scan subdirectories
					files.push(...getFilesToAnalyze([fullPath]));
				} else if (
					entry.isFile() &&
					entry.name.endsWith(".ts") &&
					!entry.name.endsWith(".test.ts")
				) {
					files.push(fullPath);
				}
			}
		}
	}

	return files;
}

/**
 * Main execution function
 */
function main() {
	const args = process.argv.slice(2);

	// Parse command line arguments
	if (args.includes("--help") || args.includes("-h")) {
    // eslint-disable-next-line no-console
		console.log(`
${colorize("TSDoc Coverage Checker", "bright")}
${colorize("Usage:", "blue")} node check-tsdoc.mjs [options] [files...]

${colorize("Options:", "blue")}
  --threshold <number>    Set coverage threshold (default: ${CONFIG.COVERAGE_THRESHOLD})
  --show-documented      Show documented exports in report
  --verbose              Enable verbose output
  --no-color             Disable colored output
  --help, -h             Show this help message

${colorize("Examples:", "blue")}
  node check-tsdoc.mjs                    # Check all TypeScript files
  node check-tsdoc.mjs src/index.ts       # Check specific file
  node check-tsdoc.mjs --threshold 95     # Set 95% threshold
    `);
		process.exit(0);
	}

	// Parse options
	if (args.includes("--show-documented")) {
		CONFIG.OUTPUT.showDocumented = true;
	}
	if (args.includes("--verbose")) {
		CONFIG.OUTPUT.verbose = true;
	}
	if (args.includes("--no-color")) {
		CONFIG.OUTPUT.colorOutput = false;
	}

	const thresholdIndex = args.indexOf("--threshold");
	if (thresholdIndex !== -1 && args[thresholdIndex + 1]) {
		CONFIG.COVERAGE_THRESHOLD = parseInt(args[thresholdIndex + 1], 10);
	}

	// Get files to analyze
	const fileArgs = args.filter(
		(arg) => !arg.startsWith("--") && !arg.match(/^\d+$/),
	);
	const filesToAnalyze = fileArgs.length > 0 ? fileArgs : getFilesToAnalyze();

	if (filesToAnalyze.length === 0) {
    // eslint-disable-next-line no-console
		console.warn(colorize("⚠️  No TypeScript files found to analyze", "yellow"));
		process.exit(1);
	}

    // eslint-disable-next-line no-console
		console.log(colorize("🔍 TSDoc Coverage Analysis", "bright"));
    // eslint-disable-next-line no-console
		console.log(colorize(`Analyzing ${filesToAnalyze.length} files...`, "blue"));

	// Analyze all files
	const analyses = filesToAnalyze.map(analyzeFile);

	// Check if this is a basic check (default threshold of 90)
	const isBasicCheck =
		CONFIG.COVERAGE_THRESHOLD === 90 && !args.includes("--threshold");

	// Generate reports
	analyses.forEach(generateFileReport);
	const summary = generateSummaryReport(analyses);

	// Add helpful message for basic check
	if (isBasicCheck && summary.overallCoverage < 100) {
    // eslint-disable-next-line no-console
		console.log(`\n${"─".repeat(60)}`);
    // eslint-disable-next-line no-console
		console.log(
			colorize("💡 TIP: For stricter documentation requirements", "cyan"),
		);
    // eslint-disable-next-line no-console
		console.log(
			colorize("Run: pnpm docs:check-strict", "bright") +
				colorize(" (requires 100% coverage)", "cyan"),
		);
    // eslint-disable-next-line no-console
		console.log(colorize("Or:  pnpm docs:check --threshold 100", "bright"));

		if (summary.overallCoverage >= 90) {
    // eslint-disable-next-line no-console
		console.log(
				`\n${colorize("🎯 Current coverage is good!", "green")} Consider aiming for 100% with strict mode.`,
			);
		} else {
    // eslint-disable-next-line no-console
		console.log(
				`\n${colorize("📈 Improve coverage first", "yellow")}, then try strict mode for perfection.`,
			);
		}
	}

	// Exit with appropriate code
	process.exit(summary.meetsThreshold ? 0 : 1);
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
	main();
}

export { analyzeFile, generateFileReport, generateSummaryReport, CONFIG };
