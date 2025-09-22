import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getBig } from '../bigJsStringCache';

export type TransactionDatum = {
  time: number;
  price: string;
  amountAsset: string;
  type: 'Buy' | 'Sell';
};

export interface TransactionState {
  data: TransactionDatum[];
  pnl: string;
  totalAsset: string;
  totalCost: string; // Total cost of remaining assets
  totalCash: string; // Total net holding in currency
  status: 'idle' | 'loading' | 'failed';
}

export function getNetHoldingSign(type: string) {
  return type == 'Buy' ? 1 : -1;
}

const initialState: TransactionState = {
  data: [],
  pnl: '0',
  totalAsset: '0',
  totalCost: '0',
  totalCash: '0',
  status: 'idle',
};

const oneHour = 60 * 60 * 1000;
const dataCache: TransactionDatum[] = [
  { time: Date.now() - oneHour * 1, price: '50.23', amountAsset: '0.0031', type: 'Buy' },
  { time: Date.now() - oneHour * 2, price: '50', amountAsset: '0.00221', type: 'Sell' },
  { time: Date.now() - oneHour * 3, price: '50', amountAsset: '0.00221', type: 'Buy' },
  { time: Date.now() - oneHour * 4, price: '50', amountAsset: '0.00221', type: 'Sell' },
  { time: Date.now() - oneHour * 5, price: '50', amountAsset: '0.00221', type: 'Buy' },
  { time: Date.now() - oneHour * 6, price: '50', amountAsset: '0.00221', type: 'Sell' },
  { time: Date.now() - oneHour * 7, price: '50', amountAsset: '0.00221', type: 'Buy' },
  { time: Date.now() - oneHour * 8, price: '50', amountAsset: '0.00221', type: 'Sell' },
  { time: Date.now() - oneHour * 9, price: '50', amountAsset: '0.00221', type: 'Buy' },
];

export const fetchTransactionData = createAsyncThunk('transaction/fetchData', async () => {
  return dataCache;
});

function addTransactionDataImpl(state: TransactionState, transaction: TransactionDatum) {
  state.data.unshift(transaction);

  const price = getBig(transaction.price);
  const amount = getBig(transaction.amountAsset);
  let totalAsset = getBig(state.totalAsset);
  let totalCost = getBig(state.totalCost);
  let totalPnL = getBig(state.pnl);
  let totalCash = getBig(state.totalCash);

  if (transaction.type === 'Buy') {
    totalCost = totalCost.plus(price.times(amount));
    totalAsset = totalAsset.plus(amount);
    totalCash = totalCash.plus(price);
  } else if (transaction.type === 'Sell') {
    const avgCost = totalCost.div(totalAsset);
    const pnl = price.minus(avgCost).times(amount);
    totalPnL = totalPnL.plus(pnl);

    totalAsset = totalAsset.minus(amount);
    totalCost = totalCost.minus(avgCost.times(amount));
    totalCash = totalCash.minus(price);
  }

  state.totalAsset = totalAsset.toString();
  state.totalCost = totalCost.toString();
  state.pnl = totalPnL.toString();
  state.totalCash = totalCash.toString();
}

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    addTransactionData: (state: TransactionState, action: PayloadAction<TransactionDatum>) =>
      addTransactionDataImpl(state, action.payload),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactionData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTransactionData.fulfilled, (state, action) => {
        action.payload
          .reverse()
          .forEach((transaction) => addTransactionDataImpl(state, transaction));
        state.status = 'idle';
      })
      .addCase(fetchTransactionData.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export const { addTransactionData } = transactionSlice.actions;
export default transactionSlice.reducer;
