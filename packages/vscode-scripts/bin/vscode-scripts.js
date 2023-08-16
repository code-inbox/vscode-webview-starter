#!/usr/bin/env node

const args = process.argv.slice(2)

import { createRequire } from "node:module"
import spawn from "react-dev-utils/crossSpawn.js"

const require = createRequire(import.meta.url)

const scriptIndex = args.findIndex(
  (x) => x === "build" || x === "eject" || x === "start" || x === "test"
)
const script = scriptIndex === -1 ? args[0] : args[scriptIndex]
const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : []

if (["build", "start"].includes(script)) {
  const result = spawn.sync(
    process.execPath,
    nodeArgs
      .concat(require.resolve("../scripts/" + script + ".js"))
      .concat(args.slice(scriptIndex + 1)),
    { stdio: "inherit" }
  )
  process.exit(result.status)
} else {
  // handle
}
