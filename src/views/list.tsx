import React from "react"
import { createRoot } from "react-dom"

// how can i set thing up so that this can just export a component and then the rendering is automatic?

const root = createRoot(document.getElementById("root") as HTMLElement)

root.render(
  <div>
    <h1>List</h1>
    Hello
  </div>
)
