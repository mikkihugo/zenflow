import { LSP} from "../../../lsp"
import { Log} from "../../../util/log"
import { bootstrap} from "../../bootstrap"
import { cmd} from "../cmd"

export const LSPCommand = cmd({
  command:"lsp",
  builder:(yargs) =>
    yargs.command(DiagnosticsCommand).command(SymbolsCommand).command(DocumentSymbolsCommand).demandCommand(),
  async handler() {},
})

const DiagnosticsCommand = cmd({
  command:"diagnostics <file>",
  builder:(yargs) => yargs.positional("file", { type:"string", demandOption:true}),
  async handler(args) {
    await bootstrap({ cwd:process.cwd()}, async () => {
      await LSP.touchFile(args.file, true)
      logger.info(await LSP.diagnostics())
})
},
})

export const SymbolsCommand = cmd({
  command:"symbols <query>",
  builder:(yargs) => yargs.positional("query", { type:"string", demandOption:true}),
  async handler(args) {
    await bootstrap({ cwd:process.cwd()}, async () => {
      using _ = Log.Default.time("symbols")
      const results = await LSP.workspaceSymbol(args.query)
      logger.info(JSON.stringify(results, null, 2))
})
},
})

export const DocumentSymbolsCommand = cmd({
  command:"document-symbols <uri>",
  builder:(yargs) => yargs.positional("uri", { type:"string", demandOption:true}),
  async handler(args) {
    await bootstrap({ cwd:process.cwd()}, async () => {
      using _ = Log.Default.time("document-symbols")
      const results = await LSP.documentSymbol(args.uri)
      logger.info(JSON.stringify(results, null, 2))
})
},
})
