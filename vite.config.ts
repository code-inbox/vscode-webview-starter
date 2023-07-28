import { builtinModules } from "module"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { glob } from "glob"
import path from "path"

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "./dist",
    lib: {
      entry: glob.sync([
        path.resolve(__dirname, "src/extension.ts"),
        path.resolve(__dirname, "src/views/*.tsx"),
      ]),
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
})
