import { configureStore } from "@reduxjs/toolkit";
import chartReducer from "./chartSlice";
import transactionReducer from "./transactionSlice";

export const store = configureStore({
  reducer: {
    chart: chartReducer,
    transactions: transactionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
