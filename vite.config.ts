import { defineConfig } from "vite"

export default defineConfig({
  plugins: [],
  build: {
    outDir: "./dist",
    lib: {
      entry: ["./src/extension.ts", "./src/index.tsx"],
      formats: ["cjs", "es"],
      fileName: (_, entryName) => {
        return "[name].js"
      },
    },
  },
})
