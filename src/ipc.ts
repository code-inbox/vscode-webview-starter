import {StateCreator} from "zustand"
import * as vscode from "vscode"

// TODO: acknowledgement of message receipt???
// TODO: sending partial state updates???

type PersistImpl = <S>(
    storeInitializer: StateCreator<S, [], []>,
    env: vscode.Webview | undefined
) => StateCreator<S, [], []>


const ipc: PersistImpl = (config, env) => {
    let hasLoaded = false;
    let messenger: Messenger;
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
            } else {
                messenger = new Messenger(env);
            }
        }
        if (!hasLoaded) {
            messenger.listen((state) => {
                console.log(`  received by ${messenger.type}`, state);
                set(state)
                console.log(`  new state on ${messenger.type}`, get());
            })
        }
        hasLoaded = true;
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
    constructor(private _frame: Window | {onDidReceiveMessage: any; postMessage: any}) {
        if (!_frame) {
            throw new Error("No window")
        }
        this.type = "onDidReceiveMessage" in _frame ? "node" : "chromium"
        this.frame = _frame;
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
        if ('postMessage' in this.frame) {
            this.frame.postMessage(message);
        } else {
            throw new Error("No postMessage")
        }
    }

}

export default ipc;