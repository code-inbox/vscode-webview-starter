import { builtinModules } from "module"
import { UserConfig, defineConfig } from "vite"
import { glob } from "glob"
import path from "path"
import getFrameworkViews from "./scripts/getFrameworkViews"

require("dotenv").config()

const baseConfig: UserConfig = {
  build: {
    outDir: "./dist",
    lib: {
      entry: [
        path.resolve(__dirname, "src/extension.ts"),
        ...getFrameworkViews().map(view => view.path),
      ],
      formats: ["cjs", "es"],
      fileName: (format, name) => {
        if (name === "extension")
          return format === "cjs" ? `${name}.js` : `${name}.${format}.js`
        return format === "es" ? `${name}.js` : `${name}.${format}.js`
      },
    },
    rollupOptions: {
      external: [
        "vscode",
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
      ],
    },
  },
  define: {
    "process.env": {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    },
  },
}

export default defineConfig(async (params) => {
  const { default: frameworkConfig } = await import(
    `./frameworks/${process.env.FRAMEWORK || "react"}.js`
  )
  if (!process.env.FRAMEWORK)
    console.warn("No framework specified, using React...")
  if (typeof frameworkConfig === "function") {
    const config = await frameworkConfig(params)
    return {
      ...baseConfig,
      ...config,
    }
  }
  return {
    ...baseConfig,
    ...frameworkConfig,
  }
})
