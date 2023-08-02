import React from "react"
import { Store, getStore } from "../state"
import { useStore } from "zustand"

const _store = getStore()

export const commands = {
  "myExtension.sayHello": (store: Store) => {
    store
      .getState()
      .addTodo("Hello from the webview" + Math.random().toString())
  },
}

export default function Box() {
  const store = useStore(_store)

  return (
    <div>
      <h1>Box 2</h1>
      This is Box 2
      {store.todos.map((todo) => (
        <div key={todo}>{todo}</div>
      ))}
    </div>
  )
}
