<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { TabGroup, TabAnchor, ProgressRadial } from '@skeletonlabs/skeleton';
	import { apiClient } from '../../lib/api';
	import { webSocketManager } from '../../lib/websocket';

	// SAFe 6.0 Essential artifacts data
	let stories: any[] = [];
	let epics: any[] = [];
	let features: any[] = [];
	let teams: any[] = [];
	let safeMetrics: any = null;
	let selectedStory: any = null;
	let selectedEpic: any = null;
	let selectedFeature: any = null;

	// Filter states
	let storyStatusFilter = '';
	let storyTypeFilter = '';
	let priorityFilter = '';
	let teamFilter = '';
	let epicFilter = '';
	let featureFilter = '';

	// Loading and error states
	let storiesLoading = true;
	let epicsLoading = false;
	let featuresLoading = false;
	let teamsLoading = false;
	let metricsLoading = false;
	let storiesError: string | null = null;
	let epicsError: string | null = null;
	let featuresError: string | null = null;
	let teamsError: string | null = null;
	let metricsError: string | null = null;

	// WebSocket unsubscribe functions
	let unsubscribeStories: () => void;
	let unsubscribeEpics: () => void;
	let unsubscribeFeatures: () => void;
	let unsubscribeTeams: () => void;
	let unsubscribeMetrics: () => void;

	// Form states for creating new SAFe artifacts
	let newStoryForm = {
		title: '',
		description: '',
		storyType: 'user_story',
		priority: 'medium',
		storyPoints: '',
		businessValue: '',
		assignedTo: '',
		assignedTeam: '',
		acceptanceCriteria: '',
		tags: '',
		dependencies: '',
		dueDate: '',
		featureId: '',
		epicId: '',
		persona: '',
		enablerType: '',
		swimlane: ''
	};

	let newEpicForm = {
		title: '',
		description: '',
		status: 'backlog',
		priority: 'medium',
		owner: '',
		startDate: '',
		endDate: '',
		businessObjectives: '',
		hypotheses: '',
		mvp: '',
		acceptanceCriteria: ''
	};

	// Tab state
	let tabSet = 0;
	const tabs = ['Stories Board', 'Backlog', 'Epics', 'Features', 'Teams', 'Flow Metrics'];

	onMount(async () => {
		// Subscribe to WebSocket SAFe 6.0 channels
		setupWebSocketSubscriptions();

		// Subscribe to SAFe 6.0 Essential artifact channels
		webSocketManager.subscribe('stories');
		webSocketManager.subscribe('epics');
		webSocketManager.subscribe('features');
		webSocketManager.subscribe('teams');
		webSocketManager.subscribe('safe-metrics');

		// Listen for project changes
		const handleProjectChange = () => {
			// WebSocket will automatically update data, just reset selections
			selectedStory = null;
			selectedEpic = null;
			selectedFeature = null;
		};

		window.addEventListener('projectChanged', handleProjectChange as EventListener);

		return () => {
			window.removeEventListener('projectChanged', handleProjectChange as EventListener);
		};
	});

	onDestroy(() => {
		// Clean up WebSocket subscriptions
		if (unsubscribeStories) unsubscribeStories();
		if (unsubscribeEpics) unsubscribeEpics();
		if (unsubscribeFeatures) unsubscribeFeatures();
		if (unsubscribeTeams) unsubscribeTeams();
		if (unsubscribeMetrics) unsubscribeMetrics();
	});

	/**
	 * Setup WebSocket subscriptions for real-time SAFe 6.0 updates
	 */
	function setupWebSocketSubscriptions() {
		console.log('🔌 Setting up SAFe 6.0 WebSocket subscriptions...');

		// Subscribe to User Stories updates
		unsubscribeStories = webSocketManager.stories.subscribe((storiesData) => {
			if (storiesData) {
				console.log('📖 Real-time User Stories data received:', storiesData.length);
				stories = storiesData;
				storiesLoading = false;
				storiesError = null;
			}
		});

		// Subscribe to Epics updates
		unsubscribeEpics = webSocketManager.epics.subscribe((epicsData) => {
			if (epicsData) {
				console.log('🏔️ Real-time Epics data received:', epicsData.length);
				epics = epicsData;
				epicsLoading = false;
				epicsError = null;
			}
		});

		// Subscribe to Features updates
		unsubscribeFeatures = webSocketManager.features.subscribe((featuresData) => {
			if (featuresData) {
				console.log('🎯 Real-time Features data received:', featuresData.length);
				features = featuresData;
				featuresLoading = false;
				featuresError = null;
			}
		});

		// Subscribe to Teams (ART) updates
		unsubscribeTeams = webSocketManager.teams.subscribe((teamsData) => {
			if (teamsData) {
				console.log('👥 Real-time Teams (ART) data received:', teamsData.length);
				teams = teamsData;
				teamsLoading = false;
				teamsError = null;
			}
		});

		// Subscribe to SAFe metrics updates
		unsubscribeMetrics = webSocketManager.safeMetrics.subscribe((metricsData) => {
			if (metricsData) {
				console.log('📊 Real-time SAFe LPM metrics data received:', metricsData);
				safeMetrics = metricsData;
				metricsLoading = false;
				metricsError = null;
			}
		});
	}

	// REST API functions for filtering (until WebSocket supports parameters)
	async function loadStories() {
		console.log('🔄 Using REST API for User Stories filtering...');
		try {
			storiesLoading = true;
			const response = await apiClient.get(`/api/v1/projects/default/safe-lpm/stories`, {
				params: {
					...(storyStatusFilter && { status: storyStatusFilter }),
					...(storyTypeFilter && { storyType: storyTypeFilter }),
					...(priorityFilter && { priority: priorityFilter }),
					...(teamFilter && { assignedTeam: teamFilter }),
					...(epicFilter && { epicId: epicFilter }),
					...(featureFilter && { featureId: featureFilter })
				}
			});
			stories = response.data?.data || [];
			storiesError = null;
			console.log('📖 Loaded User Stories via REST:', stories.length);
		} catch (error) {
			storiesError = error instanceof Error ? error.message : 'Failed to load User Stories';
			console.error('❌ Failed to load User Stories:', error);
		} finally {
			storiesLoading = false;
		}
	}

	async function createStory() {
		if (!newStoryForm.title || !newStoryForm.description) return;

		try {
			const storyData = {
				...newStoryForm,
				acceptanceCriteria: newStoryForm.acceptanceCriteria.split(',').map(s => s.trim()).filter(Boolean),
				tags: newStoryForm.tags.split(',').map(s => s.trim()).filter(Boolean),
				dependencies: newStoryForm.dependencies.split(',').map(s => s.trim()).filter(Boolean),
				storyPoints: newStoryForm.storyPoints ? parseInt(newStoryForm.storyPoints) : undefined,
				businessValue: newStoryForm.businessValue ? parseInt(newStoryForm.businessValue) : undefined,
				createdBy: 'current-user' // TODO: Get from auth context
			};

			await apiClient.post(`/api/v1/projects/default/safe-lpm/stories`, storyData);
			
			// Reset form - WebSocket will handle data refresh automatically
			newStoryForm = {
				title: '', description: '', storyType: 'user_story', priority: 'medium',
				storyPoints: '', businessValue: '', assignedTo: '', assignedTeam: '',
				acceptanceCriteria: '', tags: '', dependencies: '', dueDate: '',
				featureId: '', epicId: '', persona: '', enablerType: '', swimlane: ''
			};
			console.log('✅ Created new User Story - WebSocket will update data automatically');
		} catch (error) {
			console.error('❌ Failed to create User Story:', error);
			alert('Failed to create User Story: ' + (error instanceof Error ? error.message : String(error)));
		}
	}

	async function moveStory(story: any, newStatus: string) {
		try {
			await apiClient.put(`/api/v1/projects/default/safe-lpm/stories/${story.id}/move`, {
				status: newStatus,
				reason: `Moved to ${newStatus} via dashboard`
			});
			console.log('✅ Moved User Story - WebSocket will update data automatically');
		} catch (error) {
			console.error('❌ Failed to move User Story:', error);
			alert('Failed to move User Story: ' + (error instanceof Error ? error.message : String(error)));
		}
	}

	async function refreshData() {
		console.log('🔄 Refreshing SAFe 6.0 data via WebSocket...');
		// WebSocket handles automatic refresh, but we can re-subscribe to get fresh data
		webSocketManager.subscribe('stories');
		webSocketManager.subscribe('epics');
		webSocketManager.subscribe('features');
		webSocketManager.subscribe('teams');
		webSocketManager.subscribe('safe-metrics');
	}

	function getStatusColor(status: string): string {
		switch (status?.toLowerCase()) {
			case 'done': return 'success';
			case 'ready': 
			case 'in_progress': return 'primary';
			case 'review': return 'warning';
			case 'backlog': return 'surface';
			default: return 'surface';
		}
	}

	function getPriorityColor(priority: string): string {
		switch (priority?.toLowerCase()) {
			case 'urgent': return 'error';
			case 'high': return 'warning';
			case 'medium': return 'primary';
			case 'low': return 'secondary';
			default: return 'surface';
		}
	}

	function getStoryTypeIcon(storyType: string): string {
		return storyType === 'enabler_story' ? '⚙️' : '📖';
	}

	function formatDate(dateStr: string): string {
		if (!dateStr) return '';
		return new Date(dateStr).toLocaleDateString();
	}

	// Kanban board columns based on SAFe 6.0 flow states
	$: kanbanColumns = [
		{ id: 'backlog', title: 'Backlog', stories: stories.filter(s => s.status === 'backlog') },
		{ id: 'ready', title: 'Ready', stories: stories.filter(s => s.status === 'ready') },
		{ id: 'in_progress', title: 'In Progress', stories: stories.filter(s => s.status === 'in_progress') },
		{ id: 'review', title: 'Review', stories: stories.filter(s => s.status === 'review') },
		{ id: 'done', title: 'Done', stories: stories.filter(s => s.status === 'done') }
	];
</script>

<svelte:head>
	<title>SAFe 6.0 User Stories - Claude Code Zen</title>
</svelte:head>

<!-- Header -->
<div class="mb-8">
	<div class="flex justify-between items-center">
		<div>
			<h1 class="h1 text-primary-500 mb-2">📖 SAFe 6.0 User Stories</h1>
			<p class="text-surface-600-300-token">Scaled Agile Framework 6.0 Essential - Lean Portfolio Management</p>
		</div>
		<button class="btn variant-filled-primary" on:click={refreshData}>
			<span>🔄</span>
			<span>Refresh</span>
		</button>
	</div>
</div>

<!-- Main Content -->
<TabGroup>
	{#each tabs as tab, i}
		<TabAnchor bind:group={tabSet} name="tabs" value={i}>{tab}</TabAnchor>
	{/each}

	<!-- Tab Panels -->
	<svelte:fragment slot="panel">
		{#if tabSet === 0}
			<!-- Stories Board Tab - SAFe 6.0 Kanban -->
			<div class="space-y-6">
				<!-- SAFe Metrics Overview -->
				{#if safeMetrics && !metricsError}
					<div class="grid grid-cols-1 md:grid-cols-5 gap-4">
						<div class="card variant-glass-primary p-4 text-center">
							<div class="text-2xl font-bold text-primary-500 mb-1">
								{safeMetrics.totalStories || 0}
							</div>
							<div class="text-xs opacity-75">Total Stories</div>
						</div>
						<div class="card variant-glass-secondary p-4 text-center">
							<div class="text-2xl font-bold text-secondary-500 mb-1">
								{safeMetrics.totalEpics || 0}
							</div>
							<div class="text-xs opacity-75">Portfolio Epics</div>
						</div>
						<div class="card variant-glass-tertiary p-4 text-center">
							<div class="text-2xl font-bold text-tertiary-500 mb-1">
								{safeMetrics.totalFeatures || 0}
							</div>
							<div class="text-xs opacity-75">Program Features</div>
						</div>
						<div class="card variant-glass-success p-4 text-center">
							<div class="text-2xl font-bold text-success-500 mb-1">
								{safeMetrics.flowEfficiency ? `${(safeMetrics.flowEfficiency * 100).toFixed(1)}%` : '0%'}
							</div>
							<div class="text-xs opacity-75">Flow Efficiency</div>
						</div>
						<div class="card variant-glass-warning p-4 text-center">
							<div class="text-2xl font-bold text-warning-500 mb-1">
								{safeMetrics.avgCycleTime?.toFixed(1) || '0.0'}
							</div>
							<div class="text-xs opacity-75">Avg Cycle Time (days)</div>
						</div>
					</div>
				{/if}

				<!-- SAFe 6.0 Kanban Board -->
				<div class="grid grid-cols-1 lg:grid-cols-5 gap-4">
					{#each kanbanColumns as column}
						<div class="card variant-soft-{getStatusColor(column.id)}">
							<header class="card-header">
								<h3 class="h5 font-semibold">
									{column.title}
									<span class="badge variant-soft-surface ml-2">{column.stories.length}</span>
								</h3>
							</header>
							<section class="p-3 space-y-3 min-h-[400px]">
								{#if storiesLoading && column.id === 'backlog'}
									{#each Array(3) as _}
										<div class="card variant-soft-surface p-3 animate-pulse">
											<div class="w-24 h-4 bg-surface-300-600-token rounded mb-2"></div>
											<div class="w-16 h-3 bg-surface-300-600-token rounded"></div>
										</div>
									{/each}
								{:else if column.stories.length > 0}
									{#each column.stories as story}
										<div 
											class="card variant-soft-surface p-3 cursor-pointer hover:variant-filled-surface transition-colors"
											on:click={() => selectedStory = story}
											role="button"
											tabindex="0"
											on:keydown={(e) => e.key === 'Enter' && (selectedStory = story)}
										>
											<div class="flex justify-between items-start mb-2">
												<div class="flex items-center gap-2">
													<span class="text-sm">{getStoryTypeIcon(story.storyType)}</span>
													<span class="text-xs font-medium">{story.title}</span>
												</div>
												{#if story.storyPoints}
													<span class="badge variant-soft-primary text-xs">{story.storyPoints}pt</span>
												{/if}
											</div>
											
											<div class="text-xs opacity-75 mb-2 line-clamp-2">
												{story.description}
											</div>

											<div class="flex flex-wrap gap-1 mb-2">
												<span class="badge variant-soft-{getPriorityColor(story.priority)} text-xs">{story.priority}</span>
												{#if story.assignedTeam}
													<span class="badge variant-soft-surface text-xs">👥 {story.assignedTeam}</span>
												{/if}
											</div>

											{#if story.assignedTo}
												<div class="text-xs opacity-75">👤 {story.assignedTo}</div>
											{/if}

											<!-- Story flow actions -->
											<div class="flex gap-1 mt-2">
												{#if column.id === 'backlog'}
													<button 
														class="btn btn-sm variant-ghost-primary" 
														on:click|stopPropagation={() => moveStory(story, 'ready')}
													>
														▶️
													</button>
												{:else if column.id === 'ready'}
													<button 
														class="btn btn-sm variant-ghost-primary" 
														on:click|stopPropagation={() => moveStory(story, 'in_progress')}
													>
														🚀
													</button>
												{:else if column.id === 'in_progress'}
													<button 
														class="btn btn-sm variant-ghost-warning" 
														on:click|stopPropagation={() => moveStory(story, 'review')}
													>
														👀
													</button>
												{:else if column.id === 'review'}
													<button 
														class="btn btn-sm variant-ghost-success" 
														on:click|stopPropagation={() => moveStory(story, 'done')}
													>
														✅
													</button>
												{/if}
											</div>
										</div>
									{/each}
								{:else}
									<div class="text-center py-8 opacity-75">
										<p class="text-xs">No stories in {column.title.toLowerCase()}</p>
									</div>
								{/if}
							</section>
						</div>
					{/each}
				</div>
			</div>

		{:else if tabSet === 1}
			<!-- Backlog Tab -->
			<div class="space-y-6">
				<!-- Filters -->
				<div class="card variant-soft-surface p-4">
					<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div>
							<label class="label">Status Filter</label>
							<select class="select" bind:value={storyStatusFilter} on:change={loadStories}>
								<option value="">All Statuses</option>
								<option value="backlog">Backlog</option>
								<option value="ready">Ready</option>
								<option value="in_progress">In Progress</option>
								<option value="review">Review</option>
								<option value="done">Done</option>
							</select>
						</div>
						<div>
							<label class="label">Story Type</label>
							<select class="select" bind:value={storyTypeFilter} on:change={loadStories}>
								<option value="">All Types</option>
								<option value="user_story">User Story</option>
								<option value="enabler_story">Enabler Story</option>
							</select>
						</div>
						<div>
							<label class="label">Priority Filter</label>
							<select class="select" bind:value={priorityFilter} on:change={loadStories}>
								<option value="">All Priorities</option>
								<option value="urgent">Urgent</option>
								<option value="high">High</option>
								<option value="medium">Medium</option>
								<option value="low">Low</option>
							</select>
						</div>
						<div class="flex items-end">
							<button class="btn variant-filled-secondary" on:click={loadStories}>
								<span>🔍</span>
								<span>Apply Filters</span>
							</button>
						</div>
					</div>
				</div>

				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<!-- Stories List -->
					<div class="card variant-soft-primary">
						<header class="card-header">
							<h3 class="h4">📖 User Stories Backlog</h3>
						</header>
						<section class="p-4 max-h-96 overflow-y-auto">
							{#if storiesLoading}
								<div class="space-y-3">
									{#each Array(5) as _}
										<div class="card variant-soft-surface p-3 animate-pulse">
											<div class="w-32 h-4 bg-surface-300-600-token rounded mb-2"></div>
											<div class="w-24 h-3 bg-surface-300-600-token rounded"></div>
										</div>
									{/each}
								</div>
							{:else if storiesError}
								<div class="text-center text-error-500">
									<p class="text-sm">❌ {storiesError}</p>
								</div>
							{:else if stories.length > 0}
								<div class="space-y-3">
									{#each stories as story}
										<button 
											class="btn w-full text-left p-3"
											class:variant-filled-primary={selectedStory?.id === story.id}
											class:variant-soft-surface={selectedStory?.id !== story.id}
											on:click={() => selectedStory = story}
										>
											<div class="flex flex-col gap-2">
												<div class="flex justify-between items-start">
													<div class="flex items-center gap-2">
														<span>{getStoryTypeIcon(story.storyType)}</span>
														<span class="font-medium text-sm">{story.title}</span>
													</div>
													{#if story.storyPoints}
														<span class="badge variant-soft-primary">{story.storyPoints}pt</span>
													{/if}
												</div>
												<div class="text-xs opacity-75">{story.description}</div>
												<div class="flex gap-2 text-xs">
													<span class="badge variant-soft-{getStatusColor(story.status)}">{story.status}</span>
													<span class="badge variant-soft-{getPriorityColor(story.priority)}">{story.priority}</span>
													{#if story.assignedTeam}
														<span class="badge variant-soft-surface">👥 {story.assignedTeam}</span>
													{/if}
												</div>
											</div>
										</button>
									{/each}
								</div>
							{:else}
								<div class="text-center py-8">
									<p class="text-sm opacity-75">No user stories found</p>
								</div>
							{/if}
						</section>
					</div>

					<!-- Create New User Story -->
					<div class="card variant-soft-secondary">
						<header class="card-header">
							<h3 class="h4">➕ Create New User Story</h3>
						</header>
						<section class="p-4 space-y-4">
							<input
								type="text"
								bind:value={newStoryForm.title}
								placeholder="Story title"
								class="input"
							/>
							<textarea
								bind:value={newStoryForm.description}
								placeholder="As a [persona], I want [goal] so that [benefit]"
								class="textarea"
								rows="3"
							></textarea>
							
							<div class="grid grid-cols-2 gap-4">
								<div>
									<label class="label">Story Type</label>
									<select class="select" bind:value={newStoryForm.storyType}>
										<option value="user_story">User Story</option>
										<option value="enabler_story">Enabler Story</option>
									</select>
								</div>
								<div>
									<label class="label">Priority</label>
									<select class="select" bind:value={newStoryForm.priority}>
										<option value="low">Low</option>
										<option value="medium">Medium</option>
										<option value="high">High</option>
										<option value="urgent">Urgent</option>
									</select>
								</div>
							</div>

							<div class="grid grid-cols-2 gap-4">
								<input
									type="number"
									bind:value={newStoryForm.storyPoints}
									placeholder="Story Points (1-13)"
									class="input"
									min="1"
									max="13"
								/>
								<input
									type="number"
									bind:value={newStoryForm.businessValue}
									placeholder="Business Value (1-100)"
									class="input"
									min="1"
									max="100"
								/>
							</div>

							<div class="grid grid-cols-2 gap-4">
								<input
									type="text"
									bind:value={newStoryForm.assignedTo}
									placeholder="Assigned to"
									class="input"
								/>
								<input
									type="text"
									bind:value={newStoryForm.assignedTeam}
									placeholder="Assigned Team (ART)"
									class="input"
								/>
							</div>

							<textarea
								bind:value={newStoryForm.acceptanceCriteria}
								placeholder="Acceptance criteria (comma-separated)"
								class="textarea"
								rows="2"
							></textarea>

							<input
								type="text"
								bind:value={newStoryForm.persona}
								placeholder="User persona"
								class="input"
							/>

							<input
								type="text"
								bind:value={newStoryForm.tags}
								placeholder="Tags (comma-separated)"
								class="input"
							/>

							<button 
								class="btn variant-filled-secondary w-full" 
								on:click={createStory}
								disabled={!newStoryForm.title || !newStoryForm.description}
							>
								<span>📖</span>
								<span>Create User Story</span>
							</button>
						</section>
					</div>
				</div>

				<!-- Selected Story Details -->
				{#if selectedStory}
					<div class="card variant-glass-primary">
						<header class="card-header">
							<h3 class="h3">{getStoryTypeIcon(selectedStory.storyType)} {selectedStory.title}</h3>
						</header>
						<section class="p-4">
							<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div class="space-y-4">
									<div>
										<h5 class="font-semibold mb-2">Description</h5>
										<p class="text-sm opacity-75">{selectedStory.description}</p>
									</div>
									
									{#if selectedStory.acceptanceCriteria?.length}
										<div>
											<h5 class="font-semibold mb-2">Acceptance Criteria</h5>
											<div class="space-y-1">
												{#each selectedStory.acceptanceCriteria as criteria}
													<div class="text-xs opacity-75">✅ {criteria}</div>
												{/each}
											</div>
										</div>
									{/if}

									{#if selectedStory.persona}
										<div>
											<h5 class="font-semibold mb-2">User Persona</h5>
											<span class="badge variant-soft-tertiary text-xs">👤 {selectedStory.persona}</span>
										</div>
									{/if}
								</div>

								<div class="space-y-4">
									<div class="grid grid-cols-2 gap-4">
										<div>
											<h5 class="font-semibold mb-2">Status</h5>
											<span class="badge variant-soft-{getStatusColor(selectedStory.status)}">{selectedStory.status}</span>
										</div>
										<div>
											<h5 class="font-semibold mb-2">Priority</h5>
											<span class="badge variant-soft-{getPriorityColor(selectedStory.priority)}">{selectedStory.priority}</span>
										</div>
									</div>

									{#if selectedStory.storyPoints || selectedStory.businessValue}
										<div class="grid grid-cols-2 gap-4">
											{#if selectedStory.storyPoints}
												<div>
													<h5 class="font-semibold mb-2">Story Points</h5>
													<span class="badge variant-soft-primary">{selectedStory.storyPoints}</span>
												</div>
											{/if}
											{#if selectedStory.businessValue}
												<div>
													<h5 class="font-semibold mb-2">Business Value</h5>
													<span class="badge variant-soft-success">{selectedStory.businessValue}</span>
												</div>
											{/if}
										</div>
									{/if}

									{#if selectedStory.assignedTo || selectedStory.assignedTeam}
										<div class="grid grid-cols-2 gap-4">
											{#if selectedStory.assignedTo}
												<div>
													<h5 class="font-semibold mb-2">Assigned To</h5>
													<span class="badge variant-soft-surface">👤 {selectedStory.assignedTo}</span>
												</div>
											{/if}
											{#if selectedStory.assignedTeam}
												<div>
													<h5 class="font-semibold mb-2">Team (ART)</h5>
													<span class="badge variant-soft-surface">👥 {selectedStory.assignedTeam}</span>
												</div>
											{/if}
										</div>
									{/if}
								</div>
							</div>
						</section>
					</div>
				{/if}
			</div>

		{:else if tabSet === 2}
			<!-- Epics Tab -->
			<div class="space-y-6">
				<div class="card variant-soft-warning">
					<header class="card-header">
						<h3 class="h3 text-warning-500">🏔️ Portfolio Epics</h3>
					</header>
					<section class="p-4">
						{#if epicsLoading}
							<div class="text-center py-8">
								<div class="w-8 h-8 border-4 border-warning-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
								<p class="text-sm opacity-75">Loading Portfolio Epics...</p>
							</div>
						{:else if epicsError}
							<div class="text-center text-error-500 py-8">
								<p class="text-sm">❌ {epicsError}</p>
							</div>
						{:else if epics.length > 0}
							<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{#each epics as epic}
									<div class="card variant-glass-warning p-4">
										<h4 class="font-semibold mb-2">🏔️ {epic.title}</h4>
										<p class="text-sm opacity-75 mb-3">{epic.description}</p>
										<div class="flex gap-2 text-xs">
											<span class="badge variant-soft-{getStatusColor(epic.status)}">{epic.status}</span>
											<span class="badge variant-soft-{getPriorityColor(epic.priority)}">{epic.priority}</span>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<div class="text-center py-8">
								<p class="text-sm opacity-75">No Portfolio Epics found</p>
								<p class="text-xs opacity-50 mt-1">Epics will be synchronized from the backend</p>
							</div>
						{/if}
					</section>
				</div>
			</div>

		{:else if tabSet === 3}
			<!-- Features Tab -->
			<div class="space-y-6">
				<div class="card variant-soft-tertiary">
					<header class="card-header">
						<h3 class="h3 text-tertiary-500">🎯 Program Features</h3>
					</header>
					<section class="p-4">
						{#if featuresLoading}
							<div class="text-center py-8">
								<div class="w-8 h-8 border-4 border-tertiary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
								<p class="text-sm opacity-75">Loading Program Features...</p>
							</div>
						{:else if featuresError}
							<div class="text-center text-error-500 py-8">
								<p class="text-sm">❌ {featuresError}</p>
							</div>
						{:else if features.length > 0}
							<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{#each features as feature}
									<div class="card variant-glass-tertiary p-4">
										<h4 class="font-semibold mb-2">🎯 {feature.title}</h4>
										<p class="text-sm opacity-75 mb-3">{feature.description}</p>
										<div class="flex gap-2 text-xs">
											<span class="badge variant-soft-{getStatusColor(feature.status)}">{feature.status}</span>
											<span class="badge variant-soft-{getPriorityColor(feature.priority)}">{feature.priority}</span>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<div class="text-center py-8">
								<p class="text-sm opacity-75">No Program Features found</p>
								<p class="text-xs opacity-50 mt-1">Features will be synchronized from the backend</p>
							</div>
						{/if}
					</section>
				</div>
			</div>

		{:else if tabSet === 4}
			<!-- Teams Tab -->
			<div class="space-y-6">
				<div class="card variant-soft-success">
					<header class="card-header">
						<h3 class="h3 text-success-500">👥 Agile Release Trains (ARTs)</h3>
					</header>
					<section class="p-4">
						{#if teamsLoading}
							<div class="text-center py-8">
								<div class="w-8 h-8 border-4 border-success-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
								<p class="text-sm opacity-75">Loading Teams...</p>
							</div>
						{:else if teamsError}
							<div class="text-center text-error-500 py-8">
								<p class="text-sm">❌ {teamsError}</p>
							</div>
						{:else if teams.length > 0}
							<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{#each teams as team}
									<div class="card variant-glass-success p-4">
										<h4 class="font-semibold mb-2">👥 {team.name}</h4>
										<p class="text-sm opacity-75 mb-3">{team.description}</p>
										<div class="flex gap-2 text-xs">
											<span class="badge variant-soft-surface">{team.members?.length || 0} members</span>
											{#if team.artCapacity}
												<span class="badge variant-soft-primary">{team.artCapacity}% capacity</span>
											{/if}
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<div class="text-center py-8">
								<p class="text-sm opacity-75">No Agile Release Trains found</p>
								<p class="text-xs opacity-50 mt-1">Teams will be synchronized from the backend</p>
							</div>
						{/if}
					</section>
				</div>
			</div>

		{:else if tabSet === 5}
			<!-- Flow Metrics Tab -->
			<div class="space-y-6">
				{#if safeMetrics && !metricsError}
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						<!-- Flow Load -->
						<div class="card variant-glass-primary p-6">
							<div class="text-center">
								<div class="text-2xl font-bold text-primary-500 mb-2">
									{safeMetrics.flowLoad || 0}
								</div>
								<h4 class="font-semibold">Flow Load</h4>
								<p class="text-xs opacity-75 mt-1">Work items in system</p>
							</div>
						</div>

						<!-- Flow Velocity -->
						<div class="card variant-glass-secondary p-6">
							<div class="text-center">
								<div class="text-2xl font-bold text-secondary-500 mb-2">
									{safeMetrics.flowVelocity || 0}
								</div>
								<h4 class="font-semibold">Flow Velocity</h4>
								<p class="text-xs opacity-75 mt-1">Stories per iteration</p>
							</div>
						</div>

						<!-- Flow Time -->
						<div class="card variant-glass-tertiary p-6">
							<div class="text-center">
								<div class="text-2xl font-bold text-tertiary-500 mb-2">
									{safeMetrics.avgCycleTime?.toFixed(1) || '0.0'}
								</div>
								<h4 class="font-semibold">Flow Time</h4>
								<p class="text-xs opacity-75 mt-1">Avg cycle time (days)</p>
							</div>
						</div>

						<!-- Flow Efficiency -->
						<div class="card variant-glass-success p-6">
							<div class="text-center">
								<ProgressRadial 
									value={safeMetrics.flowEfficiency ? safeMetrics.flowEfficiency * 100 : 0} 
									width="w-16" 
									class="text-success-500 mx-auto mb-2"
								>
									<span class="text-xs font-bold">{safeMetrics.flowEfficiency ? `${(safeMetrics.flowEfficiency * 100).toFixed(0)}%` : '0%'}</span>
								</ProgressRadial>
								<h4 class="font-semibold">Flow Efficiency</h4>
								<p class="text-xs opacity-75 mt-1">Value-add time ratio</p>
							</div>
						</div>
					</div>

					<!-- Flow Distribution -->
					<div class="card variant-soft-surface">
						<header class="card-header">
							<h3 class="h3">📊 SAFe 6.0 Flow Distribution</h3>
						</header>
						<section class="p-4">
							<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
								<div>
									<h4 class="font-semibold mb-4">Story Status Distribution</h4>
									<div class="space-y-3">
										{#each kanbanColumns as column}
											<div class="flex justify-between items-center">
												<span class="badge variant-soft-{getStatusColor(column.id)} capitalize">{column.title}</span>
												<span class="text-sm font-medium">{column.stories.length}</span>
											</div>
										{/each}
									</div>
								</div>

								<div>
									<h4 class="font-semibold mb-4">Story Type Distribution</h4>
									<div class="space-y-3">
										<div class="flex justify-between items-center">
											<span class="badge variant-soft-primary">📖 User Stories</span>
											<span class="text-sm font-medium">{stories.filter(s => s.storyType === 'user_story').length}</span>
										</div>
										<div class="flex justify-between items-center">
											<span class="badge variant-soft-secondary">⚙️ Enabler Stories</span>
											<span class="text-sm font-medium">{stories.filter(s => s.storyType === 'enabler_story').length}</span>
										</div>
									</div>
								</div>
							</div>
						</section>
					</div>
				{:else if metricsLoading}
					<div class="text-center py-12">
						<div class="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
						<p class="text-sm opacity-75">Loading SAFe metrics...</p>
					</div>
				{:else if metricsError}
					<div class="text-center text-error-500 py-8">
						<p class="text-sm">❌ {metricsError}</p>
					</div>
				{:else}
					<div class="text-center py-8">
						<p class="text-sm opacity-75">No SAFe metrics available</p>
						<p class="text-xs opacity-50 mt-1">Metrics will be calculated as stories are processed</p>
					</div>
				{/if}
			</div>
		{/if}
	</svelte:fragment>
</TabGroup>