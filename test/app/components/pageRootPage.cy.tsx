import { mount } from 'cypress/react';
import RootPage from '../../../app/page';

describe('<RootPage />', () => {
  beforeEach(() => {
    cy.fixture('chartCache.json').then((data) => {
      cy.intercept('GET', '/api/chart', { statusCode: 200, body: data }).as('getData');
    });
  });

  it('run first once', () => {
    mount(<RootPage />);
    cy.wait('@getData');

    cy.contains('Available').should('exist');
    cy.get('[data-cy=cash-text]').should('contain.text', '50.23');
  });

  it('add buy trade', () => {
    mount(<RootPage />);

    cy.get('[data-cy=trade-btn]').click();

    cy.get('[data-cy=price-input]').type('30');
    cy.get('[data-cy=amount-input]').should('have.value', '0.00026665772242148975');
    cy.get('[data-cy=price-input]').should('have.value', '30');
    cy.get('[data-cy=buy-btn]').click();
    cy.get('[data-cy=asset-text]').should('contain.text', '0.00336665772242148975');
    cy.get('[data-cy=asset-text]').should('contain.text', 'BTC');
    cy.get('[data-cy=cash-text]').should('contain.text', '80.23');
  });

  it('add sell trade', () => {
    mount(<RootPage />);

    cy.get('[data-cy=trade-btn]').click();

    cy.get('[data-cy=price-input]').type('30');
    cy.get('[data-cy=amount-input]').should('have.value', '0.00026665772242148975');
    cy.get('[data-cy=price-input]').should('have.value', '30');
    cy.get('[data-cy=sell-btn]').click();
    cy.get('[data-cy=asset-text]').should('contain.text', '0.0031');
    cy.get('[data-cy=asset-text]').should('contain.text', 'BTC');
    cy.get('[data-cy=cash-text]').should('contain.text', '50.23');
  });

  it('show error', () => {
    mount(<RootPage />);

    cy.get('[data-cy=trade-btn]').click();

    cy.get('[data-cy=price-input]').type('testing is great');
    cy.get('[data-cy=amount-input]').should('have.value', '');
    cy.get('[data-cy=price-input]').should('have.value', 'testing is great');
    cy.get('[data-cy=sell-btn]').click();
    cy.get('[data-cy=error-text]').should('contain.text', 'valid numbers in format: 123,456.0001');
  });

  it('clear and get recalculated price value', () => {
    mount(<RootPage />);

    cy.get('[data-cy=trade-btn]').click();

    cy.get('[data-cy=price-input]').type('30').blur().should('have.value', '30').clear().blur();
    cy.get('[data-cy=amount-input]').clear().type('123').blur();

    cy.get('[data-cy=price-input]').should('have.value', '13837964.13804');
  });
});
