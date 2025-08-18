import { G as ensure_array_like, R as head, J as attr_class, I as escape_html, S as stringify, T as attr_style, B as pop, z as push } from "../../chunks/index2.js";
function _page($$payload, $$props) {
  push();
  let systemStatus = {
    health: "healthy",
    uptime: 0,
    memoryUsage: 0,
    version: "2.0.0-alpha.44"
  };
  let swarms = [
    {
      id: 1,
      name: "Document Processing",
      agents: 4,
      status: "active"
    },
    {
      id: 2,
      name: "Feature Development",
      agents: 6,
      status: "active"
    },
    { id: 3, name: "Code Analysis", agents: 2, status: "warning" }
  ];
  let performance = {
    cpu: 23.5,
    memory: 67.2,
    requestsPerMin: 127,
    avgResponse: 45
  };
  let recentTasks = [
    {
      id: 1,
      title: "Process PRD: User Auth",
      progress: 75,
      status: "active"
    },
    {
      id: 2,
      title: "Generate ADR: Database",
      progress: 0,
      status: "pending"
    },
    {
      id: 3,
      title: "Code Review: API",
      progress: 50,
      status: "active"
    }
  ];
  function formatUptime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  }
  function formatBytes(bytes) {
    return `${Math.round(bytes)}MB`;
  }
  function getStatusColor(status) {
    switch (status) {
      case "active":
        return "success";
      case "warning":
        return "warning";
      case "error":
        return "error";
      default:
        return "inactive";
    }
  }
  const each_array = ensure_array_like(swarms);
  const each_array_1 = ensure_array_like(recentTasks);
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Claude Code Zen - Dashboard</title>`;
  });
  $$payload.out.push(`<div class="dashboard svelte-sthdik"><div class="dashboard-header svelte-sthdik"><h1 class="svelte-sthdik">Dashboard Overview</h1> <p class="text-secondary">Real-time system monitoring and swarm management</p></div> <div class="grid grid-auto mb-5"><div class="card"><h3>⚡ System Status</h3> <div class="metrics svelte-sthdik"><div class="metric"><span class="metric-label">System Health</span> <span class="metric-value flex items-center gap-2"><span${attr_class(`status-dot ${stringify(getStatusColor(systemStatus.health))}`, "svelte-sthdik")}></span> ${escape_html(systemStatus.health)}</span></div> <div class="metric"><span class="metric-label">Uptime</span> <span class="metric-value">${escape_html(formatUptime(systemStatus.uptime))}</span></div> <div class="metric"><span class="metric-label">Memory Usage</span> <span class="metric-value">${escape_html(formatBytes(systemStatus.memoryUsage))}</span></div> <div class="metric"><span class="metric-label">Version</span> <span class="metric-value">${escape_html(systemStatus.version)}</span></div></div></div> <div class="card"><h3>🐝 Active Swarms</h3> <div class="swarms-list svelte-sthdik"><!--[-->`);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let swarm = each_array[$$index];
    $$payload.out.push(`<div class="metric"><span class="metric-label flex items-center gap-2"><span${attr_class(`status-dot ${stringify(getStatusColor(swarm.status))}`, "svelte-sthdik")}></span> ${escape_html(swarm.name)}</span> <span class="metric-value">${escape_html(swarm.agents)} agents</span></div>`);
  }
  $$payload.out.push(`<!--]--></div> <div class="mt-3"><button class="btn primary">🚀 Initialize New Swarm</button></div></div> <div class="card"><h3>📊 Performance</h3> <div class="performance-metrics"><div class="metric-item mb-3 svelte-sthdik"><div class="flex justify-between items-center mb-1"><span class="metric-label">CPU Usage</span> <span class="metric-value">${escape_html(performance.cpu.toFixed(1))}%</span></div> <div class="progress"><div class="progress-fill"${attr_style(`width: ${stringify(performance.cpu)}%`)}></div></div></div> <div class="metric-item mb-3 svelte-sthdik"><div class="flex justify-between items-center mb-1"><span class="metric-label">Memory Usage</span> <span class="metric-value">${escape_html(performance.memory.toFixed(1))}%</span></div> <div class="progress"><div${attr_class(`progress-fill ${stringify("success")}`)}${attr_style(`width: ${stringify(performance.memory)}%`)}></div></div></div> <div class="metric"><span class="metric-label">Requests/min</span> <span class="metric-value">${escape_html(performance.requestsPerMin)}</span></div> <div class="metric"><span class="metric-label">Avg Response</span> <span class="metric-value">${escape_html(performance.avgResponse)}ms</span></div></div></div> <div class="card"><h3>✅ Recent Tasks</h3> <div class="tasks-list svelte-sthdik"><!--[-->`);
  for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
    let task = each_array_1[$$index_1];
    $$payload.out.push(`<div class="task-item mb-3 svelte-sthdik"><div class="flex justify-between items-center mb-1"><span class="metric-label">${escape_html(task.title)}</span> <span class="metric-value">${escape_html(task.progress)}%</span></div> <div class="progress"><div${attr_class(`progress-fill ${stringify(task.status === "active" ? "success" : "inactive")}`)}${attr_style(`width: ${stringify(task.progress)}%`)}></div></div> <div class="flex items-center gap-2 mt-1"><span${attr_class(`status-dot ${stringify(getStatusColor(task.status))}`, "svelte-sthdik")}></span> <span class="text-muted" style="font-size: 0.75rem; text-transform: capitalize;">${escape_html(task.status)}</span></div></div>`);
  }
  $$payload.out.push(`<!--]--></div> <div class="mt-3"><button class="btn">📋 View All Tasks</button></div></div></div> <div class="card"><h3>⚡ Quick Actions</h3> <div class="actions-grid svelte-sthdik"><button class="btn primary">🤖 Create New Swarm</button> <button class="btn">📝 Create New Task</button> <button class="btn">🔄 Refresh System</button> <button class="btn">📊 View Analytics</button> <button class="btn">⚙️ System Settings</button> <button class="btn">📋 View Logs</button></div></div> <div class="status-bar mt-4 text-center text-muted svelte-sthdik"><span class="flex items-center justify-center gap-2"><span class="status-dot active"></span> Real-time updates active • Last updated: ${escape_html((/* @__PURE__ */ new Date()).toLocaleTimeString())}</span></div></div>`);
  pop();
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
