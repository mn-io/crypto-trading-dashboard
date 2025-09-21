import { createSelector } from "@reduxjs/toolkit";
import { TransactionDatum } from "./transaction";
import { RootState } from ".";

export type NetHolding = {
    totalAsset: number;
    totalUsd: number;
};

export function getNetHoldingSign(type: string) {
    return type == "Buy" ? 1 : -1;
}

const selectTransactions = (state: RootState) => state.transactions.data;

export const selectNetHolding = createSelector(
    [selectTransactions],
    (transactions: TransactionDatum[]): NetHolding => {
        const initNetHolding = { totalAsset: 0, totalUsd: 0 } as NetHolding;
        return transactions.reduce(
            (acc, tx) => {
                if (tx.type === "Buy") {
                    acc.totalAsset += tx.totalAmountAssetNumber;
                    acc.totalUsd += tx.totalPriceUsdNumber;
                } else if (tx.type === "Sell") {
                    acc.totalAsset -= tx.totalAmountAssetNumber;
                    acc.totalUsd -= tx.totalPriceUsdNumber;
                }
                return acc;
            },
            initNetHolding
        );
    }
);
