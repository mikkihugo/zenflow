import { O as store_get, G as ensure_array_like, R as head, I as escape_html, J as attr_class, U as maybe_selected, F as attr, T as attr_style, S as stringify, N as unsubscribe_stores, B as pop, z as push } from "../../../chunks/index2.js";
import { w as writable } from "../../../chunks/index.js";
function _page($$payload, $$props) {
  push();
  var $$store_subs;
  const roadmaps = writable([]);
  const milestones = writable([]);
  const visionStatements = writable([]);
  const roadmapMetrics = writable({
    totalRoadmaps: 0,
    activeMilestones: 0,
    completionRate: 0,
    strategicAlignment: 0
  });
  let selectedTimeframe = "12months";
  let selectedRoadmap = null;
  let showCompleted = true;
  let filterPriority = "all";
  function getStatusColor(status) {
    switch (status) {
      case "active":
        return "text-green-400";
      case "planning":
        return "text-yellow-400";
      case "completed":
        return "text-blue-400";
      case "on-hold":
        return "text-gray-400";
      case "cancelled":
        return "text-red-400";
      case "in-progress":
        return "text-blue-400";
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
  function calculateTimelineData(roadmaps2, milestones2) {
    const now = /* @__PURE__ */ new Date();
    const startDate = new Date(Math.min(...roadmaps2.map((r) => r.startDate.getTime())));
    const endDate = new Date(Math.max(...roadmaps2.map((r) => r.endDate.getTime())));
    return {
      startDate,
      endDate,
      totalDays: Math.ceil((endDate.getTime() - startDate.getTime()) / (1e3 * 60 * 60 * 24)),
      currentPosition: Math.ceil((now.getTime() - startDate.getTime()) / (1e3 * 60 * 60 * 24))
    };
  }
  store_get($$store_subs ??= {}, "$milestones", milestones);
  calculateTimelineData(store_get($$store_subs ??= {}, "$roadmaps", roadmaps), store_get($$store_subs ??= {}, "$milestones", milestones));
  const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$visionStatements", visionStatements));
  const each_array_1 = ensure_array_like(store_get($$store_subs ??= {}, "$roadmaps", roadmaps));
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Visionary Roadmap - Strategic Planning - Claude Code Zen</title>`;
  });
  $$payload.out.push(`<div class="min-h-screen bg-gray-900 text-white"><div class="bg-gray-800 border-b border-gray-700 p-6"><div class="max-w-7xl mx-auto"><div class="flex justify-between items-start mb-4"><div><h1 class="text-3xl font-bold text-purple-400 mb-2">🗺️ Visionary Roadmap</h1> <p class="text-gray-300">Strategic planning and roadmap visualization</p></div> <div class="flex gap-3"><button class="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors">➕ New Roadmap</button> <button class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">📌 New Milestone</button></div></div> <div class="grid grid-cols-2 md:grid-cols-4 gap-4"><div class="bg-gray-700 rounded-lg p-3"><div class="text-sm text-gray-400">Total Roadmaps</div> <div class="text-purple-400 font-semibold">${escape_html(store_get($$store_subs ??= {}, "$roadmapMetrics", roadmapMetrics).totalRoadmaps)}</div></div> <div class="bg-gray-700 rounded-lg p-3"><div class="text-sm text-gray-400">Active Milestones</div> <div class="text-blue-400 font-semibold">${escape_html(store_get($$store_subs ??= {}, "$roadmapMetrics", roadmapMetrics).activeMilestones)}</div></div> <div class="bg-gray-700 rounded-lg p-3"><div class="text-sm text-gray-400">Completion Rate</div> <div class="text-green-400 font-semibold">${escape_html(store_get($$store_subs ??= {}, "$roadmapMetrics", roadmapMetrics).completionRate)}%</div></div> <div class="bg-gray-700 rounded-lg p-3"><div class="text-sm text-gray-400">Strategic Alignment</div> <div class="text-yellow-400 font-semibold">${escape_html(store_get($$store_subs ??= {}, "$roadmapMetrics", roadmapMetrics).strategicAlignment)}%</div></div></div> <div class="mt-4 flex flex-wrap gap-4 items-center"><div class="flex gap-2"><button${attr_class(`px-3 py-1 rounded text-sm ${stringify("bg-blue-600")} transition-colors`)}>📅 Timeline</button> <button${attr_class(`px-3 py-1 rounded text-sm ${stringify("bg-gray-600")} transition-colors`)}>📊 Gantt</button> <button${attr_class(`px-3 py-1 rounded text-sm ${stringify("bg-gray-600")} transition-colors`)}>📋 Kanban</button></div> <select class="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm">`);
  $$payload.select_value = selectedTimeframe;
  $$payload.out.push(`<option value="3months"${maybe_selected($$payload, "3months")}>3 Months</option><option value="6months"${maybe_selected($$payload, "6months")}>6 Months</option><option value="12months"${maybe_selected($$payload, "12months")}>12 Months</option><option value="24months"${maybe_selected($$payload, "24months")}>24 Months</option><option value="all"${maybe_selected($$payload, "all")}>All Time</option>`);
  $$payload.select_value = void 0;
  $$payload.out.push(`</select> <select class="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm">`);
  $$payload.select_value = filterPriority;
  $$payload.out.push(`<option value="all"${maybe_selected($$payload, "all")}>All Priorities</option><option value="critical"${maybe_selected($$payload, "critical")}>Critical</option><option value="high"${maybe_selected($$payload, "high")}>High</option><option value="medium"${maybe_selected($$payload, "medium")}>Medium</option><option value="low"${maybe_selected($$payload, "low")}>Low</option>`);
  $$payload.select_value = void 0;
  $$payload.out.push(`</select> <label class="flex items-center gap-2 text-sm"><input type="checkbox"${attr("checked", showCompleted, true)} class="rounded"/> Show Completed</label></div></div></div> <div class="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6"><div class="lg:col-span-1 space-y-6"><div class="bg-gray-800 rounded-lg p-4 border border-gray-700"><h3 class="text-lg font-semibold mb-3">🎯 Vision Statements</h3> <div class="space-y-3"><!--[-->`);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let vision = each_array[$$index];
    $$payload.out.push(`<div class="bg-gray-700 rounded-lg p-3"><h4 class="font-medium text-purple-400 mb-1">${escape_html(vision.title)}</h4> <p class="text-gray-300 text-xs mb-2">${escape_html(vision.description)}</p> <div class="flex justify-between text-xs text-gray-400"><span>${escape_html(vision.timeframe)}</span> <span class="text-blue-400">${escape_html(vision.status.toUpperCase())}</span></div></div>`);
  }
  $$payload.out.push(`<!--]--></div></div> <div class="bg-gray-800 rounded-lg p-4 border border-gray-700"><h3 class="text-lg font-semibold mb-3">🗺️ Active Roadmaps</h3> <div class="space-y-2"><!--[-->`);
  for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
    let roadmap = each_array_1[$$index_1];
    $$payload.out.push(`<button${attr_class(`w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors ${stringify(selectedRoadmap?.id === roadmap.id ? "ring-2 ring-purple-400" : "")}`)}><div class="flex justify-between items-start mb-2"><h4 class="font-medium text-sm">${escape_html(roadmap.title)}</h4> <span${attr_class(`px-2 py-1 rounded text-xs ${stringify(getPriorityColor(roadmap.priority))}`)}>${escape_html(roadmap.priority.toUpperCase())}</span></div> <div class="text-xs text-gray-400 mb-2">${escape_html(roadmap.description)}</div> <div class="flex justify-between items-center"><span${attr_class(`text-xs ${stringify(getStatusColor(roadmap.status))}`)}>● ${escape_html(roadmap.status.toUpperCase())}</span> <div class="text-xs text-gray-400"><div class="w-16 bg-gray-600 rounded-full h-1"><div class="bg-blue-400 h-1 rounded-full"${attr_style(`width: ${stringify(roadmap.completion)}%`)}></div></div> <span>${escape_html(roadmap.completion)}%</span></div></div></button>`);
  }
  $$payload.out.push(`<!--]--></div></div> <div class="bg-gray-800 rounded-lg p-4 border border-gray-700"><h3 class="text-lg font-semibold mb-3">📈 Quick Stats</h3> <div class="space-y-3 text-sm"><div class="flex justify-between"><span class="text-gray-400">On Track</span> <span class="text-green-400">${escape_html(store_get($$store_subs ??= {}, "$roadmaps", roadmaps).filter((r) => r.status === "active").length)}</span></div> <div class="flex justify-between"><span class="text-gray-400">Planning</span> <span class="text-yellow-400">${escape_html(store_get($$store_subs ??= {}, "$roadmaps", roadmaps).filter((r) => r.status === "planning").length)}</span></div> <div class="flex justify-between"><span class="text-gray-400">At Risk</span> <span class="text-red-400">${escape_html(store_get($$store_subs ??= {}, "$roadmaps", roadmaps).filter((r) => r.riskLevel === "high").length)}</span></div> <div class="flex justify-between"><span class="text-gray-400">Completed</span> <span class="text-blue-400">${escape_html(store_get($$store_subs ??= {}, "$roadmaps", roadmaps).filter((r) => r.status === "completed").length)}</span></div></div></div></div> <div class="lg:col-span-3 space-y-6">`);
  {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<div class="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center"><div class="text-6xl mb-4">🗺️</div> <h2 class="text-2xl font-semibold text-purple-400 mb-3">Select a Roadmap</h2> <p class="text-gray-400 mb-6">Choose a roadmap from the sidebar to view its details and milestones</p> <button class="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors">➕ Create New Roadmap</button></div>`);
  }
  $$payload.out.push(`<!--]--></div></div></div>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
