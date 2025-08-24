
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
	export const SHELL: string;
	export const npm_command: string;
	export const COREPACK_ENABLE_AUTO_PIN: string;
	export const GOOGLE_CLOUD_PROJECT_ALT: string;
	export const TABBY_GATEWAY_TOKEN: string;
	export const WEB_DASHBOARD_URL: string;
	export const HISTCONTROL: string;
	export const GOOGLE_AI: string;
	export const HOSTNAME: string;
	export const HISTSIZE: string;
	export const NODE: string;
	export const NODE_OPTIONS: string;
	export const LESS_TERMCAP_se: string;
	export const GOOGLE_CLOUD_PROJECT: string;
	export const LESS_TERMCAP_so: string;
	export const VULTR_INFERENCE_API_KEY: string;
	export const RUNNER_NAME: string;
	export const npm_config_verify_deps_before_run: string;
	export const GOOGLE_AI_API_KEY: string;
	export const npm_config__jsr_registry: string;
	export const OPENAI_API_KEY: string;
	export const VULTR_REGISTRY_PASSWORD: string;
	export const CLAUDE_AUTH_CACHE_DAYS: string;
	export const __ETC_PROFILE_NIX_SOURCED: string;
	export const TAVILY_API_KEY: string;
	export const VULTR_REGISTRY_USERNAME: string;
	export const npm_config_dedupe_peer_dependents: string;
	export const EDITOR: string;
	export const GOBIN: string;
	export const TABBY_GATEWAY_URL: string;
	export const OPENAI_BASE_URL: string;
	export const PWD: string;
	export const NIX_PROFILES: string;
	export const OVH_INFERENCE_BASE_URL: string;
	export const npm_config_save_prefix: string;
	export const LOGNAME: string;
	export const JINA_AI_API_KEY: string;
	export const npm_config__claude_zen_registry: string;
	export const XDG_SESSION_TYPE: string;
	export const npm_config_auto_install_peers: string;
	export const MODULESHOME: string;
	export const VOYAGE_API_KEY: string;
	export const ARCHITECT_URL: string;
	export const npm_config_catalog: string;
	export const npm_config_recursive: string;
	export const npm_config_global_dir: string;
	export const CLAUDECODE: string;
	export const MOTD_SHOWN: string;
	export const GITHUB_TOKEN_NEW: string;
	export const GOOGLE_AI_PERSONAL_FREE: string;
	export const HOME: string;
	export const LANG: string;
	export const GITHUB_TOKEN: string;
	export const LS_COLORS: string;
	export const npm_package_version: string;
	export const STARSHIP_SHELL: string;
	export const __MISE_DIFF: string;
	export const NIX_SSL_CERT_FILE: string;
	export const GOOGLE_AI_BASE_URL: string;
	export const RUSTFLAGS: string;
	export const CF_ACCOUNT_ID: string;
	export const TABBY_GIST_ID: string;
	export const pnpm_config_verify_deps_before_run: string;
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
	export const TABBY_GATEWAY_BACKUP_GIST_ID: string;
	export const XDG_SESSION_CLASS: string;
	export const SELINUX_ROLE_REQUESTED: string;
	export const TERM: string;
	export const LESS_TERMCAP_mb: string;
	export const npm_package_name: string;
	export const SHELL_UPGRADED: string;
	export const LESS_TERMCAP_me: string;
	export const LESS_TERMCAP_md: string;
	export const npm_config_prefix: string;
	export const GITHUB_REPO: string;
	export const LESSOPEN: string;
	export const USER: string;
	export const npm_config_frozen_lockfile: string;
	export const ABUSEIPDB_API_KEY: string;
	export const cf_tunnel_1: string;
	export const MODULES_RUN_QUARANTINE: string;
	export const __MISE_SESSION: string;
	export const LOADEDMODULES: string;
	export const SELINUX_USE_CURRENT_RANGE: string;
	export const npm_config_global_bin_dir: string;
	export const npm_lifecycle_event: string;
	export const SHLVL: string;
	export const LESS_TERMCAP_ue: string;
	export const LESS_TERMCAP_us: string;
	export const GIT_EDITOR: string;
	export const PAGER: string;
	export const CLOUDFLARE_API_TOKEN: string;
	export const MCP_AUTH_TOKEN: string;
	export const CLAUDE_AUTH_GIST_ID: string;
	export const CLAUDE_MD_GIST_ID: string;
	export const XDG_SESSION_ID: string;
	export const VULTR_REGISTRY_URL: string;
	export const npm_config_user_agent: string;
	export const OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE: string;
	export const PNPM_SCRIPT_SRC_DIR: string;
	export const npm_execpath: string;
	export const CF_GLOBAL_API_KEY: string;
	export const OVH_INFERENCE_API_KEY: string;
	export const CF_API_EMAIL: string;
	export const XDG_RUNTIME_DIR: string;
	export const npm_config_script_shell: string;
	export const NODE_PATH: string;
	export const SSH_CLIENT: string;
	export const OPENAI_API_BASE: string;
	export const CLAUDE_CODE_ENTRYPOINT: string;
	export const __MODULES_LMINIT: string;
	export const OLLAMA_API_URL: string;
	export const DEBUGINFOD_URLS: string;
	export const npm_package_json: string;
	export const DEBUGINFOD_IMA_CERT_PATH: string;
	export const CLOUDFLARE_TUNNEL_TOKEN: string;
	export const which_declare: string;
	export const UV_THREADPOOL_SIZE: string;
	export const MISE_SHELL: string;
	export const XDG_DATA_DIRS: string;
	export const PATH: string;
	export const SELINUX_LEVEL_REQUESTED: string;
	export const MODULEPATH: string;
	export const HISTFILESIZE: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const GOOGLE_AI_KEY: string;
	export const RUST_BACKTRACE: string;
	export const npm_config_update_notifier: string;
	export const MAIL: string;
	export const SSH_TTY: string;
	export const npm_config_registry: string;
	export const NPM_CONFIG_ENGINE_STRICT: string;
	export const OPENROUTER_API_KEY: string;
	export const GITHUB_MODELS_TOKEN: string;
	export const npm_node_execpath: string;
	export const npm_config_engine_strict: string;
	export const MODULES_CMD: string;
	export const CF_API_TOKEN: string;
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
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		SHELL: string;
		npm_command: string;
		COREPACK_ENABLE_AUTO_PIN: string;
		GOOGLE_CLOUD_PROJECT_ALT: string;
		TABBY_GATEWAY_TOKEN: string;
		WEB_DASHBOARD_URL: string;
		HISTCONTROL: string;
		GOOGLE_AI: string;
		HOSTNAME: string;
		HISTSIZE: string;
		NODE: string;
		NODE_OPTIONS: string;
		LESS_TERMCAP_se: string;
		GOOGLE_CLOUD_PROJECT: string;
		LESS_TERMCAP_so: string;
		VULTR_INFERENCE_API_KEY: string;
		RUNNER_NAME: string;
		npm_config_verify_deps_before_run: string;
		GOOGLE_AI_API_KEY: string;
		npm_config__jsr_registry: string;
		OPENAI_API_KEY: string;
		VULTR_REGISTRY_PASSWORD: string;
		CLAUDE_AUTH_CACHE_DAYS: string;
		__ETC_PROFILE_NIX_SOURCED: string;
		TAVILY_API_KEY: string;
		VULTR_REGISTRY_USERNAME: string;
		npm_config_dedupe_peer_dependents: string;
		EDITOR: string;
		GOBIN: string;
		TABBY_GATEWAY_URL: string;
		OPENAI_BASE_URL: string;
		PWD: string;
		NIX_PROFILES: string;
		OVH_INFERENCE_BASE_URL: string;
		npm_config_save_prefix: string;
		LOGNAME: string;
		JINA_AI_API_KEY: string;
		npm_config__claude_zen_registry: string;
		XDG_SESSION_TYPE: string;
		npm_config_auto_install_peers: string;
		MODULESHOME: string;
		VOYAGE_API_KEY: string;
		ARCHITECT_URL: string;
		npm_config_catalog: string;
		npm_config_recursive: string;
		npm_config_global_dir: string;
		CLAUDECODE: string;
		MOTD_SHOWN: string;
		GITHUB_TOKEN_NEW: string;
		GOOGLE_AI_PERSONAL_FREE: string;
		HOME: string;
		LANG: string;
		GITHUB_TOKEN: string;
		LS_COLORS: string;
		npm_package_version: string;
		STARSHIP_SHELL: string;
		__MISE_DIFF: string;
		NIX_SSL_CERT_FILE: string;
		GOOGLE_AI_BASE_URL: string;
		RUSTFLAGS: string;
		CF_ACCOUNT_ID: string;
		TABBY_GIST_ID: string;
		pnpm_config_verify_deps_before_run: string;
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
		TABBY_GATEWAY_BACKUP_GIST_ID: string;
		XDG_SESSION_CLASS: string;
		SELINUX_ROLE_REQUESTED: string;
		TERM: string;
		LESS_TERMCAP_mb: string;
		npm_package_name: string;
		SHELL_UPGRADED: string;
		LESS_TERMCAP_me: string;
		LESS_TERMCAP_md: string;
		npm_config_prefix: string;
		GITHUB_REPO: string;
		LESSOPEN: string;
		USER: string;
		npm_config_frozen_lockfile: string;
		ABUSEIPDB_API_KEY: string;
		cf_tunnel_1: string;
		MODULES_RUN_QUARANTINE: string;
		__MISE_SESSION: string;
		LOADEDMODULES: string;
		SELINUX_USE_CURRENT_RANGE: string;
		npm_config_global_bin_dir: string;
		npm_lifecycle_event: string;
		SHLVL: string;
		LESS_TERMCAP_ue: string;
		LESS_TERMCAP_us: string;
		GIT_EDITOR: string;
		PAGER: string;
		CLOUDFLARE_API_TOKEN: string;
		MCP_AUTH_TOKEN: string;
		CLAUDE_AUTH_GIST_ID: string;
		CLAUDE_MD_GIST_ID: string;
		XDG_SESSION_ID: string;
		VULTR_REGISTRY_URL: string;
		npm_config_user_agent: string;
		OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE: string;
		PNPM_SCRIPT_SRC_DIR: string;
		npm_execpath: string;
		CF_GLOBAL_API_KEY: string;
		OVH_INFERENCE_API_KEY: string;
		CF_API_EMAIL: string;
		XDG_RUNTIME_DIR: string;
		npm_config_script_shell: string;
		NODE_PATH: string;
		SSH_CLIENT: string;
		OPENAI_API_BASE: string;
		CLAUDE_CODE_ENTRYPOINT: string;
		__MODULES_LMINIT: string;
		OLLAMA_API_URL: string;
		DEBUGINFOD_URLS: string;
		npm_package_json: string;
		DEBUGINFOD_IMA_CERT_PATH: string;
		CLOUDFLARE_TUNNEL_TOKEN: string;
		which_declare: string;
		UV_THREADPOOL_SIZE: string;
		MISE_SHELL: string;
		XDG_DATA_DIRS: string;
		PATH: string;
		SELINUX_LEVEL_REQUESTED: string;
		MODULEPATH: string;
		HISTFILESIZE: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		GOOGLE_AI_KEY: string;
		RUST_BACKTRACE: string;
		npm_config_update_notifier: string;
		MAIL: string;
		SSH_TTY: string;
		npm_config_registry: string;
		NPM_CONFIG_ENGINE_STRICT: string;
		OPENROUTER_API_KEY: string;
		GITHUB_MODELS_TOKEN: string;
		npm_node_execpath: string;
		npm_config_engine_strict: string;
		MODULES_CMD: string;
		CF_API_TOKEN: string;
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
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
