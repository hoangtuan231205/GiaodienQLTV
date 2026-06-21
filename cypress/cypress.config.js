const { defineConfig } = require("cypress");

module.exports = defineConfig({
    e2e: {
        baseUrl: "http://localhost:3000",
        specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
        supportFile: false,
        setupNodeEvents(on, config) {
            // Thiết lập các sự kiện nếu cần
        },
    },
    video: true
});
