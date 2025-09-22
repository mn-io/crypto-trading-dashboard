import { createSelector } from '@reduxjs/toolkit';
import Big from 'big.js';
import { TransactionDatum } from './transactionSlice';
import { RootState } from '.';

export type NetHolding = {
  totalAsset: string;
  totalUsd: string;
};

const selectTransactions = (state: RootState) => state.transactions.data;

export const selectNetHolding = createSelector(
  [selectTransactions],
  (transactions: TransactionDatum[]): NetHolding => {
    return transactions.reduce<NetHolding>(
      (acc, tx) => {
        if (tx.type === 'Buy') {
          acc.totalAsset = new Big(acc.totalAsset).plus(tx.amountAsset).toString();
          acc.totalUsd = new Big(acc.totalUsd).plus(tx.price).toString();
        } else if (tx.type === 'Sell') {
          acc.totalAsset = new Big(acc.totalAsset).minus(tx.amountAsset).toString();
          acc.totalUsd = new Big(acc.totalUsd).minus(tx.price).toString();
        }
        return acc;
      },
      { totalAsset: '0', totalUsd: '0' },
    );
  },
);
