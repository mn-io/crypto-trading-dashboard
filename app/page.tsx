'use client';

import { Provider } from 'react-redux';

import AssetAccountSummary from './components/asset-account-summary';
import AssetChart from './components/asset-chart';
import AssetTransactionTable from './components/asset-transaction-table';
import { store } from './store';

export default function RootPage() {
  return (
    <Provider store={store}>
      <main className="min-h-screen p-6 sm:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
          <div className="order-1">
            <AssetAccountSummary />
          </div>

          <div className="order-3 lg:order-2">
            <AssetTransactionTable />
          </div>

          <div className="order-2 lg:order-3 lg:col-span-2">
            <AssetChart />
          </div>
        </div>
      </main>
    </Provider>
  );
}
