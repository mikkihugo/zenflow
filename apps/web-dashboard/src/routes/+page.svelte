<script lang="ts">
import { onMount } from "svelte";

// Simple dashboard data
const systemStatus = { status: "healthy", uptime: "2h 34m", services: 12 };
const metrics = {
	cpu: 45,
	memory: 62,
	disk: 78,
	network: 23,
	activeAgents: 8,
	completedTasks: 156,
	errorRate: 2.3,
};

onMount(() => {
	// Simple status check
	console.log("Dashboard loaded");
});
</script>

<div class="space-y-6">
	<!-- Dashboard Header -->
	<div>
		<h1 class="text-2xl font-bold text-gray-900">Claude Code Zen Dashboard</h1>
		<p class="text-gray-600 mt-1">Monitor and manage your AI coordination system</p>
	</div>

	<!-- System Status Cards -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<!-- System Health -->
		<div class="bg-white p-6 rounded-lg shadow">
			<div class="flex items-center justify-between">
				<h3 class="text-lg font-semibold text-gray-900">System Health</h3>
				<div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
			</div>
			<div class="mt-4">
				<div class="text-2xl font-bold text-green-600">{systemStatus.status.toUpperCase()}</div>
				<div class="text-sm text-gray-500">Uptime: {systemStatus.uptime}</div>
				<div class="text-sm text-gray-500">{systemStatus.services} services running</div>
			</div>
		</div>

		<!-- Performance Metrics -->
		<div class="bg-white p-6 rounded-lg shadow">
			<h3 class="text-lg font-semibold text-gray-900">Performance</h3>
			<div class="mt-4 space-y-3">
				<div class="flex justify-between items-center">
					<span class="text-sm text-gray-600">CPU Usage</span>
					<div class="flex items-center gap-2">
						<div class="w-16 h-2 bg-gray-200 rounded-full">
							<div class="h-2 bg-blue-500 rounded-full" style="width: {metrics.cpu}%"></div>
						</div>
						<span class="text-sm font-medium">{metrics.cpu}%</span>
					</div>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-sm text-gray-600">Memory</span>
					<div class="flex items-center gap-2">
						<div class="w-16 h-2 bg-gray-200 rounded-full">
							<div class="h-2 bg-yellow-500 rounded-full" style="width: {metrics.memory}%"></div>
						</div>
						<span class="text-sm font-medium">{metrics.memory}%</span>
					</div>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-sm text-gray-600">Disk</span>
					<div class="flex items-center gap-2">
						<div class="w-16 h-2 bg-gray-200 rounded-full">
							<div class="h-2 bg-red-500 rounded-full" style="width: {metrics.disk}%"></div>
						</div>
						<span class="text-sm font-medium">{metrics.disk}%</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Activity Summary -->
		<div class="bg-white p-6 rounded-lg shadow">
			<h3 class="text-lg font-semibold text-gray-900">Activity</h3>
			<div class="mt-4 space-y-4">
				<div class="flex justify-between items-center">
					<span class="text-sm text-gray-600">Active Agents</span>
					<span class="text-2xl font-bold text-blue-600">{metrics.activeAgents}</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-sm text-gray-600">Completed Tasks</span>
					<span class="text-2xl font-bold text-green-600">{metrics.completedTasks}</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-sm text-gray-600">Error Rate</span>
					<span class="text-2xl font-bold text-red-600">{metrics.errorRate}%</span>
				</div>
			</div>
		</div>
	</div>

	<!-- TaskMaster SAFe Integration -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- SAFe Metrics -->
		<div class="bg-white p-6 rounded-lg shadow">
			<h3 class="text-lg font-semibold text-gray-900">SAFe 6.0 Metrics</h3>
			<div class="mt-4">
				<div class="grid grid-cols-2 gap-4">
					<div class="text-center p-4 bg-blue-50 rounded-lg">
						<div class="text-2xl font-bold text-blue-600">87%</div>
						<div class="text-sm text-gray-600">PI Objectives</div>
					</div>
					<div class="text-center p-4 bg-green-50 rounded-lg">
						<div class="text-2xl font-bold text-green-600">92%</div>
						<div class="text-sm text-gray-600">Feature Velocity</div>
					</div>
					<div class="text-center p-4 bg-yellow-50 rounded-lg">
						<div class="text-2xl font-bold text-yellow-600">15</div>
						<div class="text-sm text-gray-600">WIP Limit</div>
					</div>
					<div class="text-center p-4 bg-purple-50 rounded-lg">
						<div class="text-2xl font-bold text-purple-600">4.2</div>
						<div class="text-sm text-gray-600">Flow Efficiency</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Recent Activity -->
		<div class="bg-white p-6 rounded-lg shadow">
			<h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
			<div class="mt-4 space-y-3">
				<div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
					<div class="w-2 h-2 bg-green-500 rounded-full"></div>
					<div class="flex-1">
						<div class="text-sm font-medium">TaskMaster workflow completed</div>
						<div class="text-xs text-gray-500">2 minutes ago</div>
					</div>
				</div>
				<div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
					<div class="w-2 h-2 bg-blue-500 rounded-full"></div>
					<div class="flex-1">
						<div class="text-sm font-medium">SAFe PI Planning initiated</div>
						<div class="text-xs text-gray-500">5 minutes ago</div>
					</div>
				</div>
				<div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
					<div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
					<div class="flex-1">
						<div class="text-sm font-medium">Agent coordination updated</div>
						<div class="text-xs text-gray-500">8 minutes ago</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="bg-white p-6 rounded-lg shadow">
		<h3 class="text-lg font-semibold text-gray-900">Quick Actions</h3>
		<div class="mt-4 flex flex-wrap gap-3">
			<button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
				🚀 Start SAFe Planning
			</button>
			<a href="/events" class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors inline-block">
				📡 Event System Dashboard
			</a>
			<button class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
				📊 Generate Report
			</button>
			<button class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
				🔧 System Settings
			</button>
			<button class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
				📖 View Documentation
			</button>
		</div>
	</div>
</div>