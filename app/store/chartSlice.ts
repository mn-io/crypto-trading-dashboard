import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const hours24InMillis = 24 * 60 * 60 * 1000;
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
  lastFetch = now;

  const response = await fetch(process.env.NEXT_PUBLIC_API_URI_COINCAP || '', {
    headers: {
      Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_API_KEY_COINCAP,
      'Content-Type': 'application/json',
    },
  });

  const data = (await response.json()).data as any[];
  dataCache = data.map((datum) => {
    const price = datum[process.env.NEXT_PUBLIC_API_PRICE_PROPERTY_NAME || ''];
    if (!price) {
      console.error(
        `price could not be retrieved from incoming data, looking for property with name '${process.env.NEXT_PUBLIC_API_PRICE_PROPERTY_NAME}' in`,
        datum,
      );
    }
    return {
      time: datum.time,
      price,
    } as ChartDatum;
  });

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
        const hours24AgoInMillis = Date.now() - hours24InMillis;
        state.data = action.payload.filter(
          (chartDatum) =>
            chartDatum.time > hours24AgoInMillis && !!chartDatum.price && chartDatum.price !== '',
        );
        state.status = 'idle';
      })
      .addCase(fetchChartData.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default chartSlice.reducer;
