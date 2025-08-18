<script lang="ts">
	import { onMount } from 'svelte';
	import { TabGroup, TabAnchor, ProgressRadial, CodeBlock } from '@skeletonlabs/skeleton';
	import { apiClient } from '../../lib/api';

	// Roadmap data
	let roadmaps: any[] = [];
	let milestones: any[] = [];
	let visionStatements: any[] = [];
	let roadmapMetrics: any = null;
	let selectedRoadmap: any = null;
	let selectedMilestone: any = null;

	// Filter states
	let roadmapStatusFilter = '';
	let roadmapPriorityFilter = '';
	let milestoneStatusFilter = '';
	let milestoneTypeFilter = '';
	let visionStatusFilter = '';

	// Loading and error states
	let roadmapsLoading = true;
	let milestonesLoading = false;
	let visionsLoading = false;
	let metricsLoading = false;
	let roadmapsError: string | null = null;
	let milestonesError: string | null = null;
	let visionsError: string | null = null;
	let metricsError: string | null = null;

	// Form states for creating new items
	let newRoadmapForm = {
		title: '',
		description: '',
		vision: '',
		status: 'planning',
		priority: 'medium',
		owner: '',
		startDate: '',
		endDate: '',
		strategicThemes: '',
		stakeholders: '',
		budget: '',
		dependencies: '',
		kpis: ''
	};

	let newMilestoneForm = {
		roadmapId: '',
		title: '',
		description: '',
		type: 'feature-release',
		status: 'planning',
		priority: 'medium',
		dueDate: '',
		owner: '',
		deliverables: '',
		dependencies: '',
		riskFactors: '',
		successCriteria: ''
	};

	// Tab state
	let tabSet = 0;
	const tabs = ['Overview', 'Roadmaps', 'Milestones', 'Vision', 'Analytics'];

	onMount(async () => {
		await Promise.all([
			loadRoadmaps(),
			loadMilestones(),
			loadVisionStatements(),
			loadRoadmapMetrics()
		]);

		// Listen for project changes
		const handleProjectChange = async () => {
			await Promise.all([
				loadRoadmaps(),
				loadMilestones(),
				loadVisionStatements(),
				loadRoadmapMetrics()
			]);
			// Reset selections when project changes
			selectedRoadmap = null;
			selectedMilestone = null;
		};

		window.addEventListener('projectChanged', handleProjectChange as EventListener);

		return () => {
			window.removeEventListener('projectChanged', handleProjectChange as EventListener);
		};
	});

	async function loadRoadmaps() {
		try {
			roadmapsLoading = true;
			const response = await apiClient.getRoadmaps(
				roadmapStatusFilter || undefined,
				roadmapPriorityFilter || undefined
			);
			roadmaps = response.roadmaps || [];
			roadmapsError = null;
			console.log('🗺️ Loaded roadmaps:', roadmaps.length);
		} catch (error) {
			roadmapsError = error instanceof Error ? error.message : 'Failed to load roadmaps';
			console.error('❌ Failed to load roadmaps:', error);
		} finally {
			roadmapsLoading = false;
		}
	}

	async function loadMilestones() {
		try {
			milestonesLoading = true;
			const response = await apiClient.getMilestones(
				selectedRoadmap?.id,
				milestoneStatusFilter || undefined,
				milestoneTypeFilter || undefined
			);
			milestones = response.milestones || [];
			milestonesError = null;
			console.log('🎯 Loaded milestones:', milestones.length);
		} catch (error) {
			milestonesError = error instanceof Error ? error.message : 'Failed to load milestones';
			console.error('❌ Failed to load milestones:', error);
		} finally {
			milestonesLoading = false;
		}
	}

	async function loadVisionStatements() {
		try {
			visionsLoading = true;
			const response = await apiClient.getVisionStatements(
				visionStatusFilter || undefined
			);
			visionStatements = response.visions || [];
			visionsError = null;
			console.log('👁️ Loaded vision statements:', visionStatements.length);
		} catch (error) {
			visionsError = error instanceof Error ? error.message : 'Failed to load vision statements';
			console.error('❌ Failed to load vision statements:', error);
		} finally {
			visionsLoading = false;
		}
	}

	async function loadRoadmapMetrics() {
		try {
			metricsLoading = true;
			roadmapMetrics = await apiClient.getRoadmapMetrics();
			metricsError = null;
			console.log('📈 Loaded roadmap metrics:', roadmapMetrics);
		} catch (error) {
			metricsError = error instanceof Error ? error.message : 'Failed to load roadmap metrics';
			console.error('❌ Failed to load roadmap metrics:', error);
		} finally {
			metricsLoading = false;
		}
	}

	async function createRoadmap() {
		if (!newRoadmapForm.title || !newRoadmapForm.description) return;

		try {
			const roadmapData = {
				...newRoadmapForm,
				strategicThemes: newRoadmapForm.strategicThemes.split(',').map(s => s.trim()).filter(Boolean),
				stakeholders: newRoadmapForm.stakeholders.split(',').map(s => s.trim()).filter(Boolean),
				dependencies: newRoadmapForm.dependencies.split(',').map(s => s.trim()).filter(Boolean),
				kpis: newRoadmapForm.kpis.split(',').map(s => s.trim()).filter(Boolean)
			};

			await apiClient.createRoadmap(roadmapData);
			
			// Reset form and reload data
			newRoadmapForm = {
				title: '', description: '', vision: '', status: 'planning', priority: 'medium',
				owner: '', startDate: '', endDate: '', strategicThemes: '', stakeholders: '',
				budget: '', dependencies: '', kpis: ''
			};
			await loadRoadmaps();
			console.log('✅ Created new roadmap');
		} catch (error) {
			console.error('❌ Failed to create roadmap:', error);
			alert('Failed to create roadmap: ' + (error instanceof Error ? error.message : String(error)));
		}
	}

	async function createMilestone() {
		if (!newMilestoneForm.roadmapId || !newMilestoneForm.title) return;

		try {
			const milestoneData = {
				...newMilestoneForm,
				deliverables: newMilestoneForm.deliverables.split(',').map(s => s.trim()).filter(Boolean),
				dependencies: newMilestoneForm.dependencies.split(',').map(s => s.trim()).filter(Boolean),
				riskFactors: newMilestoneForm.riskFactors.split(',').map(s => s.trim()).filter(Boolean),
				successCriteria: newMilestoneForm.successCriteria.split(',').map(s => s.trim()).filter(Boolean)
			};

			await apiClient.createMilestone(milestoneData);
			
			// Reset form and reload data
			newMilestoneForm = {
				roadmapId: '', title: '', description: '', type: 'feature-release',
				status: 'planning', priority: 'medium', dueDate: '', owner: '',
				deliverables: '', dependencies: '', riskFactors: '', successCriteria: ''
			};
			await loadMilestones();
			console.log('✅ Created new milestone');
		} catch (error) {
			console.error('❌ Failed to create milestone:', error);
			alert('Failed to create milestone: ' + (error instanceof Error ? error.message : String(error)));
		}
	}

	async function refreshData() {
		console.log('🔄 Refreshing roadmap data...');
		await Promise.all([
			loadRoadmaps(),
			loadMilestones(),
			loadVisionStatements(),
			loadRoadmapMetrics()
		]);
	}

	function selectRoadmap(roadmap: any) {
		selectedRoadmap = roadmap;
		newMilestoneForm.roadmapId = roadmap.id;
		loadMilestones(); // Reload milestones for selected roadmap
	}

	function getStatusColor(status: string): string {
		switch (status?.toLowerCase()) {
			case 'active':
			case 'completed': return 'success';
			case 'planning': return 'warning';
			case 'on-hold': return 'secondary';
			case 'cancelled': return 'error';
			case 'in-progress': return 'primary';
			default: return 'surface';
		}
	}

	function getPriorityColor(priority: string): string {
		switch (priority?.toLowerCase()) {
			case 'critical': return 'error';
			case 'high': return 'warning';
			case 'medium': return 'primary';
			case 'low': return 'secondary';
			default: return 'surface';
		}
	}

	function getRiskColor(risk: string): string {
		switch (risk?.toLowerCase()) {
			case 'critical': return 'error';
			case 'high': return 'warning';
			case 'medium': return 'tertiary';
			case 'low': return 'success';
			default: return 'surface';
		}
	}

	function formatDate(dateStr: string): string {
		if (!dateStr) return '';
		return new Date(dateStr).toLocaleDateString();
	}

	function calculateProgress(roadmap: any): number {
		return roadmap.completion || 0;
	}

	function getDaysUntilDue(dateStr: string): number {
		if (!dateStr) return 0;
		const dueDate = new Date(dateStr);
		const today = new Date();
		const diffTime = dueDate.getTime() - today.getTime();
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	}
</script>

<svelte:head>
	<title>Roadmap Tasks - Claude Code Zen</title>
</svelte:head>

<!-- Header -->
<div class="mb-8">
	<div class="flex justify-between items-center">
		<div>
			<h1 class="h1 text-primary-500 mb-2">🗺️ Roadmap Tasks</h1>
			<p class="text-surface-600-300-token">Strategic planning and milestone management</p>
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
			<!-- Overview Tab -->
			<div class="space-y-6">
				<!-- Metrics Overview -->
				{#if roadmapMetrics && !metricsError}
					<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
						<div class="card variant-glass-primary p-6 text-center">
							<div class="text-3xl font-bold text-primary-500 mb-2">
								{roadmapMetrics.totalRoadmaps || 0}
							</div>
							<div class="text-sm opacity-75">Total Roadmaps</div>
						</div>
						<div class="card variant-glass-secondary p-6 text-center">
							<div class="text-3xl font-bold text-secondary-500 mb-2">
								{roadmapMetrics.totalMilestones || 0}
							</div>
							<div class="text-sm opacity-75">Total Milestones</div>
						</div>
						<div class="card variant-glass-tertiary p-6 text-center">
							<div class="text-3xl font-bold text-tertiary-500 mb-2">
								{roadmapMetrics.completionRate ? `${(roadmapMetrics.completionRate * 100).toFixed(1)}%` : '0%'}
							</div>
							<div class="text-sm opacity-75">Completion Rate</div>
						</div>
						<div class="card variant-glass-success p-6 text-center">
							<div class="text-3xl font-bold text-success-500 mb-2">
								{roadmapMetrics.onTrackCount || 0}
							</div>
							<div class="text-sm opacity-75">On Track</div>
						</div>
					</div>
				{/if}

				<!-- Active Roadmaps Summary -->
				<div class="card variant-soft-surface">
					<header class="card-header">
						<h3 class="h3 text-primary-500">📋 Active Roadmaps Summary</h3>
					</header>
					<section class="p-4">
						{#if roadmapsLoading}
							<div class="space-y-4">
								{#each Array(3) as _}
									<div class="card variant-soft-surface p-4 animate-pulse">
										<div class="w-48 h-4 bg-surface-300-600-token rounded mb-2"></div>
										<div class="w-32 h-3 bg-surface-300-600-token rounded"></div>
									</div>
								{/each}
							</div>
						{:else if roadmapsError}
							<div class="text-center text-error-500 py-8">
								<p class="text-sm">❌ {roadmapsError}</p>
							</div>
						{:else if roadmaps.filter(r => r.status === 'active').length > 0}
							<div class="space-y-4">
								{#each roadmaps.filter(r => r.status === 'active') as roadmap}
									<div class="card variant-soft-primary p-4">
										<div class="flex justify-between items-start mb-3">
											<div class="flex-1">
												<h4 class="font-semibold text-lg">{roadmap.title}</h4>
												<p class="text-sm opacity-75 mb-2">{roadmap.description}</p>
												<div class="flex gap-2 text-xs">
													<span class="badge variant-soft-{getStatusColor(roadmap.status)}">{roadmap.status}</span>
													<span class="badge variant-soft-{getPriorityColor(roadmap.priority)}">{roadmap.priority} priority</span>
													{#if roadmap.owner}
														<span class="badge variant-soft-surface">👤 {roadmap.owner}</span>
													{/if}
												</div>
											</div>
											<div class="text-right">
												<div class="text-2xl font-bold text-primary-500 mb-1">
													{calculateProgress(roadmap)}%
												</div>
												<div class="text-xs opacity-75">Complete</div>
											</div>
										</div>
										<div class="w-full bg-surface-300-600-token rounded-full h-2">
											<div 
												class="bg-primary-500 h-2 rounded-full transition-all duration-300" 
												style="width: {calculateProgress(roadmap)}%"
											></div>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<div class="text-center py-8">
								<p class="text-sm opacity-75">No active roadmaps</p>
							</div>
						{/if}
					</section>
				</div>
			</div>

		{:else if tabSet === 1}
			<!-- Roadmaps Tab -->
			<div class="space-y-6">
				<!-- Filters -->
				<div class="card variant-soft-surface p-4">
					<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label class="label">Status Filter</label>
							<select class="select" bind:value={roadmapStatusFilter} on:change={loadRoadmaps}>
								<option value="">All Statuses</option>
								<option value="active">Active</option>
								<option value="planning">Planning</option>
								<option value="completed">Completed</option>
								<option value="on-hold">On Hold</option>
								<option value="cancelled">Cancelled</option>
							</select>
						</div>
						<div>
							<label class="label">Priority Filter</label>
							<select class="select" bind:value={roadmapPriorityFilter} on:change={loadRoadmaps}>
								<option value="">All Priorities</option>
								<option value="critical">Critical</option>
								<option value="high">High</option>
								<option value="medium">Medium</option>
								<option value="low">Low</option>
							</select>
						</div>
						<div class="flex items-end">
							<button class="btn variant-filled-secondary" on:click={loadRoadmaps}>
								<span>🔍</span>
								<span>Apply Filters</span>
							</button>
						</div>
					</div>
				</div>

				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<!-- Roadmaps List -->
					<div class="card variant-soft-primary">
						<header class="card-header">
							<h3 class="h4">🗺️ Roadmaps</h3>
						</header>
						<section class="p-4 max-h-96 overflow-y-auto">
							{#if roadmapsLoading}
								<div class="space-y-3">
									{#each Array(5) as _}
										<div class="card variant-soft-surface p-3 animate-pulse">
											<div class="w-32 h-4 bg-surface-300-600-token rounded mb-2"></div>
											<div class="w-24 h-3 bg-surface-300-600-token rounded"></div>
										</div>
									{/each}
								</div>
							{:else if roadmapsError}
								<div class="text-center text-error-500">
									<p class="text-sm">❌ {roadmapsError}</p>
								</div>
							{:else if roadmaps.length > 0}
								<div class="space-y-3">
									{#each roadmaps as roadmap}
										<button 
											class="btn w-full text-left p-3"
											class:variant-filled-primary={selectedRoadmap?.id === roadmap.id}
											class:variant-soft-surface={selectedRoadmap?.id !== roadmap.id}
											on:click={() => selectRoadmap(roadmap)}
										>
											<div class="flex flex-col gap-2">
												<div class="flex justify-between items-start">
													<span class="font-medium text-sm">{roadmap.title}</span>
													<span class="text-lg">{calculateProgress(roadmap)}%</span>
												</div>
												<div class="text-xs opacity-75">{roadmap.description}</div>
												<div class="flex gap-2 text-xs">
													<span class="badge variant-soft-{getStatusColor(roadmap.status)}">{roadmap.status}</span>
													<span class="badge variant-soft-{getPriorityColor(roadmap.priority)}">{roadmap.priority}</span>
													{#if roadmap.riskLevel}
														<span class="badge variant-soft-{getRiskColor(roadmap.riskLevel)}">⚠️ {roadmap.riskLevel}</span>
													{/if}
												</div>
												{#if roadmap.startDate || roadmap.endDate}
													<div class="text-xs opacity-75">
														{formatDate(roadmap.startDate)} → {formatDate(roadmap.endDate)}
													</div>
												{/if}
											</div>
										</button>
									{/each}
								</div>
							{:else}
								<div class="text-center py-8">
									<p class="text-sm opacity-75">No roadmaps found</p>
								</div>
							{/if}
						</section>
					</div>

					<!-- Create New Roadmap -->
					<div class="card variant-soft-secondary">
						<header class="card-header">
							<h3 class="h4">➕ Create New Roadmap</h3>
						</header>
						<section class="p-4 space-y-4">
							<input
								type="text"
								bind:value={newRoadmapForm.title}
								placeholder="Roadmap title"
								class="input"
							/>
							<textarea
								bind:value={newRoadmapForm.description}
								placeholder="Description"
								class="textarea"
								rows="3"
							></textarea>
							<textarea
								bind:value={newRoadmapForm.vision}
								placeholder="Vision statement"
								class="textarea"
								rows="2"
							></textarea>
							
							<div class="grid grid-cols-2 gap-4">
								<div>
									<label class="label">Status</label>
									<select class="select" bind:value={newRoadmapForm.status}>
										<option value="planning">Planning</option>
										<option value="active">Active</option>
										<option value="on-hold">On Hold</option>
										<option value="completed">Completed</option>
										<option value="cancelled">Cancelled</option>
									</select>
								</div>
								<div>
									<label class="label">Priority</label>
									<select class="select" bind:value={newRoadmapForm.priority}>
										<option value="low">Low</option>
										<option value="medium">Medium</option>
										<option value="high">High</option>
										<option value="critical">Critical</option>
									</select>
								</div>
							</div>

							<div class="grid grid-cols-2 gap-4">
								<input
									type="date"
									bind:value={newRoadmapForm.startDate}
									placeholder="Start date"
									class="input"
								/>
								<input
									type="date"
									bind:value={newRoadmapForm.endDate}
									placeholder="End date"
									class="input"
								/>
							</div>

							<input
								type="text"
								bind:value={newRoadmapForm.owner}
								placeholder="Owner"
								class="input"
							/>

							<input
								type="text"
								bind:value={newRoadmapForm.strategicThemes}
								placeholder="Strategic themes (comma-separated)"
								class="input"
							/>

							<input
								type="text"
								bind:value={newRoadmapForm.stakeholders}
								placeholder="Stakeholders (comma-separated)"
								class="input"
							/>

							<input
								type="text"
								bind:value={newRoadmapForm.budget}
								placeholder="Budget"
								class="input"
							/>

							<input
								type="text"
								bind:value={newRoadmapForm.kpis}
								placeholder="KPIs (comma-separated)"
								class="input"
							/>

							<button 
								class="btn variant-filled-secondary w-full" 
								on:click={createRoadmap}
								disabled={!newRoadmapForm.title || !newRoadmapForm.description}
							>
								<span>🗺️</span>
								<span>Create Roadmap</span>
							</button>
						</section>
					</div>
				</div>

				<!-- Selected Roadmap Details -->
				{#if selectedRoadmap}
					<div class="card variant-glass-primary">
						<header class="card-header">
							<h3 class="h3">📋 {selectedRoadmap.title} Details</h3>
						</header>
						<section class="p-4">
							<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div class="space-y-4">
									<div>
										<h5 class="font-semibold mb-2">Description</h5>
										<p class="text-sm opacity-75">{selectedRoadmap.description}</p>
									</div>
									
									{#if selectedRoadmap.vision}
										<div>
											<h5 class="font-semibold mb-2">Vision</h5>
											<p class="text-sm opacity-75">{selectedRoadmap.vision}</p>
										</div>
									{/if}

									{#if selectedRoadmap.strategicThemes?.length}
										<div>
											<h5 class="font-semibold mb-2">Strategic Themes</h5>
											<div class="flex flex-wrap gap-2">
												{#each selectedRoadmap.strategicThemes as theme}
													<span class="badge variant-soft-primary text-xs">{theme}</span>
												{/each}
											</div>
										</div>
									{/if}

									{#if selectedRoadmap.stakeholders?.length}
										<div>
											<h5 class="font-semibold mb-2">Stakeholders</h5>
											<div class="flex flex-wrap gap-2">
												{#each selectedRoadmap.stakeholders as stakeholder}
													<span class="badge variant-soft-secondary text-xs">👤 {stakeholder}</span>
												{/each}
											</div>
										</div>
									{/if}
								</div>

								<div class="space-y-4">
									<div class="grid grid-cols-2 gap-4">
										<div>
											<h5 class="font-semibold mb-2">Status</h5>
											<span class="badge variant-soft-{getStatusColor(selectedRoadmap.status)}">{selectedRoadmap.status}</span>
										</div>
										<div>
											<h5 class="font-semibold mb-2">Priority</h5>
											<span class="badge variant-soft-{getPriorityColor(selectedRoadmap.priority)}">{selectedRoadmap.priority}</span>
										</div>
									</div>

									{#if selectedRoadmap.owner}
										<div>
											<h5 class="font-semibold mb-2">Owner</h5>
											<span class="badge variant-soft-surface">👤 {selectedRoadmap.owner}</span>
										</div>
									{/if}

									<div>
										<h5 class="font-semibold mb-2">Progress</h5>
										<div class="flex items-center gap-3">
											<div class="flex-1 bg-surface-300-600-token rounded-full h-3">
												<div 
													class="bg-primary-500 h-3 rounded-full transition-all duration-300" 
													style="width: {calculateProgress(selectedRoadmap)}%"
												></div>
											</div>
											<span class="text-sm font-bold">{calculateProgress(selectedRoadmap)}%</span>
										</div>
									</div>

									{#if selectedRoadmap.budget}
										<div>
											<h5 class="font-semibold mb-2">Budget</h5>
											<span class="badge variant-soft-tertiary">💰 {selectedRoadmap.budget}</span>
										</div>
									{/if}

									{#if selectedRoadmap.kpis?.length}
										<div>
											<h5 class="font-semibold mb-2">KPIs</h5>
											<div class="space-y-1">
												{#each selectedRoadmap.kpis as kpi}
													<div class="text-xs opacity-75">📊 {kpi}</div>
												{/each}
											</div>
										</div>
									{/if}
								</div>
							</div>
						</section>
					</div>
				{/if}
			</div>

		{:else if tabSet === 2}
			<!-- Milestones Tab -->
			<div class="space-y-6">
				<!-- Filters -->
				<div class="card variant-soft-surface p-4">
					<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div>
							<label class="label">Roadmap</label>
							<select class="select" bind:value={newMilestoneForm.roadmapId} on:change={loadMilestones}>
								<option value="">All Roadmaps</option>
								{#each roadmaps as roadmap}
									<option value={roadmap.id}>{roadmap.title}</option>
								{/each}
							</select>
						</div>
						<div>
							<label class="label">Status Filter</label>
							<select class="select" bind:value={milestoneStatusFilter} on:change={loadMilestones}>
								<option value="">All Statuses</option>
								<option value="planning">Planning</option>
								<option value="in-progress">In Progress</option>
								<option value="completed">Completed</option>
								<option value="cancelled">Cancelled</option>
							</select>
						</div>
						<div>
							<label class="label">Type Filter</label>
							<select class="select" bind:value={milestoneTypeFilter} on:change={loadMilestones}>
								<option value="">All Types</option>
								<option value="major-release">Major Release</option>
								<option value="feature-release">Feature Release</option>
								<option value="improvement">Improvement</option>
								<option value="compliance">Compliance</option>
								<option value="research">Research</option>
							</select>
						</div>
						<div class="flex items-end">
							<button class="btn variant-filled-secondary" on:click={loadMilestones}>
								<span>🔍</span>
								<span>Apply</span>
							</button>
						</div>
					</div>
				</div>

				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<!-- Milestones List -->
					<div class="card variant-soft-tertiary">
						<header class="card-header">
							<h3 class="h4">🎯 Milestones</h3>
						</header>
						<section class="p-4 max-h-96 overflow-y-auto">
							{#if milestonesLoading}
								<div class="space-y-3">
									{#each Array(5) as _}
										<div class="card variant-soft-surface p-3 animate-pulse">
											<div class="w-32 h-4 bg-surface-300-600-token rounded mb-2"></div>
											<div class="w-24 h-3 bg-surface-300-600-token rounded"></div>
										</div>
									{/each}
								</div>
							{:else if milestonesError}
								<div class="text-center text-error-500">
									<p class="text-sm">❌ {milestonesError}</p>
								</div>
							{:else if milestones.length > 0}
								<div class="space-y-3">
									{#each milestones as milestone}
										<button 
											class="btn w-full text-left p-3"
											class:variant-filled-tertiary={selectedMilestone?.id === milestone.id}
											class:variant-soft-surface={selectedMilestone?.id !== milestone.id}
											on:click={() => selectedMilestone = milestone}
										>
											<div class="flex flex-col gap-2">
												<div class="flex justify-between items-start">
													<span class="font-medium text-sm">{milestone.title}</span>
													{#if milestone.dueDate}
														<span class="text-xs {getDaysUntilDue(milestone.dueDate) < 0 ? 'text-error-500' : getDaysUntilDue(milestone.dueDate) < 7 ? 'text-warning-500' : 'opacity-75'}">
															{getDaysUntilDue(milestone.dueDate) < 0 ? `${Math.abs(getDaysUntilDue(milestone.dueDate))} days overdue` : `${getDaysUntilDue(milestone.dueDate)} days left`}
														</span>
													{/if}
												</div>
												<div class="text-xs opacity-75">{milestone.description}</div>
												<div class="flex gap-2 text-xs">
													<span class="badge variant-soft-{getStatusColor(milestone.status)}">{milestone.status}</span>
													<span class="badge variant-soft-{getPriorityColor(milestone.priority)}">{milestone.priority}</span>
													<span class="badge variant-soft-surface">{milestone.type}</span>
												</div>
												{#if milestone.dueDate}
													<div class="text-xs opacity-75">Due: {formatDate(milestone.dueDate)}</div>
												{/if}
											</div>
										</button>
									{/each}
								</div>
							{:else}
								<div class="text-center py-8">
									<p class="text-sm opacity-75">No milestones found</p>
								</div>
							{/if}
						</section>
					</div>

					<!-- Create New Milestone -->
					<div class="card variant-soft-secondary">
						<header class="card-header">
							<h3 class="h4">➕ Create New Milestone</h3>
						</header>
						<section class="p-4 space-y-4">
							<div>
								<label class="label">Roadmap</label>
								<select class="select" bind:value={newMilestoneForm.roadmapId}>
									<option value="">Select roadmap</option>
									{#each roadmaps as roadmap}
										<option value={roadmap.id}>{roadmap.title}</option>
									{/each}
								</select>
							</div>

							<input
								type="text"
								bind:value={newMilestoneForm.title}
								placeholder="Milestone title"
								class="input"
							/>

							<textarea
								bind:value={newMilestoneForm.description}
								placeholder="Description"
								class="textarea"
								rows="3"
							></textarea>

							<div class="grid grid-cols-2 gap-4">
								<div>
									<label class="label">Type</label>
									<select class="select" bind:value={newMilestoneForm.type}>
										<option value="major-release">Major Release</option>
										<option value="feature-release">Feature Release</option>
										<option value="improvement">Improvement</option>
										<option value="compliance">Compliance</option>
										<option value="research">Research</option>
									</select>
								</div>
								<div>
									<label class="label">Status</label>
									<select class="select" bind:value={newMilestoneForm.status}>
										<option value="planning">Planning</option>
										<option value="in-progress">In Progress</option>
										<option value="completed">Completed</option>
										<option value="cancelled">Cancelled</option>
									</select>
								</div>
							</div>

							<div class="grid grid-cols-2 gap-4">
								<div>
									<label class="label">Priority</label>
									<select class="select" bind:value={newMilestoneForm.priority}>
										<option value="low">Low</option>
										<option value="medium">Medium</option>
										<option value="high">High</option>
										<option value="critical">Critical</option>
									</select>
								</div>
								<input
									type="date"
									bind:value={newMilestoneForm.dueDate}
									placeholder="Due date"
									class="input"
								/>
							</div>

							<input
								type="text"
								bind:value={newMilestoneForm.owner}
								placeholder="Owner"
								class="input"
							/>

							<input
								type="text"
								bind:value={newMilestoneForm.deliverables}
								placeholder="Deliverables (comma-separated)"
								class="input"
							/>

							<input
								type="text"
								bind:value={newMilestoneForm.successCriteria}
								placeholder="Success criteria (comma-separated)"
								class="input"
							/>

							<button 
								class="btn variant-filled-secondary w-full" 
								on:click={createMilestone}
								disabled={!newMilestoneForm.roadmapId || !newMilestoneForm.title}
							>
								<span>🎯</span>
								<span>Create Milestone</span>
							</button>
						</section>
					</div>
				</div>

				<!-- Selected Milestone Details -->
				{#if selectedMilestone}
					<div class="card variant-glass-tertiary">
						<header class="card-header">
							<h3 class="h3">🎯 {selectedMilestone.title} Details</h3>
						</header>
						<section class="p-4">
							<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div class="space-y-4">
									<div>
										<h5 class="font-semibold mb-2">Description</h5>
										<p class="text-sm opacity-75">{selectedMilestone.description}</p>
									</div>

									{#if selectedMilestone.deliverables?.length}
										<div>
											<h5 class="font-semibold mb-2">Deliverables</h5>
											<div class="space-y-1">
												{#each selectedMilestone.deliverables as deliverable}
													<div class="text-xs opacity-75">📦 {deliverable}</div>
												{/each}
											</div>
										</div>
									{/if}

									{#if selectedMilestone.successCriteria?.length}
										<div>
											<h5 class="font-semibold mb-2">Success Criteria</h5>
											<div class="space-y-1">
												{#each selectedMilestone.successCriteria as criteria}
													<div class="text-xs opacity-75">✅ {criteria}</div>
												{/each}
											</div>
										</div>
									{/if}
								</div>

								<div class="space-y-4">
									<div class="grid grid-cols-2 gap-4">
										<div>
											<h5 class="font-semibold mb-2">Status</h5>
											<span class="badge variant-soft-{getStatusColor(selectedMilestone.status)}">{selectedMilestone.status}</span>
										</div>
										<div>
											<h5 class="font-semibold mb-2">Type</h5>
											<span class="badge variant-soft-surface">{selectedMilestone.type}</span>
										</div>
									</div>

									<div class="grid grid-cols-2 gap-4">
										<div>
											<h5 class="font-semibold mb-2">Priority</h5>
											<span class="badge variant-soft-{getPriorityColor(selectedMilestone.priority)}">{selectedMilestone.priority}</span>
										</div>
										{#if selectedMilestone.owner}
											<div>
												<h5 class="font-semibold mb-2">Owner</h5>
												<span class="badge variant-soft-surface">👤 {selectedMilestone.owner}</span>
											</div>
										{/if}
									</div>

									{#if selectedMilestone.dueDate}
										<div>
											<h5 class="font-semibold mb-2">Due Date</h5>
											<div class="text-sm">
												<span class="opacity-75">📅 {formatDate(selectedMilestone.dueDate)}</span>
												<span class="ml-2 {getDaysUntilDue(selectedMilestone.dueDate) < 0 ? 'text-error-500' : getDaysUntilDue(selectedMilestone.dueDate) < 7 ? 'text-warning-500' : 'text-success-500'}">
													({getDaysUntilDue(selectedMilestone.dueDate) < 0 ? `${Math.abs(getDaysUntilDue(selectedMilestone.dueDate))} days overdue` : `${getDaysUntilDue(selectedMilestone.dueDate)} days left`})
												</span>
											</div>
										</div>
									{/if}

									{#if selectedMilestone.riskFactors?.length}
										<div>
											<h5 class="font-semibold mb-2">Risk Factors</h5>
											<div class="space-y-1">
												{#each selectedMilestone.riskFactors as risk}
													<div class="text-xs text-warning-500">⚠️ {risk}</div>
												{/each}
											</div>
										</div>
									{/if}
								</div>
							</div>
						</section>
					</div>
				{/if}
			</div>

		{:else if tabSet === 3}
			<!-- Vision Tab -->
			<div class="space-y-6">
				<!-- Vision Statements -->
				<div class="card variant-soft-success">
					<header class="card-header">
						<h3 class="h3 text-success-500">👁️ Vision Statements</h3>
					</header>
					<section class="p-4">
						{#if visionsLoading}
							<div class="space-y-4">
								{#each Array(3) as _}
									<div class="card variant-soft-surface p-4 animate-pulse">
										<div class="w-48 h-4 bg-surface-300-600-token rounded mb-2"></div>
										<div class="w-32 h-3 bg-surface-300-600-token rounded"></div>
									</div>
								{/each}
							</div>
						{:else if visionsError}
							<div class="text-center text-error-500 py-8">
								<p class="text-sm">❌ {visionsError}</p>
							</div>
						{:else if visionStatements.length > 0}
							<div class="space-y-4">
								{#each visionStatements as vision}
									<div class="card variant-glass-success p-4">
										<div class="flex justify-between items-start mb-3">
											<div class="flex-1">
												<h4 class="font-semibold text-lg">{vision.title}</h4>
												<p class="text-sm opacity-75 mb-2">{vision.description}</p>
												<div class="flex gap-2 text-xs">
													<span class="badge variant-soft-{getStatusColor(vision.status)}">{vision.status}</span>
													{#if vision.timeframe}
														<span class="badge variant-soft-surface">⏰ {vision.timeframe}</span>
													{/if}
												</div>
											</div>
										</div>
										
										{#if vision.objectives?.length}
											<div class="mt-3">
												<h6 class="font-medium text-sm mb-2">Objectives:</h6>
												<div class="space-y-1">
													{#each vision.objectives as objective}
														<div class="text-xs opacity-75">🎯 {objective}</div>
													{/each}
												</div>
											</div>
										{/if}
									</div>
								{/each}
							</div>
						{:else}
							<div class="text-center py-8">
								<p class="text-sm opacity-75">No vision statements found</p>
							</div>
						{/if}
					</section>
				</div>
			</div>

		{:else if tabSet === 4}
			<!-- Analytics Tab -->
			<div class="space-y-6">
				<!-- Roadmap Analytics -->
				{#if roadmapMetrics && !metricsError}
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<!-- Completion Analytics -->
						<div class="card variant-glass-primary p-6">
							<div class="text-center">
								<ProgressRadial value={roadmapMetrics.completionRate ? roadmapMetrics.completionRate * 100 : 0} width="w-20" class="text-primary-500 mx-auto mb-4">
									<span class="text-sm font-bold">{roadmapMetrics.completionRate ? `${(roadmapMetrics.completionRate * 100).toFixed(0)}%` : '0%'}</span>
								</ProgressRadial>
								<h4 class="font-semibold">Overall Completion</h4>
								<p class="text-xs opacity-75 mt-1">Across all roadmaps</p>
							</div>
						</div>

						<!-- Performance Metrics -->
						<div class="card variant-glass-secondary p-6">
							<div class="text-center">
								<div class="text-2xl font-bold text-secondary-500 mb-2">
									{roadmapMetrics.avgVelocity?.toFixed(1) || '0.0'}
								</div>
								<h4 class="font-semibold">Avg Velocity</h4>
								<p class="text-xs opacity-75 mt-1">Milestones per month</p>
							</div>
						</div>

						<!-- Risk Assessment -->
						<div class="card variant-glass-warning p-6">
							<div class="text-center">
								<div class="text-2xl font-bold text-warning-500 mb-2">
									{roadmapMetrics.riskScore?.toFixed(1) || '0.0'}
								</div>
								<h4 class="font-semibold">Risk Score</h4>
								<p class="text-xs opacity-75 mt-1">Out of 10</p>
							</div>
						</div>
					</div>

					<!-- Detailed Metrics -->
					<div class="card variant-soft-surface">
						<header class="card-header">
							<h3 class="h3">📊 Detailed Analytics</h3>
						</header>
						<section class="p-4">
							<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
								<div>
									<h4 class="font-semibold mb-4">Status Distribution</h4>
									<div class="space-y-3">
										{#if roadmapMetrics.statusDistribution}
											{#each Object.entries(roadmapMetrics.statusDistribution) as [status, count]}
												<div class="flex justify-between items-center">
													<span class="badge variant-soft-{getStatusColor(status)} capitalize">{status}</span>
													<span class="text-sm font-medium">{count}</span>
												</div>
											{/each}
										{/if}
									</div>
								</div>

								<div>
									<h4 class="font-semibold mb-4">Priority Breakdown</h4>
									<div class="space-y-3">
										{#if roadmapMetrics.priorityDistribution}
											{#each Object.entries(roadmapMetrics.priorityDistribution) as [priority, count]}
												<div class="flex justify-between items-center">
													<span class="badge variant-soft-{getPriorityColor(priority)} capitalize">{priority}</span>
													<span class="text-sm font-medium">{count}</span>
												</div>
											{/each}
										{/if}
									</div>
								</div>
							</div>

							{#if roadmapMetrics.trends}
								<div class="mt-8">
									<h4 class="font-semibold mb-4">Performance Trends</h4>
									<CodeBlock 
										language="json" 
										code={JSON.stringify(roadmapMetrics.trends, null, 2)}
										class="max-h-64 overflow-y-auto"
									/>
								</div>
							{/if}
						</section>
					</div>
				{:else if metricsLoading}
					<div class="text-center py-12">
						<div class="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
						<p class="text-sm opacity-75">Loading analytics...</p>
					</div>
				{:else if metricsError}
					<div class="text-center text-error-500 py-8">
						<p class="text-sm">❌ {metricsError}</p>
						<button on:click={loadRoadmapMetrics} class="btn btn-sm variant-ghost-error mt-2">Retry</button>
					</div>
				{/if}
			</div>
		{/if}
	</svelte:fragment>
</TabGroup>