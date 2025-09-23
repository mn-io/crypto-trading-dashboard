import React from 'react';
import RootPage from './page';

describe('<RootPage />', () => {
  it('renders', () => {
    cy.mount(<RootPage />);
    cy.contains('Aavilable').should('exist');
  });
});
