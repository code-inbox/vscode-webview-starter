import {WebviewApi} from "vscode-webview"
import {BaseMessenger} from "./ipc"

type ConnectionFromChromium = WebviewApi<unknown>

export class ChromiumMessenger<S> implements BaseMessenger<S> {
    public type = "chromium"
    private connection: ConnectionFromChromium
    private listening = false
    constructor(connection: ConnectionFromChromium) {
        this.connection = connection
    }
    listen(fn: (message: S) => void) {
        if (this.listening) {
            return
        }
        const handler = (event: MessageEvent) => {
            if (event.origin !== location.origin) {return;}
            fn(event.data);
        };
        window.addEventListener('message', handler);
        this.listening = true
        return () => {window.removeEventListener('message', handler); this.listening = false};
    }
    post(message: S | {type: "request"} | {type: "command"; data: {command: string; args: any[]}}) {
        this.connection.postMessage(JSON.parse(JSON.stringify(message)))
    }
    requestData() {
        this.post({type: "request"})
    }
    requestCommand(command: string, args: any[]) {
        console.log('requesting command', command, args)
        this.post({type: "command", data: {command, args}})
    }
}