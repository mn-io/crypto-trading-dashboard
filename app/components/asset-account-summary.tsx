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
        <p>{netHolding.totalAsset.toString()} BTC</p>
        <p>{netHolding.totalUsd.toString()} $</p>
      </div>
    </section>
  );
}