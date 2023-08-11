import {StateCreator, StoreApi, UseBoundStore, create} from "zustand"
import * as vscode from "vscode"
import pick from "lodash.pick"
import {ChromiumMessenger} from "./chromium-messenger"
import type {NodeMessenger} from "./node-messenger"

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
            (async function () {
                // running in Node environment
                let nodeMessenger: NodeMessenger<ReturnType<typeof get>>
                if (!messenger) {
                    const {NodeMessenger} = await import("./node-messenger.ts");
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
                    console.log("node process", state)
                    if (!("type" in state)) {
                        // unless it's a specific request for data, treat incoming messages as updates to the node state
                        console.log(`received by node process`, state);
                        set(pick(state, Object.keys(get())))
                        console.log(`new state on node process`, get());
                    } else if (state.type === "command") {
                        const {command, args} = state.data
                        nodeMessenger.runCommand(command, args)
                        console.log(`command ${command} run on node process`)
                        return
                    }
                    // on all updates to the node state, broadcast to all webviews
                    nodeMessenger.post(get())
                })
            })()
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
export abstract class BaseMessenger<S> {
    public abstract type: string
    public listen(fn: (message: any) => void) { }
    public post(message: any) { }
}

export function useVscode() {
    if (typeof window === "undefined") {
        throw new Error("Cannot use command in node environment")
    }
    return function (command: string, args: any[]) {
        if (!messenger) {
            throw new Error("Cannot use command before store is created")
        }
        (messenger as ChromiumMessenger<unknown>).requestCommand(command, args)
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