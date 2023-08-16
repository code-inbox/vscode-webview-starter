import * as vscode from "vscode"
import _getStore, {useVscode} from "./ipc"
import stateCreator from "_app/state.ts" // importing from the root of the package
import {StoreApi} from "zustand/vanilla"

const getStore = _getStore(stateCreator)

/**
 * Gets a Zustand store for the current Chromium process
 * @returns A Zustand store, and a function to send a command to the Node process
 */
export const getChromiumStore = <S>() => {
    if (typeof window === "undefined") {
        throw new Error("Cannot get chromium store from node process")
    }
    return [getStore(), useVscode()] as [StoreApi<S>, ReturnType<typeof useVscode>]
}

/**
 * Gets a Zustand store for the current Node process, creating it if necessary
 * @returns A Zustand store, and a function to register a new connection to a webview
 */
export const getNodeStore = <S>() => {
    if (typeof window !== "undefined") {
        throw new Error("Cannot get node store from chromium process")
    }
    return [getStore(), (connection: vscode.Webview) => getStore(connection)] as [
        StoreApi<S>,
        (connection: vscode.Webview) => StoreApi<S>
    ]
}
