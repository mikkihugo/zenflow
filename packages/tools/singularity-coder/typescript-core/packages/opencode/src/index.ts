import "zod-openapi/extend"
import yargs from "yargs"
import { hideBin} from "yargs/helpers"
import { AuthCommand} from "./cli/cmd/auth"
import { DebugCommand} from "./cli/cmd/debug"
import { GenerateCommand} from "./cli/cmd/generate"
import { McpCommand} from "./cli/cmd/mcp"
import { ModelsCommand} from "./cli/cmd/models"
import { RunCommand} from "./cli/cmd/run"
import { ServeCommand} from "./cli/cmd/serve"
import { StatsCommand} from "./cli/cmd/stats"
import { TuiCommand} from "./cli/cmd/tui"
import { UpgradeCommand} from "./cli/cmd/upgrade"
import { FormatError} from "./cli/error"
import { UI} from "./cli/ui"
import { Installation} from "./installation"
import { NamedError} from "./util/error"
import { Log} from "./util/log"

const cancel = new AbortController()

process.on("unhandledRejection", (e) => {
  Log.Default.error("rejection", {
    e:e instanceof Error ? e.message : e,
})
})

process.on("uncaughtException", (e) => {
  Log.Default.error("exception", {
    e:e instanceof Error ? e.message : e,
})
})

const cli = yargs(hideBin(process.argv))
  .scriptName("opencode")
  .help("help", "show help")
  .version("version", "show version number", Installation.VERSION)
  .alias("version", "v")
  .option("print-logs", {
    describe:"print logs to stderr",
    type:"boolean",
})
  .middleware(async () => {
    await Log.init({ print:process.argv.includes("--print-logs")})

    try {
      const { Config} = await import("./config/config")
      const { App} = await import("./app/app")

      App.provide({ cwd:process.cwd()}, async () => {
        const cfg = await Config.get()
        if (cfg.log_level) {
          Log.setLevel(cfg.log_level as Log.Level)
} else {
          const defaultLevel = Installation.isDev() ? "DEBUG" :"INFO"
          Log.setLevel(defaultLevel)
}
})
} catch (error) {
      Log.Default.error("failed to load config", { error})
}

    Log.Default.info("opencode", {
      version:Installation.VERSION,
      args:process.argv.slice(2),
})
})
  .usage(`\n${UI.logo()}`)`
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
} catch (error) {
  const data:Record<string, any> = {}
  if (error instanceof NamedError) {
    const obj = error.toObject()
    Object.assign(data, {
      ...obj.data,
})
}

  if (error instanceof Error) {
    Object.assign(data, {
      name:error.name,
      message:error.message,
      cause:error.cause?.toString(),
})
}

  if (error instanceof ResolveMessage) {
    Object.assign(data, {
      name:error.name,
      message:error.message,
      code:error.code,
      specifier:error.specifier,
      referrer:error.referrer,
      position:error.position,
      importKind:error.importKind,
})
}
  Log.Default.error("fatal", data)
  const formatted = FormatError(error)
  if (formatted) UI.error(formatted)
  if (formatted === undefined) UI.error(`Unexpected error, check log file at ${Log.file()} for more details`)`
  process.exitCode = 1
}

cancel.abort()
