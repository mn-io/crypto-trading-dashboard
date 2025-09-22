// pages/api/chart.ts
import type { NextApiRequest, NextApiResponse } from 'next';

const hours24InMillis = 24 * 60 * 60 * 1000;
const propertyName = process.env.API_PRICE_PROPERTY_NAME || '';

export type ChartDatum = { time: number; price: string };

// Original CoinCap data (may have extra properties)
type CoinCapDatum = Record<string, unknown> & { time: number };

function mapCoinCapDatum(datum: CoinCapDatum, earliestDate: number): ChartDatum | null {
  const price = datum[propertyName];
  if (typeof price !== 'string') {
    console.error(`Invalid or missing property '${propertyName}' in datum:`, datum);
    return null;
  }

  if (price === '') {
    console.error(`Price is empty:`, datum);
    return null;
  }

  if (datum.time < earliestDate) {
    console.warn(`Datum is too early:`, datum);
    return null;
  }

  return { time: datum.time, price };
}

let dataCache: ChartDatum[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ data: ChartDatum[] }>,
) {
  try {
    if (dataCache.length > 0) {
      console.log('serving from data cache');
      res.status(200).json({ data: dataCache });
      return;
    }
    console.log(`fetching new chart data from ${process.env.API_URI_COINCAP}`);
    const response = await fetch(process.env.API_URI_COINCAP || '', {
      headers: {
        Authorization: `Bearer ${process.env.API_KEY_COINCAP}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('CoinCap API error:', response.status);
      return res.status(500).json({ data: [] });
    }

    const rawData = await response.json();
    const hours24AgoInMillis = Date.now() - hours24InMillis;

    const data: ChartDatum[] = rawData.data
      .map((datum: CoinCapDatum) => mapCoinCapDatum(datum, hours24AgoInMillis))
      .filter((d: CoinCapDatum): d is ChartDatum => d !== null);

    dataCache = data;

    res.status(200).json({ data });
  } catch (err) {
    console.error('Error fetching chart data:', err);
    res.status(500).json({ data: [] });
  }
}
