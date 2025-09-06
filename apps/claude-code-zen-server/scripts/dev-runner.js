#!/usr/bin/env node

import { execSync, spawn } from "node:child_process";
import { watch } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";

// Simple logger for development runner
const logger = {
	info: (msg) => console.log(`[${new Date().toISOString()}] INFO: ${msg}`),
	error: (msg) => console.error(`[${new Date().toISOString()}] ERROR: ${msg}`),
	warn: (msg) => console.warn(`[${new Date().toISOString()}] WARN: ${msg}`),
	debug: (msg) => console.log(`[${new Date().toISOString()}] DEBUG: ${msg}`)
};

// LogTape syslog bridge - optional feature
let syslogBridge = null;
try {
	// Try to import syslog bridge if available
	const syslogModule = await import("../src/utils/logtape-syslog-bridge");
	syslogBridge = syslogModule.syslogBridge;
	logger.info(" LogTape syslog bridge loaded successfully");
} catch {
	logger.info("ℹ️ LogTape syslog bridge not available (optional feature)");
	// Provide a simple null implementation
	syslogBridge = {
		info: () => {},
		error: () => {},
		warn: () => {},
		debug: () => {},
	};
}

const PORT = process.env.PORT || 3000;

let mainServer = null;
let errorServer = null;
let lastError = null;
let fileWatcher = null;
let isCheckingTypes = false;
let debounceTimer = null;

// ANSI color codes for terminal
const colors = {
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
	white: "\x1b[37m",
	reset: "\x1b[0m",
	bold: "\x1b[1m",
};

// Helper function to find tsc path and handle spawn ENOENT issues
function getTscCommand() {
	try {
		// Try to use local tsc from node_modules
		const localTscPath = path.join(
			process.cwd(),
			"apps/claude-code-zen-server/node_modules/.bin/tsc",
		);
		execSync(`${localTscPath} --version`, { stdio: "ignore" });
		return localTscPath;
	} catch {
		// Fallback to npx tsc
		try {
			const npxPath = execSync("which npx", { encoding: "utf8" }).trim();
			return [npxPath, "tsc"];
		} catch {
			return ["npx", "tsc"];
		}
	}
}

function createErrorPage(error) {
	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude Code Zen - Compile Error</title>
    <style>
        body {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            background: #1a1a1a;
            color: #fff;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background: #ff4757;
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .error-content {
            background: #2d3436;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #ff4757;
        }
        .error-text {
            white-space: pre-wrap;
            overflow-x: auto;
            font-size: 14px;
        }
        .status {
            background: #74b9ff;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            margin-bottom: 20px;
            text-align: center;
        }
        .auto-refresh {
            position: fixed;
            top: 10px;
            right: 10px;
            background: #00b894;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 12px;
        }
    </style>
    <script>
        // Auto-refresh every 30 seconds
        setTimeout(() => window.location.reload(), 30000);
    </script>
</head>
<body>
    <div class="auto-refresh">Auto-refreshing in 30s...</div>
    <div class="container">
        <div class="header">
            <h1> Claude Code Zen - TypeScript Compile Error</h1>
            <p>Fix the error below and the server will auto-restart</p>
        </div>
        
        <div class="status">
            <strong>Status:</strong> Waiting for fix... Watching files for changes
        </div>
        
        <div class="error-content">
            <h3>Error Details:</h3>
            <div class="error-text">${error}</div>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #636e72; border-radius: 4px; color: #ddd;">
            <strong> Tips:</strong>
            <ul>
                <li>This page auto-refreshes every 30 seconds</li>
                <li>The server will restart automatically when you fix the error</li>
                <li>Check your TypeScript files for syntax errors</li>
                <li>Look for missing imports or type errors</li>
            </ul>
        </div>
    </div>
</body>
</html>`;
}

function startErrorServer() {
	if (errorServer) return;

	errorServer = createServer((_req, res) => {
		res.writeHead(200, {
			"Content-Type": "text/html",
			"Cache-Control": "no-cache",
		});

		if (lastError) {
			res.end(createErrorPage(lastError));
		} else {
			res.end(createErrorPage("Server starting..."));
		}
	});

	errorServer.listen(PORT, () => {
		logger.info(
			`${colors.yellow} Error server running at http://localhost:${PORT}${colors.reset}`,
		);
		logger.info(
			`${colors.cyan}   Fix the TypeScript errors and the main server will restart${colors.reset}`,
		);
	});
}

function stopErrorServer() {
	if (errorServer) {
		errorServer.close();
		errorServer = null;
	}
}

function runTypeCheck() {
	return new Promise((resolve, reject) => {
		logger.info(
			`${colors.blue} Running TypeScript type check...${colors.reset}`,
		);

		const tscCommand = getTscCommand();
		let tsc;
		if (Array.isArray(tscCommand)) {
			// Using npx tsc
			tsc = spawn(
				tscCommand[0],
				[tscCommand[1], "--noEmit", "--project", "./tsconfig.json"],
				{
					stdio: "pipe",
					cwd: process.cwd(),
					env: { ...process.env, PATH: process.env.PATH },
				},
			);
		} else {
			// Using local tsc
			tsc = spawn(tscCommand, ["--noEmit", "--project", "./tsconfig.json"], {
				stdio: "pipe",
				cwd: process.cwd(),
				env: { ...process.env, PATH: process.env.PATH },
			});
		}

		let stdout = "";
		let stderr = "";

		tsc.stdout.on("data", (data) => {
			stdout += data.toString();
		});

		tsc.stderr.on("data", (data) => {
			stderr += data.toString();
		});

		tsc.on("close", (code) => {
			if (code === 0) {
				logger.info(`${colors.green} TypeScript check passed${colors.reset}`);
				if (syslogBridge) {
					syslogBridge.info("typescript", "TypeScript compilation successful", {
						exitCode: code,
						component: "tsc",
					});
				}
				resolve();
			} else {
				const error = stderr || stdout || "Unknown TypeScript error";
				logger.info(`${colors.red} TypeScript check failed:${colors.reset}`);
				logger.info(error);
				if (syslogBridge) {
					syslogBridge.error("typescript", "TypeScript compilation failed", {
						exitCode: code,
						errorOutput: error.substring(0, 500), // Truncate for syslog
						component: "tsc",
					});
				}
				reject(error);
			}
		});
	});
}

function startMainServer() {
	return new Promise((resolve, reject) => {
		logger.info(`${colors.green} Starting main server...${colors.reset}`);

		try {
			const npxPath = execSync("which npx", { encoding: "utf8" }).trim();
			mainServer = spawn(npxPath, ["tsx", "./src/main.ts"], {
				stdio: ["inherit", "inherit", "pipe"],
				cwd: path.join(process.cwd(), "apps/claude-code-zen-server"),
				env: { ...process.env, NODE_ENV: "development" },
			});
		} catch {
			// Fallback to direct node command if npx fails
			mainServer = spawn("node", ["--require", "tsx/cjs", "./src/main.ts"], {
				stdio: ["inherit", "inherit", "pipe"],
				cwd: path.join(process.cwd(), "apps/claude-code-zen-server"),
				env: { ...process.env, NODE_ENV: "development" },
			});
		}

		let startupError = "";

		mainServer.stderr.on("data", (data) => {
			const errorText = data.toString();
			logger.error(errorText);
			startupError += errorText;
		});

		mainServer.on("close", (code) => {
			if (code !== 0 && code !== null) {
				logger.info(
					`${colors.red} Main server exited with code ${code}${colors.reset}`,
				);
				lastError = startupError || `Server exited with code ${code}`;
				reject(new Error(lastError));
			}
		});

		// Give the server a moment to start
		setTimeout(() => {
			if (mainServer && !mainServer.killed) {
				logger.info(
					`${colors.green} Main server started successfully${colors.reset}`,
				);
				if (syslogBridge) {
					syslogBridge.info(
						"main-server",
						"Claude Code Zen server started successfully",
						{
							port: PORT,
							pid: mainServer.pid,
							component: "tsx",
						},
					);
				}
				resolve();
			}
		}, 2000);
	});
}

function stopMainServer() {
	if (mainServer) {
		mainServer.kill("SIGTERM");
		mainServer = null;
	}
}

function broadcastMessage(message) {
	try {
		const { spawn } = require("node:child_process");
		spawn("/home/mhugo/code/claude-code-zen/broadcast-reload.sh", [message], {
			stdio: "inherit",
			detached: true,
		});

		// Also log to syslog for centralized logging
		if (syslogBridge) {
			syslogBridge.info("dev-runner", message, {
				type: "broadcast",
				pid: process.pid,
			});
		}
	} catch {
		// Ignore broadcast errors - non-critical
	}
}

function startFileWatcher() {
	if (fileWatcher) return;

	logger.info(
		`${colors.blue}️ Watching for TypeScript file changes...${colors.reset}`,
	);

	// Watch TypeScript files for changes from the server directory
	const serverDir = path.join(process.cwd(), "apps/claude-code-zen-server");
	const srcDir = path.join(serverDir, "src");

	fileWatcher = watch(srcDir, { recursive: true }, (_eventType, filename) => {
		if (filename?.endsWith(".ts") && !isCheckingTypes) {
			logger.info(`${colors.cyan} File changed: ${filename}${colors.reset}`);

			// Clear existing timer
			if (debounceTimer) {
				clearTimeout(debounceTimer);
			}

			// Set new timer with 10 second debounce
			debounceTimer = setTimeout(async () => {
				if (isCheckingTypes) return; // Double-check

				logger.info(
					`${colors.blue} Debounce complete, checking TypeScript after file changes...${colors.reset}`,
				);
				broadcastMessage(
					" Claude Code Zen: File changes detected, checking TypeScript...",
				);

				isCheckingTypes = true;
				try {
					await runTypeCheck();

					// TypeScript passed! Switch to main server
					logger.info(
						`${colors.green} TypeScript errors fixed! Starting main server...${colors.reset}`,
					);
					broadcastMessage(
						" Claude Code Zen: TypeScript errors fixed! Starting main server...",
					);

					stopErrorServer();
					lastError = null;
					await startMainServer();

					broadcastMessage(
						" Claude Code Zen: Server ready at http://localhost:3000",
					);
				} catch (error) {
					// Still has errors, update error server
					lastError = error.toString();
					logger.info(
						`${colors.yellow} TypeScript errors still present, updating error page...${colors.reset}`,
					);
					broadcastMessage(
						" Claude Code Zen: TypeScript errors still present...",
					);
				}
				isCheckingTypes = false;
				debounceTimer = null;
			}, 30000); // 30 second debounce for batch file operations

			logger.info(
				`${colors.magenta}⏱️ TypeScript check scheduled in 30 seconds... (batching file changes)${colors.reset}`,
			);
		}
	});
}

function stopFileWatcher() {
	if (debounceTimer) {
		clearTimeout(debounceTimer);
		debounceTimer = null;
	}
	if (fileWatcher) {
		fileWatcher.close();
		fileWatcher = null;
	}
}

async function start() {
	logger.info(
		`${colors.bold}${colors.cyan} Claude Code Zen Development Runner${colors.reset}`,
	);
	logger.info(
		`${colors.cyan}   TypeScript checking + Error visualization${colors.reset}`,
	);
	logger.info(
		`${colors.green} Reload Instructions: See SYSTEMD_INSTRUCTIONS.md & CLAUDE.md${colors.reset}\n`,
	);

	try {
		// First, check TypeScript
		await runTypeCheck();

		// TypeScript is good, stop error server and start main server
		stopErrorServer();
		lastError = null;

		// Broadcast success message
		broadcastMessage(
			" Claude Code Zen: TypeScript check passed, server starting...",
		);

		await startMainServer();

		// Start file watcher for ongoing development
		startFileWatcher();

		// Broadcast server ready
		broadcastMessage(
			" Claude Code Zen: Server ready at http://localhost:3000",
		);
	} catch (error) {
		// TypeScript failed or server crashed
		lastError = error.toString();

		logger.info(
			`${colors.red} Error detected - starting error server${colors.reset}`,
		);

		// Broadcast error message
		broadcastMessage(
			" Claude Code Zen: TypeScript errors detected! Fix errors to continue...",
		);

		stopMainServer();
		startErrorServer();

		// Start file watcher to automatically detect fixes
		startFileWatcher();

		logger.info(
			`${colors.yellow} Error server running. File watcher active - will auto-restart when TypeScript errors are fixed.${colors.reset}`,
		);
	}
}

// Handle shutdown gracefully
process.on("SIGTERM", () => {
	logger.info(
		`${colors.yellow} Received SIGTERM, shutting down gracefully...${colors.reset}`,
	);
	stopFileWatcher();
	stopMainServer();
	stopErrorServer();
	process.exit(0);
});

process.on("SIGINT", () => {
	logger.info(
		`${colors.yellow} Received SIGINT, shutting down gracefully...${colors.reset}`,
	);
	stopFileWatcher();
	stopMainServer();
	stopErrorServer();
	process.exit(0);
});

// Start the development server
start();
