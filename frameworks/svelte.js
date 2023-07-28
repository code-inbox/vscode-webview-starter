function svelteMountPlugin() {
  return {
    name: "svelte-mount-plugin",
    enforce: "pre",
    async transform(code, id) {
      if (id.endsWith(".svelte")) {
        // Append the mounting logic at the end of the code
        code += `\n\nimport App from './${id.slice(
          id.lastIndexOf("/") + 1,
          -7
        )}.svelte';
const app = new App({
  target: document.getElementById('root'),
  props: {}
});`
      }
      return code
    },
  }
}

const getSvelteConfig = async () => {
  const { svelte } = await import("@sveltejs/vite-plugin-svelte")
  return {
    plugins: [svelte(), svelteMountPlugin()],
  }
}

module.exports = getSvelteConfig
