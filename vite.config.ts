import {UserConfig, defineConfig} from "vite"

require("dotenv").config()

const baseConfig: UserConfig = {
    publicDir: false,
    build: {
        emptyOutDir: false,
        lib: {
            entry: [],
            fileName: (_, name) => `${name}.js`,
        },
    },
    define: {
        "process.env": {
            NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        },
    },
}

export default defineConfig(baseConfig)