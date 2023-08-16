import { glob } from "glob"
import path from "path"
import { fileURLToPath } from "url"

import postcss from "rollup-plugin-postcss"
import esbuild from "rollup-plugin-esbuild"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import json from "@rollup/plugin-json"
import alias from "@rollup/plugin-alias"
import replace from "@rollup/plugin-replace"
import child_process from "node:child_process"

import reactConfig from "./frameworks/react.js"
import svelteConfig from "./frameworks/svelte.js"
import { postBuildPlugin } from "./plugins.js"
import { resolveApp, resolveOwn } from "./paths.js"

import dotenv from "dotenv"
dotenv.config({
  path: resolveApp(".env"),
})

const standardPlugins = [
  replace({
    preventAssignment: true,
    "process.env.NODE_ENV": JSON.stringify("production"),
  }),
  alias({
    entries: {
      "vscode-scripts": resolveOwn("./index.ts"),
      _app: resolveApp("./src"),
    },
  }),
  json(),
  esbuild({
    exclude: /xxxxxxx/,
  }),
  commonjs(),
]

const frameworkConfig =
  {
    react: reactConfig,
    svelte: svelteConfig,
  }[process.env.FRAMEWORK] || reactConfig

const frameworkGlob =
  {
    react: "src/views/*.?sx",
    svelte: "src/views/*.svelte",
  }[process.env.FRAMEWORK] || "src/views/*.?sx"

const config = [
  {
    input: Object.fromEntries(
      glob.sync(resolveApp(frameworkGlob)).map((file) => [
        // This remove `src/` as well as the file extension from each
        // file, so e.g. src/nested/foo.js becomes nested/foo
        path.relative(
          resolveApp("src/views"),
          file.slice(0, file.length - path.extname(file).length)
        ),
        // This expands the relative paths to absolute paths, so e.g.
        // src/nested/foo becomes /project/src/nested/foo.js
        fileURLToPath(new URL(file, import.meta.url)),
      ])
    ),
    output: {
      dir: "dist/chromium",
      format: "esm",
    },
    plugins: [
      postcss({
        modules: true,
      }),
      nodeResolve({}),
      ...frameworkConfig.plugins,
      ...standardPlugins,
    ],
  },
  {
    input: resolveOwn("extension.ts"),
    output: {
      dir: resolveApp("dist/node"),
      format: "cjs",
    },
    plugins: [
      ...standardPlugins,
      nodeResolve({
        mainFields: ["main", "module"],
      }),
      postBuildPlugin({
        onComplete: () => {
          child_process.execSync("code --extensionDevelopmentPath=${PWD}")
        },
      }),
    ],
    external: ["vscode"],
  },
]

export default config
