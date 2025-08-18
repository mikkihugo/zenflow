<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	
	// Browser-compatible AGUI types and implementation
	interface TaskApprovalRequest {
		id: string;
		task: string;
		description: string;
		priority: 'low' | 'normal' | 'high' | 'critical';
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
				listeners[event].forEach(cb => cb(data));
			}
		};
		
		const agui: AGUIInterface = {
			async askQuestion(question: string, options?: any): Promise<UserResponse> {
				return new Promise((resolve) => {
					const response: UserResponse = {
						approved: true,
						response: `Simulated response to: ${question}`,
						timestamp: new Date(),
						reason: 'Browser simulation'
					};
					setTimeout(() => resolve(response), 500);
				});
			},
			isReady() { return true; }
		};
		
		const taskApproval = {
			on,
			emit,
			async requestApproval(request: TaskApprovalRequest): Promise<{ approved: boolean }> {
				taskQueue.push(request);
				emit('approval-requested', request);
				
				return new Promise((resolve) => {
					setTimeout(() => {
						const result = { taskId: request.id, approved: true };
						emit('approval-completed', result);
						resolve({ approved: true });
					}, 1000);
				});
			},
			async processApproval(id: string, result: any): Promise<void> {
				const taskIndex = taskQueue.findIndex(t => t.id === id);
				if (taskIndex >= 0) {
					taskQueue.splice(taskIndex, 1);
				}
				emit('approval-completed', { taskId: id, ...result });
			},
			removeAllListeners() {
				Object.keys(listeners).forEach(key => delete listeners[key]);
			}
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
	let userPrompt = '';
	let isProcessing = false;
	let error = '';

	// Initialize AGUI system
	onMount(async () => {
		try {
			// Create simple browser-compatible AGUI
			aguiSystem = createSimpleAGUI();

			if (aguiSystem) {
				isInitialized = true;
				
				// Set up event listeners for task approvals
				aguiSystem.taskApproval.on('approval-requested', (request: TaskApprovalRequest) => {
					pendingTasks = [...pendingTasks, request];
					if (!currentTask) {
						processNextTask();
					}
				});

				aguiSystem.taskApproval.on('approval-completed', (result: any) => {
					dispatch('taskApproved', {
						task: result.taskId,
						approved: result.approved
					});
				});

				// Dispatch ready event
				dispatch('aguiReady', { agui: aguiSystem.agui });
				console.log('🎨 AGUI System initialized successfully');
			}
		} catch (err) {
			console.error('❌ Failed to initialize AGUI:', err);
			error = err instanceof Error ? err.message : 'Unknown error';
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
			await aguiSystem.taskApproval.processApproval(currentTask.id, {
				approved,
				timestamp: new Date(),
				reason: approved ? 'User approved' : 'User rejected'
			});
			
			currentTask = null;
			processNextTask();
		} catch (err) {
			console.error('Error processing approval:', err);
			error = err instanceof Error ? err.message : 'Processing failed';
		} finally {
			isProcessing = false;
		}
	}

	// Ask user a question (public API)
	export async function askQuestion(question: string, options?: any): Promise<UserResponse> {
		if (!aguiSystem) throw new Error('AGUI not initialized');
		
		try {
			const response = await aguiSystem.agui.askQuestion(question, options);
			dispatch('userResponse', { response });
			return response;
		} catch (err) {
			console.error('Error asking question:', err);
			throw err;
		}
	}

	// Request task approval (public API)
	export async function requestApproval(task: string, description: string): Promise<boolean> {
		if (!aguiSystem) throw new Error('AGUI not initialized');
		
		try {
			const result = await aguiSystem.taskApproval.requestApproval({
				id: `task-${Date.now()}`,
				task,
				description,
				priority: 'normal',
				timestamp: new Date()
			});
			return result.approved;
		} catch (err) {
			console.error('Error requesting approval:', err);
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

<div class="agui-integration card p-4 space-y-4">
	<div class="flex items-center justify-between">
		<h3 class="h3">Human-in-the-Loop Interface</h3>
		<div class="flex items-center space-x-2">
			{#if isInitialized}
				<span class="badge variant-filled-success">AGUI Ready</span>
			{:else}
				<span class="badge variant-filled-warning">Initializing...</span>
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
			<div class="card p-4 space-y-2">
				<h4 class="h4">Status</h4>
				<div class="space-y-1">
					<div class="flex justify-between">
						<span>System Status:</span>
						<span class="text-success-500">Active</span>
					</div>
					<div class="flex justify-between">
						<span>Pending Tasks:</span>
						<span class="badge variant-filled-primary">{pendingTasks.length}</span>
					</div>
					<div class="flex justify-between">
						<span>Processing:</span>
						<span class={isProcessing ? 'text-warning-500' : 'text-surface-500'}>
							{isProcessing ? 'Yes' : 'No'}
						</span>
					</div>
				</div>
			</div>

			<!-- Current Task Panel -->
			<div class="card p-4 space-y-2">
				<h4 class="h4">Current Task</h4>
				{#if currentTask}
					<div class="space-y-2">
						<p class="text-sm opacity-75">Task ID: {currentTask.id}</p>
						<p>{currentTask.description}</p>
						<div class="flex space-x-2">
							<button 
								class="btn variant-filled-success btn-sm" 
								disabled={isProcessing}
								on:click={() => handleApproval(true)}
							>
								{isProcessing ? 'Processing...' : 'Approve'}
							</button>
							<button 
								class="btn variant-filled-error btn-sm" 
								disabled={isProcessing}
								on:click={() => handleApproval(false)}
							>
								{isProcessing ? 'Processing...' : 'Reject'}
							</button>
						</div>
					</div>
				{:else if pendingTasks.length === 0}
					<p class="text-surface-500 italic">No pending tasks</p>
				{:else}
					<p class="text-warning-500">Task queue processing...</p>
				{/if}
			</div>
		</div>

		<!-- Task Queue -->
		{#if pendingTasks.length > 0}
			<div class="card p-4 space-y-2">
				<h4 class="h4">Pending Task Queue ({pendingTasks.length})</h4>
				<div class="space-y-2 max-h-32 overflow-y-auto">
					{#each pendingTasks as task, i}
						<div class="flex items-center justify-between p-2 bg-surface-100-800-token rounded">
							<span class="text-sm truncate">{task.description}</span>
							<span class="badge variant-soft-primary">#{i + 1}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	{:else}
		<div class="placeholder animate-pulse">
			<div class="placeholder-circle w-8 h-8"></div>
			<div class="placeholder-line w-full"></div>
			<div class="placeholder-line w-3/4"></div>
		</div>
	{/if}
</div>

<style>
	.agui-integration {
		border: 1px solid rgb(var(--color-surface-300) / 0.5);
		border-radius: var(--theme-rounded-base);
	}
</style>