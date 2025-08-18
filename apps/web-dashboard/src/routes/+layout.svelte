<script lang="ts">
	import '../app.postcss';
	import { AppShell, AppBar, AppRail, AppRailTile, popup } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
	import type { PopupSettings } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { apiClient, type Project } from '../lib/api';

	// Highlight JS
	import hljs from 'highlight.js/lib/core';
	import 'highlight.js/styles/github-dark.css';
	import { storeHighlightJs } from '@skeletonlabs/skeleton';
	import xml from 'highlight.js/lib/languages/xml'; // for HTML
	import css from 'highlight.js/lib/languages/css';
	import javascript from 'highlight.js/lib/languages/javascript';
	import typescript from 'highlight.js/lib/languages/typescript';

	hljs.registerLanguage('xml', xml); // for HTML
	hljs.registerLanguage('css', css);
	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('typescript', typescript);
	storeHighlightJs.set(hljs);

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	// Admin navigation items
	const navItems = [
		{ href: '/', icon: '🏠', label: 'Dashboard', title: 'Dashboard Overview' },
		{ href: '/swarm', icon: '🐝', label: 'Swarm', title: 'Advanced Swarm Management' },
		{ href: '/agents', icon: '🤖', label: 'Agents', title: 'Agent Management' },
		{ href: '/tasks', icon: '✅', label: 'Tasks', title: 'Task Management' },
		{ href: '/roadmap', icon: '🗺️', label: 'Roadmap', title: 'Strategic Roadmap Tasks' },
		{ href: '/memory', icon: '💾', label: 'Memory', title: 'Memory Management' },
		{ href: '/database', icon: '🗃️', label: 'Database', title: 'Database Management' },
		{ href: '/performance', icon: '📊', label: 'Analytics', title: 'Performance Analytics' },
		{ href: '/logs', icon: '📝', label: 'Logs', title: 'System Logs' },
		{ href: '/settings', icon: '⚙️', label: 'Settings', title: 'System Settings' },
	];

	// Get current tile value based on route
	$: currentTile = navItems.findIndex(item => $page.url.pathname === item.href) ?? 0;

	// Project management with real API data
	let projects: Project[] = [];
	let currentProject: Project | null = null;
	let projectsLoading = true;
	let projectsError: string | null = null;

	// Project dropdown popup settings
	const projectPopup: PopupSettings = {
		event: 'click',
		target: 'projectDropdown',
		placement: 'bottom-end'
	};

	// Load projects from real API
	onMount(async () => {
		try {
			projectsLoading = true;
			projects = await apiClient.getProjects();
			currentProject = projects[0] || null;
			console.log('📁 Loaded projects from API:', projects.length);
		} catch (error) {
			projectsError = error instanceof Error ? error.message : 'Failed to load projects';
			console.error('❌ Failed to load projects:', error);
		} finally {
			projectsLoading = false;
		}
	});

	function selectProject(project: Project) {
		currentProject = project;
		// Update API client with new project context
		apiClient.setProjectContext(project.id.toString());
		console.log('🔄 Switched to project:', project.name, 'ID:', project.id);
		
		// Trigger a custom event that other components can listen to
		// This will allow the dashboard to refresh its data
		window.dispatchEvent(new CustomEvent('projectChanged', {
			detail: { project, projectId: project.id.toString() }
		}));
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'active': return 'success';
			case 'paused': return 'warning';
			case 'completed': return 'secondary';
			default: return 'surface';
		}
	}

	function getStatusIcon(status: string): string {
		switch (status) {
			case 'active': return '🟢';
			case 'paused': return '⏸️';
			case 'completed': return '✅';
			default: return '⚪';
		}
	}
</script>

<!-- Admin Dashboard Shell -->
<AppShell regionPage="overflow-y-auto" slotSidebarLeft="bg-surface-50-900-token w-56">
	<svelte:fragment slot="header">
		<!-- Top App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<div class="flex items-center gap-3">
					<strong class="text-xl text-primary-500">🧠 Claude Code Zen</strong>
					<span class="badge variant-soft-secondary text-xs">Admin Portal</span>
				</div>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<div class="flex items-center gap-4">
					<!-- Project Selector Dropdown -->
					<div class="relative">
						{#if projectsLoading}
							<div class="btn variant-soft-surface flex items-center gap-2 min-w-[240px] animate-pulse">
								<span>📁</span>
								<div class="flex-1 text-left">
									<div class="font-medium text-sm">Loading projects...</div>
									<div class="text-xs opacity-75">Please wait</div>
								</div>
								<div class="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
							</div>
						{:else if projectsError}
							<div class="btn variant-soft-error flex items-center gap-2 min-w-[240px]">
								<span>❌</span>
								<div class="flex-1 text-left">
									<div class="font-medium text-sm">Failed to load</div>
									<div class="text-xs opacity-75">Check API connection</div>
								</div>
							</div>
						{:else if currentProject}
							<button
								class="btn variant-soft-surface flex items-center gap-2 min-w-[240px]"
								use:popup={projectPopup}
							>
								<span>📁</span>
								<div class="flex-1 text-left">
									<div class="font-medium text-sm">{currentProject.name}</div>
									<div class="text-xs opacity-75">{currentProject.currentPhase} • {currentProject.progress}%</div>
								</div>
								<div class="flex items-center gap-2">
									<span class="text-sm">{getStatusIcon(currentProject.status)}</span>
									<span class="text-xs">▼</span>
								</div>
							</button>
						{:else}
							<div class="btn variant-soft-surface flex items-center gap-2 min-w-[240px] opacity-50">
								<span>📁</span>
								<div class="flex-1 text-left">
									<div class="font-medium text-sm">No projects</div>
									<div class="text-xs opacity-75">Create a project</div>
								</div>
							</div>
						{/if}

						<!-- Project Dropdown Menu -->
						<div class="card p-4 w-80 shadow-xl z-10" data-popup="projectDropdown">
							<div class="arrow bg-surface-100-800-token" />
							<header class="pb-3">
								<h3 class="h6 text-surface-600-300-token">Switch Project</h3>
							</header>
							
							<div class="space-y-2 max-h-64 overflow-y-auto">
								{#each projects as project}
									<button
										class="btn w-full text-left p-3"
										class:variant-filled-primary={currentProject.id === project.id}
										class:variant-soft-surface={currentProject.id !== project.id}
										on:click={() => selectProject(project)}
									>
										<div class="flex flex-col w-full gap-1">
											<div class="flex justify-between items-center">
												<span class="font-medium text-sm">{project.name}</span>
												<span class="badge variant-soft-{getStatusColor(project.status)} text-xs">
													{getStatusIcon(project.status)} {project.status}
												</span>
											</div>
											<div class="text-xs opacity-75">{project.description}</div>
											<div class="flex justify-between items-center text-xs opacity-75">
												<span>{project.currentPhase}</span>
												<span>{project.progress}% complete</span>
											</div>
											<!-- Progress bar -->
											<div class="w-full bg-surface-300-600-token rounded-full h-1 mt-1">
												<div 
													class="bg-{getStatusColor(project.status)}-500 h-1 rounded-full transition-all duration-300" 
													style="width: {project.progress}%"
												></div>
											</div>
										</div>
									</button>
								{/each}
							</div>

							<hr class="opacity-50 my-3" />
							<button class="btn variant-ghost-success w-full">
								<span>➕</span>
								<span>Create New Project</span>
							</button>
						</div>
					</div>

					<!-- Status Indicator -->
					<div class="badge variant-soft-success flex items-center gap-2">
						<div class="w-2 h-2 rounded-full bg-success-500 animate-pulse"></div>
						Online
					</div>

					<!-- User Menu -->
					<button class="btn btn-sm variant-ghost-surface">
						<span>👤</span>
						<span class="hidden md:inline">Admin</span>
					</button>
				</div>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>

	<svelte:fragment slot="sidebarLeft">
		<!-- Admin Navigation Sidebar -->
		<div class="h-full flex flex-col">
			<!-- Navigation Header -->
			<div class="p-4 border-b border-surface-300-600-token">
				<h3 class="h6 text-surface-600-300-token font-semibold">Navigation</h3>
			</div>
			
			<!-- Navigation Rail -->
			<AppRail bind:value={currentTile} class="flex-1">
				{#each navItems as item, i}
					<AppRailTile bind:group={currentTile} name="nav" value={i} title={item.title}>
						<svelte:fragment slot="lead">
							<a href={item.href} class="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-surface-200-700-token transition-colors">
								<span class="text-lg">{item.icon}</span>
								<span class="text-sm font-medium">{item.label}</span>
							</a>
						</svelte:fragment>
					</AppRailTile>
				{/each}
			</AppRail>

			<!-- Footer -->
			<div class="p-4 border-t border-surface-300-600-token">
				<div class="text-xs text-surface-600-300-token text-center">
					<div>v2.0.0 Alpha</div>
					<div>Admin Portal</div>
				</div>
			</div>
		</div>
	</svelte:fragment>

	<!-- Main Content Area -->
	<div class="p-6 space-y-6">
		<slot />
	</div>
</AppShell>
