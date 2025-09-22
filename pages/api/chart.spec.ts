import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { readChartCacheIfEmpty } from './chart';

jest.mock('fs/promises');

let serverProc: ChildProcessWithoutNullStreams;

beforeAll(async () => {
  serverProc = spawn('next', ['dev', '--turbopack'], { stdio: ['pipe', 'pipe', 'pipe'] });

  serverProc.stdout.on('data', (data) => {
    console.log('SERVER STDOUT:', data.toString());
  });

  serverProc.stderr.on('data', (data) => {
    console.error('SERVER STDERR:', data.toString());
  });

  await new Promise((resolve) => setTimeout(resolve, 1500));
});

afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  serverProc.kill('SIGTERM');

  await new Promise((resolve) => setTimeout(resolve, 1000));
  serverProc.stdout.on('data', () => {});
  serverProc.stderr.on('data', () => {});
});

const localApi = 'http://localhost:3000/api/chart';

describe('API /api/chart', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns cached data if available', async () => {
    const dataCache = await readChartCacheIfEmpty();
    expect(dataCache.length).toEqual(118);

    const res = await fetch(localApi);

    console.log(res);
    expect(res.status).toBe(200);
    const json = await res.json();
    console.log(json);
    //expect(json.data).toEqual(dataCache);
  }, 20000);

  //   it('fetches from CoinCap API if no cache', async () => {
  //     (fs.readFile as jest.Mock).mockRejectedValue(new Error('No file'));

  //     // process.env.API_KEY_COINCAP = 'dummy';
  //     // process.env.API_URI_COINCAP = 'https://api.fake.com';
  //     // process.env.API_PRICE_PROPERTY_NAME = 'priceUsd';

  //     const res = await fetch(localApi);
  //     console.log(res);
  //     expect(res.status).toBe(200);

  //     const json = await res.json();
  //     console.log(json);
  //   });
});
