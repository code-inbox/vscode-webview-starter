import * as vscode from "vscode"
import fs from "fs"
import path from "path"

class ViewProvider implements vscode.WebviewViewProvider {
  readonly viewId: string
  readonly title: string
  readonly entryPoint: string
  private extensionContext: vscode.ExtensionContext
  private webview: vscode.Webview | undefined

  constructor(id: string, extensionContext: vscode.ExtensionContext) {
    this.extensionContext = extensionContext
    this.viewId = id
    this.title = id
    this.entryPoint = `dist/${id}.js`
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

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context_: vscode.WebviewViewResolveContext<unknown>,
    token: vscode.CancellationToken
  ): void | Thenable<void> {
    webviewView.webview.options = {
      enableScripts: true,
    }
    this.webview = webviewView.webview
    webviewView.webview.html = this.render()
  }
  private render(data = {}) {
    const nonce = this.getNonce()
    const path = this.getWebviewUri()

    return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
        <meta name="theme-color" content="#000000">
        <title>${this.title}</title>
  
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; connect-src https://api.rollbar.com/; img-src vscode-resource: vscode-webview: https:; script-src 'nonce-${nonce}';style-src vscode-resource: 'unsafe-inline' http: https: data:;">
      </head>
  
      <body data-view-type="${this.viewId}" style="background: #1D1F29;">
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <div id="root"></div>

        <script nonce="${nonce}">
            window.__INITIAL_DATA__ = ${JSON.stringify(data)};
        </script>
        <script type="module" nonce="${nonce}" src="${path}"></script>
      </body>
    </html>`
  }

  public dispose() {}

  private getWebviewUri() {
    const uri = vscode.Uri.joinPath(
      this.extensionContext.extensionUri,
      this.entryPoint
    )
    return this.webview?.asWebviewUri(uri).toString()
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
  const viewsPaths = fs.readdirSync(path.resolve(__dirname, "../src/views"))
  viewsPaths.forEach((viewPath) => {
    const viewId = viewPath.split(".")[0]
    const viewProvider = new ViewProvider(viewId, context)
    viewProvider.register()
  })
}
