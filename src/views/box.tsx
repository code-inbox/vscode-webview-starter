import React from "react"
// import { useStore } from "zustand"
// import { getChromiumStore } from "vscode-scripts"
// import { State } from "../state.ts"

// import styles from "./box.module.css"

// const [_store, vscode] = getChromiumStore<State>()

// vscode("window.showInformationMessage", [
//   `Mounting. React ${!!React} Zustand: ${!!useStore}`,
// ])

export default function Box() {
  console.log("mounging box")
  //   const store = useStore(_store)

  return (
    <div>
      <h1>Box</h1>
      <div>
        <h3>TODOS</h3>
        <ul>Hi</ul>
        <button
          data-cy="show-information-message"
          onClick={() => {
            // vscode("window.showInformationMessage", ["It works!"])
          }}
        >
          Show Information Message
        </button>
      </div>
    </div>
  )
}
