import {StateCreator, StoreApi, UseBoundStore} from "zustand"
import _getStore from "../ipc"
import * as vscode from "vscode"

export type State = {
    todos: string[]
    addTodo: (todo: string) => void
    removeTodo: (todo: string) => void
}

export type Store = UseBoundStore<StoreApi<State>>

const getStore = _getStore<State>((set) => ({
    todos: [],
    addTodo: (todo) => set((state) => ({todos: [...state.todos, todo]})),
    removeTodo: (todo) => set((state) => ({todos: state.todos.filter((t) => t !== todo)})),
}))

/**
 * Gets a Zustand store for the current Chromium process
 * @returns A Zustand store
 */
export const getChromiumStore = () => {
    if (typeof window === "undefined") {
        throw new Error("Cannot get chromium store from node process")
    }
    return getStore()
}

/**
 * Gets a Zustand store for the current Node process, creating it if necessary
 * @returns A Zustand store, and a function to register a new connection to a webview
 */
export const getNodeStore = () => {
    if (typeof window !== "undefined") {
        throw new Error("Cannot get node store from chromium process")
    }
    return [getStore(), (connection: vscode.Webview) => getStore(connection)] as const
}   