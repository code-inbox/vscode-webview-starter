import React from "react"
import { getStore, Store } from "../state"
import { useStore } from "zustand"

// TODO: would be nice if dynamicContributes could update package.json based on this info
export const commands = {
  "myExtension.sayHello": (store: Store) => {
    store
      .getState()
      .addTodo("Hello from the webview" + Math.random().toString())
  },
}


const _store = getStore()

export default function Box() {
  const store = useStore(_store)

  return (
    <div>
      <h1>Box 2</h1>
      This is Box 2
        <ul>
          {store.todos.map((todo) => (
            <><li key={todo}>{todo}</li>
            <button onClick={() => store.removeTodo(todo)}>Close</button>
            </>
          ))}
        </ul>
    </div>
  )
}
