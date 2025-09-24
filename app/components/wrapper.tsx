'use client';

import { useEffect } from 'react';
import { fetchChartData } from '../store/chartSlice';
import { useAppDispatch, useInterval } from '../store/hooks';
import { fetchTransactionData } from '../store/transactionSlice';
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

  useEffect(() => {
    dispatch(fetchTransactionData());
  }, [dispatch]);

  return (
    <main className="min-h-screen min-w-[420px] p-6 sm:p-12">
      <div className="grid grid-cols-2 gap-6 items-start">
        <div className="font-medium w-[62px] lg:order-1">
          <img src="/icon.png" width="62" />
        </div>

        <div className="ml-auto lg:order-2">
          <AssetAccountSummary />
        </div>

        <div className="lg:w-[451px] col-span-2 lg:col-span-1 lg:ml-auto lg:order-3">
          <AssetTransactionTable />
        </div>

        <div className="col-span-2 lg:col-span-3 lg:order-4">
          <AssetChart />
        </div>
      </div>
    </main>
  );
}
