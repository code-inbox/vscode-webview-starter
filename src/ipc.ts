import {StateCreator} from "zustand"
import * as vscode from "vscode"

// TODO: acknowledgement of message receipt???
// TODO: sending partial state updates???

type PersistImpl = <S>(
    storeInitializer: StateCreator<S, [], []>,
    env: vscode.Webview | undefined
) => StateCreator<S, [], []>

let hasLoaded = false;
let messenger: Messenger;

const ipc: PersistImpl = (config, env) => {
    return (set, get, api) => {
        if (!messenger) {
            if (!env) {
                if (typeof window === "undefined") {
                    throw new Error("No window")
                }
                const webviewApi = "acquireVsCodeApi" in window ? (window as any).acquireVsCodeApi() : undefined
                if (!webviewApi) {
                    throw new Error("No webview api")
                }
                messenger = new Messenger(webviewApi)
                messenger.requestData()
            } else {
                messenger = new Messenger(env);
            }
        } else if (env) {
            // means we are in node and want to attach another client to the current messenger
            messenger.addClient(env)
        }
        if (!hasLoaded) {
            messenger.listen((state) => {
                if (state.type === "request") {
                    messenger.post(get())
                } else {
                    console.log(`  received by ${messenger.type}`, state);
                    set(state)
                    console.log(`  new state on ${messenger.type}`, get());
                }
            })
        }
        hasLoaded = true;
        if (!messenger) {
            throw new Error("No messenger")
        }
        return config(
            (...args) => {
                set(...args)
                console.log(`broadcasting from ${messenger.type}`, get())
                messenger.post(get())
            },
            get,
            api
        )
    }
}

class Messenger {
    public type: "node" | "chromium"
    private frame: Window | {onDidReceiveMessage: any; postMessage: any};
    private clients: (Window | {onDidReceiveMessage: any; postMessage: any})[] = [];
    constructor(private _frame: Window | {onDidReceiveMessage: any; postMessage: any}) {
        if (!_frame) {
            throw new Error("No window")
        }
        this.type = "onDidReceiveMessage" in _frame ? "node" : "chromium"
        this.frame = _frame;
        this.clients = [_frame]
    }
    addClient(client: Window | {onDidReceiveMessage: any; postMessage: any}) {
        this.clients.push(client)
    }
    listen(fn: (message: any) => void) {
        if ('onDidReceiveMessage' in this.frame) {
            // WebviewApi is being used as frame, subscribe to messages from VSCode side.
            const dispose = this.frame.onDidReceiveMessage(fn);
            return () => dispose.dispose();
        } else {
            // Window Api is being used, subscribe to messages from react side and
            // wrap handler so signatures are the same.
            const handler = (event: MessageEvent) => {
                if (event.origin !== location.origin) {return;}
                fn(event.data);
            };

            window.addEventListener('message', handler);
            return () => window.removeEventListener('message', handler);
        }
    }
    post(message: any) {
        this.clients.forEach(client => {
            if ('postMessage' in client) {
                client.postMessage(message);
            } else {
                throw new Error("No postMessage")
            }
        })
    }
    requestData() {
        if (this.type === "chromium") {
            this.post({type: "request"})
        }
    }

}

export default ipc;