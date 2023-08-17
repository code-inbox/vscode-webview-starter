import fs from "fs"
import path from "path"
import url from "url"

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const appDirectory = fs.realpathSync(process.cwd())
export const resolveApp = (relativePath) =>
  path.resolve(appDirectory, relativePath)

export const resolveOwn = relativePath => path.resolve(__dirname, relativePath);

export const relativeToApp = relativePath => path.relative(resolveApp(relativePath), resolveOwn('.'));