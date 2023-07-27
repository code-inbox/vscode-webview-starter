import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "./dist",
    lib: {
      entry: ["./src/extension.ts", "./src/index.tsx"],
    },
    rollupOptions: {
      external: ["vscode"],
    },
  },
  define: {
    "process.env": {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    },
  },
})
