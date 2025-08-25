<script lang="ts">
	import '../app.postcss';
	import { page } from '$app/stores';
	import ConnectionBanner from '$lib/components/ConnectionBanner.svelte';
	import { writable } from 'svelte/store';
	
	// Create connection status store here since export from component isn't working
	// Start as potentially disconnected until verified
	const connectionStatus = writable({ connected: false, lastCheck: null, retrying: false });

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
		{ href: '/stories', icon: '📖', label: 'User Stories', title: 'SAFe 6.0 User Stories & LPM' },
	];

	$: activeUrl = $page.url.pathname;
	$: bannerVisible = $connectionStatus?.connected === false;
</script>

<!-- Clean Dashboard Layout -->
<div class="min-h-screen" style="background-color: #f9fafb;">
	<!-- Top Navigation Bar -->
	<nav class="bg-white shadow-sm border-b border-gray-200 fixed w-full z-30 top-0">
		<div class="px-3 py-3 lg:px-5 lg:pl-3">
			<div class="flex items-center justify-between">
				<div class="flex items-center justify-start">
					<span class="text-xl font-semibold text-blue-600">🧠 Claude Code Zen</span>
					<span class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Admin Portal</span>
				</div>
				<div class="flex items-center gap-4">
					<!-- Status Indicator -->
					<div class="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
						<div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
						Online
					</div>
					<!-- User Menu -->
					<div class="flex items-center gap-2 px-3 py-1 text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
						<span>👤</span>
						<span class="hidden md:inline text-sm">Admin</span>
					</div>
				</div>
			</div>
		</div>
	</nav>

	<!-- Connection Status Banner (shows when API is disconnected) -->
	<ConnectionBanner {connectionStatus} />

	<!-- Sidebar -->
	<aside class="fixed left-0 z-40 w-64 h-screen transition-transform bg-white border-r border-gray-200" 
	       class:with-banner={bannerVisible}
	       style="top: {bannerVisible ? '7rem' : '4rem'};">
		<div class="h-full px-3 py-4 overflow-y-auto">
			<ul class="space-y-2 font-medium">
				{#each navItems as item}
					<li>
						<a 
							href={item.href} 
							class="flex items-center p-2 rounded-lg transition-colors {activeUrl === item.href ? 'text-blue-700 bg-blue-100' : 'text-gray-900 hover:bg-gray-100'}" 
							title={item.title}
						>
							<span class="text-lg mr-3">{item.icon}</span>
							<span>{item.label}</span>
						</a>
					</li>
				{/each}
			</ul>
			
			<!-- Footer in sidebar -->
			<div class="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
				<div class="text-xs text-gray-500 text-center">
					<div>v2.0.0 Alpha</div>
					<div class="text-gray-400">Admin Portal</div>
				</div>
			</div>
		</div>
	</aside>

	<!-- Main Content -->
	<div class="p-4 ml-64 transition-all duration-300"
	     class:content-with-banner={bannerVisible}
	     style="padding-top: {bannerVisible ? '7.5rem' : '4.5rem'};">
		<slot />
	</div>
</div>
