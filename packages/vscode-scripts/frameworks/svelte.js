import svelte from "rollup-plugin-svelte"
import { svelteMountPlugin } from "../plugins.js"

export default {
  plugins: [svelte(), svelteMountPlugin()],
}
