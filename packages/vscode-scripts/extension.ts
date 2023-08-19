import * as vscode from "vscode"
import fs from "fs"
import path from "path"
import {getNodeStore} from "./state"
import type {StoreApi} from "zustand/vanilla"

class ViewProvider implements vscode.WebviewViewProvider {
    public readonly viewId: string
    public readonly title: string
    public readonly entryPoint: string
    public commandHandler: Record<string, any> = {}
    private extensionContext: vscode.ExtensionContext
    private webview: vscode.Webview | undefined
    private store: StoreApi<unknown> | undefined

    constructor(id: string, extensionContext: vscode.ExtensionContext) {
        this.extensionContext = extensionContext
        this.viewId = id
        this.title = id
        this.entryPoint = `dist/chromium/${id}.js`

        if (extensionContext.extensionMode === vscode.ExtensionMode.Development) {
            fs.watchFile(this.getFsPath(this.entryPoint).path, () => {
                this.render()
            })
        }
    }

    public register() {
        this.extensionContext.subscriptions.push(
            vscode.window.registerWebviewViewProvider(this.viewId, this, {
                webviewOptions: {
                    retainContextWhenHidden: true,
                },
            })
        )
    }

    public init() {
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context_: vscode.WebviewViewResolveContext<unknown>,
        token: vscode.CancellationToken
    ) {
        webviewView.webview.options = {
            enableScripts: true,
        }
        this.webview = webviewView.webview
        if (!this.store) {
            const [, connectWebviewToStore] = getNodeStore()
            this.store = connectWebviewToStore(this.webview)
        }

        this.render()
    }
    public render(data = {}) {
        if (!this.webview) {
            console.error("No webview found", this.viewId);
            return
        }
        const nonce = this.getNonce()
        const path = this.getWebviewUri()

        this.webview.html = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
        <meta name="theme-color" content="#000000">
        <title>${this.title}</title>
  
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; connect-src https://api.rollbar.com/; img-src vscode-resource: vscode-webview: https:; script-src 'nonce-${nonce}';style-src vscode-resource: 'unsafe-inline' http: https: data:;">
      </head>
  
      <body data-view-type="${this.viewId}" style="background: #1D1F28;">

        <noscript>You need to enable JavaScript to run this app.</noscript>
        <div id="root" style="color:white"></div>

        <script nonce="${nonce}">
            window.__INITIAL_DATA__ = ${JSON.stringify(data)};
        </script>
        <script type="module" nonce="${nonce}" src="${path}"></script>
      </body>
    </html>`
    }

    public dispose() { }

    private getFsPath(entry: string) {
        return vscode.Uri.joinPath(
            this.extensionContext.extensionUri,
            entry
        )
    }

    private getWebviewUri() {
        return this.webview?.asWebviewUri(this.getFsPath(this.entryPoint)).toString()
    }
    private getNonce() {
        let text = ""
        const possible =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length))
        }
        return text
    }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // list all paths in "src/views" directory
    const extensionPath = context.extensionPath;
    const packageJsonPath = path.join(extensionPath, 'package.json');

    // get contributes views
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const contributes = packageJson.contributes;
    const viewsIds = contributes.views['container'].map(view => view.name)

    const providers = viewsIds.map((viewId: string) => {
        const viewProvider = new ViewProvider(viewId, context)
        viewProvider.register()
        return viewProvider
    })

    if (context.extensionMode === vscode.ExtensionMode.Development) {
        fs.watch(path.resolve(context.extensionPath, "dist/node"), {}, () => {
            vscode.commands.executeCommand('workbench.action.reloadWindow');
        })
    }

    // here is a good place to setup state-listeners that have effects in the main node process
    import("_app/node/activate.ts").then(({default: activate}) => {
        activate()
    })
}

