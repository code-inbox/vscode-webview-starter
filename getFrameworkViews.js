const path = require("path")
const fs = require("fs")

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

module.exports.getFrameworkViews = function getFrameworkViews() {
    const framework = process.env.FRAMEWORK || "react"
    const mapToExtension = {
      react: "?sx",
      svelte: "svelte",
    }
    if (!mapToExtension[framework]) {
      throw new Error(`Unsupported framework: ${framework}`)
    }
    const rootPath = getRootPath()

    const folderPath = path.resolve(rootPath, "src/views")
    // give me all the framework files in the folder
    return fs
      .readdirSync(folderPath)
      .filter((file) =>
        new RegExp(`.${mapToExtension[framework]}$`).test(file)
      )
      .map((file) => ({ name: file.split(".")[0], path: path.resolve(folderPath, file) }))

}
