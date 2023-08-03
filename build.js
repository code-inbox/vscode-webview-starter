const path = require("path")
const fs = require("fs")
const { build } = require("vite")
const { getFrameworkViews } = require("./scripts/getFrameworkViews")
const { builtinModules } = require("module")

require("dotenv").config()
const isWatch = process.argv.includes("--watch")

// NOTE: this config gets merged with that defined in vite.config.js
;(async () => {
  const filesWritten = new Promise((resolve) => {
    if (fs.existsSync(path.join(__dirname, "dist"))) {
      const watcher = fs.watch(
        path.join(__dirname, "dist"),
        { recursive: true },
        (event, filename) => {
          if (event === "rename") {
            watcher.close()
            resolve(filename)
          }
          return null
        }
      )
    } else {
      const watcher = fs.watch(
        path.join(__dirname),
        { recursive: false },
        (event, filename) => {
          if (filename === "dist") {
            watcher.close()
            resolve(filename)
          }
          return null
        }
      )
    }
  })
  const { default: frameworkConfig } = await import(
    `./frameworks/${process.env.FRAMEWORK || "react"}.js`
  )
  if (!process.env.FRAMEWORK)
    console.warn("No framework specified, using React...")

  const config =
    typeof frameworkConfig === "function"
      ? await frameworkConfig()
      : frameworkConfig

  await Promise.all(
    getFrameworkViews()
      .map((f) => {
        return build({
          build: {
            emptyOutDir: false,
            lib: {
              formats: ["es"],
            },
            rollupOptions: {
              input: f.path,
              output: {
                format: "esm",
                dir: path.join(__dirname, "dist/chromium"),
                // exports: "named",
              },
            },
            watch: isWatch ? {} : null,
          },
          ...config,
        })
      })
      .concat([
        build({
          build: {
            lib: {
              formats: ["cjs"],
            },
            rollupOptions: {
              input: path.join(__dirname, "src/extension.ts"),
              output: {
                format: "cjs",
                dir: path.join(__dirname, "dist/node"),
              },
              external: [
                "vscode",
                ...builtinModules,
                ...builtinModules.map((m) => `node:${m}`),
              ],
            },
            watch: isWatch ? {} : null,
          },
        }),
      ])
  )
  if (isWatch) {
    await filesWritten
    require("child_process").execSync("code --extensionDevelopmentPath=${PWD}")
  }
})()
