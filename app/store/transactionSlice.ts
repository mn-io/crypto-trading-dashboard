import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { createNewTransactionDatum, TransactionDatum } from "./transaction";

interface TransactionState {
    data: TransactionDatum[];
    status: "idle" | "loading" | "failed";
};

const initialState: TransactionState = {
    data: [],
    status: "idle",
};

const oneHour = 60 * 60 * 1000;
const dataCache: TransactionDatum[] = [
    createNewTransactionDatum({ time: Date.now() - oneHour * 1, totalPriceUsd: "50.23", totalAmountAsset: "0.0031", type: "Buy" }),
    createNewTransactionDatum({ time: Date.now() - oneHour * 2, totalPriceUsd: "50", totalAmountAsset: "0.00221", type: "Sell" }),
    createNewTransactionDatum({ time: Date.now() - oneHour * 3, totalPriceUsd: "50", totalAmountAsset: "0.00221", type: "Buy" }),
    createNewTransactionDatum({ time: Date.now() - oneHour * 4, totalPriceUsd: "50", totalAmountAsset: "0.00221", type: "Sell" }),
    createNewTransactionDatum({ time: Date.now() - oneHour * 5, totalPriceUsd: "50", totalAmountAsset: "0.00221", type: "Buy" }),
    createNewTransactionDatum({ time: Date.now() - oneHour * 6, totalPriceUsd: "50", totalAmountAsset: "0.00221", type: "Sell" }),
    createNewTransactionDatum({ time: Date.now() - oneHour * 7, totalPriceUsd: "50", totalAmountAsset: "0.00221", type: "Buy" }),
    createNewTransactionDatum({ time: Date.now() - oneHour * 8, totalPriceUsd: "50", totalAmountAsset: "0.00221", type: "Sell" }),
    createNewTransactionDatum({ time: Date.now() - oneHour * 9, totalPriceUsd: "50", totalAmountAsset: "0.00221", type: "Buy" }),
];

export const fetchTransactionData = createAsyncThunk("transaction/fetchData", async () => {
    return dataCache;
});

const transactionSlice = createSlice({
    name: "transaction",
    initialState,
    reducers: {
        addTransactionData: (state, action: PayloadAction<TransactionDatum>) => {
            state.data.unshift(action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTransactionData.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchTransactionData.fulfilled, (state, action) => {
                state.data = action.payload;
                state.status = "idle";
            })
            .addCase(fetchTransactionData.rejected, (state) => {
                state.status = "failed";
            });
    },
});

export const { addTransactionData } = transactionSlice.actions;
export default transactionSlice.reducer;