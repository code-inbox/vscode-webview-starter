import {getStore} from "../state"
import * as vscode from "vscode"

export default function () {
    const store = getStore()
    store.subscribe(state => {
        vscode.window.showInformationMessage(`Todos length: ${state.todos.length}`)
    })
}