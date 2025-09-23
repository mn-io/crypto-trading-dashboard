import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getBig } from '../bigJsStringCache';

const lastFetchMinAge = 5000;

export type ChartDatum = { time: number; price: string };

interface ChartState {
  data: ChartDatum[];
  status: 'idle' | 'loading' | 'failed';
}

const initialState: ChartState = {
  data: [],
  status: 'idle',
};

let lastFetch = 0;

let dataCache: ChartDatum[] = [];

export const fetchChartData = createAsyncThunk('chart/fetchData', async () => {
  const now = Date.now();
  if (now - lastFetch < lastFetchMinAge) {
    return dataCache;
  }
  console.log(`fetching new chart data from internal chart API`);
  const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/chart`);

  if (response.status !== 200) {
    console.error(`fetching new chart data failed with ${response.status}`, ' clearing data cache');
    dataCache = [];
    return [];
  }
  lastFetch = now;

  dataCache = (await response.json()).data as ChartDatum[];
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
        state.data = action.payload;
        state.status = 'idle';
      })
      .addCase(fetchChartData.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

const emptyChart: ChartDatum[] = [];
export const chartSelector = (state: { chart: { data: ChartDatum[] } }) => {
  const validData =
    state.chart.data &&
    state.chart.data.length > 0 &&
    (() => {
      try {
        state.chart.data.forEach((datum) => getBig(datum.price));
        return true;
      } catch {
        console.error('Price value is invalid, not a number (big.js), in:', state.chart.data[0]);
        return false;
      }
    })();

  return validData ? state.chart.data : emptyChart;
};

export default chartSlice.reducer;
