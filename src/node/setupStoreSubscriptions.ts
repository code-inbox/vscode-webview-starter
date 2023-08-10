import {getNodeStore} from "../state"
import * as vscode from "vscode"

const [store] = getNodeStore()

// See https://vscode-docs.readthedocs.io/en/stable/customization/keybindings/

export default function () {
    store.subscribe((state, prevState) => {
        if (state.todos.length !== prevState.todos.length) {
            vscode.window.showInformationMessage(`Todos length: ${state.todos.length}`)
        }
    })
}