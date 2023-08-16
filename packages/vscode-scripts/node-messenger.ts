import * as vscode from "vscode"
import {BaseMessenger} from "./ipc"

type ConnectionFromNode = vscode.Webview

export class NodeMessenger<S> implements BaseMessenger<S> {
    public type = "node"
    public connections: ConnectionFromNode[] = []
    public api: typeof vscode = vscode
    private disposeListeners?: () => void

    listen(fn: (message: S | {type: "request"} | {type: "command"; data: {command: string; args: any[]}}) => void) {
        if (this.disposeListeners) {
            this.disposeListeners()
        }
        const disposables = this.connections.map(connection => connection.onDidReceiveMessage(fn))
        return this.disposeListeners = () => {
            disposables.forEach(disposable => disposable.dispose())
        };
    }
    post(message: S) {
        this.connections.forEach(connection => {
            connection.postMessage(JSON.parse(JSON.stringify(message)) as S)
        })
    }
    addConnection(connection: ConnectionFromNode) {
        this.connections.push(connection)
    }
    runCommand(command: string, args: any[]) {
        // command is a "." delimited string of the command to run
        // args is an array of arguments to pass to the command
        // e.g. ["editor.action.formatDocument", []]
        const indices = command.split(".") as (keyof typeof vscode)[]
        try {
            const api = indices.reduce((api: any, index: any) => api[index], this.api)
            api(...args)
        } catch (e) {
            console.error(e)
        }
    }
}
