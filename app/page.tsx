'use client';

import { Provider } from 'react-redux';

import Wrapper from './components/wrapper';
import { store } from './store';

export default function RootPage() {
  return (
    <Provider store={store}>
      <Wrapper />
    </Provider>
  );
}
