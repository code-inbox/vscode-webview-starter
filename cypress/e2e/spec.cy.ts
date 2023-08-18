/// <reference types="cypress-iframe" />
import 'cypress-iframe'

// Cypress commands do not return their subjects, they *yield* them
// https://docs.cypress.io/guides/core-concepts/introduction-to-cypress
// const $cyElement = cy.get('.element') // does NOT work

describe('Smoke tests', () => {
    before(() => {
        cy.loadVSCode()
    })
    it('features a button that when clicked, triggers a vscode informationMessage', () => {
        cy.get('.monaco-workbench .content').its('0').should('not.be.null')
        cy.ensureViewContainerActive()
        cy.getIframeBody().within(body => {
            body.find('button').click()

        })
        // cy.get(".notification-list-item-message").should('contain', 'It works!')
    })
})