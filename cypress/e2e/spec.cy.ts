function withinView(viewId: string, cb: (body: JQuery<any>) => any) {
    cy.get('.monaco-workbench > div > iframe').first().should(iframe => expect(iframe.contents().find(`iframe#active-frame[title="${viewId}"]`)).to.exist)
        .then(iframe => cy.wrap(iframe.contents().find(`iframe[title="${viewId}"]`)))
        .then(iframe => {
            cy.log('iframe', iframe)
            cy.wrap(iframe).should(iframe => expect(iframe.contents().find('body')).to.exist).then(iframe => {
                cy.wrap(iframe.contents().find('body')).then(body => {
                    cy.wrap(body).should(body => expect(body.find('div').children().length).to.be.gte(1)).within({}, body => {
                        cb(body)
                    })

                })
            })
        })
}


describe('template spec', () => {
    beforeEach(() => {
        cy.loadVSCode()
    })
    it('adds a dedicated icon to the activity bar, taking the total icons from 5 to 6', () => {
        // first check that the icon has loaded in the sidebar
        cy.get('.composite-bar .actions-container').find('li.action-item.icon').should('have.length', 6)
    })
    it('has two webviews', () => {
        cy.get('.monaco-workbench > div > iframe').should('have.length', 2)
    })
    it('one webview contains an information button that triggers showInformationMessage', () => {
        withinView("box", body => {
            body.find('button').click()
        })
        cy.get(".notification-list-item-message").should('contain', 'It works!')
    })
})