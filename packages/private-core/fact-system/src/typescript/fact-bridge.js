/**
 * @fileoverview FACT Bridge - TypeScript to Rust Bridge
 *
 * Bridges TypeScript coordination layer with high-performance Rust fact processing engine.
 * Handles WASM loading, N-API bindings, and fallback to TypeScript implementations.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import { getLogger } from "@claude-zen/foundation";
import { liveAPIConnector } from "./connectors/live-api-connector";

const logger = getLogger("FactBridge");
/**
 * Bridge between TypeScript and Rust fact processing engine
 */
export class FactBridge {
	rustEngine;
	database;
	useRustEngine;
	initialized = false;
	constructor(config) {
		this.useRustEngine = config.useRustEngine;
		this.database = config.database;
	}
	/**
	 * Initialize the bridge and load Rust engine if enabled
	 */
	async initialize() {
		if (this.initialized) return;
		if (this.useRustEngine) {
			try {
				await this.loadRustEngine();
				logger.info("✅ Rust FACT engine loaded successfully");
			} catch (error) {
				logger.warn(
					"Failed to load Rust engine, falling back to TypeScript:",
					error,
				);
				this.useRustEngine = false;
			}
		}
		this.initialized = true;
	}
	/**
	 * SQL search against facts database (points to valid resources)
	 */
	async searchFacts(query) {
		if (this.useRustEngine && this.rustEngine) {
			try {
				const resultJson = await this.rustEngine.search_facts(
					query.query,
					query.factTypes || [
						"npm-package",
						"github-repo",
						"security-advisory",
						"hex-package",
						"rust-crate",
						"go-module",
						"perl-package",
						"java-package",
						"gitlab-repo",
						"bitbucket-repo",
					],
					query.limit || 10,
				);
				const rustResults = JSON.parse(resultJson);
				return this.convertRustSearchResults(rustResults);
			} catch (error) {
				logger.warn(
					"Rust fact search failed, falling back to TypeScript:",
					error,
				);
			}
		}
		// TypeScript fallback
		return this.searchFactsTypeScript(query);
	}
	/**
	 * Get a specific fact using deterministic lookup
	 */
	async getFact(query) {
		if (this.useRustEngine && this.rustEngine) {
			try {
				const resultJson = await this.rustEngine.get_fact(
					query.factType,
					query.identifier,
					query.version,
				);
				const rustResult = JSON.parse(resultJson);
				return this.convertRustFactResult(rustResult, query);
			} catch (error) {
				logger.warn(
					"Rust fact lookup failed, falling back to TypeScript:",
					error,
				);
			}
		}
		// TypeScript fallback
		return this.getFactTypeScript(query);
	}
	/**
	 * Get NPM package facts
	 */
	async getNPMFacts(packageName, version) {
		if (this.useRustEngine && this.rustEngine) {
			try {
				const resultJson = await this.rustEngine.get_npm_facts(
					packageName,
					version,
				);
				return JSON.parse(resultJson);
			} catch (error) {
				logger.warn(
					"Rust NPM facts failed, falling back to TypeScript:",
					error,
				);
			}
		}
		// TypeScript fallback
		return this.getNPMFactsTypeScript(packageName, version);
	}
	/**
	 * Get GitHub repository facts using GraphQL
	 */
	async getGitHubFacts(owner, repo) {
		if (this.useRustEngine && this.rustEngine) {
			try {
				const resultJson = await this.rustEngine.get_github_facts(owner, repo);
				return JSON.parse(resultJson);
			} catch (error) {
				logger.warn(
					"Rust GitHub facts failed, falling back to TypeScript:",
					error,
				);
			}
		}
		// TypeScript fallback
		return this.getGitHubFactsTypeScript(owner, repo);
	}
	/**
	 * Get security advisory facts
	 */
	async getSecurityFacts(cveId) {
		if (this.useRustEngine && this.rustEngine) {
			try {
				const resultJson = await this.rustEngine.get_security_facts(cveId);
				return JSON.parse(resultJson);
			} catch (error) {
				logger.warn(
					"Rust security facts failed, falling back to TypeScript:",
					error,
				);
			}
		}
		// TypeScript fallback
		return this.getSecurityFactsTypeScript(cveId);
	}
	/**
	 * Get Hex (Elixir package manager) facts
	 */
	async getHexFacts(packageName, version) {
		if (this.useRustEngine && this.rustEngine) {
			try {
				const resultJson = await this.rustEngine.get_hex_facts(
					packageName,
					version,
				);
				return JSON.parse(resultJson);
			} catch (error) {
				logger.warn(
					"Rust Hex facts failed, falling back to TypeScript:",
					error,
				);
			}
		}
		// TypeScript fallback
		return this.getHexFactsTypeScript(packageName, version);
	}
	/**
	 * Get API documentation facts (TypeScript only for now)
	 */
	async getAPIDocsFacts(apiName, endpoint) {
		// API docs are handled in TypeScript for structured data
		return this.getAPIDocsFactsTypeScript(apiName, endpoint);
	}
	/**
	 * Get Rust crate facts
	 */
	async getRustCrateFacts(crateName, version) {
		if (this.useRustEngine && this.rustEngine) {
			try {
				const resultJson = await this.rustEngine.get_rust_crate(
					crateName,
					version,
				);
				return JSON.parse(resultJson);
			} catch (error) {
				logger.warn(
					"Rust crate facts failed, falling back to TypeScript:",
					error,
				);
			}
		}
		// TypeScript fallback
		return this.getRustCrateFactsTypeScript(crateName, version);
	}
	/**
	 * Get Go module facts
	 */
	async getGoModuleFacts(modulePath, version) {
		if (this.useRustEngine && this.rustEngine) {
			try {
				const resultJson = await this.rustEngine.get_go_module(
					modulePath,
					version,
				);
				return JSON.parse(resultJson);
			} catch (error) {
				logger.warn(
					"Go module facts failed, falling back to TypeScript:",
					error,
				);
			}
		}
		// TypeScript fallback
		return this.getGoModuleFactsTypeScript(modulePath, version);
	}
	/**
	 * Get Perl package facts
	 */
	async getPerlPackageFacts(packageName, version) {
		if (this.useRustEngine && this.rustEngine) {
			try {
				const resultJson = await this.rustEngine.get_perl_package(
					packageName,
					version,
				);
				return JSON.parse(resultJson);
			} catch (error) {
				logger.warn(
					"Perl package facts failed, falling back to TypeScript:",
					error,
				);
			}
		}
		// TypeScript fallback
		return this.getPerlPackageFactsTypeScript(packageName, version);
	}
	/**
	 * Get Java package facts
	 */
	async getJavaPackageFacts(groupId, artifactId, version) {
		if (this.useRustEngine && this.rustEngine) {
			try {
				const resultJson = await this.rustEngine.get_java_package(
					groupId,
					artifactId,
					version,
				);
				return JSON.parse(resultJson);
			} catch (error) {
				logger.warn(
					"Java package facts failed, falling back to TypeScript:",
					error,
				);
			}
		}
		// TypeScript fallback
		return this.getJavaPackageFactsTypeScript(groupId, artifactId, version);
	}
	/**
	 * Get GitLab repository facts
	 */
	async getGitLabRepoFacts(projectPath) {
		if (this.useRustEngine && this.rustEngine) {
			try {
				const resultJson = await this.rustEngine.get_gitlab_repo(projectPath);
				return JSON.parse(resultJson);
			} catch (error) {
				logger.warn(
					"GitLab repo facts failed, falling back to TypeScript:",
					error,
				);
			}
		}
		// TypeScript fallback
		return this.getGitLabRepoFactsTypeScript(projectPath);
	}
	/**
	 * Get Bitbucket repository facts
	 */
	async getBitbucketRepoFacts(workspace, repoSlug) {
		if (this.useRustEngine && this.rustEngine) {
			try {
				const resultJson = await this.rustEngine.get_bitbucket_repo(
					workspace,
					repoSlug,
				);
				return JSON.parse(resultJson);
			} catch (error) {
				logger.warn(
					"Bitbucket repo facts failed, falling back to TypeScript:",
					error,
				);
			}
		}
		// TypeScript fallback
		return this.getBitbucketRepoFactsTypeScript(workspace, repoSlug);
	}
	/**
	 * Get system statistics
	 */
	async getStats() {
		if (this.useRustEngine && this.rustEngine) {
			try {
				const statsJson = await this.rustEngine.get_stats();
				return JSON.parse(statsJson);
			} catch (error) {
				logger.warn("Failed to get Rust stats:", error);
			}
		}
		// Return basic stats
		return {
			cacheSize: 0,
			totalQueries: 0,
			cacheHitRate: 0,
		};
	}
	/**
	 * Load Rust engine via WASM or N-API
	 */
	async loadRustEngine() {
		try {
			// Try to load WASM version first (optional - may not exist in dev)
			const wasmModule = await import("../../wasm/fact_tools");
			this.rustEngine = wasmModule;
			logger.info("Loaded Rust engine via WASM");
		} catch (_wasmError) {
			try {
				// Try to load N-API version (optional - may not exist in dev)
				// Use dynamic import to handle missing files gracefully
				const nativeModule = await eval(
					`import('../../src/rust/target/release/fact-tools.node')`,
				);
				this.rustEngine = nativeModule;
				logger.info("Loaded Rust engine via N-API");
			} catch (_nativeError) {
				logger.warn("No Rust engine available, using TypeScript fallback");
				this.rustEngine = null; // Will use TypeScript implementation
			}
		}
	}
	/**
	 * TypeScript SQL search against facts database
	 */
	async searchFactsTypeScript(query) {
		// In production: would run SQL queries against facts database
		// For now: mock search results pointing to REAL API endpoints
		const mockResults = [];
		// Example: search for "react" in npm packages
		if (!query.factTypes || query.factTypes.includes("npm-package")) {
			if (query.query.toLowerCase().includes("react")) {
				mockResults.push({
					factType: "npm-package",
					identifier: "react",
					version: "latest", // Will fetch latest stable
					resourceUrl: "https://registry.npmjs.org/react", // Point to NPM registry API
					score: 0.95,
					indexedAt: Date.now() - 86400000, // 1 day ago
					metadata: {
						title: "React",
						description: "A JavaScript library for building user interfaces",
					},
				});
				mockResults.push({
					factType: "npm-package",
					identifier: "react-dom",
					version: "latest",
					resourceUrl: "https://registry.npmjs.org/react-dom", // Point to NPM registry API
					score: 0.88,
					indexedAt: Date.now() - 86400000,
					metadata: {
						title: "React DOM",
						description: "React package for working with the DOM",
					},
				});
			}
		}
		// Example: search for repositories
		if (!query.factTypes || query.factTypes.includes("github-repo")) {
			if (query.query.toLowerCase().includes("typescript")) {
				mockResults.push({
					factType: "github-repo",
					identifier: "microsoft/TypeScript",
					resourceUrl: "https://api.github.com/repos/microsoft/TypeScript", // Point to GitHub API
					score: 0.92,
					indexedAt: Date.now() - 3600000, // 1 hour ago
					metadata: {
						title: "TypeScript",
						description:
							"TypeScript is a superset of JavaScript that compiles to clean JavaScript output",
					},
				});
			}
		}
		// Example: search for Hex packages
		if (!query.factTypes || query.factTypes.includes("hex-package")) {
			if (query.query.toLowerCase().includes("phoenix")) {
				mockResults.push({
					factType: "hex-package",
					identifier: "phoenix",
					version: "latest",
					resourceUrl: "https://hex.pm/api/packages/phoenix", // Point to Hex.pm API
					score: 0.9,
					indexedAt: Date.now() - 7200000, // 2 hours ago
					metadata: {
						title: "Phoenix",
						description: "A productive web framework for Elixir",
					},
				});
			}
		}
		// Example: search for security advisories
		if (!query.factTypes || query.factTypes.includes("security-advisory")) {
			if (
				query.query.toLowerCase().includes("cve-2024") ||
				query.query.toLowerCase().includes("vulnerability")
			) {
				mockResults.push({
					factType: "security-advisory",
					identifier: "CVE-2024-1234",
					resourceUrl:
						"https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=CVE-2024-1234", // Point to NVD API
					score: 0.85,
					indexedAt: Date.now() - 1800000, // 30 minutes ago
					metadata: {
						title: "CVE-2024-1234",
						description: "Critical vulnerability in web framework",
					},
				});
			}
		}
		return mockResults
			.sort((a, b) => b.score - a.score)
			.slice(0, query.limit || 10);
	}
	/**
	 * Simple fact retrieval - fast query
	 */
	async getFactTypeScript(query) {
		const factData = await this.collectFactData(query);
		return {
			source: factData.source,
			factType: query.factType,
			identifier: query.identifier,
			data: factData,
			isCached: false,
			ttl: 3600000,
			timestamp: Date.now(),
		};
	}
	/**
	 * Fast fact collection
	 */
	async collectFactData(query) {
		switch (query.factType) {
			case "npm-package":
				return this.getNPMFactsTypeScript(query.identifier, query.version);
			case "github-repo": {
				const [owner, repo] = query.identifier.split("/");
				return this.getGitHubFactsTypeScript(owner, repo);
			}
			case "security-advisory":
				return this.getSecurityFactsTypeScript(query.identifier);
			case "hex-package":
				return this.getHexFactsTypeScript(query.identifier, query.version);
			case "api-docs":
				return this.getAPIDocsFactsTypeScript(
					query.identifier,
					query.parameters?.endpoint,
				);
			case "rust-crate":
				return this.getRustCrateFactsTypeScript(
					query.identifier,
					query.version,
				);
			case "go-module":
				return this.getGoModuleFactsTypeScript(query.identifier, query.version);
			case "perl-package":
				return this.getPerlPackageFactsTypeScript(
					query.identifier,
					query.version,
				);
			case "java-package": {
				const [groupId, artifactId] = query.identifier.split(":");
				return this.getJavaPackageFactsTypeScript(
					groupId,
					artifactId,
					query.version,
				);
			}
			case "gitlab-repo":
				return this.getGitLabRepoFactsTypeScript(query.identifier);
			case "bitbucket-repo": {
				const [workspace, repoSlug] = query.identifier.split("/");
				return this.getBitbucketRepoFactsTypeScript(workspace, repoSlug);
			}
			default:
				throw new Error(`Unknown fact type: ${query.factType}`);
		}
	}
	/**
	 * NPM facts - direct API call
	 */
	async getNPMFactsTypeScript(packageName, version) {
		return liveAPIConnector.fetchNPMPackage(packageName, version);
	}
	/**
	 * GitHub facts - direct API call
	 */
	async getGitHubFactsTypeScript(owner, repo) {
		return liveAPIConnector.fetchGitHubRepository(owner, repo);
	}
	/**
	 * Security facts - direct API call
	 */
	async getSecurityFactsTypeScript(cveId) {
		return liveAPIConnector.fetchSecurityAdvisory(cveId);
	}
	/**
	 * Hex facts - direct API call
	 */
	async getHexFactsTypeScript(packageName, version) {
		return liveAPIConnector.fetchHexPackage(packageName, version);
	}
	/**
	 * Rust crate facts - direct API call
	 */
	async getRustCrateFactsTypeScript(crateName, version) {
		return liveAPIConnector.fetchRustCrate(crateName, version);
	}
	/**
	 * Go module facts - direct API call
	 */
	async getGoModuleFactsTypeScript(modulePath, version) {
		return liveAPIConnector.fetchGoModule(modulePath, version);
	}
	/**
	 * Perl package facts - direct API call
	 */
	async getPerlPackageFactsTypeScript(packageName, version) {
		return liveAPIConnector.fetchPerlPackage(packageName, version);
	}
	/**
	 * Java package facts - direct API call
	 */
	async getJavaPackageFactsTypeScript(groupId, artifactId, version) {
		return liveAPIConnector.fetchJavaPackage(groupId, artifactId, version);
	}
	/**
	 * GitLab repository facts - direct API call
	 */
	async getGitLabRepoFactsTypeScript(projectPath) {
		return liveAPIConnector.fetchGitLabRepository(projectPath);
	}
	/**
	 * Bitbucket repository facts - direct API call
	 */
	async getBitbucketRepoFactsTypeScript(workspace, repoSlug) {
		return liveAPIConnector.fetchBitbucketRepository(workspace, repoSlug);
	}
	/**
	 * Production OpenAPI/Swagger documentation fetching
	 * Fetches and parses actual swagger.json or openapi.yaml endpoints
	 */
	async getAPIDocsFactsTypeScript(apiName, endpoint) {
		const apiNameLower = apiName.toLowerCase();
		// Production OpenAPI/Swagger endpoints for major APIs
		const swaggerEndpoints = {
			stripe:
				"https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json",
			github:
				"https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json",
			kubernetes:
				"https://raw.githubusercontent.com/kubernetes/kubernetes/master/api/openapi-spec/swagger.json",
			docker: "https://docs.docker.com/engine/api/v1.41.yaml",
			gitlab: "https://docs.gitlab.com/ee/api/openapi/openapi.yaml",
			bitbucket: "https://api.bitbucket.org/swagger.json",
			npm: "https://registry.npmjs.org/-/api-docs/openapi.json",
			"hex.pm": "https://hex.pm/api/docs/openapi.json",
			"crates.io": "https://crates.io/api/docs/openapi.json",
		};
		// Try to find a known OpenAPI endpoint
		const swaggerUrl = swaggerEndpoints[apiNameLower];
		if (swaggerUrl) {
			try {
				logger.info(`Fetching OpenAPI spec for ${apiName} from ${swaggerUrl}`);
				const response = await fetch(swaggerUrl, {
					headers: {
						Accept: "application/json",
						"User-Agent": "claude-code-zen-fact-system",
					},
				});
				if (!response.ok) {
					throw new Error(
						`OpenAPI fetch failed: ${response.status} ${response.statusText}`,
					);
				}
				const openApiSpec = await response.json();
				// Parse OpenAPI 3.0 spec
				const info = openApiSpec.info || {};
				const servers = openApiSpec.servers || [];
				const paths = openApiSpec.paths || {};
				// Extract endpoints from paths
				const endpoints = [];
				for (const [pathStr, pathObj] of Object.entries(paths)) {
					if (typeof pathObj === "object" && pathObj !== null) {
						for (const [method, methodObj] of Object.entries(pathObj)) {
							if (
								typeof methodObj === "object" &&
								methodObj !== null &&
								[
									"get",
									"post",
									"put",
									"patch",
									"delete",
									"options",
									"head",
								].includes(method.toLowerCase())
							) {
								const operation = methodObj;
								const parameters = {};
								// Extract parameters
								if (operation.parameters) {
									for (const param of operation.parameters) {
										parameters[param.name] = {
											type: param.schema?.type || "string",
											description: param.description,
											required: param.required || false,
											in: param.in,
										};
									}
								}
								// Extract request body schema
								if (operation.requestBody?.content) {
									const content = operation.requestBody.content;
									const jsonContent = content["application/json"];
									if (jsonContent?.schema?.properties) {
										Object.assign(parameters, jsonContent.schema.properties);
									}
								}
								endpoints.push({
									path: pathStr,
									method: method.toUpperCase(),
									description:
										operation.summary ||
										operation.description ||
										`${method.toUpperCase()} ${pathStr}`,
									parameters,
								});
							}
						}
					}
				}
				// Extract authentication info
				let authentication = "API Key";
				if (openApiSpec.components?.securitySchemes) {
					const schemes = Object.values(openApiSpec.components.securitySchemes);
					if (schemes.length > 0) {
						const scheme = schemes[0];
						if (scheme.type === "http" && scheme.scheme === "bearer") {
							authentication = "Bearer token";
						} else if (scheme.type === "apiKey") {
							authentication = `API Key (${scheme.in}: ${scheme.name})`;
						} else if (scheme.type === "oauth2") {
							authentication = "OAuth 2.0";
						}
					}
				}
				// Filter endpoints by specific endpoint if requested
				let filteredEndpoints = endpoints;
				if (endpoint) {
					filteredEndpoints = endpoints.filter(
						(ep) =>
							ep.path.includes(endpoint) ||
							ep.description.toLowerCase().includes(endpoint.toLowerCase()),
					);
				}
				return {
					name: info.title || apiName,
					baseUrl: servers[0]?.url || `https://api.${apiNameLower}.com`,
					authentication,
					endpoints: filteredEndpoints.slice(0, 20), // Limit to first 20 endpoints
					endpoint,
					rateLimit: "See documentation",
					documentation:
						info.contact?.url ||
						openApiSpec.externalDocs?.url ||
						`https://docs.${apiNameLower}.com`,
					sdks: [], // Would need additional lookup
					confidence: 1.0, // High confidence for actual OpenAPI spec
					source: "openapi-spec-live",
					timestamp: Date.now(),
				};
			} catch (error) {
				logger.warn(`Failed to fetch OpenAPI spec for ${apiName}:`, error);
				// Fall through to default handling
			}
		}
		// Fallback: Try common OpenAPI endpoint patterns
		const commonPatterns = [
			`https://api.${apiNameLower}.com/swagger.json`,
			`https://api.${apiNameLower}.com/openapi.json`,
			`https://api.${apiNameLower}.com/docs/openapi.json`,
			`https://${apiNameLower}.com/api/swagger.json`,
			`https://${apiNameLower}.com/api/openapi.json`,
			`https://docs.${apiNameLower}.com/openapi.json`,
		];
		for (const patternUrl of commonPatterns) {
			try {
				logger.debug(`Trying OpenAPI pattern: ${patternUrl}`);
				const response = await fetch(patternUrl, {
					headers: {
						Accept: "application/json",
						"User-Agent": "claude-code-zen-fact-system",
					},
				});
				if (response.ok) {
					const openApiSpec = await response.json();
					// Basic validation that this looks like an OpenAPI spec
					if (openApiSpec.openapi || openApiSpec.swagger) {
						logger.info(`Found OpenAPI spec at ${patternUrl}`);
						// Parse basic info (simplified version of above)
						const info = openApiSpec.info || {};
						const servers = openApiSpec.servers || [];
						return {
							name: info.title || apiName,
							baseUrl: servers[0]?.url || `https://api.${apiNameLower}.com`,
							authentication: "API Key",
							endpoints: [],
							endpoint,
							rateLimit: "See documentation",
							documentation: `https://docs.${apiNameLower}.com`,
							sdks: [],
							confidence: 0.8, // Good confidence for discovered spec
							source: "openapi-spec-discovered",
							timestamp: Date.now(),
						};
					}
				}
			} catch (_error) {}
		}
		// Final fallback: Try web search to find OpenAPI docs
		try {
			logger.info(`Attempting web search to find OpenAPI docs for ${apiName}`);
			// Search for OpenAPI/Swagger documentation
			const _searchQuery = `${apiName} openapi swagger documentation api docs site:docs.${apiNameLower}.com OR site:api.${apiNameLower}.com OR site:${apiNameLower}.com`;
			// Use foundation LLM provider for API docs discovery
			const { getGlobalLLM } = await import("@claude-zen/foundation");
			const llm = getGlobalLLM();
			llm.setRole("researcher"); // Use researcher role for web search
			const searchPrompt = `Find OpenAPI/Swagger documentation for "${apiName}" API. 
      Research and identify:
      1. Official API documentation URL
      2. Base API URL (like https://api.${apiNameLower}.com)  
      3. Authentication method (API Key, Bearer token, OAuth)
      4. Any OpenAPI/Swagger spec URLs
      
      Based on your knowledge, return a JSON object with:
      {
        "baseUrl": "actual_api_base_url",
        "documentation": "official_docs_url", 
        "authentication": "auth_method",
        "confidence": 0.1-1.0,
        "found": true/false
      }`;
			const searchResponse = await llm.complete(searchPrompt, {
				model: "sonnet",
				temperature: 0.1,
				maxTokens: 500,
			});
			try {
				// Extract JSON from response
				const jsonMatch = searchResponse.match(/\{[^}]*\}/);
				if (jsonMatch) {
					const searchResult = JSON.parse(jsonMatch[0]);
					if (searchResult.found) {
						return {
							name: apiName,
							baseUrl:
								searchResult.baseUrl || `https://api.${apiNameLower}.com`,
							authentication: searchResult.authentication || "API Key",
							endpoints: [],
							endpoint,
							rateLimit: "See documentation",
							documentation:
								searchResult.documentation ||
								`https://docs.${apiNameLower}.com`,
							sdks: [],
							confidence: Math.min(searchResult.confidence || 0.6, 0.8), // Cap at 0.8 for LLM search
							source: "llm-knowledge-discovery",
							timestamp: Date.now(),
						};
					}
				}
			} catch (parseError) {
				logger.warn(
					`Failed to parse LLM search result for ${apiName}:`,
					parseError,
				);
			}
		} catch (error) {
			logger.warn(`Web search fallback failed for ${apiName}:`, error);
		}
		// Absolute final fallback: Return structured default
		return {
			name: apiName,
			baseUrl: `https://api.${apiNameLower}.com`,
			authentication: "API Key",
			endpoints: [],
			endpoint,
			rateLimit: "See documentation",
			documentation: `https://docs.${apiNameLower}.com`,
			sdks: [],
			confidence: 0.3, // Low confidence for default structure
			source: "default-structure",
			timestamp: Date.now(),
		};
	}
	/**
	 * Convert Rust search results to TypeScript format
	 */
	convertRustSearchResults(rustResults) {
		return rustResults.map((result) => ({
			factType: result.fact_type,
			identifier: result.identifier,
			version: result.version,
			resourceUrl: result.resource_url,
			score: result.score || 0.8,
			indexedAt: result.indexed_at || Date.now(),
			metadata: result.metadata || {
				title: result.identifier,
				description: result.description,
			},
		}));
	}
	/**
	 * Convert Rust fact result to TypeScript format
	 */
	convertRustFactResult(rustResult, query) {
		return {
			source: rustResult.source || "rust-engine",
			factType: query.factType,
			identifier: query.identifier,
			data: rustResult.data || rustResult,
			isCached: rustResult.is_cached || false,
			cacheTimestamp: rustResult.cache_timestamp,
			ttl: rustResult.ttl || query.cacheTTL || 3600000,
			timestamp: Date.now(),
		};
	}
	/**
	 * Check if cache entry is still valid
	 */
	isCacheValid(timestamp, ttl) {
		return Date.now() - timestamp < ttl;
	}
	/**
	 * Shutdown the bridge
	 */
	async shutdown() {
		if (this.rustEngine) {
			try {
				await this.rustEngine.shutdown();
			} catch (error) {
				logger.warn("Error shutting down Rust engine:", error);
			}
		}
	}
}
