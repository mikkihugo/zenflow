<script lang="ts">
import "../app.postcss";
import { writable } from "svelte/store";
import { page } from "$app/stores";
import ConnectionBanner from "../lib/components/ConnectionBanner.svelte";

// Create connection status store here since export from component isn't working
// Start as potentially disconnected until verified
const _connectionStatus = writable({
	connected: false,
	lastCheck: null,
	retrying: false,
});

// Admin navigation items
const _navItems = [
	{ href: "/", icon: "🏠", label: "Dashboard", title: "Dashboard Overview" },
	{
		href: "/safe",
		icon: "🎯",
		label: "SAFe Platform",
		title: "SAFe 6.0 Production Platform",
	},
	{
		href: "/safe-production",
		icon: "🚀",
		label: "SAFe Production",
		title: "Production SAFe Dashboard",
	},
	{
		href: "/system",
		icon: "📊",
		label: "System",
		title: "System Capability Dashboard",
	},
	{
		href: "/facades",
		icon: "🏗️",
		label: "Facades",
		title: "Strategic Facade Monitor",
	},
	{
		href: "/swarm",
		icon: "🐝",
		label: "Swarm",
		title: "Advanced Swarm Management",
	},
	{ href: "/agui", icon: "🎛️", label: "AGUI", title: "Advanced GUI Interface" },
	{ href: "/agents", icon: "🤖", label: "Agents", title: "AI Agent Coordination" },
	{ href: "/memory", icon: "💾", label: "Memory", title: "Memory Management" },
	{
		href: "/database",
		icon: "🗃️",
		label: "Database",
		title: "Database Management",
	},
	{
		href: "/stories",
		icon: "📖",
		label: "User Stories",
		title: "SAFe 6.0 User Stories & LPM",
	},
];

$: activeUrl = $page.url.pathname;
$: bannerVisible = $_connectionStatus?.connected === false;
</script>

<!-- Clean Dashboard Layout -->
<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	<!-- Top Navigation Bar -->
	<nav class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 fixed w-full z-50 top-0">
		<div class="px-3 py-3 lg:px-5 lg:pl-3">
			<div class="flex items-center justify-between">
				<div class="flex items-center justify-start">
					<span class="text-xl font-semibold text-blue-600 dark:text-blue-400">🧠 Claude Code Zen</span>
					<span class="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">Admin Portal</span>
				</div>
				<div class="flex items-center gap-4">
					<!-- Status Indicator -->
					<div class="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
						<div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
						Online
					</div>
					<!-- User Menu -->
					<div class="flex items-center gap-2 px-3 py-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
						<span>👤</span>
						<span class="hidden md:inline text-sm">Admin</span>
					</div>
				</div>
			</div>
		</div>
	</nav>

	<!-- Connection Status Banner (shows when API is disconnected) -->
	<ConnectionBanner connectionStatus={$_connectionStatus} />

	<!-- Sidebar -->
	<aside class="fixed left-0 z-40 w-64 h-screen transition-transform bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700" 
	       class:with-banner={bannerVisible}
	       style="top: {bannerVisible ? '7rem' : '4rem'};">
		<div class="h-full px-3 py-4 overflow-y-auto">
			<ul class="space-y-2 font-medium">
				{#each _navItems as item}
					<li>
						<a 
							href={item.href} 
							class="flex items-center p-2 rounded-lg transition-colors {activeUrl === item.href ? 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900' : 'text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}" 
							title={item.title}
						>
							<span class="text-lg mr-3">{item.icon}</span>
							<span>{item.label}</span>
						</a>
					</li>
				{/each}
			</ul>
			
			<!-- Footer in sidebar -->
			<div class="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
				<div class="text-xs text-gray-500 dark:text-gray-400 text-center">
					<div>v2.0.0 Alpha</div>
					<div class="text-gray-400 dark:text-gray-500">Admin Portal</div>
				</div>
			</div>
		</div>
	</aside>

	<!-- Main Content -->
	<div class="p-4 ml-64 transition-all duration-300 relative z-10"
	     class:content-with-banner={bannerVisible}
	     style="padding-top: {bannerVisible ? '7.5rem' : '4.5rem'};">
		<slot />
	</div>
</div>
