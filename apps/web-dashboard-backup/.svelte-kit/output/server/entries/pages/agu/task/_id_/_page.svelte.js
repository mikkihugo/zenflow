import { O as store_get, R as head, G as ensure_array_like, I as escape_html, J as attr_class, S as stringify, F as attr, U as maybe_selected, T as attr_style, N as unsubscribe_stores, B as pop, z as push } from "../../../../../chunks/index2.js";
import { p as page } from "../../../../../chunks/stores.js";
import { w as writable } from "../../../../../chunks/index.js";
function _page($$payload, $$props) {
  push();
  var $$store_subs;
  store_get($$store_subs ??= {}, "$page", page).params.id;
  const task = writable(null);
  const isLoading = writable(true);
  const decision = writable("");
  const rationale = writable("");
  const modifications = writable({});
  const showModificationForm = writable(false);
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
  function getSeverityColor(severity) {
    switch (severity) {
      case "critical":
        return "text-red-400";
      case "high":
        return "text-orange-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-blue-400";
      default:
        return "text-gray-400";
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
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Task Approval - ${escape_html(store_get($$store_subs ??= {}, "$task", task)?.title || "Loading...")} - Claude Code Zen</title>`;
  });
  $$payload.out.push(`<div class="min-h-screen bg-gray-900 text-white">`);
  if (store_get($$store_subs ??= {}, "$isLoading", isLoading)) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="flex items-center justify-center min-h-screen"><div class="text-center"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div> <p class="text-gray-300">Loading task details...</p></div></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
    if (store_get($$store_subs ??= {}, "$task", task)) {
      $$payload.out.push("<!--[-->");
      const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$task", task).sourceAnalysis.tags);
      const each_array_1 = ensure_array_like(store_get($$store_subs ??= {}, "$task", task).acceptanceCriteria);
      const each_array_2 = ensure_array_like(store_get($$store_subs ??= {}, "$task", task).businessContext.stakeholders);
      const each_array_5 = ensure_array_like(store_get($$store_subs ??= {}, "$task", task).requiredAgentTypes);
      $$payload.out.push(`<div class="bg-gray-800 border-b border-gray-700 p-6"><div class="max-w-7xl mx-auto"><div class="flex items-center gap-4 mb-4"><a href="/agu" class="text-purple-400 hover:text-purple-300">← Back to AGU</a> <div class="h-6 w-px bg-gray-600"></div> <h1 class="text-2xl font-bold text-purple-400">📋 Task Approval Review</h1></div> <div class="flex justify-between items-start"><div><h2 class="text-xl font-semibold mb-2">${escape_html(store_get($$store_subs ??= {}, "$task", task).title)}</h2> <div class="flex items-center gap-4 text-sm text-gray-300"><span${attr_class(`px-2 py-1 rounded ${stringify(getPriorityColor(store_get($$store_subs ??= {}, "$task", task).priority))}`)}>${escape_html(store_get($$store_subs ??= {}, "$task", task).priority.toUpperCase())}</span> <span class="text-blue-400">${escape_html(store_get($$store_subs ??= {}, "$task", task).type)}</span> <span>${escape_html(store_get($$store_subs ??= {}, "$task", task).estimatedHours)}h estimated</span> <span>Created ${escape_html(formatTimeAgo(store_get($$store_subs ??= {}, "$task", task).created))}</span></div></div> <div class="text-right text-sm text-gray-400"><div>Task ID: ${escape_html(store_get($$store_subs ??= {}, "$task", task).id)}</div> <div>Correlation: ${escape_html(store_get($$store_subs ??= {}, "$task", task).correlationId)}</div></div></div></div></div> <div class="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 space-y-6"><div class="bg-gray-800 rounded-lg p-6 border border-gray-700"><h3 class="text-lg font-semibold mb-3">📝 Task Description</h3> <p class="text-gray-300 leading-relaxed">${escape_html(store_get($$store_subs ??= {}, "$task", task).description)}</p></div> <div class="bg-gray-800 rounded-lg p-6 border border-gray-700"><h3 class="text-lg font-semibold mb-3">🔍 Source Analysis</h3> <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"><div><div class="text-sm text-gray-400">File Path</div> <div class="font-mono text-green-400">${escape_html(store_get($$store_subs ??= {}, "$task", task).sourceAnalysis.filePath)}</div></div> <div><div class="text-sm text-gray-400">Line Number</div> <div class="text-blue-400">${escape_html(store_get($$store_subs ??= {}, "$task", task).sourceAnalysis.lineNumber || "N/A")}</div></div> <div><div class="text-sm text-gray-400">Analysis Type</div> <div class="text-purple-400">${escape_html(store_get($$store_subs ??= {}, "$task", task).sourceAnalysis.type)}</div></div> <div><div class="text-sm text-gray-400">Severity</div> <div${attr_class(getSeverityColor(store_get($$store_subs ??= {}, "$task", task).sourceAnalysis.severity))}>${escape_html(store_get($$store_subs ??= {}, "$task", task).sourceAnalysis.severity.toUpperCase())}</div></div></div> `);
      if (store_get($$store_subs ??= {}, "$task", task).sourceAnalysis.codeSnippet) {
        $$payload.out.push("<!--[-->");
        $$payload.out.push(`<div class="mb-4"><div class="text-sm text-gray-400 mb-2">Code Context</div> <pre class="bg-gray-900 rounded-lg p-4 text-sm font-mono overflow-x-auto border border-gray-600"><code>${escape_html(store_get($$store_subs ??= {}, "$task", task).sourceAnalysis.codeSnippet)}</code></pre></div>`);
      } else {
        $$payload.out.push("<!--[!-->");
      }
      $$payload.out.push(`<!--]--> <div class="mb-4"><div class="text-sm text-gray-400 mb-2">Analysis Tags</div> <div class="flex flex-wrap gap-2"><!--[-->`);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let tag = each_array[$$index];
        $$payload.out.push(`<span class="bg-blue-600 text-blue-100 px-2 py-1 rounded text-xs">${escape_html(tag)}</span>`);
      }
      $$payload.out.push(`<!--]--></div></div> <div class="flex justify-between text-sm"><span class="text-gray-400">Scanner: ${escape_html(store_get($$store_subs ??= {}, "$task", task).scannedBy)}</span> <span class="text-gray-400">Confidence: ${escape_html(Math.round(store_get($$store_subs ??= {}, "$task", task).sourceAnalysis.confidence * 100))}%</span></div></div> <div class="bg-gray-800 rounded-lg p-6 border border-gray-700"><h3 class="text-lg font-semibold mb-3">✅ Acceptance Criteria</h3> <div class="space-y-2"><!--[-->`);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let criterion = each_array_1[$$index_1];
        $$payload.out.push(`<div class="flex items-start gap-2"><span class="text-green-400 mt-1">•</span> <span class="text-gray-300">${escape_html(criterion)}</span></div>`);
      }
      $$payload.out.push(`<!--]--></div></div> <div class="bg-gray-800 rounded-lg p-6 border border-gray-700"><h3 class="text-lg font-semibold mb-3">🏢 Business Context</h3> <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"><div><div class="text-sm text-gray-400">Business Impact</div> <div class="text-orange-400 font-semibold">${escape_html(store_get($$store_subs ??= {}, "$task", task).businessContext.impact.toUpperCase())}</div></div> <div><div class="text-sm text-gray-400">Deadline</div> <div class="text-yellow-400">${escape_html(store_get($$store_subs ??= {}, "$task", task).businessContext.deadline.toLocaleDateString())}</div></div></div> <div class="mb-4"><div class="text-sm text-gray-400 mb-2">Stakeholders</div> <div class="flex flex-wrap gap-2"><!--[-->`);
      for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
        let stakeholder = each_array_2[$$index_2];
        $$payload.out.push(`<span class="bg-purple-600 text-purple-100 px-2 py-1 rounded text-xs">${escape_html(stakeholder)}</span>`);
      }
      $$payload.out.push(`<!--]--></div></div> `);
      if (store_get($$store_subs ??= {}, "$task", task).businessContext.dependencies.length > 0) {
        $$payload.out.push("<!--[-->");
        const each_array_3 = ensure_array_like(store_get($$store_subs ??= {}, "$task", task).businessContext.dependencies);
        $$payload.out.push(`<div class="mb-4"><div class="text-sm text-gray-400 mb-2">Dependencies</div> <!--[-->`);
        for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
          let dep = each_array_3[$$index_3];
          $$payload.out.push(`<div class="text-sm text-gray-300">• ${escape_html(dep.reference)} (${escape_html(dep.type)}, ${escape_html(dep.criticality)} criticality)</div>`);
        }
        $$payload.out.push(`<!--]--></div>`);
      } else {
        $$payload.out.push("<!--[!-->");
      }
      $$payload.out.push(`<!--]--> `);
      if (store_get($$store_subs ??= {}, "$task", task).businessContext.riskFactors.length > 0) {
        $$payload.out.push("<!--[-->");
        const each_array_4 = ensure_array_like(store_get($$store_subs ??= {}, "$task", task).businessContext.riskFactors);
        $$payload.out.push(`<div><div class="text-sm text-gray-400 mb-2">Risk Factors</div> <!--[-->`);
        for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
          let risk = each_array_4[$$index_4];
          $$payload.out.push(`<div class="text-sm text-gray-300">• ${escape_html(risk.description)} (${escape_html(risk.severity)}, ${escape_html(Math.round(risk.probability * 100))}% probability)</div>`);
        }
        $$payload.out.push(`<!--]--></div>`);
      } else {
        $$payload.out.push("<!--[!-->");
      }
      $$payload.out.push(`<!--]--></div> <div class="bg-gray-800 rounded-lg p-6 border border-gray-700"><h3 class="text-lg font-semibold mb-4">🎯 Make Decision</h3> <div class="mb-4"><label class="block text-sm font-medium mb-2">Decision</label> <div class="grid grid-cols-2 md:grid-cols-4 gap-2"><label class="flex items-center"><input type="radio"${attr("checked", store_get($$store_subs ??= {}, "$decision", decision) === "approve", true)} value="approve" class="mr-2"/> <span class="text-green-400">✅ Approve</span></label> <label class="flex items-center"><input type="radio"${attr("checked", store_get($$store_subs ??= {}, "$decision", decision) === "modify", true)} value="modify" class="mr-2"/> <span class="text-yellow-400">📝 Modify</span></label> <label class="flex items-center"><input type="radio"${attr("checked", store_get($$store_subs ??= {}, "$decision", decision) === "reject", true)} value="reject" class="mr-2"/> <span class="text-red-400">❌ Reject</span></label> <label class="flex items-center"><input type="radio"${attr("checked", store_get($$store_subs ??= {}, "$decision", decision) === "defer", true)} value="defer" class="mr-2"/> <span class="text-gray-400">⏸️ Defer</span></label></div></div> <div class="mb-4"><label for="rationale" class="block text-sm font-medium mb-2">Rationale ${escape_html(store_get($$store_subs ??= {}, "$decision", decision) === "reject" || store_get($$store_subs ??= {}, "$decision", decision) === "modify" ? "(Required)" : "(Optional)")}</label> <textarea id="rationale" placeholder="Provide reasoning for your decision..." class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 h-24 resize-none">`);
      const $$body = escape_html(store_get($$store_subs ??= {}, "$rationale", rationale));
      if ($$body) {
        $$payload.out.push(`${$$body}`);
      }
      $$payload.out.push(`</textarea></div> `);
      if (store_get($$store_subs ??= {}, "$decision", decision) === "modify") {
        $$payload.out.push("<!--[-->");
        $$payload.out.push(`<div class="mb-4 p-4 bg-gray-700 rounded-lg"><div class="flex justify-between items-center mb-3"><h4 class="font-medium">Task Modifications</h4> <button class="text-blue-400 hover:text-blue-300 text-sm">${escape_html(store_get($$store_subs ??= {}, "$showModificationForm", showModificationForm) ? "Hide" : "Show")} Options</button></div> `);
        if (store_get($$store_subs ??= {}, "$showModificationForm", showModificationForm)) {
          $$payload.out.push("<!--[-->");
          $$payload.out.push(`<div class="space-y-3"><div><label class="block text-sm text-gray-400 mb-1">New Title</label> <input type="text"${attr("value", store_get($$store_subs ??= {}, "$modifications", modifications).title)} placeholder="Leave empty to keep current title" class="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"/></div> <div><label class="block text-sm text-gray-400 mb-1">Priority</label> <select class="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm">`);
          $$payload.select_value = store_get($$store_subs ??= {}, "$modifications", modifications).priority;
          $$payload.out.push(`<option value=""${maybe_selected($$payload, "")}>Keep current priority</option><option value="low"${maybe_selected($$payload, "low")}>Low</option><option value="medium"${maybe_selected($$payload, "medium")}>Medium</option><option value="high"${maybe_selected($$payload, "high")}>High</option><option value="critical"${maybe_selected($$payload, "critical")}>Critical</option>`);
          $$payload.select_value = void 0;
          $$payload.out.push(`</select></div> <div><label class="block text-sm text-gray-400 mb-1">Estimated Hours</label> <input type="number"${attr("value", store_get($$store_subs ??= {}, "$modifications", modifications).estimatedHours)}${attr("placeholder", `Current: ${stringify(store_get($$store_subs ??= {}, "$task", task).estimatedHours)}`)} class="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"/></div></div>`);
        } else {
          $$payload.out.push("<!--[!-->");
        }
        $$payload.out.push(`<!--]--></div>`);
      } else {
        $$payload.out.push("<!--[!-->");
      }
      $$payload.out.push(`<!--]--> <button${attr("disabled", !store_get($$store_subs ??= {}, "$decision", decision), true)} class="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium transition-colors">Submit Decision</button></div></div> <div class="space-y-6"><div class="bg-gray-800 rounded-lg p-6 border border-gray-700"><h3 class="text-lg font-semibold mb-4">📊 Task Summary</h3> <div class="space-y-3 text-sm"><div class="flex justify-between"><span class="text-gray-400">Type</span> <span class="text-blue-400">${escape_html(store_get($$store_subs ??= {}, "$task", task).type)}</span></div> <div class="flex justify-between"><span class="text-gray-400">Priority</span> <span${attr_class(getPriorityColor(store_get($$store_subs ??= {}, "$task", task).priority).split(" ")[0])}>${escape_html(store_get($$store_subs ??= {}, "$task", task).priority.toUpperCase())}</span></div> <div class="flex justify-between"><span class="text-gray-400">Estimated Hours</span> <span>${escape_html(store_get($$store_subs ??= {}, "$task", task).estimatedHours)}h</span></div> <div class="flex justify-between"><span class="text-gray-400">Suggested Swarm</span> <span class="text-purple-400">${escape_html(store_get($$store_subs ??= {}, "$task", task).suggestedSwarmType)}</span></div></div></div> <div class="bg-gray-800 rounded-lg p-6 border border-gray-700"><h3 class="text-lg font-semibold mb-4">👥 Required Agents</h3> <div class="space-y-2"><!--[-->`);
      for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
        let agent = each_array_5[$$index_5];
        $$payload.out.push(`<div class="bg-gray-700 rounded px-3 py-2 text-sm">${escape_html(agent)}</div>`);
      }
      $$payload.out.push(`<!--]--></div></div> <div class="bg-gray-800 rounded-lg p-6 border border-gray-700"><h3 class="text-lg font-semibold mb-4">⚡ Quick Actions</h3> <div class="space-y-2"><button class="w-full text-left bg-green-600 hover:bg-green-700 p-2 rounded text-sm transition-colors">✅ Quick Approve</button> <button class="w-full text-left bg-yellow-600 hover:bg-yellow-700 p-2 rounded text-sm transition-colors">⏸️ Defer for Review</button> <a${attr("href", `/agu/task/${stringify(store_get($$store_subs ??= {}, "$task", task).id)}/export`)} class="w-full text-left bg-blue-600 hover:bg-blue-700 p-2 rounded text-sm transition-colors block">📄 Export Details</a></div></div> <div class="bg-gray-800 rounded-lg p-6 border border-gray-700"><h3 class="text-lg font-semibold mb-4">🎯 Analysis Confidence</h3> <div class="space-y-3"><div><div class="flex justify-between mb-1"><span class="text-gray-400">Scanner Confidence</span> <span class="text-blue-400">${escape_html(Math.round(store_get($$store_subs ??= {}, "$task", task).sourceAnalysis.confidence * 100))}%</span></div> <div class="w-full bg-gray-700 rounded-full h-2"><div class="bg-blue-400 h-2 rounded-full"${attr_style(`width: ${stringify(store_get($$store_subs ??= {}, "$task", task).sourceAnalysis.confidence * 100)}%`)}></div></div></div> <div class="text-xs text-gray-500">High confidence indicates reliable automated analysis</div></div></div></div></div>`);
    } else {
      $$payload.out.push("<!--[!-->");
      $$payload.out.push(`<div class="flex items-center justify-center min-h-screen"><div class="text-center"><h1 class="text-2xl font-bold text-red-400 mb-4">Task Not Found</h1> <p class="text-gray-300 mb-4">The requested task could not be found.</p> <a href="/agu" class="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors">Return to AGU Dashboard</a></div></div>`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></div>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
