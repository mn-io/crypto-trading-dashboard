'use client';

import { useEffect } from 'react';
import { fetchChartData } from '../store/chartSlice';
import { useAppDispatch, useInterval } from '../store/hooks';
import AssetAccountSummary from './asset-account-summary';
import AssetChart from './asset-chart';
import AssetTransactionTable from './asset-transaction-table';

const fetchNewchartDataInMillis = 60_000;

export default function Wrapper() {
  const dispatch = useAppDispatch();

  useInterval(() => {
    dispatch(fetchChartData());
  }, fetchNewchartDataInMillis);

  useEffect(() => {
    dispatch(fetchChartData());
  }, [dispatch]);

  return (
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
  );
}
