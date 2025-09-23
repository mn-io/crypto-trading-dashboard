import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import RootPage from './page';
import { store } from './store';

describe('RootPage', () => {
  it('renders Wrapper component', () => {
    render(
      <Provider store={store}>
        <RootPage />
      </Provider>,
    );

    expect(screen.getByText(/some text from Wrapper/i)).toBeInTheDocument();
  });
});
