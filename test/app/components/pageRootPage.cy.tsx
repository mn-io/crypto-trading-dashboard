import React from 'react';
import RootPage from '../../../app/page';

describe('<RootPage />', () => {
  it('renders', () => {
    cy.mount(<RootPage />);
    cy.contains('Aavilable').should('exist');
  });
});
