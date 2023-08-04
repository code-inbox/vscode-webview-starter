import {getStore} from "../state"
import * as vscode from "vscode"

// See https://vscode-docs.readthedocs.io/en/stable/customization/keybindings/

export default function () {
    const store = getStore()
    store.subscribe(state => {
        vscode.window.showInformationMessage(`Todos length: ${state.todos.length}`)
    })
}