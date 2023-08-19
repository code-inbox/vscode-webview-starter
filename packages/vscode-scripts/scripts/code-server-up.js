import { exec } from 'child_process';
import { resolveOwn, resolveApp } from '../paths.js';

// Specify the path to the folder containing docker-compose.yml
const composeFolderPath = resolveOwn(".")
const projectFolderPath = resolveApp(".")

// Define the commands to execute
const dockerComposeUp = 'docker-compose up -d';
const installExtension = 'docker exec vscodeExtension code-server --install-extension /source/vscode-starter-1.0.0.vsix';

// Function to execute a command and handle errors
const executeCommand = (command, cwd) => {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject(`Error executing command: ${error}`);
        return;
      }
      resolve(stdout.trim());
    });
  });
};

// Execute commands sequentially using async/await
(async () => {
  try {
    const dockerComposeResult = await executeCommand(dockerComposeUp, composeFolderPath);
    console.log('Docker Compose up successful:', dockerComposeResult);

    const installExtensionResult = await executeCommand(installExtension, projectFolderPath);

    console.log('Extension installed successfully:', installExtensionResult);
  } catch (error) {
    console.error(error);
  }
})();
