import { G as ensure_array_like, O as store_get, R as head, I as escape_html, J as attr_class, F as attr, S as stringify, T as attr_style, N as unsubscribe_stores, B as pop, z as push } from "../../../chunks/index2.js";
import { w as writable } from "../../../chunks/index.js";
function _page($$payload, $$props) {
  push();
  var $$store_subs;
  const activeWorkflows = writable([]);
  const pendingApprovals = writable([]);
  const systemGovernance = writable({
    status: "active",
    policies: [],
    violations: 0,
    complianceScore: 95
  });
  const aguMetrics = writable({
    totalTasks: 0,
    approvedTasks: 0,
    rejectedTasks: 0,
    pendingTasks: 0,
    averageApprovalTime: "0m"
  });
  function getStatusColor(status) {
    switch (status) {
      case "active":
        return "text-blue-400";
      case "pending":
        return "text-yellow-400";
      case "escalated":
        return "text-red-400";
      case "completed":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  }
  function getPriorityColor(priority) {
    switch (priority) {
      case "critical":
        return "text-red-400 bg-red-900/20";
      case "high":
        return "text-orange-400 bg-orange-900/20";
      case "medium":
        return "text-yellow-400 bg-yellow-900/20";
      case "low":
        return "text-blue-400 bg-blue-900/20";
      default:
        return "text-gray-400 bg-gray-900/20";
    }
  }
  function formatTimeAgo(date) {
    const now = /* @__PURE__ */ new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1e3 * 60));
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffMinutes < 24 * 60) {
      return `${Math.floor(diffMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffMinutes / (24 * 60))}d ago`;
    }
  }
  const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$activeWorkflows", activeWorkflows));
  const each_array_1 = ensure_array_like(store_get($$store_subs ??= {}, "$pendingApprovals", pendingApprovals));
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>AGU - AI Governance Unit - Claude Code Zen</title>`;
  });
  $$payload.out.push(`<div class="min-h-screen bg-gray-900 text-white"><div class="bg-gray-800 border-b border-gray-700 p-6"><div class="max-w-7xl mx-auto"><h1 class="text-3xl font-bold text-purple-400 mb-2">🛡️ AGU - AI Governance Unit</h1> <p class="text-gray-300">Centralized governance, approval workflows, and compliance management</p> <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4"><div class="bg-gray-700 rounded-lg p-3"><div class="text-sm text-gray-400">System Status</div> <div class="text-green-400 font-semibold">${escape_html(store_get($$store_subs ??= {}, "$systemGovernance", systemGovernance).status.toUpperCase())}</div></div> <div class="bg-gray-700 rounded-lg p-3"><div class="text-sm text-gray-400">Compliance Score</div> <div class="text-blue-400 font-semibold">${escape_html(store_get($$store_subs ??= {}, "$systemGovernance", systemGovernance).complianceScore)}%</div></div> <div class="bg-gray-700 rounded-lg p-3"><div class="text-sm text-gray-400">Pending Approvals</div> <div class="text-yellow-400 font-semibold">${escape_html(store_get($$store_subs ??= {}, "$pendingApprovals", pendingApprovals).length)}</div></div> <div class="bg-gray-700 rounded-lg p-3"><div class="text-sm text-gray-400">Active Workflows</div> <div class="text-purple-400 font-semibold">${escape_html(store_get($$store_subs ??= {}, "$activeWorkflows", activeWorkflows).length)}</div></div></div></div></div> <div class="max-w-7xl mx-auto p-6 grid grid-cols-1 xl:grid-cols-3 gap-6"><div class="xl:col-span-2 space-y-6"><div class="bg-gray-800 rounded-lg p-6 border border-gray-700"><h2 class="text-xl font-semibold mb-4">🔀 Active Workflow Gates</h2> <div class="space-y-4"><!--[-->`);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let workflow = each_array[$$index];
    $$payload.out.push(`<div${attr_class(`bg-gray-700 rounded-lg p-4 border-l-4 ${stringify(workflow.status === "escalated" ? "border-red-400" : workflow.status === "pending" ? "border-yellow-400" : "border-blue-400")}`)}><div class="flex justify-between items-start mb-3"><div><h3 class="font-semibold text-lg">${escape_html(workflow.name)}</h3> <div class="flex items-center gap-4 text-sm text-gray-300"><span${attr_class(getStatusColor(workflow.status))}>● ${escape_html(workflow.status.toUpperCase())}</span> <span${attr_class(`px-2 py-1 rounded text-xs ${stringify(getPriorityColor(workflow.priority))}`)}>${escape_html(workflow.priority.toUpperCase())}</span> <span>Gate: ${escape_html(workflow.gateType)}</span> <span>${escape_html(formatTimeAgo(workflow.created))}</span></div></div> <div class="text-right text-sm text-gray-400"><div>ID: ${escape_html(workflow.id)}</div> <div>Requested by: ${escape_html(workflow.requester)}</div></div></div> <div class="mb-3"><div class="text-sm text-gray-300"><span class="font-medium">Business Impact:</span> <span${attr_class(workflow.businessImpact === "critical" ? "text-red-400" : workflow.businessImpact === "high" ? "text-orange-400" : "text-yellow-400")}>${escape_html(workflow.businessImpact.toUpperCase())}</span></div> <div class="text-sm text-gray-300"><span class="font-medium">Stakeholders:</span> ${escape_html(workflow.stakeholders.join(", "))}</div></div> <div class="flex gap-2"><button class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition-colors">✅ Approve</button> <button class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors">❌ Reject</button> <button class="bg-orange-600 hover:bg-orange-700 px-3 py-1 rounded text-sm transition-colors">🔺 Escalate</button> <a${attr("href", `/agu/workflow/${stringify(workflow.id)}`)} class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors inline-block">👁️ Details</a></div></div>`);
  }
  $$payload.out.push(`<!--]--> `);
  if (store_get($$store_subs ??= {}, "$activeWorkflows", activeWorkflows).length === 0) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="text-center py-8 text-gray-500"><p>No active workflows requiring attention</p></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div></div> <div class="bg-gray-800 rounded-lg p-6 border border-gray-700"><h2 class="text-xl font-semibold mb-4">📋 Pending Task Approvals</h2> <div class="space-y-4"><!--[-->`);
  for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
    let approval = each_array_1[$$index_2];
    const each_array_2 = ensure_array_like(approval.acceptanceCriteria);
    $$payload.out.push(`<div class="bg-gray-700 rounded-lg p-4"><div class="flex justify-between items-start mb-3"><div><h3 class="font-semibold">${escape_html(approval.taskTitle)}</h3> <p class="text-gray-300 text-sm mt-1">${escape_html(approval.description)}</p></div> <div class="text-right text-sm text-gray-400"><div${attr_class(`px-2 py-1 rounded text-xs ${stringify(getPriorityColor(approval.priority))} mb-1`)}>${escape_html(approval.priority.toUpperCase())}</div> <div>${escape_html(approval.estimatedHours)}h estimated</div></div></div> <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 text-sm"><div><div class="text-gray-400">Type:</div> <div class="text-blue-400">${escape_html(approval.type)}</div></div> <div><div class="text-gray-400">Source:</div> <div class="font-mono text-green-400">${escape_html(approval.sourceAnalysis.filePath)}</div></div> <div><div class="text-gray-400">Required Agents:</div> <div>${escape_html(approval.requiredAgents.join(", "))}</div></div> <div><div class="text-gray-400">Deadline:</div> <div class="text-yellow-400">${escape_html(approval.deadline.toLocaleDateString())}</div></div></div> <div class="mb-3"><div class="text-sm text-gray-400 mb-1">Acceptance Criteria:</div> <div class="text-sm"><!--[-->`);
    for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
      let criterion = each_array_2[$$index_1];
      $$payload.out.push(`<div class="text-gray-300">• ${escape_html(criterion)}</div>`);
    }
    $$payload.out.push(`<!--]--></div></div> <div class="flex gap-2"><button class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition-colors">✅ Approve Task</button> <button class="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm transition-colors">📝 Modify</button> <button class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors">❌ Reject</button> <a${attr("href", `/agu/task/${stringify(approval.id)}`)} class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors inline-block">👁️ Review</a></div></div>`);
  }
  $$payload.out.push(`<!--]--> `);
  if (store_get($$store_subs ??= {}, "$pendingApprovals", pendingApprovals).length === 0) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="text-center py-8 text-gray-500"><p>No pending task approvals</p></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div></div></div> <div class="space-y-6"><div class="bg-gray-800 rounded-lg p-6 border border-gray-700"><h3 class="text-lg font-semibold mb-4">📊 AGU Metrics</h3> <div class="space-y-3"><div class="flex justify-between"><span class="text-gray-400">Total Tasks</span> <span class="font-semibold">${escape_html(store_get($$store_subs ??= {}, "$aguMetrics", aguMetrics).totalTasks)}</span></div> <div class="flex justify-between"><span class="text-gray-400">Approved</span> <span class="text-green-400 font-semibold">${escape_html(store_get($$store_subs ??= {}, "$aguMetrics", aguMetrics).approvedTasks)}</span></div> <div class="flex justify-between"><span class="text-gray-400">Rejected</span> <span class="text-red-400 font-semibold">${escape_html(store_get($$store_subs ??= {}, "$aguMetrics", aguMetrics).rejectedTasks)}</span></div> <div class="flex justify-between"><span class="text-gray-400">Pending</span> <span class="text-yellow-400 font-semibold">${escape_html(store_get($$store_subs ??= {}, "$aguMetrics", aguMetrics).pendingTasks)}</span></div> <div class="flex justify-between"><span class="text-gray-400">Avg Approval Time</span> <span class="text-blue-400 font-semibold">${escape_html(store_get($$store_subs ??= {}, "$aguMetrics", aguMetrics).averageApprovalTime)}</span></div></div></div> <div class="bg-gray-800 rounded-lg p-6 border border-gray-700"><h3 class="text-lg font-semibold mb-4">⚡ Quick Actions</h3> <div class="space-y-2"><a href="/agu/scan" class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors block">🔍 Initiate Code Scan</a> <a href="/agu/policies" class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors block">📋 Review Policies</a> <a href="/agu/reports" class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors block">📊 Generate Reports</a> <a href="/agu/audit" class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors block">🔍 Audit Trail</a> <a href="/agu/settings" class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors block">⚙️ AGU Settings</a></div></div> <div class="bg-gray-800 rounded-lg p-6 border border-gray-700"><h3 class="text-lg font-semibold mb-4">🛡️ Governance Status</h3> <div class="space-y-3"><div><div class="flex justify-between mb-1"><span class="text-gray-400">Compliance Score</span> <span class="text-blue-400">${escape_html(store_get($$store_subs ??= {}, "$systemGovernance", systemGovernance).complianceScore)}%</span></div> <div class="w-full bg-gray-700 rounded-full h-2"><div class="bg-blue-400 h-2 rounded-full"${attr_style(`width: ${stringify(store_get($$store_subs ??= {}, "$systemGovernance", systemGovernance).complianceScore)}%`)}></div></div></div> <div class="flex justify-between"><span class="text-gray-400">Violations</span> <span class="text-red-400">${escape_html(store_get($$store_subs ??= {}, "$systemGovernance", systemGovernance).violations)}</span></div> <div class="flex justify-between"><span class="text-gray-400">Active Policies</span> <span class="text-green-400">${escape_html(store_get($$store_subs ??= {}, "$systemGovernance", systemGovernance).policies.length)}</span></div></div></div> <div class="bg-gray-800 rounded-lg p-6 border border-gray-700"><h3 class="text-lg font-semibold mb-4">🕐 Recent Activity</h3> <div class="space-y-3 text-sm"><div class="border-l-2 border-green-400 pl-3"><div class="text-green-400">Workflow approved</div> <div class="text-gray-400">Security patch deployment - 15m ago</div></div> <div class="border-l-2 border-yellow-400 pl-3"><div class="text-yellow-400">Task escalated</div> <div class="text-gray-400">Database optimization review - 1h ago</div></div> <div class="border-l-2 border-blue-400 pl-3"><div class="text-blue-400">Policy updated</div> <div class="text-gray-400">Code review requirements - 2h ago</div></div></div></div></div></div></div>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
