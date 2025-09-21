import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export type ChartDatum = { time: number; priceUsd: string };

interface ChartState {
  data: ChartDatum[];
  status: 'idle' | 'loading' | 'failed';
  maxPoints: number;
}

const initialState: ChartState = {
  data: [],
  status: 'idle',
  maxPoints: -1, // -1 = use all points (data.length)
};

let lastFetch = 0;

let dataCache: ChartDatum[] = [];

export const fetchChartData = createAsyncThunk('chart/fetchData', async () => {
  const now = Date.now();
  if (now - lastFetch < 5000) {
    // max every 5 sec
    return dataCache;
  }
  lastFetch = now;

  // interval choices m1 m5 m15 m30 h1 h2 h6 h12 d1
  const response = await fetch('https://rest.coincap.io/v3/assets/bitcoin/history?interval=d1', {
    headers: {
      Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_API_KEY_COINCAP,
      'Content-Type': 'application/json',
    },
  });

  const jsonObj = await response.json();
  dataCache = jsonObj.data as ChartDatum[];
  return dataCache;
});

const chartSlice = createSlice({
  name: 'chart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchChartData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchChartData.fulfilled, (state, action) => {
        if (state.maxPoints == -1) {
          state.data = action.payload;
        } else {
          state.data = action.payload.slice(0, state.maxPoints);
        }
        state.status = 'idle';
      })
      .addCase(fetchChartData.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default chartSlice.reducer;
