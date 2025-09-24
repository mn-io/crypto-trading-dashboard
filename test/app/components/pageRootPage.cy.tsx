import RootPage from '../../../app/page';

describe('<RootPage />', () => {
  it('renders', () => {
    cy.fixture('chartCache.json').then((data) => {
      cy.intercept('GET', '/api/chart', {
        statusCode: 200,
        body: data,
      }).as('getData');

      cy.mount(<RootPage />);

      cy.wait('@getData');
      cy.contains('Available').should('exist');
    });
  });
});
