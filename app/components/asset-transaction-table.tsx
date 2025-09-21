'use client'

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchTransactionData } from "../store/transactionSlice";
import TransactionModal from "./add-trade-modal";
import { getNetHoldingSign, TransactionDatum } from "../store/transaction";

const dateFormatter = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

const timeFormatter = new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
});

export default function AssetTransactionTable() {
  const dispatch = useAppDispatch();
  const data: TransactionDatum[] = useAppSelector((state) => state.transactions.data);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    dispatch(fetchTransactionData());
  }, [dispatch]);

  const now = Date.now();
  const today = dateFormatter.format(now);

  return (
    <section>
      <TransactionModal isOpen={openDialog} onClose={() => setOpenDialog(false)} />
        
      <div className="mb-4">
        <button
          className="w-full primary-button-color font-semibold py-2 px-4 rounded cursor-pointer"
          onClick={() => setOpenDialog(true)}
        >
          Trade
        </button>
      </div>

      <div className="max-h-64 overflow-y-auto table-bg-color rounded-xl p-4">
        <table className="w-full text-left border-collapse">
          <tbody>
            {data.map((datum) => {
              const dateObj = new Date(datum.time);
              const date = dateFormatter.format(dateObj);
              const time = timeFormatter.format(dateObj);

              const netHoldingsing = getNetHoldingSign(datum.type);
              const netHoldingsingStr = netHoldingsing == 1 ? "+" : "-"
              const netHoldingsingInvertedStr = netHoldingsing == -1 ? "+" : "-"

              return (
                <tr key={datum.time + datum.type}>
                  <td className="text-left pb-2">{datum.type}</td>
                  <td className="text-center font-semibold">
                    {netHoldingsingInvertedStr + datum.totalAmountAsset + "BTC / " + netHoldingsingStr + datum.totalPriceUsd + " $"}
                  </td>
                  <td className="text-right">
                    {date != today ? date + " " : ""}
                    {time}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}