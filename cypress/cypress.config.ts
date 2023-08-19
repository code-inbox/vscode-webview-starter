const {defineConfig} = require('cypress')

module.exports = defineConfig({
    chromeWebSecurity: false,
    defaultCommandTimeout: 4000,
    e2e: {
        record: true,
    },
})
