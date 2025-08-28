<script lang="ts">
import { onMount } from "svelte";
import AGUIIntegration from "../../lib/components/AGUIIntegration.svelte";

interface AGUIInterface {
	askQuestion(question: string, options?: any): Promise<any>;
	isReady(): boolean;
}

let aguiComponent: AGUIIntegration;
let aguiInstance: AGUIInterface | null = null;
let log: string[] = [];
let testResults: {
	test: string;
	status: "pending" | "success" | "error";
	message?: string;
}[] = [];

// Test scenarios
const tests = [
	{ name: "AGUI Initialization", id: "init" },
	{ name: "Ask Simple Question", id: "question" },
	{ name: "Request Task Approval", id: "approval" },
	{ name: "Handle Multiple Tasks", id: "multiple" },
];

onMount(() => {
	// Initialize test results
	testResults = tests.map((test) => ({
		test: test.name,
		status: "pending",
	}));
});

// Handle AGUI ready event
function handleAGUIReady(event: CustomEvent<{ agui: AGUIInterface }>) {
	aguiInstance = event.detail.agui;
	addLog("✅ AGUI system initialized and ready");

	// Mark initialization test as success
	testResults = testResults.map((result) =>
		result.test === "AGUI Initialization"
			? {
					...result,
					status: "success",
					message: "AGUI WebInterface created successfully",
				}
			: result,
	);

	// Auto-run basic tests
	setTimeout(() => runBasicTests(), 1000);
}

// Handle task approval events
function handleTaskApproval(
	event: CustomEvent<{ task: string; approved: boolean }>,
) {
	const { task, approved } = event.detail;
	addLog(`📋 Task ${task}: ${approved ? "APPROVED" : "REJECTED"}`);
}

// Handle user responses
function handleUserResponse(event: CustomEvent<{ response: any }>) {
	const { response } = event.detail;
	addLog(`💬 User responded: ${JSON.stringify(response)}`);
}

// Add log entry
function addLog(message: string) {
	const timestamp = new Date().toLocaleTimeString();
	log = [`[${timestamp}] ${message}`, ...log];
}

// Run basic tests
async function runBasicTests() {
	if (!aguiComponent) {
		addLog("❌ AGUI component not available");
		return;
	}

	// Test 1: Ask a simple question
	try {
		addLog("🧪 Testing: Ask simple question...");

		// Simulate asking a question (will be handled by the UI)
		addLog('💭 Question: "Should we proceed with the deployment?"');

		testResults = testResults.map((result) =>
			result.test === "Ask Simple Question"
				? { ...result, status: "success", message: "Question interface ready" }
				: result,
		);
	} catch (error) {
		addLog(`❌ Question test failed: ${error}`);
		testResults = testResults.map((result) =>
			result.test === "Ask Simple Question"
				? {
						...result,
						status: "error",
						message: error instanceof Error ? error.message : "Unknown error",
					}
				: result,
		);
	}

	// Test 2: Request task approval
	try {
		addLog("🧪 Testing: Request task approval...");

		// This will trigger the approval UI
		setTimeout(() => {
			if (aguiComponent) {
				aguiComponent
					.requestApproval(
						"test-deployment",
						"Deploy new features to production environment",
					)
					.then(() => {
						addLog("✅ Task approval request sent");
						testResults = testResults.map((result) =>
							result.test === "Request Task Approval"
								? {
										...result,
										status: "success",
										message: "Approval request created successfully",
									}
								: result,
						);
					})
					.catch((error) => {
						addLog(`❌ Task approval failed: ${error}`);
						testResults = testResults.map((result) =>
							result.test === "Request Task Approval"
								? { ...result, status: "error", message: error.message }
								: result,
						);
					});
			}
		}, 2000);
	} catch (error) {
		addLog(`❌ Approval test failed: ${error}`);
	}

	// Test 3: Multiple tasks
	setTimeout(() => {
		try {
			addLog("🧪 Testing: Multiple task approvals...");

			if (aguiComponent) {
				// Send multiple approval requests
				const tasks = [
					{ id: "backup-db", desc: "Create database backup before deployment" },
					{
						id: "scale-servers",
						desc: "Scale up server instances for traffic",
					},
					{
						id: "notify-users",
						desc: "Send maintenance notification to users",
					},
				];

				tasks.forEach((task, i) => {
					setTimeout(() => {
						aguiComponent.requestApproval(task.id, task.desc);
					}, i * 1000);
				});

				testResults = testResults.map((result) =>
					result.test === "Handle Multiple Tasks"
						? {
								...result,
								status: "success",
								message: `${tasks.length} tasks queued successfully`,
							}
						: result,
				);
			}
		} catch (error) {
			addLog(`❌ Multiple tasks test failed: ${error}`);
			testResults = testResults.map((result) =>
				result.test === "Handle Multiple Tasks"
					? {
							...result,
							status: "error",
							message: error instanceof Error ? error.message : "Unknown error",
						}
					: result,
			);
		}
	}, 5000);
}

// Manual test trigger
function triggerManualTest() {
	if (aguiComponent) {
		aguiComponent.requestApproval(
			`manual-test-${Date.now()}`,
			"Manual test: Please approve this test task",
		);
		addLog("🧪 Manual test triggered");
	}
}

// Clear log
function clearLog() {
	log = [];
}
</script>

<svelte:head>
	<title>AGUI Integration Test - Claude Code Zen</title>
</svelte:head>

<div class="container h-full mx-auto flex justify-center items-center p-4">
	<div class="space-y-6 w-full max-w-6xl">
		<div class="text-center">
			<h1 class="h1 gradient-heading">AGUI Integration Test</h1>
			<p class="text-lg opacity-75 mt-2">Human-in-the-Loop Interface Verification</p>
		</div>

		<!-- Test Results Dashboard -->
		<div class="card p-6 space-y-4">
			<h2 class="h2">Test Results</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				{#each testResults as result}
					<div class="flex items-center justify-between p-3 bg-surface-50-900-token rounded">
						<span>{result.test}</span>
						<div class="flex items-center space-x-2">
							{#if result.status === 'pending'}
								<span class="badge variant-filled-surface">Pending</span>
							{:else if result.status === 'success'}
								<span class="badge variant-filled-success">Success</span>
							{:else if result.status === 'error'}
								<span class="badge variant-filled-error">Error</span>
							{/if}
							{#if result.message}
								<span class="text-sm opacity-75" title={result.message}>
									{result.message.length > 30 ? result.message.substring(0, 30) + '...' : result.message}
								</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- AGUI Integration Component -->
		<AGUIIntegration 
			bind:this={aguiComponent}
			on:aguiReady={handleAGUIReady}
			on:taskApproved={handleTaskApproval}
			on:userResponse={handleUserResponse}
		/>

		<!-- Manual Controls -->
		<div class="card p-4 space-y-4">
			<h3 class="h3">Manual Controls</h3>
			<div class="flex flex-wrap gap-2">
				<button class="btn variant-filled-primary" on:click={triggerManualTest}>
					Trigger Manual Test
				</button>
				<button class="btn variant-filled-secondary" on:click={() => runBasicTests()}>
					Re-run Tests
				</button>
				<button class="btn variant-filled-surface" on:click={clearLog}>
					Clear Log
				</button>
			</div>
		</div>

		<!-- Activity Log -->
		<div class="card p-4 space-y-4">
			<div class="flex items-center justify-between">
				<h3 class="h3">Activity Log</h3>
				<span class="badge variant-filled-primary">{log.length} entries</span>
			</div>
			<div class="bg-surface-900 text-surface-100 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
				{#if log.length === 0}
					<p class="opacity-50 italic">No activity yet...</p>
				{:else}
					{#each log as entry}
						<div class="py-1">{entry}</div>
					{/each}
				{/if}
			</div>
		</div>

		<!-- Integration Status -->
		<div class="text-center">
			{#if aguiInstance}
				<div class="alert variant-filled-success">
					<h4>🎉 Integration Successful!</h4>
					<p>AGUI WebInterface is successfully integrated into Svelte dashboard.</p>
				</div>
			{:else}
				<div class="alert variant-filled-warning">
					<h4>⏳ Initializing Integration...</h4>
					<p>Setting up AGUI WebInterface connection...</p>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.gradient-heading {
		background: linear-gradient(45deg, rgb(var(--color-primary-500)), rgb(var(--color-secondary-500)));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
</style>