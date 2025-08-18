import { D as bind_props, B as pop, z as push, E as fallback, F as attr, G as ensure_array_like, I as escape_html, J as attr_class, K as copy_payload, M as assign_payload, N as unsubscribe_stores, O as store_get, P as slot } from "../../chunks/index2.js";
import { p as page } from "../../chunks/stores.js";
import { w as writable } from "../../chunks/index.js";
const initialState = {
  connected: false,
  socket: null,
  error: null
};
function createWebSocketStore() {
  const { subscribe, set, update } = writable(initialState);
  function connect(url) {
    return;
  }
  function disconnect() {
    update((state) => {
      if (state.socket) {
        state.socket.close();
      }
      return {
        ...state,
        connected: false,
        socket: null
      };
    });
  }
  function send(data) {
    update((state) => {
      if (state.socket && state.connected) {
        state.socket.send(JSON.stringify(data));
      }
      return state;
    });
  }
  return {
    subscribe,
    connect,
    disconnect,
    send
  };
}
createWebSocketStore();
function CommandPalette($$payload, $$props) {
  push();
  let filteredCommands, groupedCommands;
  let isOpen = fallback($$props["isOpen"], false);
  let searchQuery = "";
  let selectedIndex = 0;
  let commandInput;
  const commands = [
    {
      id: "file.new",
      title: "New File",
      description: "Create a new file",
      category: "File",
      icon: "📄",
      shortcut: "Ctrl+N"
    },
    {
      id: "file.open",
      title: "Open File",
      description: "Open an existing file",
      category: "File",
      icon: "📂",
      shortcut: "Ctrl+O"
    },
    {
      id: "file.save",
      title: "Save File",
      description: "Save current file",
      category: "File",
      icon: "💾",
      shortcut: "Ctrl+S"
    },
    {
      id: "file.saveAll",
      title: "Save All",
      description: "Save all open files",
      category: "File",
      icon: "💾",
      shortcut: "Ctrl+Shift+S"
    },
    {
      id: "project.build",
      title: "Build Project",
      description: "Build the entire project",
      category: "Project",
      icon: "🔨",
      shortcut: "Ctrl+Shift+B"
    },
    {
      id: "project.test",
      title: "Run Tests",
      description: "Execute test suite",
      category: "Project",
      icon: "🧪",
      shortcut: "Ctrl+Shift+T"
    },
    {
      id: "project.lint",
      title: "Lint Code",
      description: "Run code linting",
      category: "Project",
      icon: "🔍",
      shortcut: "Ctrl+Shift+L"
    },
    {
      id: "project.format",
      title: "Format Code",
      description: "Format all code files",
      category: "Project",
      icon: "✨",
      shortcut: "Ctrl+Shift+F"
    },
    {
      id: "swarm.init",
      title: "Initialize Swarm",
      description: "Create a new AI swarm",
      category: "Swarm",
      icon: "🐝",
      shortcut: "Ctrl+Shift+I"
    },
    {
      id: "swarm.spawn",
      title: "Spawn Agent",
      description: "Add a new agent to swarm",
      category: "Swarm",
      icon: "🤖",
      shortcut: "Ctrl+Shift+A"
    },
    {
      id: "swarm.status",
      title: "Swarm Status",
      description: "View swarm coordination status",
      category: "Swarm",
      icon: "📊",
      shortcut: "Ctrl+Shift+M"
    },
    {
      id: "swarm.monitor",
      title: "Monitor Swarm",
      description: "Real-time swarm monitoring",
      category: "Swarm",
      icon: "👀",
      shortcut: "Ctrl+Shift+W"
    },
    {
      id: "dev.server",
      title: "Start Dev Server",
      description: "Start development server",
      category: "Dev",
      icon: "🚀",
      shortcut: "F5"
    },
    {
      id: "dev.stop",
      title: "Stop Dev Server",
      description: "Stop development server",
      category: "Dev",
      icon: "🛑",
      shortcut: "Shift+F5"
    },
    {
      id: "dev.restart",
      title: "Restart Server",
      description: "Restart development server",
      category: "Dev",
      icon: "🔄",
      shortcut: "Ctrl+F5"
    },
    {
      id: "dev.logs",
      title: "View Logs",
      description: "Open development logs",
      category: "Dev",
      icon: "📝",
      shortcut: "Ctrl+Shift+U"
    },
    {
      id: "nav.explorer",
      title: "File Explorer",
      description: "Open file explorer",
      category: "Navigation",
      icon: "🗂️",
      shortcut: "Ctrl+Shift+E"
    },
    {
      id: "nav.terminal",
      title: "Terminal",
      description: "Open integrated terminal",
      category: "Navigation",
      icon: "💻",
      shortcut: "Ctrl+`"
    },
    {
      id: "nav.search",
      title: "Search Files",
      description: "Search across project files",
      category: "Navigation",
      icon: "🔍",
      shortcut: "Ctrl+Shift+F"
    },
    {
      id: "nav.go-to-file",
      title: "Go to File",
      description: "Quick file navigation",
      category: "Navigation",
      icon: "📄",
      shortcut: "Ctrl+P"
    },
    {
      id: "settings.preferences",
      title: "Preferences",
      description: "Open user preferences",
      category: "Settings",
      icon: "⚙️",
      shortcut: "Ctrl+,"
    },
    {
      id: "settings.workspace",
      title: "Workspace Settings",
      description: "Configure workspace",
      category: "Settings",
      icon: "🏗️",
      shortcut: "Ctrl+Shift+,"
    },
    {
      id: "settings.theme",
      title: "Change Theme",
      description: "Switch color theme",
      category: "Settings",
      icon: "🎨",
      shortcut: "Ctrl+K Ctrl+T"
    },
    {
      id: "advanced.neural",
      title: "Neural Training",
      description: "Start neural pattern training",
      category: "Advanced",
      icon: "🧠",
      shortcut: "Ctrl+Shift+N"
    },
    {
      id: "advanced.benchmark",
      title: "Run Benchmarks",
      description: "Performance benchmarking",
      category: "Advanced",
      icon: "⚡",
      shortcut: "Ctrl+Shift+B"
    },
    {
      id: "advanced.export",
      title: "Export Project",
      description: "Export project data",
      category: "Advanced",
      icon: "📦",
      shortcut: "Ctrl+Shift+E"
    }
  ];
  filteredCommands = commands;
  groupedCommands = filteredCommands.reduce(
    (groups, cmd) => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
      return groups;
    },
    {}
  );
  if (isOpen && commandInput) {
    commandInput.focus();
  }
  if (
    // Global keyboard listener
    // Ctrl+Shift+P to open command palette
    isOpen
  ) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="command-palette-backdrop svelte-184awb3"><div class="command-palette svelte-184awb3"><div class="search-container svelte-184awb3"><div class="search-icon svelte-184awb3">🔍</div> <input${attr("value", searchQuery)} placeholder="Type a command or search..." class="search-input svelte-184awb3" autocomplete="off" spellcheck="false"/> <div class="search-shortcut svelte-184awb3">Ctrl+Shift+P</div></div> <div class="commands-container svelte-184awb3">`);
    if (filteredCommands.length === 0) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="no-results svelte-184awb3"><div class="no-results-icon svelte-184awb3">🔍</div> <div class="no-results-text svelte-184awb3">No commands found</div> <div class="no-results-hint svelte-184awb3">Try searching for something else</div></div>`);
    } else {
      $$payload.out.push("<!--[!-->");
      const each_array = ensure_array_like(Object.entries(groupedCommands));
      $$payload.out.push(`<!--[-->`);
      for (let categoryIndex = 0, $$length = each_array.length; categoryIndex < $$length; categoryIndex++) {
        let [category, categoryCommands] = each_array[categoryIndex];
        const each_array_1 = ensure_array_like(categoryCommands);
        $$payload.out.push(`<div class="command-category svelte-184awb3"><div class="category-header svelte-184awb3">${escape_html(category)}</div> <!--[-->`);
        for (let commandIndex = 0, $$length2 = each_array_1.length; commandIndex < $$length2; commandIndex++) {
          let command = each_array_1[commandIndex];
          const globalIndex = filteredCommands.indexOf(command);
          $$payload.out.push(`<div${attr_class("command-item svelte-184awb3", void 0, { "selected": globalIndex === selectedIndex })}><div class="command-main svelte-184awb3"><div class="command-icon svelte-184awb3">${escape_html(command.icon)}</div> <div class="command-info svelte-184awb3"><div class="command-title svelte-184awb3">${escape_html(command.title)}</div> <div class="command-description svelte-184awb3">${escape_html(command.description)}</div></div></div> <div class="command-shortcut svelte-184awb3">${escape_html(command.shortcut)}</div></div>`);
        }
        $$payload.out.push(`<!--]--></div>`);
      }
      $$payload.out.push(`<!--]-->`);
    }
    $$payload.out.push(`<!--]--></div> <div class="command-footer svelte-184awb3"><div class="footer-shortcuts svelte-184awb3"><span><kbd class="svelte-184awb3">↑↓</kbd> Navigate</span> <span><kbd class="svelte-184awb3">Enter</kbd> Execute</span> <span><kbd class="svelte-184awb3">Tab</kbd> Complete</span> <span><kbd class="svelte-184awb3">Esc</kbd> Close</span></div> <div class="footer-info svelte-184awb3">${escape_html(filteredCommands.length)} commands available</div></div></div></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]-->`);
  bind_props($$props, { isOpen });
  pop();
}
function _layout($$payload, $$props) {
  push();
  var $$store_subs;
  let commandPaletteOpen = false;
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out.push(`<div class="app svelte-pvqcup"><header class="header svelte-pvqcup"><div class="header-content svelte-pvqcup"><h1 class="svelte-pvqcup">🧠 claude-code-zen</h1> <p class="svelte-pvqcup">AI-Powered Development Toolkit</p> <div class="status-indicator svelte-pvqcup"><span class="status-dot active svelte-pvqcup"></span> Real-time Dashboard</div></div></header> <nav class="nav svelte-pvqcup"><a href="/"${attr_class("svelte-pvqcup", void 0, {
      "active": store_get($$store_subs ??= {}, "$page", page).url.pathname === "/"
    })}><span class="icon svelte-pvqcup">🏠</span> Dashboard</a> <a href="/workspace"${attr_class("svelte-pvqcup", void 0, {
      "active": store_get($$store_subs ??= {}, "$page", page).url.pathname === "/workspace"
    })}><span class="icon svelte-pvqcup">🗂️</span> Workspace</a> <a href="/status"${attr_class("svelte-pvqcup", void 0, {
      "active": store_get($$store_subs ??= {}, "$page", page).url.pathname === "/status"
    })}><span class="icon svelte-pvqcup">⚡</span> System Status</a> <a href="/swarm"${attr_class("svelte-pvqcup", void 0, {
      "active": store_get($$store_subs ??= {}, "$page", page).url.pathname === "/swarm"
    })}><span class="icon svelte-pvqcup">🐝</span> Swarm Management</a> <a href="/performance"${attr_class("svelte-pvqcup", void 0, {
      "active": store_get($$store_subs ??= {}, "$page", page).url.pathname === "/performance"
    })}><span class="icon svelte-pvqcup">📊</span> Performance</a> <a href="/logs"${attr_class("svelte-pvqcup", void 0, {
      "active": store_get($$store_subs ??= {}, "$page", page).url.pathname === "/logs"
    })}><span class="icon svelte-pvqcup">📝</span> Live Logs</a> <a href="/dev-communication"${attr_class("svelte-pvqcup", void 0, {
      "active": store_get($$store_subs ??= {}, "$page", page).url.pathname === "/dev-communication"
    })}><span class="icon svelte-pvqcup">💬</span> Dev Communication</a> <a href="/agu"${attr_class("svelte-pvqcup", void 0, {
      "active": store_get($$store_subs ??= {}, "$page", page).url.pathname === "/agu" || store_get($$store_subs ??= {}, "$page", page).url.pathname.startsWith("/agu/")
    })}><span class="icon svelte-pvqcup">🛡️</span> AGU</a> <a href="/matron"${attr_class("svelte-pvqcup", void 0, {
      "active": store_get($$store_subs ??= {}, "$page", page).url.pathname === "/matron" || store_get($$store_subs ??= {}, "$page", page).url.pathname.startsWith("/matron/")
    })}><span class="icon svelte-pvqcup">🧙‍♀️</span> Matron Advisory</a> <a href="/roadmap"${attr_class("svelte-pvqcup", void 0, {
      "active": store_get($$store_subs ??= {}, "$page", page).url.pathname === "/roadmap" || store_get($$store_subs ??= {}, "$page", page).url.pathname.startsWith("/roadmap/")
    })}><span class="icon svelte-pvqcup">🗺️</span> Visionary Roadmap</a> <a href="/settings"${attr_class("svelte-pvqcup", void 0, {
      "active": store_get($$store_subs ??= {}, "$page", page).url.pathname === "/settings"
    })}><span class="icon svelte-pvqcup">⚙️</span> Settings</a></nav> <main class="main svelte-pvqcup"><!---->`);
    slot($$payload2, $$props, "default", {});
    $$payload2.out.push(`<!----></main> <footer class="footer svelte-pvqcup"><p class="svelte-pvqcup">claude-code-zen v2.0.0 | Svelte Dashboard | Press <kbd class="svelte-pvqcup">Ctrl+Shift+P</kbd> for Command Palette</p></footer></div> `);
    CommandPalette($$payload2, {
      get isOpen() {
        return commandPaletteOpen;
      },
      set isOpen($$value) {
        commandPaletteOpen = $$value;
        $$settled = false;
      }
    });
    $$payload2.out.push(`<!---->`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
export {
  _layout as default
};
//# sourceMappingURL=_layout.svelte.js.map
