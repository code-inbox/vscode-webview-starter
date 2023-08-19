import { exec } from "child_process"
import { resolveOwn } from '../paths.js';

const composeFolderPath = resolveOwn(".")

// Define the command to execute
const dockerComposeDownCommand = "docker-compose down"

// Function to execute a command and handle errors
const executeCommand = (command, cwd) => {
  return new Promise((resolve, reject) => {
    exec(command, {cwd}, (error, stdout, stderr) => {
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
    const downResult = await executeCommand(dockerComposeDownCommand, composeFolderPath)
    console.log("Docker Compose down completed:", downResult)
  } catch (error) {
    console.error(error)
  }
})()
