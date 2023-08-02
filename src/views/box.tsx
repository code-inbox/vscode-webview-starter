import React from "react"
import { useStore } from "zustand"
import { Store, getStore } from "../state"

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
      <h1>Box</h1>
      <div>
        <h3>TODOS</h3>
        <ul>
          {store.todos.map((todo) => (
            <><li key={todo}>{todo}</li>
            <button onClick={() => store.removeTodo(todo)}>Close</button>
            </>
          ))}
        </ul>
      </div>
    </div>
  )
}
