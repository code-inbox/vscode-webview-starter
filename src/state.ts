import {StoreApi, UseBoundStore} from "zustand"
import _getStore from "../ipc"

export type State = {
    todos: string[]
    addTodo: (todo: string) => void
    removeTodo: (todo: string) => void
}

export type Store = UseBoundStore<StoreApi<State>>

export const getStore = _getStore<State>((set) => ({
    todos: [],
    addTodo: (todo) => set((state) => ({todos: [...state.todos, todo]})),
    removeTodo: (todo) => set((state) => ({todos: state.todos.filter((t) => t !== todo)})),
}))
