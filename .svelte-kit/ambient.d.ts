
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```sh
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const NODE_ENV: string;
	export const APP_NAME: string;
	export const APP_VERSION: string;
	export const CLAUDE_INSTANCE_ID: string;
	export const CLAUDE_LOG_LEVEL: string;
	export const CLAUDE_LOG_CONSOLE: string;
	export const CLAUDE_LOG_FILE: string;
	export const CLAUDE_LOG_JSON: string;
	export const LOG_FORMAT: string;
	export const LOG_DIR: string;
	export const CLAUDE_LOG_FILE_PATH: string;
	export const CLAUDE_LOG_ERROR_FILE: string;
	export const CLAUDE_LOG_ACCESS_FILE: string;
	export const CLAUDE_LOG_MAX_SIZE: string;
	export const CLAUDE_LOG_MAX_FILES: string;
	export const CLAUDE_LOG_PERFORMANCE: string;
	export const CLAUDE_LOG_MEMORY_USAGE: string;
	export const CLAUDE_LOG_REQUEST_DETAILS: string;
	export const CLAUDE_MCP_HOST: string;
	export const CLAUDE_MCP_PORT: string;
	export const CLAUDE_WEB_HOST: string;
	export const CLAUDE_WEB_PORT: string;
	export const CLAUDE_MCP_TIMEOUT: string;
	export const CLAUDE_WS_HEARTBEAT_INTERVAL: string;
	export const CLAUDE_WS_MAX_CONNECTIONS: string;
	export const CLAUDE_MCP_CORS_ORIGIN: string;
	export const FORCE_HTTPS: string;
	export const HSTS_MAX_AGE: string;
	export const CSP_DEFAULT_SRC: string;
	export const CSP_SCRIPT_SRC: string;
	export const CSP_STYLE_SRC: string;
	export const RATE_LIMIT_WINDOW: string;
	export const RATE_LIMIT_MAX_REQUESTS: string;
	export const RATE_LIMIT_MAX_TOKENS: string;
	export const CORS_ORIGIN: string;
	export const CORS_CREDENTIALS: string;
	export const ANTHROPIC_API_KEY: string;
	export const OPENAI_API_KEY: string;
	export const GITHUB_TOKEN: string;
	export const ANTHROPIC_MAX_TOKENS: string;
	export const ANTHROPIC_TEMPERATURE: string;
	export const ANTHROPIC_TIMEOUT: string;
	export const AI_FAILOVER_ENABLED: string;
	export const AI_HEALTH_CHECK_INTERVAL: string;
	export const AI_RETRY_ATTEMPTS: string;
	export const DATABASE_URL: string;
	export const DATABASE_POOL_MIN: string;
	export const DATABASE_POOL_MAX: string;
	export const DATABASE_POOL_IDLE_TIMEOUT: string;
	export const DATABASE_SSL: string;
	export const VECTOR_DATABASE_URL: string;
	export const VECTOR_DIMENSION: string;
	export const VECTOR_INDEX_SIZE_MB: string;
	export const DATABASE_AUTO_MIGRATE: string;
	export const DATABASE_MIGRATE_ON_START: string;
	export const DATABASE_BACKUP_ENABLED: string;
	export const DATABASE_BACKUP_INTERVAL: string;
	export const REDIS_URL: string;
	export const REDIS_PASSWORD: string;
	export const REDIS_POOL_SIZE: string;
	export const REDIS_CONNECT_TIMEOUT: string;
	export const MEMORY_CACHE_SIZE: string;
	export const MEMORY_CACHE_SIZE_MB: string;
	export const MEMORY_CACHE_TTL: string;
	export const SESSION_STORE: string;
	export const SESSION_SECRET: string;
	export const SESSION_MAX_AGE: string;
	export const SESSION_SECURE: string;
	export const SESSION_SAME_SITE: string;
	export const SWARM_MAX_AGENTS: string;
	export const MAX_AGENTS: string;
	export const DEFAULT_SWARM_SIZE: string;
	export const SWARM_COORDINATION_TIMEOUT: string;
	export const MAX_CONCURRENT_TASKS: string;
	export const AGENT_MAX_MEMORY: string;
	export const AGENT_TIMEOUT: string;
	export const AGENT_RETRY_ATTEMPTS: string;
	export const CLAUDE_WORK_DIR: string;
	export const CLAUDE_TEMP_DIR: string;
	export const CLAUDE_CACHE_DIR: string;
	export const CLAUDE_CONFIG_DIR: string;
	export const MAX_FILE_SIZE: string;
	export const MAX_FILES_PER_REQUEST: string;
	export const DOCUMENT_MAX_SIZE: string;
	export const HEALTH_CHECK_ENABLED: string;
	export const HEALTH_CHECK_TIMEOUT: string;
	export const METRICS_ENABLED: string;
	export const METRICS_INTERVAL: string;
	export const PERFORMANCE_MONITORING: string;
	export const PERFORMANCE_THRESHOLD_CPU: string;
	export const PERFORMANCE_THRESHOLD_MEMORY: string;
	export const DATADOG_API_KEY: string;
	export const SENTRY_DSN: string;
	export const BACKUP_ENABLED: string;
	export const BACKUP_INTERVAL: string;
	export const BACKUP_RETENTION: string;
	export const BACKUP_COMPRESSION: string;
	export const BACKUP_S3_BUCKET: string;
	export const AWS_ACCESS_KEY_ID: string;
	export const AWS_SECRET_ACCESS_KEY: string;
	export const AWS_REGION: string;
	export const JWT_SECRET: string;
	export const JWT_EXPIRY: string;
	export const JWT_REFRESH_EXPIRY: string;
	export const ENCRYPTION_KEY: string;
	export const MCP_HTTP_ENABLED: string;
	export const MCP_STDIO_ENABLED: string;
	export const WEB_DASHBOARD_ENABLED: string;
	export const TUI_ENABLED: string;
	export const CLI_ENABLED: string;
	export const NEURAL_PROCESSING_ENABLED: string;
	export const SWARM_COORDINATION_ENABLED: string;
	export const DOCUMENT_PROCESSING_ENABLED: string;
	export const GITHUB_INTEGRATION_ENABLED: string;
	export const REAL_TIME_UPDATES_ENABLED: string;
	export const DEBUG: string;
	export const DEBUG_ENABLED: string;
	export const DEBUG_VERBOSE: string;
	export const VERBOSE_LOGGING: string;
	export const DEV_TOOLS_ENABLED: string;
	export const HOT_RELOAD_ENABLED: string;
	export const SOURCE_MAPS_ENABLED: string;
	export const ENABLE_PROFILING: string;
	export const ENABLE_TRACING: string;
	export const ENABLE_GPU: string;
	export const ENABLE_SIMD: string;
	export const WORKER_THREADS: string;
	export const ENABLE_NEURAL_NETWORKS: string;
	export const ENABLE_VECTOR_SEARCH: string;
	export const ENABLE_GRAPH_ANALYSIS: string;
	export const TZ: string;
	export const NODE_OPTIONS: string;
	export const SHELL: string;
	export const PWD: string;
	export const LOGNAME: string;
	export const XDG_SESSION_TYPE: string;
	export const MOTD_SHOWN: string;
	export const HOME: string;
	export const SSL_CERT_DIR: string;
	export const VSCODE_AGENT_FOLDER: string;
	export const SSH_CONNECTION: string;
	export const XDG_SESSION_CLASS: string;
	export const SELINUX_ROLE_REQUESTED: string;
	export const USER: string;
	export const SELINUX_USE_CURRENT_RANGE: string;
	export const SHLVL: string;
	export const XDG_SESSION_ID: string;
	export const XDG_RUNTIME_DIR: string;
	export const SSL_CERT_FILE: string;
	export const SSH_CLIENT: string;
	export const VSCODE_CLI_REQUIRE_TOKEN: string;
	export const PATH: string;
	export const SELINUX_LEVEL_REQUESTED: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const _: string;
	export const VSCODE_CWD: string;
	export const VSCODE_NLS_CONFIG: string;
	export const VSCODE_HANDLES_SIGPIPE: string;
	export const VSCODE_ESM_ENTRYPOINT: string;
	export const VSCODE_HANDLES_UNCAUGHT_ERRORS: string;
	export const BROWSER: string;
	export const ELECTRON_RUN_AS_NODE: string;
	export const VSCODE_IPC_HOOK_CLI: string;
	export const APPLICATION_INSIGHTS_NO_STATSBEAT: string;
	export const VSCODE_L10N_BUNDLE_LOCATION: string;
	export const ELECTRON_NO_ASAR: string;
	export const VITE_USER_NODE_ENV: string;
}

/**
 * Similar to [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * logger.info(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		NODE_ENV: string;
		APP_NAME: string;
		APP_VERSION: string;
		CLAUDE_INSTANCE_ID: string;
		CLAUDE_LOG_LEVEL: string;
		CLAUDE_LOG_CONSOLE: string;
		CLAUDE_LOG_FILE: string;
		CLAUDE_LOG_JSON: string;
		LOG_FORMAT: string;
		LOG_DIR: string;
		CLAUDE_LOG_FILE_PATH: string;
		CLAUDE_LOG_ERROR_FILE: string;
		CLAUDE_LOG_ACCESS_FILE: string;
		CLAUDE_LOG_MAX_SIZE: string;
		CLAUDE_LOG_MAX_FILES: string;
		CLAUDE_LOG_PERFORMANCE: string;
		CLAUDE_LOG_MEMORY_USAGE: string;
		CLAUDE_LOG_REQUEST_DETAILS: string;
		CLAUDE_MCP_HOST: string;
		CLAUDE_MCP_PORT: string;
		CLAUDE_WEB_HOST: string;
		CLAUDE_WEB_PORT: string;
		CLAUDE_MCP_TIMEOUT: string;
		CLAUDE_WS_HEARTBEAT_INTERVAL: string;
		CLAUDE_WS_MAX_CONNECTIONS: string;
		CLAUDE_MCP_CORS_ORIGIN: string;
		FORCE_HTTPS: string;
		HSTS_MAX_AGE: string;
		CSP_DEFAULT_SRC: string;
		CSP_SCRIPT_SRC: string;
		CSP_STYLE_SRC: string;
		RATE_LIMIT_WINDOW: string;
		RATE_LIMIT_MAX_REQUESTS: string;
		RATE_LIMIT_MAX_TOKENS: string;
		CORS_ORIGIN: string;
		CORS_CREDENTIALS: string;
		ANTHROPIC_API_KEY: string;
		OPENAI_API_KEY: string;
		GITHUB_TOKEN: string;
		ANTHROPIC_MAX_TOKENS: string;
		ANTHROPIC_TEMPERATURE: string;
		ANTHROPIC_TIMEOUT: string;
		AI_FAILOVER_ENABLED: string;
		AI_HEALTH_CHECK_INTERVAL: string;
		AI_RETRY_ATTEMPTS: string;
		DATABASE_URL: string;
		DATABASE_POOL_MIN: string;
		DATABASE_POOL_MAX: string;
		DATABASE_POOL_IDLE_TIMEOUT: string;
		DATABASE_SSL: string;
		VECTOR_DATABASE_URL: string;
		VECTOR_DIMENSION: string;
		VECTOR_INDEX_SIZE_MB: string;
		DATABASE_AUTO_MIGRATE: string;
		DATABASE_MIGRATE_ON_START: string;
		DATABASE_BACKUP_ENABLED: string;
		DATABASE_BACKUP_INTERVAL: string;
		REDIS_URL: string;
		REDIS_PASSWORD: string;
		REDIS_POOL_SIZE: string;
		REDIS_CONNECT_TIMEOUT: string;
		MEMORY_CACHE_SIZE: string;
		MEMORY_CACHE_SIZE_MB: string;
		MEMORY_CACHE_TTL: string;
		SESSION_STORE: string;
		SESSION_SECRET: string;
		SESSION_MAX_AGE: string;
		SESSION_SECURE: string;
		SESSION_SAME_SITE: string;
		SWARM_MAX_AGENTS: string;
		MAX_AGENTS: string;
		DEFAULT_SWARM_SIZE: string;
		SWARM_COORDINATION_TIMEOUT: string;
		MAX_CONCURRENT_TASKS: string;
		AGENT_MAX_MEMORY: string;
		AGENT_TIMEOUT: string;
		AGENT_RETRY_ATTEMPTS: string;
		CLAUDE_WORK_DIR: string;
		CLAUDE_TEMP_DIR: string;
		CLAUDE_CACHE_DIR: string;
		CLAUDE_CONFIG_DIR: string;
		MAX_FILE_SIZE: string;
		MAX_FILES_PER_REQUEST: string;
		DOCUMENT_MAX_SIZE: string;
		HEALTH_CHECK_ENABLED: string;
		HEALTH_CHECK_TIMEOUT: string;
		METRICS_ENABLED: string;
		METRICS_INTERVAL: string;
		PERFORMANCE_MONITORING: string;
		PERFORMANCE_THRESHOLD_CPU: string;
		PERFORMANCE_THRESHOLD_MEMORY: string;
		DATADOG_API_KEY: string;
		SENTRY_DSN: string;
		BACKUP_ENABLED: string;
		BACKUP_INTERVAL: string;
		BACKUP_RETENTION: string;
		BACKUP_COMPRESSION: string;
		BACKUP_S3_BUCKET: string;
		AWS_ACCESS_KEY_ID: string;
		AWS_SECRET_ACCESS_KEY: string;
		AWS_REGION: string;
		JWT_SECRET: string;
		JWT_EXPIRY: string;
		JWT_REFRESH_EXPIRY: string;
		ENCRYPTION_KEY: string;
		MCP_HTTP_ENABLED: string;
		MCP_STDIO_ENABLED: string;
		WEB_DASHBOARD_ENABLED: string;
		TUI_ENABLED: string;
		CLI_ENABLED: string;
		NEURAL_PROCESSING_ENABLED: string;
		SWARM_COORDINATION_ENABLED: string;
		DOCUMENT_PROCESSING_ENABLED: string;
		GITHUB_INTEGRATION_ENABLED: string;
		REAL_TIME_UPDATES_ENABLED: string;
		DEBUG: string;
		DEBUG_ENABLED: string;
		DEBUG_VERBOSE: string;
		VERBOSE_LOGGING: string;
		DEV_TOOLS_ENABLED: string;
		HOT_RELOAD_ENABLED: string;
		SOURCE_MAPS_ENABLED: string;
		ENABLE_PROFILING: string;
		ENABLE_TRACING: string;
		ENABLE_GPU: string;
		ENABLE_SIMD: string;
		WORKER_THREADS: string;
		ENABLE_NEURAL_NETWORKS: string;
		ENABLE_VECTOR_SEARCH: string;
		ENABLE_GRAPH_ANALYSIS: string;
		TZ: string;
		NODE_OPTIONS: string;
		SHELL: string;
		PWD: string;
		LOGNAME: string;
		XDG_SESSION_TYPE: string;
		MOTD_SHOWN: string;
		HOME: string;
		SSL_CERT_DIR: string;
		VSCODE_AGENT_FOLDER: string;
		SSH_CONNECTION: string;
		XDG_SESSION_CLASS: string;
		SELINUX_ROLE_REQUESTED: string;
		USER: string;
		SELINUX_USE_CURRENT_RANGE: string;
		SHLVL: string;
		XDG_SESSION_ID: string;
		XDG_RUNTIME_DIR: string;
		SSL_CERT_FILE: string;
		SSH_CLIENT: string;
		VSCODE_CLI_REQUIRE_TOKEN: string;
		PATH: string;
		SELINUX_LEVEL_REQUESTED: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		_: string;
		VSCODE_CWD: string;
		VSCODE_NLS_CONFIG: string;
		VSCODE_HANDLES_SIGPIPE: string;
		VSCODE_ESM_ENTRYPOINT: string;
		VSCODE_HANDLES_UNCAUGHT_ERRORS: string;
		BROWSER: string;
		ELECTRON_RUN_AS_NODE: string;
		VSCODE_IPC_HOOK_CLI: string;
		APPLICATION_INSIGHTS_NO_STATSBEAT: string;
		VSCODE_L10N_BUNDLE_LOCATION: string;
		ELECTRON_NO_ASAR: string;
		VITE_USER_NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * logger.info(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
