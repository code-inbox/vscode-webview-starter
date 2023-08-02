const { generate } = require("astring")

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

function getStaticInfoPlugin() {
  return {
    name: "get-static-info",
    moduleParsed({ id, ...rest }) {
      if (id.endsWith(".tsx")) {
        const componentName = id.slice(id.lastIndexOf("/") + 1, -4)
        const exportNodes = rest.ast.body.filter(
          (n) => n.type === "ExportNamedDeclaration"
        )
        const source = exportNodes
          .map((n) => {
            const name = n.declaration.declarations[0].id.name
            const definition = generate(n.declaration.declarations[0].init)
            const cjsExport = `module.exports.${name} = ${definition};`
            return cjsExport
          })
          .join("\n")
        this.emitFile({
          type: "asset",
          fileName: `${componentName}.static.js`,
          source,
        })
      }
    },
  }
}


const getReactConfig = async () => {
  const { default: react } = await import("@vitejs/plugin-react")
  return {
    plugins: [react(), reactMountPlugin(), getStaticInfoPlugin()],
  }
}

module.exports = getReactConfig
