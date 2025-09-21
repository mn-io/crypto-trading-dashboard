import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import Big from "big.js";

export type TransactionDatum = {
    time: number;
    priceUsd: string;
    amountAsset: string;
    type: "Buy" | "Sell";
};

interface TransactionState {
    data: TransactionDatum[];
    pnl: string;          
    remainingAsset: string;  
    remainingCost: string;   // Total cost of remaining assets
    status: "idle" | "loading" | "failed";
};

export function getNetHoldingSign(type: string) {
    return type == "Buy" ? 1 : -1;
}


const initialState: TransactionState = {
    data: [],
    pnl: "0",
    remainingAsset: "0",
    remainingCost: "0",
    status: "idle",
};


const oneHour = 60 * 60 * 1000;
const dataCache: TransactionDatum[] = [
    { time: Date.now() - oneHour * 1, priceUsd: "50.23", amountAsset: "0.0031", type: "Buy" },
    { time: Date.now() - oneHour * 2, priceUsd: "50", amountAsset: "0.00221", type: "Sell" },
    { time: Date.now() - oneHour * 3, priceUsd: "50", amountAsset: "0.00221", type: "Buy" },
    { time: Date.now() - oneHour * 4, priceUsd: "50", amountAsset: "0.00221", type: "Sell" },
    { time: Date.now() - oneHour * 5, priceUsd: "50", amountAsset: "0.00221", type: "Buy" },
    { time: Date.now() - oneHour * 6, priceUsd: "50", amountAsset: "0.00221", type: "Sell" },
    { time: Date.now() - oneHour * 7, priceUsd: "50", amountAsset: "0.00221", type: "Buy" },
    { time: Date.now() - oneHour * 8, priceUsd: "50", amountAsset: "0.00221", type: "Sell" },
    { time: Date.now() - oneHour * 9, priceUsd: "50", amountAsset: "0.00221", type: "Buy" },
];

export const fetchTransactionData = createAsyncThunk("transaction/fetchData", async () => {
    return dataCache;
});

 function addTransactionDataImpl(state: TransactionState, transaction: TransactionDatum) {
            state.data.unshift(transaction);

            const price = new Big(transaction.priceUsd);
            const amount = new Big(transaction.amountAsset);
            let totalAsset = new Big(state.remainingAsset);
            let totalCost = new Big(state.remainingCost);
            let totalPnL = new Big(state.pnl);

            if (transaction.type === "Buy") {
                totalCost = totalCost.plus(price.times(amount));
                totalAsset = totalAsset.plus(amount);
            } else if (transaction.type === "Sell") {
                const avgCost = totalCost.div(totalAsset);
                const pnl = price.minus(avgCost).times(amount);
                totalPnL = totalPnL.plus(pnl);

                totalAsset = totalAsset.minus(amount);
                totalCost = totalCost.minus(avgCost.times(amount));
            }

            state.remainingAsset = totalAsset.toString();
            state.remainingCost = totalCost.toString();
            state.pnl = totalPnL.toString();
        };

const transactionSlice = createSlice({
    name: "transaction",
    initialState,
    reducers: {
        addTransactionData: (state: TransactionState, action: PayloadAction<TransactionDatum>) => addTransactionDataImpl(state, action.payload)
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTransactionData.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchTransactionData.fulfilled, (state, action) => {
                action.payload.reverse().forEach((transaction) => addTransactionDataImpl(state, transaction));
                state.status = "idle";
            })
            .addCase(fetchTransactionData.rejected, (state) => {
                state.status = "failed";
            });
    },
});

export const { addTransactionData } = transactionSlice.actions;
export default transactionSlice.reducer;