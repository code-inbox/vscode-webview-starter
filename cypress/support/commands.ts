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
    }
);

Cypress.Commands.add(
    'getWebviews', () => {
        // returns all iframes with class '.webview.ready
        // log the number of "body" elements
        return cy.get('.monaco-workbench').find('iframe');
    }
)