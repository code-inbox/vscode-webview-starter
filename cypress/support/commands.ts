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
        iframeOnload(args?: any): any;
        iframeDirect(args?: any): any;

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
                cy.stub(win.console, 'warn')
                    .as('consoleWarn')
                    .callsFake((message) =>
                        Cypress.log({
                            name: 'warnnn',
                            message,
                        })
                    );
                cy.stub(win.console, 'log')
                    .as('consoleLog')
                    .callsFake((message) =>
                        Cypress.log({
                            name: 'loggg',
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
        .its('0', {log: false}).invoke('querySelector', 'iframe#active-frame').should('not.be.null')
        .then(iframe => cy.wrap(iframe, {log: false}))
        .its('0.contentDocument.body', {log: false}).should('not.be.empty')
        .then((body) => cy.wrap(body, {log: false}))
        .its('0', {log: false}).invoke('querySelector', 'button').should('not.be.null') // todo check for emptiness
    // .then((root) => cy.wrap(root, {log: false}))
})

Cypress.Commands.add('ensureViewContainerActive', () => {
    cy.get('.composite-bar .actions-container .action-item').its('0')
        .then(item => cy.wrap(item).click())
        .then(() => {
            cy.get('.composite-bar .actions-container .action-item').should('have.length', 6).its('5')
                .then(item => cy.wrap(item).click())
        })
})

Cypress.Commands.add('iframeOnload', {prevSubject: 'element'}, $iframe => {
    return new Cypress.Promise(resolve => {
        $iframe.on('load', () => {
            resolve($iframe.contents().find('body'));
        });
    });
});

Cypress.Commands.add('iframeDirect', {prevSubject: 'element'}, $iframe => {
    return new Cypress.Promise(resolve => {
        resolve($iframe.contents().find('body'));
    });
});