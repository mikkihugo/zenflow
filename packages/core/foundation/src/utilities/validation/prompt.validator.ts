/**
 * @fileoverview Claude Prompt Validation and Safety Filter
 *
 * Provides comprehensive validation and filtering for Claude prompts to prevent
 * parsing issues, malicious inputs, and ensure prompt quality. Implements multiple
 * validation layers including content analysis, safety checks, and output parsing
 * protection.
 *
 * Key Features:
 * - Prompt safety validation (detects malicious patterns)
 * - Output parsing protection (prevents Claude descriptive text from being parsed as data)
 * - Content quality validation (ensures prompts meet standards)
 * - Configurable filtering rules and thresholds
 * - Integration with Claude SDK safety mechanisms
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import { getLogger} from "../../core/logging/index.js";

const logger = getLogger("prompt-validation");

// Configuration for prompt validation
export const PROMPT_VALIDATION_CONFIG = {
	/** Maximum prompt length to prevent excessive processing */
	maxPromptLength:100000,
	/** Minimum prompt length to ensure meaningful requests */
	minPromptLength:10,
	/** Maximum lines in a single prompt */
	maxPromptLines:1000,
	/** Enable strict content validation */
	strictValidation:true,
	/** Enable output parsing protection */
	outputParsingProtection:true,
	/** Log validation failures for debugging */
	logValidationFailures:true,
} as const;

// Validation result types
export interface PromptValidationResult {
	isValid:boolean;
	filteredPrompt?:string;
	issues:PromptIssue[];
	risk:"low" | "medium" | "high" | "critical";
	recommendations?:string[];
}

export interface PromptIssue {
	type:"safety" | "parsing" | "quality" | "performance";
	severity:"info" | "warning" | "error" | "critical";
	message:string;
	location?:{
		line:number;
		column:number;
};
	suggestion?:string;
}

// Dangerous patterns that could cause parsing issues or security problems
const DANGEROUS_PATTERNS = [
	// Output parsing interference patterns
	{
		pattern:/📁\s*file:\s*[/\\]\S+/gi,
		type:"parsing" as const,
		severity:"error" as const,
		message:
			"Contains file path patterns that could interfere with output parsing",
		suggestion:
			"Use generic file references instead of specific paths with emojis",
},
	{
		pattern:
			/\b[a-z]:[/\\]\S+\.(ts|js|tsx|jsx|py|java|cpp|c|h|cs|php|rb|go|rs|swift|kt|scala|clj|hs|ml|fs|dart|lua|pl|r|m|sh|bat|ps1)\b/gi,
		type:"parsing" as const,
		severity:"warning" as const,
		message:"Contains specific file paths that may cause parsing confusion",
		suggestion:"Use relative paths or generic file references",
},
	// Injection patterns
	{
		pattern:/--dangerously-skip-permissions/gi,
		type:"safety" as const,
		severity:"critical" as const,
		message:"Contains dangerous permission bypass flags",
		suggestion:"Remove dangerous permission bypasses from prompts",
},
	{
		pattern:/\b(rm\s+-rf|del\s+\/[qs]|format\s+c:|sudo\s+rm)/gi,
		type:"safety" as const,
		severity:"critical" as const,
		message:"Contains potentially destructive system commands",
		suggestion:"Remove destructive system commands from prompts",
},
	// Command injection patterns
	{
		pattern:/[$&();[\]`{|}]/g,
		type:"safety" as const,
		severity:"warning" as const,
		message:
			"Contains shell metacharacters that could enable command injection",
		suggestion:"Escape or remove shell metacharacters",
},
	// Credential patterns
	{
		pattern:
			/\b(password|token|key|secret|api[_-]?key|auth[_-]?token)\s*[:=]\s*\S+/gi,
		type:"safety" as const,
		severity:"critical" as const,
		message:"Contains potential credentials or secrets",
		suggestion:"Remove credentials and use secure configuration instead",
},
];

// Quality patterns for good prompts
const QUALITY_PATTERNS = [
	{
		pattern:/\b(please|help|assist|can you|could you)\b/gi,
		type:"quality" as const,
		severity:"info" as const,
		message:"Uses polite language - good practice",
		suggestion:null,
},
	{
		pattern:/\b(step by step|systematic|detailed|comprehensive|thorough)\b/gi,
		type:"quality" as const,
		severity:"info" as const,
		message:"Requests systematic approach - good practice",
		suggestion:null,
},
];

/**
 * Basic validation for prompt input
 */
function validateBasicPromptInput(
	prompt:string,
):PromptValidationResult | null {
	if (!prompt || typeof prompt !== "string") {
		return {
			isValid:false,
			issues:[
				{
					type:"quality",
					severity:"critical",
					message:"Prompt must be a non-empty string",
},
],
			risk:"critical",
};
}
	return null;
}

/**
 * Validate prompt length and complexity
 */
function validatePromptLength(
	prompt:string,
	issues:PromptIssue[],
):"low" | "medium" | "high" | "critical" {
	let risk:"low" | "medium" | "high" | "critical" = "low";

	if (prompt.length > PROMPT_VALIDATION_CONFIG.maxPromptLength) {
		issues.push({
			type:"performance",
			severity:"error",
			message:`Prompt exceeds maximum length of ${PROMPT_VALIDATION_CONFIG.maxPromptLength} characters`,
			suggestion:"Break down the prompt into smaller, focused requests",
});
		risk = "high";
}

	if (prompt.length < PROMPT_VALIDATION_CONFIG.minPromptLength) {
		issues.push({
			type:"quality",
			severity:"warning",
			message:`Prompt is very short (${prompt.length} characters)`,
			suggestion:"Provide more specific details about what you need",
});
}

	const lines = prompt.split("\n");
	if (lines.length > PROMPT_VALIDATION_CONFIG.maxPromptLines) {
		issues.push({
			type:"performance",
			severity:"error",
			message:`Prompt has too many lines (${lines.length})`,
			suggestion:"Reduce prompt complexity or split into multiple requests",
});
		risk = "high";
}

	return risk;
}

/**
 * Update risk level based on severity
 */
function updateRiskLevel(
	severity:"critical" | "error" | "warning" | "info",
	currentRisk:"low" | "medium" | "high" | "critical",
):"low" | "medium" | "high" | "critical" {
	if (severity === "critical") {
		return "critical";
}
	if (severity === "error" && currentRisk !== "critical") {
		return "high";
}
	if (severity === "warning" && currentRisk === "low") {
		return "medium";
}
	return currentRisk;
}

/**
 * Check for dangerous patterns in prompt
 */
function checkDangerousPatterns(
	prompt:string,
	issues:PromptIssue[],
	currentRisk:"low" | "medium" | "high" | "critical",
):{ risk: "low" | "medium" | "high" | "critical"; filteredPrompt: string} {
	let risk = currentRisk;
	let filteredPrompt = prompt;

	for (const dangerousPattern of DANGEROUS_PATTERNS) {
		const matches = prompt.match(dangerousPattern.pattern);
		if (matches) {
			const issue:PromptIssue = {
				type:dangerousPattern.type,
				severity:dangerousPattern.severity,
				message:`${dangerousPattern['message']} (found ${matches.length} occurrence${matches.length > 1 ? "s" :""})`,
				suggestion:dangerousPattern.suggestion,
};

			issues.push(issue);
			risk = updateRiskLevel(dangerousPattern.severity, risk);

			// Apply filtering if configured
			if (
				PROMPT_VALIDATION_CONFIG.outputParsingProtection &&
				dangerousPattern.type === "parsing"
			) {
				filteredPrompt = filteredPrompt.replace(
					dangerousPattern.pattern,
					"[FILTERED_CONTENT]",
				);
				logger.debug("🧹 Filtered parsing interference pattern from prompt");
}
}
}

	return { risk, filteredPrompt};
}

/**
 * Check for quality patterns in prompt
 */
function checkQualityPatterns(prompt:string, issues:PromptIssue[]): void {
	for (const qualityPattern of QUALITY_PATTERNS) {
		const matches = prompt.match(qualityPattern.pattern);
		if (matches) {
			issues.push({
				type:qualityPattern.type,
				severity:qualityPattern.severity,
				message:qualityPattern['message'],
});
}
}
}

/**
 * Generate recommendations based on validation issues
 */
function generateRecommendations(issues:PromptIssue[]): string[] {
	const recommendations:string[] = [];
	const criticalIssues = issues.filter((i) => i.severity === "critical");
	const errorIssues = issues.filter((i) => i.severity === "error");

	if (criticalIssues.length > 0) {
		recommendations.push(
			"🚨 Address critical security issues before proceeding",
		);
		recommendations.push(
			...criticalIssues.map((i) => `• ${i.suggestion}`).filter(Boolean),
		);
}

	if (errorIssues.length > 0) {
		recommendations.push("⚠️  Fix error-level issues for better reliability");
		recommendations.push(
			...errorIssues.map((i) => `• ${i.suggestion}`).filter(Boolean),
		);
}

	return recommendations;
}

/**
 * Log validation results if configured
 */
function logValidationResults(
	isValid:boolean,
	risk:"low" | "medium" | "high" | "critical",
	issues:PromptIssue[],
):void {
	if (
		PROMPT_VALIDATION_CONFIG.logValidationFailures &&
		(!isValid || issues.length > 0)
	) {
		const criticalIssues = issues.filter((i) => i.severity === "critical");
		const errorIssues = issues.filter((i) => i.severity === "error");

		logger.warn("Prompt validation findings:", {
			isValid,
			risk,
			issueCount:issues.length,
			criticalIssues:criticalIssues.length,
			errorIssues:errorIssues.length,
});
}
}

/**
 * Validates a Claude prompt for safety, quality, and parsing compatibility.
 */
export function validatePrompt(prompt:string): PromptValidationResult {
	// Basic input validation
	const basicValidation = validateBasicPromptInput(prompt);
	if (basicValidation) {
		return basicValidation;
}

	const issues:PromptIssue[] = [];
	let risk = validatePromptLength(prompt, issues);

	const { risk:updatedRisk, filteredPrompt} = checkDangerousPatterns(
		prompt,
		issues,
		risk,
	);
	risk = updatedRisk;

	checkQualityPatterns(prompt, issues);

	const recommendations = generateRecommendations(issues);
	const criticalIssues = issues.filter((i) => i.severity === "critical");
	const isValid = risk !== "critical" && criticalIssues.length === 0;

	logValidationResults(isValid, risk, issues);

	return {
		isValid,
		filteredPrompt:filteredPrompt !== prompt ? filteredPrompt : undefined,
		issues,
		risk,
		recommendations:recommendations.length > 0 ? recommendations : undefined,
};
}

/**
 * Filters Claude output to prevent parsing as structured data when it's descriptive text.
 */
export function filterClaudeOutput(
	output:string,
	context:"stderr" | "stdout" = "stdout",
):{
	cleanOutput:string;
	filteredLines:string[];
	parsingWarnings:string[];
} {
	const lines = output.split("\n");
	const cleanLines:string[] = [];
	const filteredLines:string[] = [];
	const parsingWarnings:string[] = [];

	for (const line of lines) {
		const trimmedLine = line.trim();

		// Skip empty lines
		if (!trimmedLine) {
			cleanLines.push(line);
			continue;
}

		// Detect Claude's descriptive output patterns that should not be parsed as data
		const isDescriptivePattern = [
			// File path patterns with emojis (Claude's descriptive output)
			/^📁\s+(File:|Directory:|Path:)/,
			/^📄\s+/,
			/^🔍\s+/,
			// Progress indicators
			/^(✅|❌|⚠️|🔄|⏳|🚀|📊|📈|📉)\s+/,
			// Conversational patterns
			/^(i'll | i' m|let me|here's|this|the|based on)/i,
			// Analysis patterns
			/^(analysis:|summary:|results:|findings:)/i,
			// Lists with bullets
			/^\s*[•-]\s+/,
			// Numbered lists that are explanatory
			/^\s*\d+\.\s+(the | this | here | based | i)/i,
].some((pattern) => pattern.test(trimmedLine));

		// Special handling for stderr - be more conservative
		if (context === "stderr") {
			// Only include lines that look like actual error output from tools
			// TypeScript errors:path(line,col):error TSnnnn: message
			const isActualError =
				/^[\w./-]+\.tsx?\(\d+,\d+\):\s+(error|warning)\s+/i.test(trimmedLine);

			if (isDescriptivePattern && !isActualError) {
				filteredLines.push(line);
				parsingWarnings.push(
					`Filtered descriptive pattern from stderr:${trimmedLine.substring(0, 80)}...`,
				);
				continue;
}
}

		// Filter out obviously descriptive content
		if (isDescriptivePattern) {
			filteredLines.push(line);
			parsingWarnings.push(
				`Filtered descriptive pattern:${trimmedLine.substring(0, 80)}...`,
			);
			continue;
}

		cleanLines.push(line);
}

	return {
		cleanOutput:cleanLines.join("\n"),
		filteredLines,
		parsingWarnings,
};
}

/**
 * Validates a prompt and rejects it if it contains critical issues.
 */
export function validateAndRejectPrompt(prompt:string): string {
	const validation = validatePrompt(prompt);

	if (!validation.isValid) {
		const criticalIssues = validation.issues.filter(
			(i) => i.severity === "critical",
		);

		throw new Error(
			`Prompt validation failed with ${criticalIssues.length} critical issue(s): ${criticalIssues
				.map((i) => i['message'])
				.join("; ")}`,
		);
}

	// Return filtered prompt if available, otherwise original
	return validation.filteredPrompt || prompt;
}

/**
 * Enhanced prompt wrapper that applies validation and safety measures.
 */
export function createSafePrompt(
	basePrompt:string,
	options:{
		enableFiltering?:boolean;
		strictValidation?:boolean;
		logValidation?:boolean;
} = {},
):string {
	const config = {
		enableFiltering:
			options.enableFiltering ??
			PROMPT_VALIDATION_CONFIG.outputParsingProtection,
		strictValidation:
			options.strictValidation ?? PROMPT_VALIDATION_CONFIG.strictValidation,
		logValidation:
			options.logValidation ?? PROMPT_VALIDATION_CONFIG.logValidationFailures,
};

	// Always validate the prompt
	const validation = validatePrompt(basePrompt);

	if (config.logValidation && validation.issues.length > 0) {
		logger.info(
			`Prompt safety analysis found ${validation.issues.length} issue(s), risk level:${validation.risk}`,
		);
}

	// Reject if strict validation enabled and prompt has critical issues
	if (config.strictValidation && !validation.isValid) {
		throw new Error(
			`Prompt rejected due to safety concerns: ${validation.issues
				.filter((i) => i.severity === "critical")
				.map((i) => i['message'])
				.join("; ")}`,
		);
}

	// Apply filtering if enabled and available
	if (config.enableFiltering && validation.filteredPrompt) {
		logger.debug("Applied safety filtering to prompt");
		return validation.filteredPrompt;
}

	return basePrompt;
}

/**
 * Integration function for Claude SDK to apply prompt validation.
 */
export function wrapClaudePrompt(prompt:string): string {
	try {
		return createSafePrompt(prompt, {
			enableFiltering:true,
			strictValidation:true,
			logValidation:true,
});
} catch (error) {
		logger.error("Claude prompt validation failed:", error);
		throw error;
}
}

export default {
	validatePrompt,
	filterClaudeOutput,
	validateAndRejectPrompt,
	createSafePrompt,
	wrapClaudePrompt,
	PROMPT_VALIDATION_CONFIG,
};
