const fs = require("fs")
const path = require("path")

const saveFile = fs.writeFileSync

const viewsPaths = fs.readdirSync(path.resolve(__dirname, "src/views"))
const json = require(path.resolve("package.json"))
json.contributes.views.container = []

viewsPaths.forEach((viewPath) => {
  const viewName = viewPath.split(".")[0]
  json.contributes.views.container.push({
    id: viewName,
    name: viewName,
    type: "webview",
    initialSize: 4,
  })
  saveFile(path.resolve("package.json"), JSON.stringify(json, null, 2))
})
