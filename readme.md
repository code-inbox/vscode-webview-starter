
<img width="899" alt="codeinbox readme dark" src="https://github.com/code-inbox/vscode-webview-starter/assets/11192814/12cee044-6b38-449d-a575-15d719739409">

# VSCode Webview Starter Template

This is a starter template for creating a VSCode extension with one or more webviews to be rendered in a sidebar (In VSCode parlance, it creates a dedicated `viewContainer` in the `Activity Bar` with one or more `views`).



https://github.com/code-inbox/vscode-webview-starter/assets/11192814/c44df936-f87b-44a3-a1a9-9c53bf6d2ce4



## Getting started

The build scripts assume you are running Node 16 or later.

1. Clone this repository
2. Run `npm install`
3. Run `npm start`. This will compile the extension and open a new VSCode window with the extension loaded.

## Specifying framework

By default, this template is configured to use React as the framework for the webviews. Depending on the framework you wish to use, you can change the `FRAMEWORK` variable in the `.env` file to one of the following:

- `react`
- `svelte`
- (more coming soon)

## Adding a new webview

Each "webview" is a collapsible pane that appears in your view container. Each webview runs in a separate iframe. It can contain any HTML content you wish.

All that is required is to create a new file in the `src/views` directory. Each entry in this directory that has a file extension appropriate to the current `FRAMEWORK` will be compiled into a separate webview.

For example, if you are using React, you can create a new file called `src/views/my-view.tsx` and it will be compiled into a webview. If you are using Svelte, you can create a new file called `src/views/my-view.svelte` and it will be compiled into a webview.

## State management

State management for webview extensions can be tricky, because there can be multiple processes running. For example, if you have two webviews, you will have a total of three processes running:

- The main VSCode process (Node)
- The webview process for the first webview (Chromium)
- The webview process for the second webview (Chromium)

This template uses [Zustand](https://github.com/pmndrs/zustand) for state management. You can define your state along with its update functions in `src/state.ts`, and a custom middleware will ensure that the state is kept in sync across all processes.

## Commands

### Defining commands

An easy way to create custom commands is by simply exporting a `commands` object from your webview file. For example:

```ts
// src/views/my-view.tsx

export const commands = {
  "my-extension.my-command": (store) => {
    // Do something
  },
}
```

### Calling commands

Your users can call commands directly from the command palette, or you can call them programmatically from your main `node` process. A good place to call commands programmatically in response to state changes is in `src/node/setupStoreSubscriptions.ts`. See the default code for an example.
