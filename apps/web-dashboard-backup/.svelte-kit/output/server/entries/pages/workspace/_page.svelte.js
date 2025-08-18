import { R as head, J as attr_class, I as escape_html, G as ensure_array_like, B as pop, z as push } from "../../../chunks/index2.js";
function _page($$payload, $$props) {
  push();
  let files = [];
  let selectedFile = null;
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Workspace - Claude Code Zen</title>`;
  });
  $$payload.out.push(`<div class="workspace svelte-15pq2td"><div class="workspace-header svelte-15pq2td"><h1 class="svelte-15pq2td">🗂️ Workspace</h1> <div class="workspace-actions svelte-15pq2td"><button class="btn primary"><span>🎯</span> Command Palette <kbd class="svelte-15pq2td">Ctrl+Shift+P</kbd></button></div></div> <div class="workspace-layout svelte-15pq2td"><div${attr_class("file-explorer svelte-15pq2td", void 0, { "collapsed": false })}><div class="explorer-header svelte-15pq2td"><button class="collapse-btn svelte-15pq2td">${escape_html("📁")}</button> <h3 class="svelte-15pq2td">Files</h3> <button class="btn-icon svelte-15pq2td" title="Refresh">🔄</button></div> `);
  {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="explorer-content svelte-15pq2td">`);
    {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--> `);
    {
      $$payload.out.push("<!--[!-->");
      {
        $$payload.out.push("<!--[!-->");
        if (files.length === 0) {
          $$payload.out.push("<!--[-->");
          $$payload.out.push(`<div class="empty svelte-15pq2td">📄 No files found</div>`);
        } else {
          $$payload.out.push("<!--[!-->");
          const each_array = ensure_array_like(files);
          $$payload.out.push(`<div class="files-list svelte-15pq2td"><!--[-->`);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let file = each_array[$$index];
            $$payload.out.push(`<button${attr_class("file-item svelte-15pq2td", void 0, { "selected": selectedFile?.path === file.path })}><span class="file-icon">${escape_html(file.type === "directory" ? "📁" : "📄")}</span> <span class="file-name svelte-15pq2td">${escape_html(file.name)}</span> `);
            if (file.type === "file" && file.size) {
              $$payload.out.push("<!--[-->");
              $$payload.out.push(`<span class="file-size svelte-15pq2td">${escape_html(Math.round(file.size / 1024))}KB</span>`);
            } else {
              $$payload.out.push("<!--[!-->");
            }
            $$payload.out.push(`<!--]--></button>`);
          }
          $$payload.out.push(`<!--]--></div>`);
        }
        $$payload.out.push(`<!--]-->`);
      }
      $$payload.out.push(`<!--]-->`);
    }
    $$payload.out.push(`<!--]--></div>`);
  }
  $$payload.out.push(`<!--]--></div> <div class="main-content svelte-15pq2td">`);
  {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<div class="welcome svelte-15pq2td"><h2 class="svelte-15pq2td">🎯 Welcome to Workspace</h2> <p class="svelte-15pq2td">Select a file from the explorer to view its content, or use the command palette to perform actions.</p> <div class="quick-actions svelte-15pq2td"><button class="btn primary">🎯 Open Command Palette</button> <button class="btn">🔄 Refresh Files</button></div></div>`);
  }
  $$payload.out.push(`<!--]--></div></div></div> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]-->`);
  pop();
}
export {
  _page as default
};
//# sourceMappingURL=_page.svelte.js.map
