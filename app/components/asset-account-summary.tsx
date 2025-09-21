'use client'

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchTransactionData } from "../store/transactionSlice";
import { calcuateTotalNetHoldingAsset, calcuateTotatNetPriceUsd, TransactionDatum } from "../store/transaction";

export default function AssetAccountSummary() {
  const dispatch = useAppDispatch();
  const data: TransactionDatum[] = useAppSelector((state) => state.transactions.data);

  useEffect(() => {
    dispatch(fetchTransactionData());
  }, [dispatch]);

  //TODO: add cache
  const amountAsset = calcuateTotalNetHoldingAsset(data);
  const amountPriceUsd = calcuateTotatNetPriceUsd(data);

  return (
    <section className="p-4 flex items-start justify-between">
      <div className="font-medium">
        <img src="/icon.png" />
      </div>
      <div className="text-right text-sm">
        <p>Aavilable</p>
        <p>{amountAsset} BTC</p>
        <p>{amountPriceUsd} $</p>
      </div>
    </section>
  );
}