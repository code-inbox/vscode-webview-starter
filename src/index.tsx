import React from "react"
import List from "./List"
import { createRoot } from "react-dom"

const root = createRoot(document.getElementById("root") as HTMLElement)

root.render(
  <div>
    <h1>My App</h1>
    Hello
  </div>
)
