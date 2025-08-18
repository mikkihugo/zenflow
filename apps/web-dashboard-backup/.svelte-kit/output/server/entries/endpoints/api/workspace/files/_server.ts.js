import { json } from "@sveltejs/kit";
import { readdir, stat } from "fs/promises";
import { join, resolve } from "path";
const GET = async ({ url }) => {
  try {
    const searchParams = url.searchParams;
    const path = searchParams.get("path") || "";
    const baseDir = process.cwd();
    const targetPath = path ? join(baseDir, path) : baseDir;
    const resolvedPath = resolve(targetPath);
    if (!resolvedPath.startsWith(resolve(baseDir))) {
      return json({ error: "Access denied" }, { status: 403 });
    }
    try {
      const items = await readdir(resolvedPath);
      const files = [];
      for (const item of items) {
        if (item.startsWith(".") || item === "node_modules") {
          continue;
        }
        try {
          const itemPath = join(resolvedPath, item);
          const stats = await stat(itemPath);
          files.push({
            name: item,
            path: path ? `${path}/${item}` : item,
            type: stats.isDirectory() ? "directory" : "file",
            size: stats.isFile() ? stats.size : void 0,
            modified: stats.mtime.toISOString()
          });
        } catch (itemError) {
          console.warn(`Skipping item ${item}:`, itemError);
        }
      }
      files.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === "directory" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
      return json({
        files,
        currentPath: path,
        parentPath: path ? path.split("/").slice(0, -1).join("/") : null
      });
    } catch (fsError) {
      console.error("File system error:", fsError);
      return json({ error: "Directory not found or access denied" }, { status: 404 });
    }
  } catch (error) {
    console.error("Workspace files API error:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};
export {
  GET
};
//# sourceMappingURL=_server.ts.js.map
