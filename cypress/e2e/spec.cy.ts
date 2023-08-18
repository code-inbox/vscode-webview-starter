/// <reference types="cypress-iframe" />
import 'cypress-iframe'

// Cypress commands do not return their subjects, they *yield* them
// https://docs.cypress.io/guides/core-concepts/introduction-to-cypress
// const $cyElement = cy.get('.element') // does NOT work

describe('Smoke tests', () => {
    before(() => {
        cy.loadVSCode()
        // toggle developer tools
        cy.get('.monaco-workbench .content').its('0').should('not.be.null')
        cy.ensureViewContainerActive()
        cy.get(".monaco-workbench > div > iframe").iframeOnload().its('0').invoke('querySelector', 'iframe#active-frame').should('not.be.null')
            .then(iframe => cy.wrap(iframe)).its('0.contentDocument.body', {log: false}).should('not.be.empty').then(ifb => cy.wrap(ifb)).as('iframeBody')
    })
    it('features a button that when clicked, triggers a vscode informationMessage', function () {
        cy.wrap(this.iframeBody.find('script')).debug()
        // 

        // cy.get('.monaco-menu .action-item-menu').contains('View').click()

        // cy.get(".notification-list-item-message").should('contain', 'It works!')
    })
})




/**
 *      cy.get('.menubar-menu-title.toolbar-toggle-more.codicon.codicon-menubar-more').click()
        cy.get('.action-menu-item.monaco-submenu-item').contains('View').click()
        cy.get('.action-menu-item').contains('Command Palette').click()
        cy.type('Toggle developer tools')
        // type enter
        cy.type('{enter}')
 */