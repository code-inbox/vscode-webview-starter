import { loadConfigFile } from "rollup/loadConfigFile"
import { watch } from "rollup"
import path from "node:path"
import contributes from "./contributes.js"

const __dirname = path.dirname(new URL(import.meta.url).pathname)

// load the config file next to the current script;
// the provided config object has the same effect as passing "--format es"
// on the command line and will override the format of all outputs
loadConfigFile(path.resolve(__dirname, "../rollup.config.js")).then(
  async ({ options, warnings }) => {
    // "warnings" wraps the default `onwarn` handler passed by the CLI.
    // This prints all warnings up to this point:
    console.log(`We currently have ${warnings.count} warnings`)

    contributes()

    // This prints all deferred warnings
    warnings.flush()

    watch(options)
  }
)
