import { json } from "@sveltejs/kit";
import { stat, readFile } from "fs/promises";
import { join, resolve } from "path";
const GET = async ({ url }) => {
  try {
    const searchParams = url.searchParams;
    const path = searchParams.get("path");
    if (!path) {
      return json({ error: "Path parameter is required" }, { status: 400 });
    }
    const baseDir = process.cwd();
    const targetPath = join(baseDir, path);
    const resolvedPath = resolve(targetPath);
    if (!resolvedPath.startsWith(resolve(baseDir))) {
      return json({ error: "Access denied" }, { status: 403 });
    }
    try {
      const stats = await stat(resolvedPath);
      if (stats.isDirectory()) {
        return json({ error: "Path is a directory, not a file" }, { status: 400 });
      }
      const maxSize = 1024 * 1024;
      if (stats.size > maxSize) {
        return json({
          error: "File too large to display",
          size: stats.size,
          maxSize
        }, { status: 413 });
      }
      const content = await readFile(resolvedPath, "utf8");
      return json({
        content,
        size: stats.size,
        modified: stats.mtime.toISOString(),
        path,
        encoding: "utf8"
      });
    } catch (fsError) {
      console.error("File read error:", fsError);
      if (fsError.code === "ENOENT") {
        return json({ error: "File not found" }, { status: 404 });
      } else if (fsError.code === "EACCES") {
        return json({ error: "Permission denied" }, { status: 403 });
      } else if (fsError.code === "EISDIR") {
        return json({ error: "Path is a directory" }, { status: 400 });
      } else {
        return json({ error: "Failed to read file" }, { status: 500 });
      }
    }
  } catch (error) {
    console.error("Workspace file content API error:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};
export {
  GET
};
//# sourceMappingURL=_server.ts.js.map
