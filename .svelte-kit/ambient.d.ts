
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
	export const CLAUDE_TUI_HOST: string;
	export const CLAUDE_TUI_PORT: string;
	export const CLAUDE_MCP_TIMEOUT: string;
	export const CLAUDE_WS_HEARTBEAT_INTERVAL: string;
	export const CLAUDE_WS_MAX_CONNECTIONS: string;
	export const CLAUDE_MCP_CORS_ORIGIN: string;
	export const CORS_ORIGIN: string;
	export const FORCE_HTTPS: string;
	export const HSTS_MAX_AGE: string;
	export const CSP_DEFAULT_SRC: string;
	export const CSP_SCRIPT_SRC: string;
	export const CSP_STYLE_SRC: string;
	export const RATE_LIMIT_WINDOW: string;
	export const RATE_LIMIT_MAX_REQUESTS: string;
	export const RATE_LIMIT_MAX_TOKENS: string;
	export const SESSION_SECURE: string;
	export const SESSION_SAME_SITE: string;
	export const ANTHROPIC_API_KEY: string;
	export const CLAUDE_API_KEY: string;
	export const OPENAI_API_KEY: string;
	export const GITHUB_TOKEN: string;
	export const ANTHROPIC_MAX_TOKENS: string;
	export const ANTHROPIC_TEMPERATURE: string;
	export const ANTHROPIC_TIMEOUT: string;
	export const AI_FAILOVER_ENABLED: string;
	export const AI_HEALTH_CHECK_INTERVAL: string;
	export const AI_RETRY_ATTEMPTS: string;
	export const DATABASE_URL: string;
	export const SQLITE_DB_PATH: string;
	export const POSTGRES_URL: string;
	export const POSTGRES_HOST: string;
	export const POSTGRES_PORT: string;
	export const POSTGRES_USER: string;
	export const POSTGRES_PASSWORD: string;
	export const POSTGRES_DB: string;
	export const DATABASE_POOL_MIN: string;
	export const DATABASE_POOL_MAX: string;
	export const DATABASE_POOL_IDLE_TIMEOUT: string;
	export const DATABASE_SSL: string;
	export const LANCEDB_PATH: string;
	export const KUZU_PATH: string;
	export const VECTOR_DIMENSION: string;
	export const VECTOR_INDEX_SIZE_MB: string;
	export const DATABASE_AUTO_MIGRATE: string;
	export const DATABASE_MIGRATE_ON_START: string;
	export const DATABASE_BACKUP_ENABLED: string;
	export const REDIS_URL: string;
	export const REDIS_HOST: string;
	export const REDIS_PORT: string;
	export const REDIS_PASSWORD: string;
	export const REDIS_POOL_SIZE: string;
	export const MEMORY_CACHE_SIZE: string;
	export const MEMORY_CACHE_SIZE_MB: string;
	export const MEMORY_CACHE_TTL: string;
	export const SESSION_STORE: string;
	export const SESSION_SECRET: string;
	export const SESSION_MAX_AGE: string;
	export const SWARM_MAX_AGENTS: string;
	export const MAX_AGENTS: string;
	export const DEFAULT_SWARM_SIZE: string;
	export const SWARM_COORDINATION_TIMEOUT: string;
	export const MAX_CONCURRENT_TASKS: string;
	export const AGENT_MAX_MEMORY: string;
	export const AGENT_TIMEOUT: string;
	export const AGENT_RETRY_ATTEMPTS: string;
	export const AGENT_SPAWN_DELAY: string;
	export const CLAUDE_WORK_DIR: string;
	export const CLAUDE_TEMP_DIR: string;
	export const CLAUDE_CACHE_DIR: string;
	export const CLAUDE_CONFIG_DIR: string;
	export const MAX_FILE_SIZE: string;
	export const MAX_FILES_PER_REQUEST: string;
	export const DOCUMENT_MAX_SIZE: string;
	export const DOCUMENT_PROCESSING_TIMEOUT: string;
	export const HEALTH_CHECK_ENABLED: string;
	export const HEALTH_CHECK_TIMEOUT: string;
	export const ENABLE_HEALTH_CHECKS: string;
	export const METRICS_ENABLED: string;
	export const ENABLE_METRICS: string;
	export const METRICS_INTERVAL: string;
	export const PERFORMANCE_MONITORING: string;
	export const PERFORMANCE_THRESHOLD_CPU: string;
	export const PERFORMANCE_THRESHOLD_MEMORY: string;
	export const DATADOG_API_KEY: string;
	export const SENTRY_DSN: string;
	export const NEW_RELIC_LICENSE_KEY: string;
	export const BACKUP_ENABLED: string;
	export const BACKUP_INTERVAL: string;
	export const BACKUP_RETENTION: string;
	export const MCP_HTTP_ENABLED: string;
	export const MCP_STDIO_ENABLED: string;
	export const MCP_WEBSOCKET_ENABLED: string;
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
	export const DEBUG_TRACE_REQUESTS: string;
	export const DEBUG_MEMORY_LEAKS: string;
	export const VERBOSE_LOGGING: string;
	export const ENABLE_PROFILING: string;
	export const ENABLE_TRACING: string;
	export const DEV_TOOLS_ENABLED: string;
	export const HOT_RELOAD_ENABLED: string;
	export const SOURCE_MAPS_ENABLED: string;
	export const ENABLE_GPU: string;
	export const ENABLE_SIMD: string;
	export const WORKER_THREADS: string;
	export const ENABLE_NEURAL_NETWORKS: string;
	export const ENABLE_VECTOR_SEARCH: string;
	export const ENABLE_GRAPH_ANALYSIS: string;
	export const ENABLE_VISION_PIPELINE: string;
	export const WEBHOOK_URL: string;
	export const SLACK_WEBHOOK_URL: string;
	export const DISCORD_WEBHOOK_URL: string;
	export const JWT_SECRET: string;
	export const ENCRYPTION_KEY: string;
	export const CLAUDE_WEB_SESSION_SECRET: string;
	export const TZ: string;
	export const NODE_OPTIONS: string;
	export const TEST_DATABASE_URL: string;
	export const TEST_REDIS_URL: string;
	export const ENABLE_TEST_MODE: string;
	export const MOCK_EXTERNAL_APIS: string;
	export const SKIP_AUTH_IN_TESTS: string;
	export const SHELL: string;
	export const npm_command: string;
	export const COREPACK_ENABLE_AUTO_PIN: string;
	export const GOOGLE_CLOUD_PROJECT_ALT: string;
	export const npm_config_userconfig: string;
	export const TABBY_GATEWAY_TOKEN: string;
	export const WEB_DASHBOARD_URL: string;
	export const npm_config_cache: string;
	export const HISTCONTROL: string;
	export const TERM_PROGRAM_VERSION: string;
	export const GOOGLE_AI: string;
	export const TMUX: string;
	export const HISTSIZE: string;
	export const HOSTNAME: string;
	export const NODE: string;
	export const LESS_TERMCAP_se: string;
	export const GOOGLE_CLOUD_PROJECT: string;
	export const LESS_TERMCAP_so: string;
	export const VULTR_INFERENCE_API_KEY: string;
	export const RUNNER_NAME: string;
	export const GOOGLE_AI_API_KEY: string;
	export const COLOR: string;
	export const npm_config_local_prefix: string;
	export const COMPOSE_PROJECT_NAME: string;
	export const VULTR_REGISTRY_PASSWORD: string;
	export const CLAUDE_AUTH_CACHE_DAYS: string;
	export const __ETC_PROFILE_NIX_SOURCED: string;
	export const TAVILY_API_KEY: string;
	export const VULTR_REGISTRY_USERNAME: string;
	export const npm_config_globalconfig: string;
	export const EDITOR: string;
	export const GOBIN: string;
	export const TABBY_GATEWAY_URL: string;
	export const OPENAI_BASE_URL: string;
	export const PWD: string;
	export const NIX_PROFILES: string;
	export const OVH_INFERENCE_BASE_URL: string;
	export const LOGNAME: string;
	export const JINA_AI_API_KEY: string;
	export const XDG_SESSION_TYPE: string;
	export const MODULESHOME: string;
	export const VOYAGE_API_KEY: string;
	export const npm_config_init_module: string;
	export const ARCHITECT_URL: string;
	export const ERL_FLAGS: string;
	export const HEX_CACHE_CLEANUP: string;
	export const CLAUDECODE: string;
	export const MOTD_SHOWN: string;
	export const GITHUB_TOKEN_NEW: string;
	export const GOOGLE_AI_PERSONAL_FREE: string;
	export const HOME: string;
	export const LANG: string;
	export const LS_COLORS: string;
	export const CARGO_HOME: string;
	export const RUSTUP_TOOLCHAIN: string;
	export const npm_package_version: string;
	export const STARSHIP_SHELL: string;
	export const __MISE_DIFF: string;
	export const NIX_SSL_CERT_FILE: string;
	export const GOOGLE_AI_BASE_URL: string;
	export const RUSTFLAGS: string;
	export const CF_ACCOUNT_ID: string;
	export const TABBY_GIST_ID: string;
	export const HEX_CACHE_SIZE: string;
	export const HEX_KEEP_ALL_PACKAGES: string;
	export const SSH_CONNECTION: string;
	export const GOROOT: string;
	export const COHERE_API_KEY: string;
	export const INIT_CWD: string;
	export const __MISE_SHIM: string;
	export const IMPLEMENTOR_URL: string;
	export const DEVMAIL: string;
	export const STARSHIP_SESSION_KEY: string;
	export const __MISE_ORIG_PATH: string;
	export const npm_lifecycle_script: string;
	export const GITHUB_API_TOKEN: string;
	export const npm_config_npm_version: string;
	export const TABBY_GATEWAY_BACKUP_GIST_ID: string;
	export const XDG_SESSION_CLASS: string;
	export const SELINUX_ROLE_REQUESTED: string;
	export const TERM: string;
	export const npm_package_name: string;
	export const LESS_TERMCAP_mb: string;
	export const SHELL_UPGRADED: string;
	export const LESS_TERMCAP_me: string;
	export const LESS_TERMCAP_md: string;
	export const RUSTUP_HOME: string;
	export const npm_config_prefix: string;
	export const GITHUB_REPO: string;
	export const LESSOPEN: string;
	export const USER: string;
	export const TMUX_PANE: string;
	export const ABUSEIPDB_API_KEY: string;
	export const cf_tunnel_1: string;
	export const LE_WORKING_DIR: string;
	export const MODULES_RUN_QUARANTINE: string;
	export const MISE_GITHUB_TOKEN: string;
	export const __MISE_SESSION: string;
	export const LOADEDMODULES: string;
	export const SELINUX_USE_CURRENT_RANGE: string;
	export const NICE_LEVEL: string;
	export const npm_lifecycle_event: string;
	export const LESS_TERMCAP_ue: string;
	export const SHLVL: string;
	export const LESS_TERMCAP_us: string;
	export const GIT_EDITOR: string;
	export const PAGER: string;
	export const CLOUDFLARE_API_TOKEN: string;
	export const CLAUDE_AUTH_GIST_ID: string;
	export const MCP_AUTH_TOKEN: string;
	export const CLAUDE_MD_GIST_ID: string;
	export const XDG_SESSION_ID: string;
	export const VULTR_REGISTRY_URL: string;
	export const npm_config_user_agent: string;
	export const OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE: string;
	export const npm_execpath: string;
	export const LD_LIBRARY_PATH: string;
	export const CF_GLOBAL_API_KEY: string;
	export const OVH_INFERENCE_API_KEY: string;
	export const CF_API_EMAIL: string;
	export const XDG_RUNTIME_DIR: string;
	export const npm_config_script_shell: string;
	export const SSH_CLIENT: string;
	export const OPENAI_API_BASE: string;
	export const CLAUDE_CODE_ENTRYPOINT: string;
	export const __MODULES_LMINIT: string;
	export const OLLAMA_API_URL: string;
	export const ELIXIR_ERL_OPTIONS: string;
	export const DEBUGINFOD_URLS: string;
	export const npm_package_json: string;
	export const OMP_NUM_THREADS: string;
	export const DEBUGINFOD_IMA_CERT_PATH: string;
	export const CLOUDFLARE_TUNNEL_TOKEN: string;
	export const which_declare: string;
	export const CLAUDE_CODE_OAUTH_TOKEN: string;
	export const UV_THREADPOOL_SIZE: string;
	export const MISE_SHELL: string;
	export const XDG_DATA_DIRS: string;
	export const npm_config_noproxy: string;
	export const PATH: string;
	export const SELINUX_LEVEL_REQUESTED: string;
	export const npm_config_node_gyp: string;
	export const MODULEPATH: string;
	export const HISTFILESIZE: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const GOOGLE_AI_KEY: string;
	export const RUST_BACKTRACE: string;
	export const npm_config_global_prefix: string;
	export const MAIL: string;
	export const SSH_TTY: string;
	export const NPM_CONFIG_ENGINE_STRICT: string;
	export const OPENROUTER_API_KEY: string;
	export const GENAISCRIPT_DEFAULT_MODEL: string;
	export const GITHUB_MODELS_TOKEN: string;
	export const npm_node_execpath: string;
	export const OLDPWD: string;
	export const npm_package_engines_node: string;
	export const MODULES_CMD: string;
	export const TERM_PROGRAM: string;
	export const CF_API_TOKEN: string;
	export const _: string;
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
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
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
		CLAUDE_TUI_HOST: string;
		CLAUDE_TUI_PORT: string;
		CLAUDE_MCP_TIMEOUT: string;
		CLAUDE_WS_HEARTBEAT_INTERVAL: string;
		CLAUDE_WS_MAX_CONNECTIONS: string;
		CLAUDE_MCP_CORS_ORIGIN: string;
		CORS_ORIGIN: string;
		FORCE_HTTPS: string;
		HSTS_MAX_AGE: string;
		CSP_DEFAULT_SRC: string;
		CSP_SCRIPT_SRC: string;
		CSP_STYLE_SRC: string;
		RATE_LIMIT_WINDOW: string;
		RATE_LIMIT_MAX_REQUESTS: string;
		RATE_LIMIT_MAX_TOKENS: string;
		SESSION_SECURE: string;
		SESSION_SAME_SITE: string;
		ANTHROPIC_API_KEY: string;
		CLAUDE_API_KEY: string;
		OPENAI_API_KEY: string;
		GITHUB_TOKEN: string;
		ANTHROPIC_MAX_TOKENS: string;
		ANTHROPIC_TEMPERATURE: string;
		ANTHROPIC_TIMEOUT: string;
		AI_FAILOVER_ENABLED: string;
		AI_HEALTH_CHECK_INTERVAL: string;
		AI_RETRY_ATTEMPTS: string;
		DATABASE_URL: string;
		SQLITE_DB_PATH: string;
		POSTGRES_URL: string;
		POSTGRES_HOST: string;
		POSTGRES_PORT: string;
		POSTGRES_USER: string;
		POSTGRES_PASSWORD: string;
		POSTGRES_DB: string;
		DATABASE_POOL_MIN: string;
		DATABASE_POOL_MAX: string;
		DATABASE_POOL_IDLE_TIMEOUT: string;
		DATABASE_SSL: string;
		LANCEDB_PATH: string;
		KUZU_PATH: string;
		VECTOR_DIMENSION: string;
		VECTOR_INDEX_SIZE_MB: string;
		DATABASE_AUTO_MIGRATE: string;
		DATABASE_MIGRATE_ON_START: string;
		DATABASE_BACKUP_ENABLED: string;
		REDIS_URL: string;
		REDIS_HOST: string;
		REDIS_PORT: string;
		REDIS_PASSWORD: string;
		REDIS_POOL_SIZE: string;
		MEMORY_CACHE_SIZE: string;
		MEMORY_CACHE_SIZE_MB: string;
		MEMORY_CACHE_TTL: string;
		SESSION_STORE: string;
		SESSION_SECRET: string;
		SESSION_MAX_AGE: string;
		SWARM_MAX_AGENTS: string;
		MAX_AGENTS: string;
		DEFAULT_SWARM_SIZE: string;
		SWARM_COORDINATION_TIMEOUT: string;
		MAX_CONCURRENT_TASKS: string;
		AGENT_MAX_MEMORY: string;
		AGENT_TIMEOUT: string;
		AGENT_RETRY_ATTEMPTS: string;
		AGENT_SPAWN_DELAY: string;
		CLAUDE_WORK_DIR: string;
		CLAUDE_TEMP_DIR: string;
		CLAUDE_CACHE_DIR: string;
		CLAUDE_CONFIG_DIR: string;
		MAX_FILE_SIZE: string;
		MAX_FILES_PER_REQUEST: string;
		DOCUMENT_MAX_SIZE: string;
		DOCUMENT_PROCESSING_TIMEOUT: string;
		HEALTH_CHECK_ENABLED: string;
		HEALTH_CHECK_TIMEOUT: string;
		ENABLE_HEALTH_CHECKS: string;
		METRICS_ENABLED: string;
		ENABLE_METRICS: string;
		METRICS_INTERVAL: string;
		PERFORMANCE_MONITORING: string;
		PERFORMANCE_THRESHOLD_CPU: string;
		PERFORMANCE_THRESHOLD_MEMORY: string;
		DATADOG_API_KEY: string;
		SENTRY_DSN: string;
		NEW_RELIC_LICENSE_KEY: string;
		BACKUP_ENABLED: string;
		BACKUP_INTERVAL: string;
		BACKUP_RETENTION: string;
		MCP_HTTP_ENABLED: string;
		MCP_STDIO_ENABLED: string;
		MCP_WEBSOCKET_ENABLED: string;
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
		DEBUG_TRACE_REQUESTS: string;
		DEBUG_MEMORY_LEAKS: string;
		VERBOSE_LOGGING: string;
		ENABLE_PROFILING: string;
		ENABLE_TRACING: string;
		DEV_TOOLS_ENABLED: string;
		HOT_RELOAD_ENABLED: string;
		SOURCE_MAPS_ENABLED: string;
		ENABLE_GPU: string;
		ENABLE_SIMD: string;
		WORKER_THREADS: string;
		ENABLE_NEURAL_NETWORKS: string;
		ENABLE_VECTOR_SEARCH: string;
		ENABLE_GRAPH_ANALYSIS: string;
		ENABLE_VISION_PIPELINE: string;
		WEBHOOK_URL: string;
		SLACK_WEBHOOK_URL: string;
		DISCORD_WEBHOOK_URL: string;
		JWT_SECRET: string;
		ENCRYPTION_KEY: string;
		CLAUDE_WEB_SESSION_SECRET: string;
		TZ: string;
		NODE_OPTIONS: string;
		TEST_DATABASE_URL: string;
		TEST_REDIS_URL: string;
		ENABLE_TEST_MODE: string;
		MOCK_EXTERNAL_APIS: string;
		SKIP_AUTH_IN_TESTS: string;
		SHELL: string;
		npm_command: string;
		COREPACK_ENABLE_AUTO_PIN: string;
		GOOGLE_CLOUD_PROJECT_ALT: string;
		npm_config_userconfig: string;
		TABBY_GATEWAY_TOKEN: string;
		WEB_DASHBOARD_URL: string;
		npm_config_cache: string;
		HISTCONTROL: string;
		TERM_PROGRAM_VERSION: string;
		GOOGLE_AI: string;
		TMUX: string;
		HISTSIZE: string;
		HOSTNAME: string;
		NODE: string;
		LESS_TERMCAP_se: string;
		GOOGLE_CLOUD_PROJECT: string;
		LESS_TERMCAP_so: string;
		VULTR_INFERENCE_API_KEY: string;
		RUNNER_NAME: string;
		GOOGLE_AI_API_KEY: string;
		COLOR: string;
		npm_config_local_prefix: string;
		COMPOSE_PROJECT_NAME: string;
		VULTR_REGISTRY_PASSWORD: string;
		CLAUDE_AUTH_CACHE_DAYS: string;
		__ETC_PROFILE_NIX_SOURCED: string;
		TAVILY_API_KEY: string;
		VULTR_REGISTRY_USERNAME: string;
		npm_config_globalconfig: string;
		EDITOR: string;
		GOBIN: string;
		TABBY_GATEWAY_URL: string;
		OPENAI_BASE_URL: string;
		PWD: string;
		NIX_PROFILES: string;
		OVH_INFERENCE_BASE_URL: string;
		LOGNAME: string;
		JINA_AI_API_KEY: string;
		XDG_SESSION_TYPE: string;
		MODULESHOME: string;
		VOYAGE_API_KEY: string;
		npm_config_init_module: string;
		ARCHITECT_URL: string;
		ERL_FLAGS: string;
		HEX_CACHE_CLEANUP: string;
		CLAUDECODE: string;
		MOTD_SHOWN: string;
		GITHUB_TOKEN_NEW: string;
		GOOGLE_AI_PERSONAL_FREE: string;
		HOME: string;
		LANG: string;
		LS_COLORS: string;
		CARGO_HOME: string;
		RUSTUP_TOOLCHAIN: string;
		npm_package_version: string;
		STARSHIP_SHELL: string;
		__MISE_DIFF: string;
		NIX_SSL_CERT_FILE: string;
		GOOGLE_AI_BASE_URL: string;
		RUSTFLAGS: string;
		CF_ACCOUNT_ID: string;
		TABBY_GIST_ID: string;
		HEX_CACHE_SIZE: string;
		HEX_KEEP_ALL_PACKAGES: string;
		SSH_CONNECTION: string;
		GOROOT: string;
		COHERE_API_KEY: string;
		INIT_CWD: string;
		__MISE_SHIM: string;
		IMPLEMENTOR_URL: string;
		DEVMAIL: string;
		STARSHIP_SESSION_KEY: string;
		__MISE_ORIG_PATH: string;
		npm_lifecycle_script: string;
		GITHUB_API_TOKEN: string;
		npm_config_npm_version: string;
		TABBY_GATEWAY_BACKUP_GIST_ID: string;
		XDG_SESSION_CLASS: string;
		SELINUX_ROLE_REQUESTED: string;
		TERM: string;
		npm_package_name: string;
		LESS_TERMCAP_mb: string;
		SHELL_UPGRADED: string;
		LESS_TERMCAP_me: string;
		LESS_TERMCAP_md: string;
		RUSTUP_HOME: string;
		npm_config_prefix: string;
		GITHUB_REPO: string;
		LESSOPEN: string;
		USER: string;
		TMUX_PANE: string;
		ABUSEIPDB_API_KEY: string;
		cf_tunnel_1: string;
		LE_WORKING_DIR: string;
		MODULES_RUN_QUARANTINE: string;
		MISE_GITHUB_TOKEN: string;
		__MISE_SESSION: string;
		LOADEDMODULES: string;
		SELINUX_USE_CURRENT_RANGE: string;
		NICE_LEVEL: string;
		npm_lifecycle_event: string;
		LESS_TERMCAP_ue: string;
		SHLVL: string;
		LESS_TERMCAP_us: string;
		GIT_EDITOR: string;
		PAGER: string;
		CLOUDFLARE_API_TOKEN: string;
		CLAUDE_AUTH_GIST_ID: string;
		MCP_AUTH_TOKEN: string;
		CLAUDE_MD_GIST_ID: string;
		XDG_SESSION_ID: string;
		VULTR_REGISTRY_URL: string;
		npm_config_user_agent: string;
		OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE: string;
		npm_execpath: string;
		LD_LIBRARY_PATH: string;
		CF_GLOBAL_API_KEY: string;
		OVH_INFERENCE_API_KEY: string;
		CF_API_EMAIL: string;
		XDG_RUNTIME_DIR: string;
		npm_config_script_shell: string;
		SSH_CLIENT: string;
		OPENAI_API_BASE: string;
		CLAUDE_CODE_ENTRYPOINT: string;
		__MODULES_LMINIT: string;
		OLLAMA_API_URL: string;
		ELIXIR_ERL_OPTIONS: string;
		DEBUGINFOD_URLS: string;
		npm_package_json: string;
		OMP_NUM_THREADS: string;
		DEBUGINFOD_IMA_CERT_PATH: string;
		CLOUDFLARE_TUNNEL_TOKEN: string;
		which_declare: string;
		CLAUDE_CODE_OAUTH_TOKEN: string;
		UV_THREADPOOL_SIZE: string;
		MISE_SHELL: string;
		XDG_DATA_DIRS: string;
		npm_config_noproxy: string;
		PATH: string;
		SELINUX_LEVEL_REQUESTED: string;
		npm_config_node_gyp: string;
		MODULEPATH: string;
		HISTFILESIZE: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		GOOGLE_AI_KEY: string;
		RUST_BACKTRACE: string;
		npm_config_global_prefix: string;
		MAIL: string;
		SSH_TTY: string;
		NPM_CONFIG_ENGINE_STRICT: string;
		OPENROUTER_API_KEY: string;
		GENAISCRIPT_DEFAULT_MODEL: string;
		GITHUB_MODELS_TOKEN: string;
		npm_node_execpath: string;
		OLDPWD: string;
		npm_package_engines_node: string;
		MODULES_CMD: string;
		TERM_PROGRAM: string;
		CF_API_TOKEN: string;
		_: string;
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
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
