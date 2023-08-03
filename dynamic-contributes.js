const fs = require("fs")
const path = require("path")
const {getFrameworkViews} = require("./scripts/getFrameworkViews")

const saveFile = fs.writeFileSync

const viewsPaths = getFrameworkViews()
const json = require(path.resolve("package.json"))
json.contributes.views.container = []

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
