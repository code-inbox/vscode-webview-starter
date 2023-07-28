const path = require("path")
const fs = require("fs")

require("dotenv").config()

module.exports = function getFrameworkViews() {
  const framework = process.env.FRAMEWORK || "react"
  const mapToExtension = {
    react: "?sx",
    svelte: "svelte",
  }
  if (!mapToExtension[framework]) {
    throw new Error(`Unsupported framework: ${framework}`)
  }
  const folderPath = path.resolve(__dirname, "../src/views")
  // give me all the files in the folder
  const paths = fs
    .readdirSync(folderPath)
    .map((file) => ({ name: file, path: path.resolve(folderPath, file) }))
    .filter(({ name }) =>
      new RegExp(`.${mapToExtension[framework]}$`).test(name)
    )
  return paths
}
