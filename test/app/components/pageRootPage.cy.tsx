import RootPage from '../../../app/page';

describe('<RootPage />', () => {
  it('renders', () => {
    cy.mount(<RootPage />);
    cy.contains('Available').should('exist');
  });
});
