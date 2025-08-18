import { G as ensure_array_like, O as store_get, R as head, I as escape_html, J as attr_class, S as stringify, F as attr, T as attr_style, N as unsubscribe_stores, B as pop, z as push } from "../../../chunks/index2.js";
import { w as writable } from "../../../chunks/index.js";
function _page($$payload, $$props) {
  push();
  var $$store_subs;
  const activeConsultations = writable([]);
  const expertDomains = writable([]);
  const recommendationHistory = writable([]);
  const matronMetrics = writable({
    totalConsultations: 0,
    activeExperts: 0,
    resolutionRate: 0,
    averageResponseTime: "0m"
  });
  function getStatusColor(status) {
    switch (status) {
      case "active":
        return "text-blue-400";
      case "analysis":
        return "text-yellow-400";
      case "pending":
        return "text-orange-400";
      case "completed":
        return "text-green-400";
      case "escalated":
        return "text-red-400";
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
  function getComplexityColor(complexity) {
    switch (complexity) {
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
  function getExpertStatusColor(status) {
    switch (status) {
      case "available":
        return "text-green-400";
      case "busy":
        return "text-yellow-400";
      case "offline":
        return "text-gray-400";
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
  const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$activeConsultations", activeConsultations));
  const each_array_2 = ensure_array_like(store_get($$store_subs ??= {}, "$recommendationHistory", recommendationHistory));
  const each_array_3 = ensure_array_like(store_get($$store_subs ??= {}, "$expertDomains", expertDomains));
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Matron Advisory - AI Expert Guidance - Claude Code Zen</title>`;
  });
  $$payload.out.push(`<div class="min-h-screen bg-gray-900 text-white"><div class="bg-gray-800 border-b border-gray-700 p-6"><div class="max-w-7xl mx-auto"><h1 class="text-3xl font-bold text-purple-400 mb-2">🧙‍♀️ Matron Advisory</h1> <p class="text-gray-300">AI-powered expert guidance and strategic recommendations</p> <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4"><div class="bg-gray-700 rounded-lg p-3"><div class="text-sm text-gray-400">Total Consultations</div> <div class="text-blue-400 font-semibold">${escape_html(store_get($$store_subs ??= {}, "$matronMetrics", matronMetrics).totalConsultations)}</div></div> <div class="bg-gray-700 rounded-lg p-3"><div class="text-sm text-gray-400">Active Experts</div> <div class="text-green-400 font-semibold">${escape_html(store_get($$store_subs ??= {}, "$matronMetrics", matronMetrics).activeExperts)}</div></div> <div class="bg-gray-700 rounded-lg p-3"><div class="text-sm text-gray-400">Resolution Rate</div> <div class="text-purple-400 font-semibold">${escape_html(store_get($$store_subs ??= {}, "$matronMetrics", matronMetrics).resolutionRate)}%</div></div> <div class="bg-gray-700 rounded-lg p-3"><div class="text-sm text-gray-400">Avg Response Time</div> <div class="text-yellow-400 font-semibold">${escape_html(store_get($$store_subs ??= {}, "$matronMetrics", matronMetrics).averageResponseTime)}</div></div></div></div></div> <div class="max-w-7xl mx-auto p-6 grid grid-cols-1 xl:grid-cols-3 gap-6"><div class="xl:col-span-2 space-y-6"><div class="bg-gray-800 rounded-lg p-6 border border-gray-700"><h2 class="text-xl font-semibold mb-4">💭 Active Consultations</h2> <div class="space-y-4"><!--[-->`);
  for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
    let consultation = each_array[$$index_1];
    $$payload.out.push(`<div${attr_class(`bg-gray-700 rounded-lg p-4 border-l-4 ${stringify(consultation.priority === "critical" ? "border-red-400" : consultation.priority === "high" ? "border-orange-400" : "border-blue-400")}`)}><div class="flex justify-between items-start mb-3"><div><h3 class="font-semibold text-lg">${escape_html(consultation.title)}</h3> <div class="flex items-center gap-4 text-sm text-gray-300"><span${attr_class(getStatusColor(consultation.status))}>● ${escape_html(consultation.status.toUpperCase())}</span> <span${attr_class(`px-2 py-1 rounded text-xs ${stringify(getPriorityColor(consultation.priority))}`)}>${escape_html(consultation.priority.toUpperCase())}</span> <span class="text-purple-400">${escape_html(consultation.domain)}</span> <span>${escape_html(formatTimeAgo(consultation.created))}</span></div></div> <div class="text-right text-sm text-gray-400"><div>ID: ${escape_html(consultation.id)}</div> <div>Expert: ${escape_html(consultation.expert)}</div></div></div> <div class="mb-3"><div class="text-sm text-gray-400 mb-1">Question:</div> <div class="text-gray-300 text-sm bg-gray-800 rounded p-2">${escape_html(consultation.question)}</div></div> <div class="mb-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"><div><div class="text-gray-400">Business Impact:</div> <div${attr_class(consultation.businessImpact === "critical" ? "text-red-400" : consultation.businessImpact === "high" ? "text-orange-400" : "text-yellow-400")}>${escape_html(consultation.businessImpact.toUpperCase())}</div></div> <div><div class="text-gray-400">Complexity:</div> <div${attr_class(getComplexityColor(consultation.complexity))}>${escape_html(consultation.complexity.toUpperCase())}</div></div> <div><div class="text-gray-400">Requested by:</div> <div class="text-blue-400">${escape_html(consultation.requestedBy)}</div></div> <div><div class="text-gray-400">Stakeholders:</div> <div>${escape_html(consultation.stakeholders.join(", "))}</div></div></div> `);
    if (consultation.context) {
      $$payload.out.push("<!--[-->");
      const each_array_1 = ensure_array_like(Object.entries(consultation.context));
      $$payload.out.push(`<div class="mb-3"><div class="text-sm text-gray-400 mb-1">Context:</div> <div class="grid grid-cols-2 gap-2 text-xs"><!--[-->`);
      for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
        let [key, value] = each_array_1[$$index];
        $$payload.out.push(`<div class="text-gray-300"><span class="text-gray-500">${escape_html(key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()))}:</span> ${escape_html(value)}</div>`);
      }
      $$payload.out.push(`<!--]--></div></div>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--> <div class="flex gap-2"><a${attr("href", `/matron/consultation/${stringify(consultation.id)}`)} class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors">👁️ View Details</a> <button class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition-colors">💬 Add Input</button> <button class="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm transition-colors">📋 View Recommendations</button></div></div>`);
  }
  $$payload.out.push(`<!--]--> `);
  if (store_get($$store_subs ??= {}, "$activeConsultations", activeConsultations).length === 0) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="text-center py-8 text-gray-500"><p>No active consultations</p></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div></div> <div class="bg-gray-800 rounded-lg p-6 border border-gray-700"><h2 class="text-xl font-semibold mb-4">💡 Recent Recommendations</h2> <div class="space-y-4"><!--[-->`);
  for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
    let recommendation = each_array_2[$$index_2];
    $$payload.out.push(`<div class="bg-gray-700 rounded-lg p-4"><div class="flex justify-between items-start mb-3"><div><h3 class="font-semibold">${escape_html(recommendation.title)}</h3> <div class="text-sm text-gray-300">by ${escape_html(recommendation.expert)}</div></div> <div class="text-right text-sm"><div${attr_class(`px-2 py-1 rounded text-xs ${stringify(recommendation.status === "approved" ? "bg-green-600" : "bg-yellow-600")}`)}>${escape_html(recommendation.status.replace("-", " ").toUpperCase())}</div> <div class="text-gray-400 mt-1">${escape_html(formatTimeAgo(recommendation.created))}</div></div></div> <p class="text-gray-300 text-sm mb-3">${escape_html(recommendation.summary)}</p> <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3"><div><div class="text-gray-400">Confidence</div> <div class="text-blue-400">${escape_html(Math.round(recommendation.confidence * 100))}%</div></div> <div><div class="text-gray-400">Complexity</div> <div${attr_class(getComplexityColor(recommendation.implementationComplexity))}>${escape_html(recommendation.implementationComplexity.toUpperCase())}</div></div> <div><div class="text-gray-400">Timeframe</div> <div class="text-purple-400">${escape_html(recommendation.estimatedTimeframe)}</div></div> <div><div class="text-gray-400">Risk Level</div> <div${attr_class(recommendation.riskLevel === "high" ? "text-red-400" : recommendation.riskLevel === "medium" ? "text-yellow-400" : "text-green-400")}>${escape_html(recommendation.riskLevel.toUpperCase())}</div></div></div> <div class="flex gap-2"><a${attr("href", `/matron/recommendation/${stringify(recommendation.id)}`)} class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors">📄 Full Report</a> <button class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition-colors">✅ Approve</button> <button class="bg-orange-600 hover:bg-orange-700 px-3 py-1 rounded text-sm transition-colors">📝 Request Changes</button></div></div>`);
  }
  $$payload.out.push(`<!--]--> `);
  if (store_get($$store_subs ??= {}, "$recommendationHistory", recommendationHistory).length === 0) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="text-center py-8 text-gray-500"><p>No recent recommendations</p></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div></div></div> <div class="space-y-6"><div class="bg-gray-800 rounded-lg p-6 border border-gray-700"><h3 class="text-lg font-semibold mb-4">👨‍💼 Available Experts</h3> <div class="space-y-3"><!--[-->`);
  for (let $$index_4 = 0, $$length = each_array_3.length; $$index_4 < $$length; $$index_4++) {
    let expert = each_array_3[$$index_4];
    const each_array_4 = ensure_array_like(expert.specialties.slice(0, 3));
    $$payload.out.push(`<div class="bg-gray-700 rounded-lg p-3"><div class="flex justify-between items-start mb-2"><div><div class="font-medium">${escape_html(expert.name)}</div> <div class="text-sm text-gray-400">${escape_html(expert.domain.replace("-", " ").toUpperCase())}</div></div> <div class="text-right text-sm"><div${attr_class(getExpertStatusColor(expert.status))}>● ${escape_html(expert.status.toUpperCase())}</div> <div class="text-gray-400">⭐ ${escape_html(expert.rating)}</div></div></div> <div class="text-xs text-gray-300 mb-2"><div class="text-gray-400">Specialties:</div> <div class="flex flex-wrap gap-1"><!--[-->`);
    for (let $$index_3 = 0, $$length2 = each_array_4.length; $$index_3 < $$length2; $$index_3++) {
      let specialty = each_array_4[$$index_3];
      $$payload.out.push(`<span class="bg-blue-600 text-blue-100 px-1 py-0.5 rounded">${escape_html(specialty)}</span>`);
    }
    $$payload.out.push(`<!--]--> `);
    if (expert.specialties.length > 3) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<span class="text-gray-400">+${escape_html(expert.specialties.length - 3)}</span>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--></div></div> <div class="flex justify-between text-xs text-gray-400 mb-2"><span>${escape_html(expert.consultations)} consultations</span> <span>Last: ${escape_html(formatTimeAgo(expert.lastActive))}</span></div> <button class="w-full bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded text-sm transition-colors"${attr("disabled", expert.status === "offline", true)}>💬 Request Consultation</button></div>`);
  }
  $$payload.out.push(`<!--]--></div></div> <div class="bg-gray-800 rounded-lg p-6 border border-gray-700"><h3 class="text-lg font-semibold mb-4">⚡ Quick Actions</h3> <div class="space-y-2"><a href="/matron/request" class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors block">💭 New Consultation</a> <a href="/matron/history" class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors block">📚 Consultation History</a> <a href="/matron/experts" class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors block">👨‍💼 Expert Directory</a> <a href="/matron/analytics" class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors block">📊 Advisory Analytics</a> <a href="/matron/knowledge-base" class="w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors block">📖 Knowledge Base</a></div></div> <div class="bg-gray-800 rounded-lg p-6 border border-gray-700"><h3 class="text-lg font-semibold mb-4">📈 Advisory Statistics</h3> <div class="space-y-3"><div><div class="flex justify-between mb-1"><span class="text-gray-400">Resolution Rate</span> <span class="text-green-400">${escape_html(store_get($$store_subs ??= {}, "$matronMetrics", matronMetrics).resolutionRate)}%</span></div> <div class="w-full bg-gray-700 rounded-full h-2"><div class="bg-green-400 h-2 rounded-full"${attr_style(`width: ${stringify(store_get($$store_subs ??= {}, "$matronMetrics", matronMetrics).resolutionRate)}%`)}></div></div></div> <div class="flex justify-between"><span class="text-gray-400">Active Consultations</span> <span class="text-blue-400">${escape_html(store_get($$store_subs ??= {}, "$activeConsultations", activeConsultations).length)}</span></div> <div class="flex justify-between"><span class="text-gray-400">Experts Online</span> <span class="text-green-400">${escape_html(store_get($$store_subs ??= {}, "$expertDomains", expertDomains).filter((e) => e.status === "available").length)}</span></div> <div class="flex justify-between"><span class="text-gray-400">Avg Response</span> <span class="text-purple-400">${escape_html(store_get($$store_subs ??= {}, "$matronMetrics", matronMetrics).averageResponseTime)}</span></div></div></div> <div class="bg-gray-800 rounded-lg p-6 border border-gray-700"><h3 class="text-lg font-semibold mb-4">🕐 Recent Activity</h3> <div class="space-y-3 text-sm"><div class="border-l-2 border-green-400 pl-3"><div class="text-green-400">Consultation completed</div> <div class="text-gray-400">Performance optimization - 2h ago</div></div> <div class="border-l-2 border-blue-400 pl-3"><div class="text-blue-400">New expert available</div> <div class="text-gray-400">AI DevOps Consultant online - 1h ago</div></div> <div class="border-l-2 border-yellow-400 pl-3"><div class="text-yellow-400">Recommendation pending</div> <div class="text-gray-400">Architecture decision review - 30m ago</div></div> <div class="border-l-2 border-purple-400 pl-3"><div class="text-purple-400">Knowledge updated</div> <div class="text-gray-400">Security best practices - 15m ago</div></div></div></div></div></div></div>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
