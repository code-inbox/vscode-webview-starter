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
            onLoad(win) {
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

Cypress.Commands.add('ensureViewContainerActive', () => {
    cy.get('.composite-bar .actions-container .action-item')
        .its('0').then(item => cy.wrap(item).click())
        .then(() => {
            cy.get('.composite-bar .actions-container .action-item').should('have.length', 6).its('5')
                .then(item => cy.wrap(item).click())
        })
})
