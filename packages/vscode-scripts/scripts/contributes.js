import fs from "fs"
import path from "path"
import dotenv from "dotenv"

import { createRequire } from "node:module"
const require = createRequire(import.meta.url)

dotenv.config()

function getFrameworkViews() {
  const framework = process.env.FRAMEWORK || "react"
  const mapToExtension = {
    react: "?sx",
    svelte: "svelte",
  }
  if (!mapToExtension[framework]) {
    throw new Error(`Unsupported framework: ${framework}`)
  }

  const folderPath = path.resolve("src/views")
  // give me all the framework files in the folder
  return fs
    .readdirSync(folderPath)
    .filter((file) => new RegExp(`.${mapToExtension[framework]}$`).test(file))
    .map((file) => ({
      name: file.split(".")[0],
      path: path.resolve(folderPath, file),
    }))
}

const saveFile = fs.writeFileSync

const viewsPaths = getFrameworkViews()
const json = require(path.resolve("package.json"))
json.contributes.views.container = []

export default function () {
  viewsPaths.forEach(({ name: viewPath }) => {
    const viewName = viewPath.split(".")[0]
    json.contributes.views.container.push({
      id: viewName,
      name: viewName,
      type: "webview",
      initialSize: 4,
    })
    saveFile(path.resolve("package.json"), JSON.stringify(json, null, 2))
  })
}
