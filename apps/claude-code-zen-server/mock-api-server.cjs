#!/usr/bin/env node

/**
 * Mock API Server for claude-code-zen Dashboard Testing
 *
 * This is a simple Express server that provides mock API endpoints
 * for testing the dashboard's real API integration.
 *
 * Usage: node mock-api-server.js
 * Server runs on: http://localhost:3000
 */

const express = require("express");
const cors = require("cors");
const app = express();
const port = 3001;

// Enable CORS for all origins (development only)
app.use(cors());
app.use(express.json());

// Mock data
const mockProjects = [
	{
		id: "proj-1",
		name: "Claude Code Zen",
		description: "AI-powered swarm coordination",
		status: "active",
	},
	{
		id: "proj-2",
		name: "Neural Analytics",
		description: "Advanced neural processing",
		status: "development",
	},
];

const mockAgents = [
	{
		id: "agent-1",
		name: "System Architect",
		type: "architect",
		status: "active",
		capabilities: ["design", "coordination"],
		performance: { successRate: 0.92, avgResponseTime: 850 },
		currentTask: "System optimization",
	},
	{
		id: "agent-2",
		name: "Code Analyzer",
		type: "analyst",
		status: "busy",
		capabilities: ["analysis", "debugging"],
		performance: { successRate: 0.88, avgResponseTime: 1200 },
		currentTask: "Performance analysis",
	},
	{
		id: "agent-3",
		name: "Quality Guardian",
		type: "tester",
		status: "idle",
		capabilities: ["testing", "validation"],
		performance: { successRate: 0.95, avgResponseTime: 600 },
		currentTask: null,
	},
];

const mockTasks = [
	{
		id: "task-1",
		title: "API Integration Testing",
		description: "Test dashboard API connectivity",
		status: "in-progress",
		priority: "high",
		assignedAgent: "agent-1",
		createdAt: new Date(Date.now() - 3600000).toISOString(),
		estimatedCompletion: new Date(Date.now() + 1800000).toISOString(),
	},
	{
		id: "task-2",
		title: "Performance Optimization",
		description: "Optimize neural processing pipeline",
		status: "pending",
		priority: "medium",
		assignedAgent: "agent-2",
		createdAt: new Date(Date.now() - 7200000).toISOString(),
		estimatedCompletion: new Date(Date.now() + 3600000).toISOString(),
	},
];

// Health endpoint
app.get("/api/v1/coordination/health", (_req, res) => {
	res.json({
		status: "healthy",
		uptime: process.uptime(),
		timestamp: new Date().toISOString(),
		services: {
			database: "operational",
			neural: "operational",
			coordination: "operational",
		},
		metrics: {
			activeAgents: 3,
			completedTasks: 15,
			systemLoad: 0.45,
		},
	});
});

// Projects endpoints
app.get("/api/v1/coordination/projects", (_req, res) => {
	res.json({
		projects: mockProjects,
		total: mockProjects.length,
	});
});

// Agents endpoints
app.get("/api/v1/coordination/agents", (_req, res) => {
	res.json({
		agents: mockAgents,
		total: mockAgents.length,
	});
});

app.post("/api/v1/coordination/agents", (req, res) => {
	const newAgent = {
		id: `agent-${Date.now()}`,
		name: req.body.name || "New Agent",
		type: req.body.type || "general",
		status: "idle",
		capabilities: req.body.capabilities || ["coordination"],
		performance: { successRate: 1.0, avgResponseTime: 500 },
		currentTask: null,
	};
	mockAgents.push(newAgent);
	res.json(newAgent);
});

// Tasks endpoints
app.get("/api/v1/coordination/tasks", (_req, res) => {
	res.json({
		tasks: mockTasks,
		total: mockTasks.length,
	});
});

app.post("/api/v1/coordination/tasks", (req, res) => {
	const newTask = {
		id: `task-${Date.now()}`,
		title: req.body.title || "New Task",
		description: req.body.description || "Task description",
		status: "pending",
		priority: req.body.priority || "medium",
		assignedAgent: null,
		createdAt: new Date().toISOString(),
		estimatedCompletion: new Date(Date.now() + 3600000).toISOString(),
	};
	mockTasks.push(newTask);
	res.json(newTask);
});

// Performance metrics endpoint
app.get("/api/v1/analytics/performance", (_req, res) => {
	res.json({
		overview: {
			totalTasks: 27,
			completedTasks: 15,
			activeTasks: 5,
			successRate: 0.91,
		},
		systemMetrics: {
			cpuUsage: 0.35,
			memoryUsage: 0.62,
			networkLatency: 45,
			throughput: 125.5,
		},
		agentMetrics: {
			totalAgents: 3,
			activeAgents: 2,
			idleAgents: 1,
			avgResponseTime: 850,
		},
		trends: {
			lastHour: {
				tasksCompleted: 3,
				avgPerformance: 0.88,
				peakLatency: 120,
			},
			last24Hours: {
				tasksCompleted: 15,
				avgPerformance: 0.91,
				peakLatency: 200,
			},
		},
	});
});

// Memory endpoints
app.get("/api/v1/memory/status", (_req, res) => {
	res.json({
		status: "active",
		totalMemory: "2.1GB",
		usedMemory: "1.3GB",
		sessions: 5,
		lastBackup: new Date(Date.now() - 1800000).toISOString(),
	});
});

// Database endpoints
app.get("/api/v1/database/status", (_req, res) => {
	res.json({
		status: "connected",
		type: "SQLite + LanceDB + Kuzu",
		totalRecords: 15420,
		lastSync: new Date(Date.now() - 600000).toISOString(),
	});
});

// Start server
app.listen(port, () => {
	console.log("🚀 Claude Code Zen Mock API Server");
	console.log(`📡 Server running at: http://localhost:${port}`);
	console.log("🧪 Mock endpoints available:");
	console.log("   GET  /api/v1/coordination/health");
	console.log("   GET  /api/v1/coordination/projects");
	console.log("   GET  /api/v1/coordination/agents");
	console.log("   POST /api/v1/coordination/agents");
	console.log("   GET  /api/v1/coordination/tasks");
	console.log("   POST /api/v1/coordination/tasks");
	console.log("   GET  /api/v1/analytics/performance");
	console.log("   GET  /api/v1/memory/status");
	console.log("   GET  /api/v1/database/status");
	console.log("");
	console.log("🎯 Dashboard URL: http://localhost:3002");
	console.log("✅ Ready for API integration testing!");
});
