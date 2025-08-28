<script lang="ts">
import { createEventDispatcher, onDestroy, onMount } from "svelte";

// Browser-compatible AGUI types and implementation
interface TaskApprovalRequest {
	id: string;
	task: string;
	description: string;
	priority: "low" | "normal" | "high" | "critical";
	timestamp: Date;
}

interface UserResponse {
	approved: boolean;
	response?: any;
	timestamp: Date;
	reason?: string;
}

interface AGUIInterface {
	askQuestion(question: string, options?: any): Promise<UserResponse>;
	isReady(): boolean;
}

// Simple browser-compatible AGUI implementation
function createSimpleAGUI(): { agui: AGUIInterface; taskApproval: any } {
	const taskQueue: TaskApprovalRequest[] = [];
	const listeners: Record<string, Function[]> = {};

	const on = (event: string, callback: Function) => {
		if (!listeners[event]) listeners[event] = [];
		listeners[event].push(callback);
	};

	const emit = (event: string, data: any) => {
		if (listeners[event]) {
			listeners[event].forEach((cb) => cb(data));
		}
	};

	const agui: AGUIInterface = {
		async askQuestion(question: string, _options?: any): Promise<UserResponse> {
			return new Promise((resolve) => {
				const response: UserResponse = {
					approved: true,
					response: `Interactive response to: ${question}`,
					timestamp: new Date(),
					reason: "User interaction",
				};
				// Emit question to UI for real user interaction
				emit("question-requested", { question, resolve });
			});
		},
		isReady() {
			return true;
		},
	};

	const taskApproval = {
		on,
		emit,
		async requestApproval(
			request: TaskApprovalRequest,
		): Promise<{ approved: boolean }> {
			taskQueue.push(request);
			emit("approval-requested", request);

			// Return a promise that will be resolved when user makes a decision
			return new Promise((resolve) => {
				// Store the resolve function so we can call it later
				const completionListener = (result: any) => {
					if (result.taskId === request.id) {
						resolve({ approved: result.approved });
						// Remove this specific listener
						const index = listeners["approval-completed"]?.indexOf(completionListener);
						if (index !== undefined && index > -1) {
							listeners["approval-completed"].splice(index, 1);
						}
					}
				};
				on("approval-completed", completionListener);
			});
		},
		async processApproval(id: string, result: any): Promise<void> {
			const taskIndex = taskQueue.findIndex((t) => t.id === id);
			if (taskIndex >= 0) {
				taskQueue.splice(taskIndex, 1);
			}
			emit("approval-completed", { taskId: id, ...result });
		},
		removeAllListeners() {
			Object.keys(listeners).forEach((key) => delete listeners[key]);
		},
	};

	return { agui, taskApproval };
}

const dispatch = createEventDispatcher<{
	taskApproved: { task: string; approved: boolean };
	userResponse: { response: UserResponse };
	aguiReady: { agui: AGUIInterface };
}>();

// AGUI instance and state
let aguiSystem: { agui: AGUIInterface; taskApproval: any } | null = null;
let isInitialized = false;
let pendingTasks: TaskApprovalRequest[] = [];
let currentTask: TaskApprovalRequest | null = null;
let userPrompt = "";
let isProcessing = false;
let error = "";
let approvalComment = "";
let taskHistory: Array<{task: TaskApprovalRequest, approved: boolean, comment?: string, timestamp: Date}> = [];

// Initialize AGUI system
onMount(async () => {
	try {
		// Create simple browser-compatible AGUI
		aguiSystem = createSimpleAGUI();

		if (aguiSystem) {
			isInitialized = true;

			// Set up event listeners for task approvals
			aguiSystem.taskApproval.on(
				"approval-requested",
				(request: TaskApprovalRequest) => {
					pendingTasks = [...pendingTasks, request];
					if (!currentTask) {
						processNextTask();
					}
				},
			);

			aguiSystem.taskApproval.on("approval-completed", (result: any) => {
				dispatch("taskApproved", {
					task: result.taskId,
					approved: result.approved,
				});
			});

			// Dispatch ready event
			dispatch("aguiReady", { agui: aguiSystem.agui });
			console.log("🎨 AGUI System initialized successfully");
		}
	} catch (err) {
		console.error("❌ Failed to initialize AGUI:", err);
		error = err instanceof Error ? err.message : "Unknown error";
	}
});

// Process next pending task
function processNextTask() {
	if (pendingTasks.length > 0 && !currentTask) {
		currentTask = pendingTasks.shift()!;
		userPrompt = `${currentTask.description}\n\nDo you want to proceed?`;
	}
}

// Handle user approval
async function handleApproval(approved: boolean) {
	if (!aguiSystem || !currentTask) return;

	isProcessing = true;
	try {
		// Store in task history
		taskHistory = [...taskHistory, {
			task: currentTask,
			approved,
			comment: approvalComment,
			timestamp: new Date()
		}];

		await aguiSystem.taskApproval.processApproval(currentTask.id, {
			approved,
			timestamp: new Date(),
			reason: approved ? "User approved" : "User rejected",
			comment: approvalComment,
		});

		// Clear comment and move to next task
		approvalComment = "";
		currentTask = null;
		processNextTask();
	} catch (err) {
		console.error("Error processing approval:", err);
		error = err instanceof Error ? err.message : "Processing failed";
	} finally {
		isProcessing = false;
	}
}

// Ask user a question (public API)
export async function askQuestion(
	question: string,
	options?: any,
): Promise<UserResponse> {
	if (!aguiSystem) throw new Error("AGUI not initialized");

	try {
		const response = await aguiSystem.agui.askQuestion(question, options);
		dispatch("userResponse", { response });
		return response;
	} catch (err) {
		console.error("Error asking question:", err);
		throw err;
	}
}

// Request task approval (public API)
export async function requestApproval(
	task: string,
	description: string,
): Promise<boolean> {
	if (!aguiSystem) throw new Error("AGUI not initialized");

	try {
		const result = await aguiSystem.taskApproval.requestApproval({
			id: `task-${Date.now()}`,
			task,
			description,
			priority: "normal",
			timestamp: new Date(),
		});
		return result.approved;
	} catch (err) {
		console.error("Error requesting approval:", err);
		throw err;
	}
}

// Cleanup
onDestroy(() => {
	if (aguiSystem) {
		aguiSystem.taskApproval.removeAllListeners();
	}
});
</script>

<div class="agui-integration bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Human-in-the-Loop Interface</h3>
		<div class="flex items-center space-x-2">
			{#if isInitialized}
				<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">AGUI Ready</span>
			{:else}
				<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">Initializing...</span>
			{/if}
		</div>
	</div>

	{#if error}
		<div class="alert variant-filled-error">
			<h4>AGUI Error</h4>
			<p>{error}</p>
		</div>
	{/if}

	{#if isInitialized}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<!-- Status Panel -->
			<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
				<h4 class="text-lg font-semibold text-gray-900 dark:text-white">Status</h4>
				<div class="space-y-1">
					<div class="flex justify-between">
						<span class="text-gray-700 dark:text-gray-300">System Status:</span>
						<span class="text-green-600 dark:text-green-400">Active</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-700 dark:text-gray-300">Pending Tasks:</span>
						<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">{pendingTasks.length}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-700 dark:text-gray-300">Processing:</span>
						<span class={isProcessing ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400'}>
							{isProcessing ? 'Yes' : 'No'}
						</span>
					</div>
				</div>
			</div>

			<!-- Current Task Panel -->
			<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
				<h4 class="text-lg font-semibold text-gray-900 dark:text-white">Task Approval Required</h4>
				{#if currentTask}
					<div class="space-y-4">
						<div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-600/50 p-3 rounded-lg">
							<div class="flex items-start space-x-2">
								<span class="text-yellow-600 dark:text-yellow-400">⚠️</span>
								<div class="flex-1">
									<p class="font-semibold text-yellow-800 dark:text-yellow-200">Task: {currentTask.task}</p>
									<p class="text-yellow-700 dark:text-yellow-300 text-sm mt-1">{currentTask.description}</p>
									<p class="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
										Priority: <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium {currentTask.priority === 'critical' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' : currentTask.priority === 'high' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'}">{currentTask.priority}</span>
										| ID: {currentTask.id}
									</p>
								</div>
							</div>
						</div>
						
						<!-- Comment Field -->
						<div>
							<label for="approval-comment" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Comment (optional)
							</label>
							<textarea 
								id="approval-comment"
								class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
								rows="3" 
								placeholder="Add a comment explaining your decision..."
								bind:value={approvalComment}
								disabled={isProcessing}
							></textarea>
						</div>

						<!-- Action Buttons -->
						<div class="flex space-x-3 justify-center">
							<button 
								class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 dark:disabled:bg-green-800 text-white rounded-md font-medium transition-colors" 
								disabled={isProcessing}
								on:click={() => handleApproval(true)}
							>
								<span class="mr-2">✅</span>
								{isProcessing ? 'Processing...' : 'Approve Task'}
							</button>
							<button 
								class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-800 text-white rounded-md font-medium transition-colors" 
								disabled={isProcessing}
								on:click={() => handleApproval(false)}
							>
								<span class="mr-2">❌</span>
								{isProcessing ? 'Processing...' : 'Reject Task'}
							</button>
						</div>
					</div>
				{:else if pendingTasks.length === 0}
					<div class="text-center py-6 text-gray-500 dark:text-gray-400">
						<p class="text-lg">✅ No tasks pending approval</p>
						<p class="text-sm mt-1 text-gray-400 dark:text-gray-500">Use the "Trigger Manual Test" button to create a task</p>
					</div>
				{:else}
					<div class="text-center py-4">
						<div class="animate-pulse space-y-2">
							<div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
							<div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
						</div>
						<p class="text-yellow-600 dark:text-yellow-400 mt-2">Processing task queue...</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- Task Queue -->
		{#if pendingTasks.length > 0}
			<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
				<h4 class="text-lg font-semibold text-gray-900 dark:text-white">Pending Task Queue ({pendingTasks.length})</h4>
				<div class="space-y-2 max-h-32 overflow-y-auto">
					{#each pendingTasks as task, i}
						<div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
							<div class="flex-1 truncate">
								<p class="text-sm font-medium text-gray-900 dark:text-gray-100">{task.task}</p>
								<p class="text-xs text-gray-600 dark:text-gray-300">{task.description}</p>
							</div>
							<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 ml-2">#{i + 1}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Task History -->
		{#if taskHistory.length > 0}
			<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
				<h4 class="text-lg font-semibold text-gray-900 dark:text-white">Recent Decisions ({taskHistory.length})</h4>
				<div class="space-y-2 max-h-48 overflow-y-auto">
					{#each taskHistory.slice(-10).reverse() as entry}
						<div class="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded border-l-4 {entry.approved ? 'border-l-green-500' : 'border-l-red-500'}">
							<div class="flex-1">
								<div class="flex items-center space-x-2 mb-1">
									<span class="{entry.approved ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
										{entry.approved ? '✅' : '❌'}
									</span>
									<span class="font-medium text-sm text-gray-900 dark:text-gray-100">{entry.task.task}</span>
									<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium {entry.approved ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}">
										{entry.approved ? 'APPROVED' : 'REJECTED'}
									</span>
								</div>
								<p class="text-xs text-gray-600 dark:text-gray-300 mb-1">{entry.task.description}</p>
								{#if entry.comment}
									<p class="text-xs italic bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 p-2 rounded">
										💬 "{entry.comment}"
									</p>
								{/if}
								<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
									{entry.timestamp.toLocaleTimeString()}
								</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	{:else}
		<div class="animate-pulse p-4">
			<div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full mb-4"></div>
			<div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
			<div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
		</div>
	{/if}
</div>

<style>
	.agui-integration {
		/* Styles are now handled by Tailwind classes */
	}
</style>