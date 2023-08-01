function reactMountPlugin() {
  return {
    name: "react-mount-plugin",
    enforce: "pre",
    async transform(code, id) {
      if (id.endsWith(".tsx")) {
        // Append the mounting logic with the default component import
        code += `\n\nimport React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import Component from './${id.slice(id.lastIndexOf("/") + 1, -4)}';
const root = createRoot(document.getElementById('root'));
root.render(<Component />);`
      }
      return code
    },
  }
}

const getReactConfig = async () => {
  const { default: react } = await import("@vitejs/plugin-react")
  return {
    plugins: [react(), reactMountPlugin()],
  }
}

module.exports = getReactConfig
