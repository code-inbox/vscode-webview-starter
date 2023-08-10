import type {RollupOptions} from "rollup"

import esbuild from "rollup-plugin-esbuild"
import {nodeResolve} from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import json from "@rollup/plugin-json"
import replace from "@rollup/plugin-replace"
import postcss from "rollup-plugin-postcss"
import {glob} from "glob"
import path from "node:path"
import {fileURLToPath} from "node:url"
import child_process from "node:child_process"

import reactConfig from "./frameworks/react"
import svelteConfig from "./frameworks/svelte"
import {postBuildPlugin} from "./plugins"

import dotenv from "dotenv"
dotenv.config()

const standardPlugins = [
    replace({
        preventAssignment: true,
        "process.env.NODE_ENV": JSON.stringify("production"),
    }),
    json(),
    esbuild(),
    commonjs(),
]

const frameworkConfig = {
    react: reactConfig,
    svelte: svelteConfig,
}[process.env.FRAMEWORK] || reactConfig

const frameworkGlob = {
    react: "src/views/*.?sx",
    svelte: "src/views/*.svelte",
}[process.env.FRAMEWORK] || "src/views/*.?sx"

console.log('framework glob', frameworkGlob)

const config: RollupOptions[] = [
    {
        input: Object.fromEntries(
            glob.sync(frameworkGlob).map((file) => [
                // This remove `src/` as well as the file extension from each
                // file, so e.g. src/nested/foo.js becomes nested/foo
                path.relative(
                    "src/views",
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
            nodeResolve(),
            ...frameworkConfig.plugins,
            ...standardPlugins
        ],
    },
    {
        input: "extension.ts",
        output: {
            dir: "dist/node",
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
        external: ["vscode"]
    },
]

export default config