<script lang="ts">
	import '../app.postcss';
	// Skeleton UI temporarily disabled due to compatibility issues
	// import '@skeletonlabs/skeleton';
	// import { AppShell, AppBar, AppRail, AppRailTile } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';

	// Admin navigation items
	const navItems = [
		{ href: '/', icon: '🏠', label: 'Dashboard', title: 'Dashboard Overview' },
		{ href: '/safe', icon: '🎯', label: 'SAFe Platform', title: 'SAFe 6.0 Production Platform' },
		{ href: '/safe-production', icon: '🚀', label: 'SAFe Production', title: 'Production SAFe Dashboard' },
		{ href: '/system', icon: '📊', label: 'System', title: 'System Capability Dashboard' },
		{ href: '/facades', icon: '🏗️', label: 'Facades', title: 'Strategic Facade Monitor' },
		{ href: '/swarm', icon: '🐝', label: 'Swarm', title: 'Advanced Swarm Management' },
		{ href: '/agui', icon: '🎛️', label: 'AGUI', title: 'Advanced GUI Interface' },
		{ href: '/memory', icon: '💾', label: 'Memory', title: 'Memory Management' },
		{ href: '/database', icon: '🗃️', label: 'Database', title: 'Database Management' },
		{ href: '/roadmap', icon: '🗺️', label: 'Roadmap', title: 'Strategic Roadmap Tasks' },
	];

	// Get current tile value based on route
	$: currentTile = navItems.findIndex(item => $page.url.pathname === item.href) ?? 0;
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
					<!-- Project Switcher Component -->
					<ProjectSwitcher />

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
