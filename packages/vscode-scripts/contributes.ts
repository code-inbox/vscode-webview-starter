const fs = require("fs")
const path = require("path")
require("dotenv").config()

const getRootPath = () => {
    let currentPath = __dirname
    while (!fs.existsSync(path.resolve(currentPath, "package.json"))) {
        const parentPath = path.dirname(currentPath)
        if (parentPath === currentPath) {
            throw new Error("Could not find package.json")
        }
        currentPath = parentPath
    }
    return currentPath
}

function getFrameworkViews() {
    const framework = process.env.FRAMEWORK || "react"
    const mapToExtension = {
        react: "?sx",
        svelte: "svelte",
    } as any
    if (!mapToExtension[framework]) {
        throw new Error(`Unsupported framework: ${framework}`)
    }
    const rootPath = getRootPath()

    const folderPath = path.resolve(rootPath, "src/views")
    // give me all the framework files in the folder
    return fs
        .readdirSync(folderPath)
        .filter((file: string) =>
            new RegExp(`.${mapToExtension[framework]}$`).test(file)
        )
        .map((file: string) => ({name: file.split(".")[0], path: path.resolve(folderPath, file)}))

}

const saveFile = fs.writeFileSync

const viewsPaths = getFrameworkViews()
const json = require(path.resolve("package.json"))
json.contributes.views.container = []

viewsPaths.forEach(({name: viewPath}: {name: string}) => {
    const viewName = viewPath.split(".")[0]
    json.contributes.views.container.push({
        id: viewName,
        name: viewName,
        type: "webview",
        initialSize: 4,
    })
    saveFile(path.resolve("package.json"), JSON.stringify(json, null, 2))
})
