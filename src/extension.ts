// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode"

class ViewProvider implements vscode.WebviewViewProvider {
  public static viewType: string = "ping.list"
  public static title: string = "Ping"

  private extensionContext: vscode.ExtensionContext
  private webview: vscode.Webview | undefined

  constructor(extensionContext: vscode.ExtensionContext) {
    this.extensionContext = extensionContext
    console.log("ViewProvider constructed")
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context_: vscode.WebviewViewResolveContext<unknown>,
    token: vscode.CancellationToken
  ): void | Thenable<void> {
    console.log("ViewProvider resolveWebviewView")
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
        <title>${ViewProvider.title}</title>
  
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; connect-src https://api.rollbar.com/; img-src vscode-resource: vscode-webview: https:; script-src 'nonce-${nonce}';style-src vscode-resource: 'unsafe-inline' http: https: data:;">
      </head>
  
      <body data-view-type="${
        ViewProvider.viewType
      }" style="background: #1D1F29;">
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
      "dist/index.js"
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

class ListViewProvider extends ViewProvider {
  static title = "overriden"
  static viewType = "list"
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const viewProvider = new ListViewProvider(context)
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      ViewProvider.viewType,
      viewProvider,
      {
        webviewOptions: {
          retainContextWhenHidden: true,
        },
      }
    )
  )
}
