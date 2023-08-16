# vscode-scripts

This is a package that can be installed in a VSCode extension to add scripts for building and running the extension. It is analogous to 'react-scripts' in a Create React App project.

## Assumptions

The package assumes you are using Typescript. It also assumes the following basic entry points to be defined:

### node/activate.ts

Whatever default export function is defined here, will be called when the extension is activated. This is the entry point for the extension and runs in a Node environment. You have access to the state and can call arbitrary VSCode APIs from here.

### state.ts

Use this entry point to define and export a Zustand 'StateCreator' that will be used to create a shared state to be synced across all processes / views.

### views/{view-name}

Each file in this directory will be compiled into a separate webview. The file extension determines the framework that will be used to compile the view. For example, if you are using React, you can create a new file called `src/views/my-view.tsx` and it will be compiled into a webview. If you are using Svelte, you can create a new file called `src/views/my-view.svelte` and it will be compiled into a webview. Whatever framework you choose, ensure that the corresponding `FRAMEWORK` variable is set in the `.env` file.

Frontend components defined here have access to the Zustand store and (indirect) access to the VSCode API's via the `getChromiumStore` function exported from this package.

```
package.json
src/
    node/
        activate.ts
    views/
        my-view.(tsx|svelte)
        ...other arbitrary views
    state.ts
```

## Usage

Once installed, you can run define the following commands in your package.json:

```json
{
  "scripts": {
    "start": "vscode-scripts start",
    "build": "vscode-scripts build"
  }
}
```
