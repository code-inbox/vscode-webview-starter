import {StateCreator, StoreApi, UseBoundStore, create} from "zustand"
import * as vscode from "vscode"
import pick from "lodash.pick"
import {WebviewApi} from "vscode-webview"

// TODO: sending partial state updates???

type IpcImpl = <S extends {}>(
    storeInitializer: StateCreator<S, [], []>,
    newConnectionFromNode?: vscode.Webview
) => StateCreator<S, [], []>


// Aim is to have only 1 messenger:store per-process
let messenger: BaseMessenger<unknown>;
let store: UseBoundStore<StoreApi<any>>;

const ipc: IpcImpl = (storeInitializer, newConnectionFromNode?: vscode.Webview) => {
    return (set, get, api) => {
        // instantiate Node messenger if running in node, Chromium messenger if running in chromium
        if (typeof window === "undefined") {
            // running in Node environment
            let nodeMessenger: NodeMessenger<ReturnType<typeof get>>
            if (!messenger) {
                console.log('new messenger node')
                nodeMessenger = messenger = new NodeMessenger()
            } else {
                console.log('re-use messenger node')
                nodeMessenger = messenger as NodeMessenger<ReturnType<typeof get>>
            }
            // there can be a 1:many messaging relationship between node processes and webviews / chromium processes
            if (newConnectionFromNode) {
                nodeMessenger.addConnection(newConnectionFromNode)
            }
            console.log('node messenger state', nodeMessenger.connections.length)
            nodeMessenger.listen(state => {
                if (!("type" in state)) {
                    // unless it's a specific request for data, treat incoming messages as updates to the node state
                    console.log(`received by node process`, state);
                    set(pick(state, Object.keys(get())))
                    console.log(`new state on node process`, get());
                }
                // on all updates to the node state, broadcast to all webviews
                nodeMessenger.post(get())
            })
        } else {
            // running in chromium environment
            let chromiumMessenger: ChromiumMessenger<ReturnType<typeof get>>
            if (!messenger) {
                const connectionFromChromium = "acquireVsCodeApi" in window ? window.acquireVsCodeApi() : undefined
                if (!connectionFromChromium) {
                    throw new Error("Could not acquire vscode api from chromium")
                }
                console.log('new messenger chromium')
                chromiumMessenger = messenger = new ChromiumMessenger(connectionFromChromium)
                chromiumMessenger.requestData()
            } else {
                console.log('re-use messenger chromium')
                chromiumMessenger = messenger as ChromiumMessenger<ReturnType<typeof get>>
            }
            chromiumMessenger.listen(state => {
                console.log(`received by chromium process`, state);
                set(state)
                console.log(`new state on chromium process`, get());
            })
        }

        return storeInitializer(
            (...args) => {
                set(...args)
                console.log(...args, `broadcasting from ${messenger.type}`, get())
                messenger.post(get())
            },
            get,
            api
        )
    }
}

type ConnectionFromChromium = WebviewApi<unknown>
type ConnectionFromNode = vscode.Webview

abstract class BaseMessenger<S> {
    public abstract type: string
    public listen(fn: (message: any) => void) { }
    public post(message: any) { }
}

class NodeMessenger<S> implements BaseMessenger<S> {
    public type = "node"
    public connections: ConnectionFromNode[] = []
    private disposeListeners?: () => void
    listen(fn: (message: S | {type: "request"}) => void) {
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
}

class ChromiumMessenger<S> implements BaseMessenger<S> {
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
    post(message: S | {type: "request"}) {
        this.connection.postMessage(JSON.parse(JSON.stringify(message)))
    }
    requestData() {
        this.post({type: "request"})
    }
}

export default function getStore<S extends {}>(initializer: StateCreator<S>) {
    /**
     * Returns a Zustand store for the current process, creating it if necessary
     * @param connection If running in Node, you can have a 1:many connection to webviews that will be synced with. This registers a new connection.
     */
    return function (connection?: vscode.Webview): UseBoundStore<StoreApi<S>> {
        if (store) {
            // run the middleware again to update messenger without creating a new store
            ipc(() => ({}), connection)(store.setState, store.getState, store)
            return store
        }
        return store = create<S>(
            ipc<S>(initializer)
        )
    }
}