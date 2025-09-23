'use client';

import { useAppSelector } from '../store/hooks';

export default function AssetAccountSummary() {
  const totalAsset = useAppSelector((state) => state.transactions.totalAsset);
  const totalCash = useAppSelector((state) => state.transactions.totalCash);

  return (
    <section className="p-4 flex items-start justify-between">
      <div className="font-medium">
        <img src="/icon.png" />
      </div>
      <div className="text-right text-sm">
        <p>Available</p>
        <p>
          {totalAsset} <span className="font-bold">{process.env.NEXT_PUBLIC_ASSET}</span>
        </p>
        <p>
          {totalCash}{' '}
          <span className="font-bold">{process.env.NEXT_PUBLIC_PRICE_CURRENCY_SIGN}</span>
        </p>
      </div>
    </section>
  );
}
