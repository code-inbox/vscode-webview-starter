import {generate} from "astring"

export function reactMountPlugin() {
    return {
        name: "react-mount-plugin",
        order: "pre",
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

export function postBuildPlugin(options){
    return {
        name: "post-build-plugin",
        writeBundle(_, bundle) {
            // Check if Rollup is in watch mode
            if (this.meta.watchMode) {
                // Get an array of output file names
                const outputFiles = Object.keys(bundle)

                // Execute arbitrary code here
                if (options && options.onComplete) {
                    options.onComplete(outputFiles)
                }
            }
        },
    }
}

export function getStaticInfoPlugin(){
    return {
        name: "get-static-info",
        moduleParsed({id, ast}) {
            if (id.endsWith(".tsx") && ast) {
                const componentName = id.slice(id.lastIndexOf("/") + 1, -4)
                const exportNodes = (ast)?.body.filter(
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

export function svelteMountPlugin() {
    return {
        name: "svelte-mount-plugin",
        order: "pre",
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