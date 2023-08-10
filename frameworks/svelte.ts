import svelte from 'rollup-plugin-svelte';
import {svelteMountPlugin} from "../plugins"

export default {
    plugins: [svelte(), svelteMountPlugin()],
}