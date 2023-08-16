import {StateCreator} from "zustand/vanilla"

export type State = {
    todos: string[]
    addTodo: (todo: string) => void
    removeTodo: (todo: string) => void
}

const stateCreator: StateCreator<State, [], []> = (set) => ({
    todos: [],
    addTodo: (todo) => set((state) => ({todos: [...state.todos, todo]})),
    removeTodo: (todo) => set((state) => ({todos: state.todos.filter((t) => t !== todo)})),
})

export default stateCreator