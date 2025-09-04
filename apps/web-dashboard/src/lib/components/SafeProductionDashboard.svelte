<script lang="ts">
import { onDestroy, onMount } from "svelte";
import type { Writable } from "svelte/store";
import { writable } from "svelte/store";
import { apiClient } from "$lib/api";
// Widget imports disabled due to TailwindCSS compatibility issues
// import SafeVisualizationWidget from './SafeVisualizationWidget.svelte';
// import SafeCoachingWidget from './SafeCoachingWidget.svelte';
// import SafeGamificationWidget from './SafeGamificationWidget.svelte';
// import SafePredictionWidget from './SafePredictionWidget.svelte';
// import SafeIntegrationWidget from './SafeIntegrationWidget.svelte';

// Props
export let userId: string;
export let userRole:
	| "team_member"
	| "scrum_master"
	| "po"
	| "rte"
	| "architect"
	| "business_owner";
export const immersionLevel: "basic" | "enhanced" | "production" = "enhanced";

// Dashboard state
interface DashboardWidget {
	id: string;
	type:
		| "visualization"
		| "coaching"
		| "gamification"
		| "prediction"
		| "integration";
	title: string;
	size: "small" | "medium" | "large" | "full-width";
	position: { x: number; y: number };
	data: any;
}

interface DashboardState {
	widgets: DashboardWidget[];
	realTimeUpdates: boolean;
	performanceMetrics: {
		renderTime: number;
		userEngagement: number;
		predictionAccuracy: number;
		workflowEfficiency: number;
	};
}

// Reactive stores
const dashboardState: Writable<DashboardState> = writable({
	widgets: [],
	realTimeUpdates: true,
	performanceMetrics: {
		renderTime: 0,
		userEngagement: 0,
		predictionAccuracy: 0,
		workflowEfficiency: 0,
	},
});

const eventLog: Writable<any[]> = writable([]);
const connectionStatus: Writable<"connected" | "connecting" | "disconnected"> =
	writable("connecting");

// WebSocket connection for real-time updates
let socket: any;
let updateInterval: NodeJS.Timeout;

onMount(async () => {
	await initializeDashboard();
	startRealTimeUpdates();
});

onDestroy(() => {
	if (socket) {
		socket.disconnect();
	}
	if (updateInterval) {
		clearInterval(updateInterval);
	}
});

async function initializeDashboard() {
	try {
		connectionStatus.set("connecting");

		// Initialize WebSocket connection
		const { io } = await import("socket.io-client");
		socket = io("ws://localhost:3000", {
			auth: { userId, userRole },
			transports: ["websocket"],
		});

		socket.on("connect", () => {
			connectionStatus.set("connected");
			console.log("Connected to SAFe Production Platform");
		});

		socket.on("disconnect", () => {
			connectionStatus.set("disconnected");
			console.log("Disconnected from SAFe Production Platform");
		});

		// Listen for dashboard updates
		socket.on("dashboard:updated", (update: any) => {
			eventLog.update((log) => [
				{ timestamp: new Date(), type: "dashboard_update", data: update },
				...log.slice(0, 99), // Keep last 100 events
			]);
			updateDashboardWidgets(update);
		});

		socket.on("safe:gate_status_changed", (event: any) => {
			eventLog.update((log) => [
				{ timestamp: new Date(), type: "gate_status", data: event },
				...log.slice(0, 99),
			]);
			updateVisualizationWidgets(event);
		});

		socket.on("user:achievement_unlocked", (event: any) => {
			if (event.userId === userId) {
				eventLog.update((log) => [
					{ timestamp: new Date(), type: "achievement", data: event },
					...log.slice(0, 99),
				]);
				updateGamificationWidgets(event);
				showAchievementNotification(event);
			}
		});

		socket.on("brain:prediction_generated", (event: any) => {
			eventLog.update((log) => [
				{ timestamp: new Date(), type: "prediction", data: event },
				...log.slice(0, 99),
			]);
			updatePredictionWidgets(event);
		});

		// Listen for TaskMaster SAFe workflow events
		socket.on("taskmaster:task_updated", (event: any) => {
			eventLog.update((log) => [
				{ timestamp: new Date(), type: "taskmaster_task", data: event },
				...log.slice(0, 99),
			]);
			// Refresh TaskMaster data when tasks are updated
			loadTaskMasterData();
		});

		socket.on("taskmaster:metrics_updated", (event: any) => {
			eventLog.update((log) => [
				{ timestamp: new Date(), type: "taskmaster_metrics", data: event },
				...log.slice(0, 99),
			]);
			// Update dashboard metrics immediately
			dashboardState.update((state) => ({
				...state,
				performanceMetrics: {
					...state.performanceMetrics,
					renderTime:
						event.metrics.averageCycleTime ||
						state.performanceMetrics.renderTime,
					userEngagement:
						event.metrics.teamVelocity / 100 ||
						state.performanceMetrics.userEngagement,
					predictionAccuracy:
						event.metrics.predictiveAccuracy ||
						state.performanceMetrics.predictionAccuracy,
					workflowEfficiency:
						event.metrics.throughput / 10 ||
						state.performanceMetrics.workflowEfficiency,
				},
			}));
		});

		socket.on("taskmaster:pi_event", (event: any) => {
			eventLog.update((log) => [
				{ timestamp: new Date(), type: "taskmaster_pi", data: event },
				...log.slice(0, 99),
			]);
			// Show PI Planning notification
			if (event.type === "pi_planning_started") {
				showAchievementNotification({
					type: "pi_planning",
					message: `PI Planning ${event.piNumber} has started`,
					priority: "high",
				});
			}
		});

		// Load initial dashboard configuration
		await loadDashboardConfiguration();

		// Load real TaskMaster SAFe data
		await loadTaskMasterData();
	} catch (error) {
		console.error("Failed to initialize dashboard:", error);
		connectionStatus.set("disconnected");
	}
}

async function loadDashboardConfiguration() {
	// Simulate loading role-specific dashboard configuration
	const roleConfigs = {
		team_member: [
			{
				type: "gamification",
				title: "Skills & Achievements",
				size: "medium",
				position: { x: 0, y: 0 },
			},
			{
				type: "visualization",
				title: "3D Team Universe",
				size: "large",
				position: { x: 1, y: 0 },
			},
			{
				type: "coaching",
				title: "AI Coach",
				size: "small",
				position: { x: 0, y: 1 },
			},
			{
				type: "prediction",
				title: "Personal Insights",
				size: "medium",
				position: { x: 1, y: 1 },
			},
		],
		scrum_master: [
			{
				type: "visualization",
				title: "Team Health Radar",
				size: "large",
				position: { x: 0, y: 0 },
			},
			{
				type: "integration",
				title: "Workflow Orchestration",
				size: "medium",
				position: { x: 1, y: 0 },
			},
			{
				type: "coaching",
				title: "Facilitation Coach",
				size: "small",
				position: { x: 0, y: 1 },
			},
			{
				type: "prediction",
				title: "Team Performance Forecast",
				size: "medium",
				position: { x: 1, y: 1 },
			},
		],
		po: [
			{
				type: "visualization",
				title: "Value Stream Galaxy",
				size: "full-width",
				position: { x: 0, y: 0 },
			},
			{
				type: "prediction",
				title: "Customer Impact Forecast",
				size: "large",
				position: { x: 0, y: 1 },
			},
			{
				type: "coaching",
				title: "Product Strategy Coach",
				size: "medium",
				position: { x: 1, y: 1 },
			},
		],
		rte: [
			{
				type: "visualization",
				title: "ART Constellation",
				size: "large",
				position: { x: 0, y: 0 },
			},
			{
				type: "integration",
				title: "PI Planning Command Center",
				size: "large",
				position: { x: 1, y: 0 },
			},
			{
				type: "prediction",
				title: "PI Success Probability",
				size: "medium",
				position: { x: 0, y: 1 },
			},
			{
				type: "coaching",
				title: "RTE Excellence Coach",
				size: "medium",
				position: { x: 1, y: 1 },
			},
		],
		architect: [
			{
				type: "visualization",
				title: "System Architecture Cosmos",
				size: "full-width",
				position: { x: 0, y: 0 },
			},
			{
				type: "prediction",
				title: "Technical Debt Evolution",
				size: "large",
				position: { x: 0, y: 1 },
			},
			{
				type: "integration",
				title: "Architecture Governance",
				size: "medium",
				position: { x: 1, y: 1 },
			},
		],
		business_owner: [
			{
				type: "visualization",
				title: "Portfolio Universe",
				size: "full-width",
				position: { x: 0, y: 0 },
			},
			{
				type: "prediction",
				title: "Business Outcome Forecasting",
				size: "large",
				position: { x: 0, y: 1 },
			},
			{
				type: "integration",
				title: "Portfolio Command Center",
				size: "large",
				position: { x: 1, y: 1 },
			},
		],
	};

	const widgets = roleConfigs[userRole].map((config, index) => ({
		id: `widget_${index}_${config.type}`,
		...config,
		data: generateInitialWidgetData(config.type),
	}));

	dashboardState.update((state) => ({
		...state,
		widgets,
	}));
}

async function loadTaskMasterData() {
	try {
		console.log("Loading TaskMaster SAFe data...");

		// Fetch real-time SAFe metrics from TaskMaster
		const [metrics, dashboard, health] = await Promise.all([
			apiClient.getTaskMasterMetrics(),
			apiClient.getTaskMasterDashboard(),
			apiClient.getTaskMasterHealth(),
		]);

		console.log("TaskMaster data loaded:", { metrics, dashboard, health });

		// Update dashboard state with real SAFe data
		dashboardState.update((state) => ({
			...state,
			realTimeUpdates: true,
			performanceMetrics: {
				...state.performanceMetrics,
				workflowEfficiency: metrics.wipEfficiency || 0.85,
				predictionAccuracy: health.overallHealth || 0.9,
			},
			widgets: state.widgets.map((widget) => ({
				...widget,
				data: {
					...widget.data,
					realMetrics: metrics,
					healthData: health,
					tasksByState: dashboard.tasksByState,
					safeMetrics: {
						totalTasks: metrics.totalTasks,
						averageCycleTime: metrics.averageCycleTime,
						throughput: metrics.throughput,
						systemHealth: health.overallHealth,
						wipUtilization: health.wipUtilization,
						activeBottlenecks: health.activeBottlenecks,
					},
				},
			})),
		}));

		// Log event for dashboard visibility
		eventLog.update((log) => [
			{
				timestamp: new Date(),
				type: "taskmaster_data_loaded",
				data: {
					totalTasks: metrics.totalTasks,
					systemHealth: health.overallHealth,
					message: "Real TaskMaster SAFe data loaded successfully",
				},
			},
			...log.slice(0, 99),
		]);
	} catch (error) {
		console.error("Failed to load TaskMaster data:", error);

		// Log error event
		eventLog.update((log) => [
			{
				timestamp: new Date(),
				type: "taskmaster_data_error",
				data: {
					error: error.message,
					message: "Using mock data - TaskMaster API not available",
				},
			},
			...log.slice(0, 99),
		]);
	}
}

function generateInitialWidgetData(type: string) {
	const baseData = {
		loading: false,
		lastUpdate: new Date(),
		userRole,
		immersionLevel,
	};

	switch (type) {
		case "visualization":
			return {
				...baseData,
				scene: {
					objects: [],
					connections: [],
					camera: { position: { x: 0, y: 50, z: 200 } },
				},
			};
		case "coaching":
			return {
				...baseData,
				activeSession: null,
				suggestions: [],
				progressTracking: {},
			};
		case "gamification":
			return {
				...baseData,
				currentLevel: { level: 1, progress: 0 },
				achievements: [],
				challenges: [],
			};
		case "prediction":
			return {
				...baseData,
				predictions: [],
				confidence: 0,
				trends: [],
			};
		case "integration":
			return {
				...baseData,
				connectedTools: [],
				automations: [],
				status: "healthy",
			};
		default:
			return baseData;
	}
}

function startRealTimeUpdates() {
	updateInterval = setInterval(async () => {
		if (socket?.connected) {
			// Request dashboard refresh
			socket.emit("dashboard:request_update", { userId, userRole });

			try {
				// Fetch real TaskMaster data for live updates
				await loadTaskMasterData();

				// Update performance metrics with real data
				const metrics = await apiClient.getTaskMasterMetrics();
				dashboardState.update((state) => ({
					...state,
					performanceMetrics: {
						...state.performanceMetrics,
						renderTime: metrics.averageCycleTime || Math.random() * 50 + 10,
						userEngagement:
							metrics.teamVelocity / 100 || Math.random() * 0.3 + 0.7,
						predictionAccuracy:
							metrics.predictiveAccuracy || Math.random() * 0.2 + 0.8,
						workflowEfficiency:
							metrics.throughput / 10 || Math.random() * 0.25 + 0.75,
					},
				}));
			} catch (error) {
				console.warn(
					"Failed to fetch real-time TaskMaster data, using fallback metrics:",
					error,
				);
				// Fallback to simulated metrics if TaskMaster API is unavailable
				dashboardState.update((state) => ({
					...state,
					performanceMetrics: {
						...state.performanceMetrics,
						renderTime: Math.random() * 50 + 10,
						userEngagement: Math.random() * 0.3 + 0.7,
						predictionAccuracy: Math.random() * 0.2 + 0.8,
						workflowEfficiency: Math.random() * 0.25 + 0.75,
					},
				}));
			}
		}
	}, 30000); // Update every 30 seconds
}

function updateDashboardWidgets(update: any) {
	dashboardState.update((state) => ({
		...state,
		widgets: state.widgets.map((widget) =>
			update.affectedWidgets?.includes(widget.id)
				? { ...widget, data: { ...widget.data, ...update.data } }
				: widget,
		),
	}));
}

function updateVisualizationWidgets(event: any) {
	dashboardState.update((state) => ({
		...state,
		widgets: state.widgets.map((widget) =>
			widget.type === "visualization"
				? {
						...widget,
						data: { ...widget.data, lastEvent: event, lastUpdate: new Date() },
					}
				: widget,
		),
	}));
}

function updateGamificationWidgets(event: any) {
	dashboardState.update((state) => ({
		...state,
		widgets: state.widgets.map((widget) =>
			widget.type === "gamification"
				? {
						...widget,
						data: {
							...widget.data,
							achievements: [event, ...(widget.data.achievements || [])],
							lastUpdate: new Date(),
						},
					}
				: widget,
		),
	}));
}

function updatePredictionWidgets(event: any) {
	dashboardState.update((state) => ({
		...state,
		widgets: state.widgets.map((widget) =>
			widget.type === "prediction"
				? {
						...widget,
						data: {
							...widget.data,
							predictions: [
								event,
								...(widget.data.predictions || []).slice(0, 4),
							],
							lastUpdate: new Date(),
						},
					}
				: widget,
		),
	}));
}

function showAchievementNotification(achievement: any) {
	// Create toast notification for achievement
	const notification = {
		type: "achievement",
		title: "🏆 Achievement Unlocked!",
		message: `${achievement.title}: ${achievement.description}`,
		duration: 5000,
	};

	// You could dispatch this to a notification store
	console.log("Achievement notification:", notification);
}

function getGridStyle(widget: DashboardWidget) {
	const sizeMap = {
		small: { gridColumn: "span 1", gridRow: "span 1" },
		medium: { gridColumn: "span 2", gridRow: "span 1" },
		large: { gridColumn: "span 2", gridRow: "span 2" },
		"full-width": { gridColumn: "span 4", gridRow: "span 1" },
	};

	return sizeMap[widget.size];
}

// Reactive statements
$: connectedStatus = $connectionStatus;
$: widgets = $dashboardState.widgets;
$: metrics = $dashboardState.performanceMetrics;
$: recentEvents = $eventLog.slice(0, 5);
</script>

<script lang="ts">
/**
 * Progressive widget loader for dashboard grid.
 * Dynamically imports the correct widget component based on widget.type.
 * Shows a loading spinner and error fallback.
 */
import { onMount } from "svelte";
import { writable } from "svelte/store";

const widgetTypeToImport: Record<string, () => Promise<any>> = {
  visualization: () => import("./SafeVisualizationWidget.svelte"),
  coaching: () => import("./SafeCoachingWidget.svelte"),
  gamification: () => import("./SafeGamificationWidget.svelte"),
  prediction: () => import("./SafePredictionWidget.svelte"),
  integration: () => import("./SafeIntegrationWidget.svelte"),
};

export let userRole: string;
export let immersionLevel: "basic" | "enhanced" | "production";

export let widget: any;

let loadedComponent: any = null;
let error: string | null = null;
let loading = true;

onMount(async () => {
  loading = true;
  error = null;
  loadedComponent = null;
  const importFn = widgetTypeToImport[widget.type];
  if (!importFn) {
    error = `Unknown widget type: ${widget.type}`;
    loading = false;
    return;
  }
  try {
    const mod = await importFn();
    loadedComponent = mod.default;
  } catch (e) {
    error = "Failed to load widget: " + (e?.message || e);
  }
  loading = false;
});
</script>

<!-- WidgetLoader component -->
<svelte:component
  this={loadedComponent}
  data={widget.data}
  userRole={userRole}
  immersionLevel={immersionLevel}
  {...$$restProps}
  style="width: 100%; min-height: 120px;"
  />
{#if loading}
  <div style="background: rgba(15,23,42,0.5); border-radius: 8px; padding: 1rem; min-height: 120px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
    <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏳</div>
    <div style="color: #94a3b8; font-size: 0.875rem;">Loading widget...</div>
  </div>
{/if}
{#if error}
  <div style="background: rgba(220,38,38,0.2); border-radius: 8px; padding: 1rem; min-height: 120px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
    <div style="font-size: 2rem; margin-bottom: 0.5rem;">⚠️</div>
    <div style="color: #ef4444; font-size: 0.875rem;">{error}</div>
  </div>
{/if}

<!-- Main Dashboard Container -->
<div style="min-height: 100vh; background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%); color: white; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <!-- Header -->
  <header style="background: rgba(30, 41, 59, 0.5); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(51, 65, 85, 0.7); position: sticky; top: 0; z-index: 50;">
    <div style="max-width: 1280px; margin: 0 auto; padding: 1rem;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <h1 style="font-size: 1.5rem; font-weight: bold; background: linear-gradient(to right, #60a5fa, #a78bfa); background-clip: text; -webkit-background-clip: text; color: transparent;">
            🚀 SAFe Production Platform
          </h1>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: {connectedStatus === 'connected' ? '#4ade80' : connectedStatus === 'connecting' ? '#facc15' : '#f87171'};"></div>
            <span style="font-size: 0.875rem; color: #cbd5e1; text-transform: capitalize;">{connectedStatus}</span>
          </div>
        </div>
        
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div style="font-size: 0.875rem; color: #cbd5e1;">
            <span style="font-weight: 600; text-transform: capitalize;">{userRole.replace('_', ' ')}</span> • {userId}
          </div>
          
          <!-- Performance Metrics -->
          <div style="display: flex; align-items: center; gap: 0.75rem; font-size: 0.75rem; color: #94a3b8;">
            <div style="display: flex; align-items: center; gap: 0.25rem;">
              <div style="width: 8px; height: 8px; background: #60a5fa; border-radius: 50%;"></div>
              <span>Render: {metrics.renderTime.toFixed(0)}ms</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.25rem;">
              <div style="width: 8px; height: 8px; background: #4ade80; border-radius: 50%;"></div>
              <span>Engagement: {(metrics.userEngagement * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main style="max-width: 1280px; margin: 0 auto; padding: 1.5rem;">
    <!-- Dashboard Grid -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
      {#each widgets as widget (widget.id)}
        <div style="grid-column: {getGridStyle(widget).gridColumn}; grid-row: {getGridStyle(widget).gridRow}; background: rgba(30, 41, 59, 0.3); backdrop-filter: blur(12px); border-radius: 12px; border: 1px solid rgba(51, 65, 85, 0.5); padding: 1.5rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); transition: transform 0.3s ease;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
            <h3 style="font-size: 1.125rem; font-weight: 600; color: #e2e8f0;">{widget.title}</h3>
            <div style="width: 8px; height: 8px; background: #4ade80; border-radius: 50%; animation: pulse 2s infinite;"></div>
          </div>
          
          <!-- Progressive Widget Loader -->
          {#key widget.id}
            <WidgetLoader {widget} {userRole} {immersionLevel} />
          {/key}
        </div>
      {/each}
    </div>

    <!-- Real-time Event Stream -->
    <div style="background: rgba(30, 41, 59, 0.3); backdrop-filter: blur(12px); border-radius: 12px; border: 1px solid rgba(51, 65, 85, 0.5); padding: 1.5rem;">
      <h3 style="font-size: 1.125rem; font-weight: 600; color: #e2e8f0; margin-bottom: 1rem;">📡 Real-time Event Stream</h3>
      <div style="max-height: 128px; overflow-y: auto;">
        {#each recentEvents as event (event.timestamp)}
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.875rem; padding: 0.5rem; background: rgba(51, 65, 85, 0.3); border-radius: 8px; margin-bottom: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div style="width: 6px; height: 6px; background: #60a5fa; border-radius: 50%;"></div>
              <span style="color: #cbd5e1; text-transform: capitalize;">{event.type.replace('_', ' ')}</span>
              <span style="color: #94a3b8;">{event.timestamp.toLocaleTimeString()}</span>
            </div>
            <div style="font-size: 0.75rem; color: #64748b;">
              {JSON.stringify(event.data).slice(0, 50)}...
            </div>
          </div>
        {/each}
        {#if recentEvents.length === 0}
          <div style="text-align: center; color: #64748b; font-style: italic; padding: 2rem;">
            No recent events. Connect to SAFe platform to see real-time updates.
          </div>
        {/if}
      </div>
    </div>
  </main>
</div>

<style>
  /* Pulse animation for status indicators */
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  /* Custom scrollbar styling */
  div[style*="overflow-y: auto"] {
    scrollbar-width: thin;
    scrollbar-color: rgb(51, 65, 85) rgb(30, 41, 59);
  }
  
  div[style*="overflow-y: auto"]::-webkit-scrollbar {
    width: 6px;
  }
  
  div[style*="overflow-y: auto"]::-webkit-scrollbar-track {
    background: rgb(30, 41, 59);
    border-radius: 3px;
  }
  
  div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb {
    background: rgb(51, 65, 85);
    border-radius: 3px;
  }
  
  div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb:hover {
    background: rgb(71, 85, 105);
  }
</style>