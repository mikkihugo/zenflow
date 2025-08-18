import { G as ensure_array_like, O as store_get, R as head, J as attr_class, I as escape_html, S as stringify, F as attr, U as maybe_selected, N as unsubscribe_stores, B as pop, z as push } from "../../../chunks/index2.js";
import { w as writable } from "../../../chunks/index.js";
function _page($$payload, $$props) {
  push();
  var $$store_subs;
  const currentMessage = writable("");
  const systemStatus = writable("ready");
  const activeAgents = writable([]);
  const communicationTypes = [
    {
      id: "direct",
      name: "💬 Direct Command",
      desc: "Direct system commands and queries"
    },
    {
      id: "coordination",
      name: "🤝 Agent Coordination",
      desc: "Multi-agent task coordination"
    },
    {
      id: "analysis",
      name: "🔍 Code Analysis",
      desc: "Deep code analysis requests"
    },
    {
      id: "planning",
      name: "📋 Project Planning",
      desc: "Strategic planning and roadmapping"
    },
    {
      id: "debugging",
      name: "🐛 Debug Session",
      desc: "Interactive debugging assistance"
    },
    {
      id: "review",
      name: "👁️ Code Review",
      desc: "Comprehensive code review requests"
    }
  ];
  let selectedType = "direct";
  let messageHistory = [];
  let isProcessing = false;
  function getStatusColor(status) {
    switch (status) {
      case "processing":
        return "text-yellow-400";
      case "completed":
        return "text-green-400";
      case "error":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  }
  function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString();
  }
  const each_array = ensure_array_like(communicationTypes);
  const each_array_1 = ensure_array_like(messageHistory.slice().reverse());
  const each_array_3 = ensure_array_like(store_get($$store_subs ??= {}, "$activeAgents", activeAgents));
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Dev Communication - Claude Code Zen</title>`;
  });
  $$payload.out.push(`<div class="min-h-screen bg-gray-900 text-white"><div class="bg-gray-800 border-b border-gray-700 p-6"><div class="max-w-7xl mx-auto"><h1 class="text-3xl font-bold text-blue-400 mb-2">💬 Development Communication Hub</h1> <p class="text-gray-300">Direct communication interface with the Claude Code Zen system</p> <div class="mt-4 flex items-center gap-4"><div class="flex items-center gap-2"><div${attr_class(`w-3 h-3 rounded-full ${stringify(store_get($$store_subs ??= {}, "$systemStatus", systemStatus) === "ready" ? "bg-green-400" : "bg-yellow-400")}`)}></div> <span class="text-sm">System: ${escape_html(store_get($$store_subs ??= {}, "$systemStatus", systemStatus))}</span></div> <div class="flex items-center gap-2"><span class="text-sm">Active Agents: ${escape_html(store_get($$store_subs ??= {}, "$activeAgents", activeAgents).length)}</span></div></div></div></div> <div class="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 space-y-6"><div class="bg-gray-800 rounded-lg p-6 border border-gray-700"><h2 class="text-xl font-semibold mb-4">📝 New Communication</h2> <div class="mb-4"><label class="block text-sm font-medium mb-2">Communication Type</label> <select class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2">`);
  $$payload.select_value = selectedType;
  $$payload.out.push(`<!--[-->`);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let type = each_array[$$index];
    $$payload.out.push(`<option${attr("value", type.id)}${maybe_selected($$payload, type.id)}>${escape_html(type.name)}</option>`);
  }
  $$payload.out.push(`<!--]-->`);
  $$payload.select_value = void 0;
  $$payload.out.push(`</select> <p class="text-sm text-gray-400 mt-1">${escape_html(communicationTypes.find((t) => t.id === selectedType)?.desc || "")}</p></div> <div class="mb-4"><label class="block text-sm font-medium mb-2">Message</label> <textarea placeholder="Describe what you need help with, the task to coordinate, or the analysis to perform..." class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 h-32 resize-none"${attr("disabled", isProcessing, true)}>`);
  const $$body = escape_html(store_get($$store_subs ??= {}, "$currentMessage", currentMessage));
  if ($$body) {
    $$payload.out.push(`${$$body}`);
  }
  $$payload.out.push(`</textarea></div> <div class="flex justify-between items-center"><button${attr("disabled", !store_get($$store_subs ??= {}, "$currentMessage", currentMessage).trim() || isProcessing, true)} class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-2 rounded-lg font-medium transition-colors">${escape_html("🚀 Send Communication")}</button> <button class="text-gray-400 hover:text-red-400 text-sm transition-colors">🗑️ Clear History</button></div></div> <div class="bg-gray-800 rounded-lg p-6 border border-gray-700"><h2 class="text-xl font-semibold mb-4">📜 Communication History</h2> <div class="space-y-4 max-h-96 overflow-y-auto"><!--[-->`);
  for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
    let message = each_array_1[$$index_2];
    $$payload.out.push(`<div${attr_class(`bg-gray-700 rounded-lg p-4 border-l-4 ${stringify(message.status === "completed" ? "border-green-400" : message.status === "error" ? "border-red-400" : "border-yellow-400")}`)}><div class="flex justify-between items-start mb-2"><div class="flex items-center gap-2"><span class="text-sm font-medium">${escape_html(communicationTypes.find((t) => t.id === message.type)?.name || message.type)}</span> <span${attr_class(`text-xs ${stringify(getStatusColor(message.status))}`)}>${escape_html(message.status)}</span></div> <span class="text-xs text-gray-400">${escape_html(formatTime(message.timestamp))}</span></div> <div class="mb-3"><p class="text-sm text-gray-300">${escape_html(message.content)}</p></div> `);
    if (message.response) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="bg-gray-600 rounded p-3 mt-2"><p class="text-sm text-green-300 font-medium mb-1">System Response:</p> <p class="text-sm text-gray-200">${escape_html(message.response)}</p> `);
      if (message.agents && message.agents.length > 0) {
        $$payload.out.push("<!--[-->");
        const each_array_2 = ensure_array_like(message.agents);
        $$payload.out.push(`<div class="mt-2"><p class="text-xs text-gray-400">Assigned Agents:</p> <div class="flex flex-wrap gap-1 mt-1"><!--[-->`);
        for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
          let agent = each_array_2[$$index_1];
          $$payload.out.push(`<span class="bg-blue-600 text-xs px-2 py-1 rounded">${escape_html(agent)}</span>`);
        }
        $$payload.out.push(`<!--]--></div></div>`);
      } else {
        $$payload.out.push("<!--[!-->");
      }
      $$payload.out.push(`<!--]--></div>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--> `);
    if (message.error) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="bg-red-900/30 rounded p-3 mt-2 border border-red-600"><p class="text-sm text-red-300">Error: ${escape_html(message.error)}</p></div>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--></div>`);
  }
  $$payload.out.push(`<!--]--> `);
  if (messageHistory.length === 0) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="text-center py-8 text-gray-500"><p>No communications yet. Start a conversation with the system!</p></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div></div></div> <div class="space-y-6"><div class="bg-gray-800 rounded-lg p-6 border border-gray-700"><h3 class="text-lg font-semibold mb-4">⚡ Quick Actions</h3> <div class="space-y-2"><button class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors">🔍 System Health Check</button> <button class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors">🐝 Initialize New Swarm</button> <button class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors">📊 Performance Analysis</button> <button class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors">🔧 Debug Current Task</button> <button class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors">📋 Generate Status Report</button></div></div> <div class="bg-gray-800 rounded-lg p-6 border border-gray-700"><h3 class="text-lg font-semibold mb-4">🤖 Active Agents</h3> <div class="space-y-2"><!--[-->`);
  for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
    let agent = each_array_3[$$index_3];
    $$payload.out.push(`<div class="flex items-center justify-between bg-gray-700 p-2 rounded"><span class="text-sm">${escape_html(agent.name)}</span> <span class="text-xs text-green-400">${escape_html(agent.status)}</span></div>`);
  }
  $$payload.out.push(`<!--]--> `);
  if (store_get($$store_subs ??= {}, "$activeAgents", activeAgents).length === 0) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<p class="text-sm text-gray-500">No active agents</p>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div></div> <div class="bg-gray-800 rounded-lg p-6 border border-gray-700"><h3 class="text-lg font-semibold mb-4">💡 Communication Tips</h3> <div class="space-y-3 text-sm text-gray-300"><div><p class="font-medium text-blue-400">Be Specific:</p> <p>Provide clear context and expected outcomes</p></div> <div><p class="font-medium text-green-400">Use Examples:</p> <p>Include code snippets or file paths when relevant</p></div> <div><p class="font-medium text-yellow-400">Set Priorities:</p> <p>Indicate urgency and dependencies</p></div> <div><p class="font-medium text-purple-400">Feedback Loop:</p> <p>Ask for clarification if responses aren't clear</p></div></div></div></div></div></div>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
