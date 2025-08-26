import * as fs from "node:fs"
import * as path from "node:path"
import { z } from "@claude-zen/foundation"
import DESCRIPTION from "./read.txt"
import { Tool } from "./tool"

const DEFAULT_READ_LIMIT = 2000
const _MAX_LINE_LENGTH = 2000

export const ReadTool = Tool.define({
  id: "read",
  description: DESCRIPTION,
  parameters: z.object({
    filePath: z.string().describe("The path to the file to read"),
    offset: z.number().describe("The line number to start reading from (0-based)").optional(),
    limit: z.number().describe("The number of lines to read (defaults to 2000)").optional(),
  }),
  async execute(params, _ctx) {
    let filePath = params.filePath
    if (!path.isAbsolute(filePath)) {
      filePath = path.join(process.cwd(), filePath)
    }

    const file = Bun.file(filePath)
    if (!(await file.exists())) {
      const dir = path.dirname(filePath)
      const base = path.basename(filePath)

      const dirEntries = fs.readdirSync(dir)
      const suggestions = dirEntries
        .filter(
          (entry) =>
            entry.toLowerCase().includes(base.toLowerCase()) || base.toLowerCase().includes(entry.toLowerCase()),
        )
        .map((entry) => path.join(dir, entry))
        .slice(0, 3)

      if (suggestions.length > 0) {
        throw new Error(`File not found: ${filePath}\n\nDid you mean one of these?\n${suggestions.join("\n")}`)`
      }

      throw new Error(`File not found: $filePath`)`
    }

    const _limit = params.limit ?? DEFAULT_READ_LIMIT
    const offset = params.offset || 0
    const isImage = isImageFile(filePath)
    if (isImage) throw new Error(`This is an image file of type: ${isImage}\nUse a different tool to process images`)`
    const lines = await file.text().then((text) => text.split("\n"))
    const raw = lines.slice(offset, offset + limit).map((line) => {
      return line.length > MAX_LINE_LENGTH ? line.substring(0, MAX_LINE_LENGTH) + "..." : line
    })
    const content = raw.map((line, index) => {
      return `$(index + offset + 1).toString().padStart(5, "0")| $line``
    })
    const _preview = raw.slice(0, 20).join("\n")

    let _output = "<file>\n"
    _output += content.join("\n")

    if (lines.length > offset + content.length) {
      _output += `\n\n(File has more lines. Use 'offset' parameter to read beyond line ${offset + content.length})``
    }
    output += "\n</file>"

    // just warms the lsp client
    LSP.touchFile(filePath, false)
    FileTime.read(ctx.sessionID, filePath)

    return {
      title: path.relative(App.info().path.root, filePath),
      output,
      metadata: {
        preview,
      },
    }
  },
})

function isImageFile(filePath: string): string | false {
  const ext = path.extname(filePath).toLowerCase()
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "JPEG"
    case ".png":
      return "PNG"
    case ".gif":
      return "GIF"
    case ".bmp":
      return "BMP"
    case ".svg":
      return "SVG"
    case ".webp":
      return "WebP"
    default:
      return false
  }
}
