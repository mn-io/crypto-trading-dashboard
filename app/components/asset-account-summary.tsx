'use client'

import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectNetHolding } from "../store/netHolding";

export default function AssetAccountSummary() {
  const dispatch = useAppDispatch();
  const netHolding = useAppSelector(selectNetHolding);

  return (
    <section className="p-4 flex items-start justify-between">
      <div className="font-medium">
        <img src="/icon.png" />
      </div>
      <div className="text-right text-sm">
        <p>Aavilable</p>
        <p>{netHolding.totalAsset.toString()} <span className="font-bold">BTC</span></p>
        <p>{netHolding.totalUsd.toString()} <span className="font-bold">$</span></p>
      </div>
    </section>
  );
}