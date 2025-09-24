'use client';

import { useAppSelector } from '../store/hooks';

export default function AssetAccountSummary() {
  const totalAsset = useAppSelector((state) => state.transactions.totalAsset);
  const totalCash = useAppSelector((state) => state.transactions.totalCash);

  return (
    <section>
      <div className="text-right text-sm">
        <p>Available</p>
        <p>
          {totalAsset}&nbsp;<span className="font-bold">{process.env.NEXT_PUBLIC_ASSET}</span>
        </p>
        <p>
          {totalCash}&nbsp;
          <span className="font-bold">{process.env.NEXT_PUBLIC_PRICE_CURRENCY_SIGN}</span>
        </p>
      </div>
    </section>
  );
}
