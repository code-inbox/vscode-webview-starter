import React from "react"
import { useStore } from "zustand"
import { getChromiumStore } from "../state"

import styles from "./box.module.css"

const _store = getChromiumStore()

export default function Box() {
  const store = useStore(_store)

  return (
    <div>
      <h1 className={styles.heading}>Box</h1>
      <div>
        <h3>TODOS</h3>
        <ul>
          {store.todos.map((todo) => (
            <>
              <li key={todo}>{todo}</li>
              <button onClick={() => store.removeTodo(todo)}>Close</button>
            </>
          ))}
        </ul>
      </div>
    </div>
  )
}
