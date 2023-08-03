import {StoreApi, UseBoundStore, create} from "zustand"
import * as vscode from "vscode"
import ipc from "./ipc"

export type State = {
    todos: string[]
    addTodo: (todo: string) => void
    removeTodo: (todo: string) => void
}

export type Store = UseBoundStore<StoreApi<State>>

export const getStore = (connection?: vscode.Webview) => create<State>(
    ipc((set) => ({
        todos: [],
        addTodo: (todo) => set((state) => ({todos: [...state.todos, todo]})),
        removeTodo: (todo) => set((state) => ({todos: state.todos.filter((t) => t !== todo)})),
    }), connection)
)
