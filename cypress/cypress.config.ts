const {defineConfig} = require('cypress')

module.exports = defineConfig({
    projectId: 'cm8ts1',
    chromeWebSecurity: false,
    e2e: {
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
        experimentalStudio: true,
        testIsolation: false
    }
})
