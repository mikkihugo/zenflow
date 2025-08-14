
    import { createRequire } from 'module';
    import { fileURLToPath } from 'url';
    import { dirname } from 'path';
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const require = createRequire(import.meta.url);
    
import {
  __name
} from "./chunk-O4JO3PGD.js";

// src/fact-integration/rust-fact-bridge.ts
import { spawn } from "child_process";
import { join } from "path";
import { EventEmitter } from "events";
var RustFactBridge = class extends EventEmitter {
  static {
    __name(this, "RustFactBridge");
  }
  config;
  binaryPath;
  isInitialized = false;
  constructor(config = {}) {
    super();
    this.config = {
      binaryPath: join(__dirname, "../../fact-core/target/release/fact-core"),
      cacheSize: 100 * 1024 * 1024,
      // 100MB
      timeout: 3e4,
      // 30 seconds
      monitoring: true,
      ...config
    };
    this.binaryPath = this.config.binaryPath;
  }
  /**
   * Initialize the Rust FACT system
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }
    try {
      const testResult = await this.executeCommand("--version");
      console.log(`Rust FACT initialized: ${testResult.stdout.trim()}`);
      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize Rust FACT: ${error}`);
    }
  }
  /**
   * Process data using a Rust FACT template
   */
  async process(request) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    const command = "process";
    const args = [
      "--template",
      request.templateId,
      "--context",
      JSON.stringify(request.context)
    ];
    if (request.options?.timeout) {
      args.push("--timeout", request.options.timeout.toString());
    }
    if (request.options?.priority) {
      args.push("--priority", request.options.priority);
    }
    if (request.options?.noCache) {
      args.push("--no-cache");
    }
    try {
      const result = await this.executeCommand(command, args);
      const output = JSON.parse(result.stdout);
      this.emit("processed", {
        templateId: request.templateId,
        success: true,
        processingTime: output.metadata?.processingTimeMs || 0
      });
      return output;
    } catch (error) {
      this.emit("error", {
        templateId: request.templateId,
        error: error instanceof Error ? error.message : "Unknown error"
      });
      throw error;
    }
  }
  /**
   * Process version-specific tool knowledge with GitHub integration
   */
  async processToolKnowledge(toolName, version, knowledgeType = "docs") {
    const factResult = await this.process({
      templateId: "tool-knowledge-extraction",
      context: {
        tool: toolName,
        version,
        knowledgeType,
        versionedSubject: `${toolName}@${version}`
      }
    });
    if (this.shouldEnhanceWithGitHub(factResult, knowledgeType)) {
      try {
        const githubAnalysis = await this.enhanceWithGitHubKnowledge(toolName, version, knowledgeType);
        return this.mergeFACTAndGitHubKnowledge(factResult, githubAnalysis);
      } catch (error) {
        console.warn(`GitHub enhancement failed for ${toolName}@${version}:`, error);
        return factResult;
      }
    }
    return factResult;
  }
  /**
   * Enhance tool knowledge with GitHub repository analysis
   */
  async enhanceWithGitHubKnowledge(toolName, version, knowledgeType) {
    const { GitHubCodeAnalyzer } = await import("./github-code-analyzer-MYCYN5ET.js");
    const analyzer = new GitHubCodeAnalyzer();
    if (this.isBeamEcosystemTool(toolName)) {
      const hexAnalysis = await analyzer.analyzeHexPackageRepos(toolName, version);
      return analyzer.generateFACTEntries(toolName, version, hexAnalysis);
    }
    return this.analyzeGeneralToolRepos(analyzer, toolName, version, knowledgeType);
  }
  async analyzeGeneralToolRepos(analyzer, toolName, version, knowledgeType) {
    const searchQueries = [
      `${toolName} example`,
      `${toolName} tutorial`,
      `"${toolName}" usage`,
      `${toolName} getting started`
    ];
    const allSnippets = [];
    const allPatterns = [];
    const sources = [];
    return {
      documentation: `GitHub-sourced examples and documentation for ${toolName}@${version}`,
      snippets: allSnippets.slice(0, 10),
      // Limit to top 10 snippets
      examples: allPatterns.slice(0, 5),
      // Limit to top 5 patterns  
      bestPractices: [],
      troubleshooting: [],
      githubSources: sources
    };
  }
  shouldEnhanceWithGitHub(factResult, knowledgeType) {
    return !factResult.snippets?.length || !factResult.examples?.length || knowledgeType === "snippets" || knowledgeType === "examples";
  }
  isBeamEcosystemTool(toolName) {
    const beamTools = [
      "phoenix",
      "ecto",
      "plug",
      "cowboy",
      "jason",
      "tesla",
      "broadway",
      "oban",
      "libcluster",
      "distillery",
      "guardian",
      "absinthe",
      "nerves",
      "scenic",
      "liveview",
      "live_view"
    ];
    return beamTools.includes(toolName.toLowerCase());
  }
  mergeFACTAndGitHubKnowledge(factResult, githubResult) {
    return {
      ...factResult,
      snippets: [
        ...factResult.snippets || [],
        ...githubResult.snippets || []
      ].slice(0, 15),
      // Limit total snippets
      examples: [
        ...factResult.examples || [],
        ...githubResult.examples || []
      ].slice(0, 10),
      // Limit total examples
      bestPractices: [
        ...factResult.bestPractices || [],
        ...githubResult.bestPractices || []
      ].slice(0, 8),
      // Limit best practices
      githubSources: githubResult.githubSources || []
    };
  }
  /**
   * Process project environment analysis
   */
  async analyzeEnvironment(environmentData) {
    return this.process({
      templateId: "environment-analysis",
      context: environmentData
    });
  }
  /**
   * Get cache statistics from Rust FACT
   */
  async getCacheStats() {
    const result = await this.executeCommand("cache-stats");
    return JSON.parse(result.stdout);
  }
  /**
   * Clear the cache
   */
  async clearCache() {
    await this.executeCommand("clear-cache");
    this.emit("cache-cleared");
  }
  /**
   * List available templates
   */
  async listTemplates() {
    const result = await this.executeCommand("list-templates");
    return JSON.parse(result.stdout);
  }
  /**
   * Search templates by tags
   */
  async searchTemplates(tags) {
    const result = await this.executeCommand("search-templates", [
      "--tags",
      tags.join(",")
    ]);
    return JSON.parse(result.stdout);
  }
  /**
   * Execute a command with the Rust FACT binary
   */
  executeCommand(command, args = []) {
    return new Promise((resolve, reject) => {
      const fullArgs = [command, ...args];
      const child = spawn(this.binaryPath, fullArgs, {
        stdio: "pipe",
        timeout: this.config.timeout
      });
      let stdout = "";
      let stderr = "";
      child.stdout?.on("data", (data) => {
        stdout += data.toString();
      });
      child.stderr?.on("data", (data) => {
        stderr += data.toString();
      });
      child.on("close", (code) => {
        if (code === 0) {
          resolve({ stdout, stderr, code: code || 0 });
        } else {
          reject(new Error(`Rust FACT process exited with code ${code}: ${stderr}`));
        }
      });
      child.on("error", (error) => {
        reject(new Error(`Failed to spawn Rust FACT process: ${error.message}`));
      });
    });
  }
  /**
   * Shutdown the bridge
   */
  async shutdown() {
    this.emit("shutdown");
  }
};
var globalRustFactBridge = null;
function getRustFactBridge(config) {
  if (!globalRustFactBridge) {
    globalRustFactBridge = new RustFactBridge(config);
  }
  return globalRustFactBridge;
}
__name(getRustFactBridge, "getRustFactBridge");
var rust_fact_bridge_default = RustFactBridge;
export {
  RustFactBridge,
  rust_fact_bridge_default as default,
  getRustFactBridge
};
//# sourceMappingURL=rust-fact-bridge-HYHK2TUO.js.map
