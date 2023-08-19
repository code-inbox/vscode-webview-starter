import path from "path"
import { exec } from "child_process"
import { relativeToApp } from "../paths.js"

// Define the command to execute
const vscePackageCommand = `vsce package --no-dependencies --out ${path.join(
  relativeToApp("."),
  "vscode-starter-1.0.0.vsix"
)}`

// Function to execute a command and handle errors
const executeCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error executing command: ${error}`)
        return
      }
      resolve(stdout.trim())
    })
  })
}

// Execute the command using async/await
;(async () => {
  try {
    const packageResult = await executeCommand(vscePackageCommand)
    console.log("Package created successfully:", packageResult)
  } catch (error) {
    console.error(error)
  }
})()
