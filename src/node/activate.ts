import * as vscode from "vscode"
import {getNodeStore} from "vscode-scripts"
import {State} from "../state"

// See https://vscode-docs.readthedocs.io/en/stable/customization/keybindings/
const [store] = getNodeStore<State>()

export default function () {
    vscode.commands.registerCommand("vscode_starter.addTodo", () => {
        store.getState().addTodo("New todo: " + Math.random().toString().substring(0, 5))
    })
    store.subscribe((state, prevState) => {
        if (state.todos.length !== prevState.todos.length) {
            vscode.window.showInformationMessage(`Todos lengths: ${state.todos.length}`)
        }
    })
}