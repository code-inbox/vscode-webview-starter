// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

declare namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Chainable<Subject> {
        loadVSCode(): void;
        getWebviews(): Chainable<any>;
        getIframeBody(): Chainable<any>;
        ensureViewContainerActive(): Chainable<any>;
    }
}

Cypress.Commands.add(
    'loadVSCode',
    (
    ) => {
        const url = "http://localhost:8080";
        cy.visit(url, {
            onBeforeLoad(win) {
                cy.stub(win.console, 'error')
                    .as('consoleError')
                    .callsFake((message) =>
                        Cypress.log({
                            name: 'error',
                            message,
                        })
                    );
            },
        });
        cy.getIframeBody
    }
);

Cypress.Commands.add(
    'getWebviews', () => {
        // returns all iframes with class '.webview.ready
        // log the number of "body" elements
        return cy.get('.monaco-workbench').find('iframe');
    }
)


Cypress.Commands.add('getIframeBody', () => {
    // get the iframe > document > body
    // and retry until the body element is not empty
    cy.log('getIframeBody')

    return cy
        .get('.monaco-workbench > div > iframe', {log: false}).should('have.length', 2)
        .its('0.contentDocument.body', {log: false}).should('not.be.empty')
        .then((body) => cy.wrap(body, {log: false}))
        .its('0.childNodes', {log: false, timeout: 15000}).should('have.length.gte', 4)
        .its('3', {log: false}).should('have.id', 'active-frame')
        .then(iframe => cy.wrap(iframe, {log: false}))
        .its('0.contentDocument.body', {log: false}).should('not.be.empty')
        .then((body) => cy.wrap(body, {log: false}))
        .find('div#root', {log: false})
        .then((root) => cy.wrap(root, {log: false}))
        .should('not.be.empty')
        .then((body) => cy.wrap(body, {log: false}))
})

Cypress.Commands.add('ensureViewContainerActive', () => {
    cy.get('.composite-bar .actions-container .action-item').its('0')
        .then(item => cy.wrap(item).click())
        .then(() => {
            cy.get('.composite-bar .actions-container .action-item').should('have.length', 6).its('5')
                .then(item => cy.wrap(item).click())
        })
})