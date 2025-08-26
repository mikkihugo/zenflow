import "zod-openapi/extend"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { AuthCommand } from "./cli/cmd/auth"
import { DebugCommand } from "./cli/cmd/debug"
import { GenerateCommand } from "./cli/cmd/generate"
import { McpCommand } from "./cli/cmd/mcp"
import { ModelsCommand } from "./cli/cmd/models"
import { RunCommand } from "./cli/cmd/run"
import { ServeCommand } from "./cli/cmd/serve"
import { StatsCommand } from "./cli/cmd/stats"
import { TuiCommand } from "./cli/cmd/tui"
import { UpgradeCommand } from "./cli/cmd/upgrade"
import { FormatError } from "./cli/error"
import { UI } from "./cli/ui"
import { Installation } from "./installation"
import { NamedError } from "./util/error"
import { Log } from "./util/log"

const cancel = new AbortController()

process.on("unhandledRejection", (e) => {
  Log.Default.error("rejection", {
    e: e instanceof Error ? e.message : e,
  })
})

process.on("uncaughtException", (e) => {
  Log.Default.error("exception", {
    e: e instanceof Error ? e.message : e,
  })
})

const cli = yargs(hideBin(process.argv))
  .scriptName("opencode")
  .help("help", "show help")
  .version("version", "show version number", Installation.VERSION)
  .alias("version", "v")
  .option("print-logs", {
    describe: "print logs to stderr",
    type: "boolean",
  })
  .middleware(async () => {
    await Log.init({ print: process.argv.includes("--print-logs") })

    try {
      const { Config } = await import("./config/config")
      const { App } = await import("./app/app")

      App.provide({ cwd: process.cwd() }, async () => {
        const cfg = await Config.get()
        if (cfg.log_level) {
          Log.setLevel(cfg.log_level as Log.Level)
        } else {
          const defaultLevel = Installation.isDev() ? "DEBUG" : "INFO"
          Log.setLevel(defaultLevel)
        }
      })
    } catch (e) {
      Log.Default.error("failed to load config", { error: e })
    }

    Log.Default.info("opencode", {
      version: Installation.VERSION,
      args: process.argv.slice(2),
    })
  })
  .usage(`\n${UI.logo()}`)
  .command(McpCommand)
  .command(TuiCommand)
  .command(RunCommand)
  .command(GenerateCommand)
  .command(DebugCommand)
  .command(AuthCommand)
  .command(UpgradeCommand)
  .command(ServeCommand)
  .command(ModelsCommand)
  .command(StatsCommand)
  .fail((msg) => {
    if (msg.startsWith("Unknown argument") || msg.startsWith("Not enough non-option arguments")) {
      cli.showHelp("log")
    }
  })
  .strict()

try {
  await cli.parse()
} catch (e) {
  const data: Record<string, any> = {}
  if (e instanceof NamedError) {
    const obj = e.toObject()
    Object.assign(data, {
      ...obj.data,
    })
  }

  if (e instanceof Error) {
    Object.assign(data, {
      name: e.name,
      message: e.message,
      cause: e.cause?.toString(),
    })
  }

  if (e instanceof ResolveMessage) {
    Object.assign(data, {
      name: e.name,
      message: e.message,
      code: e.code,
      specifier: e.specifier,
      referrer: e.referrer,
      position: e.position,
      importKind: e.importKind,
    })
  }
  Log.Default.error("fatal", data)
  const formatted = FormatError(e)
  if (formatted) UI.error(formatted)
  if (formatted === undefined) UI.error(`Unexpected error, check log file at ${Log.file()} for more details`)
  process.exitCode = 1
}

cancel.abort()
