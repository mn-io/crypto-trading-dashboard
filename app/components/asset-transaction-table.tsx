'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTransactionData, getNetHoldingSign } from '../store/transactionSlice';

const TransactionModal = dynamic(() => import('./add-trade-modal'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="flex items-center justify-center p-4">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
      </div>
    </div>
  ),
});

const dateFormatter = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

export default function AssetTransactionTable() {
  const data = useAppSelector((state) => state.transactions.data);
  const [openDialog, setOpenDialog] = useState(false);

  const now = Date.now();
  const today = dateFormatter.format(now);

  return (
    <section>
      {openDialog && <TransactionModal isOpen={openDialog} onClose={() => setOpenDialog(false)} />}

      <div className="mb-4">
        <button
          className="w-full primary-button-color font-semibold py-2 px-4 rounded cursor-pointer"
          onClick={() => setOpenDialog(true)}
        >
          Trade
        </button>
      </div>

      <div className="table-bg-color rounded-lg p-4 max-h-240 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td className="text-center">No trade data available</td>
              </tr>
            ) : (
              data.map((datum) => {
                const dateObj = new Date(datum.time);
                const date = dateFormatter.format(dateObj);
                const time = timeFormatter.format(dateObj);

                const netHoldingsing = getNetHoldingSign(datum.type);
                const netHoldingsingStr = netHoldingsing == 1 ? '+' : '-';
                const netHoldingsingInvertedStr = netHoldingsing == -1 ? '+' : '-';

                return (
                  <tr key={datum.time + datum.type}>
                    <td className="text-left pb-2 align-top">{datum.type}</td>
                    <td className="text-center font-semibold align-top">
                      {netHoldingsingInvertedStr}
                      {datum.amountAsset}&nbsp;
                      {process.env.NEXT_PUBLIC_ASSET} / {netHoldingsingStr}
                      {datum.price}&nbsp;
                      {process.env.NEXT_PUBLIC_PRICE_CURRENCY_SIGN}
                    </td>
                    <td className="text-right align-top">
                      {date != today ? date + ' ' : ''}
                      {time}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
