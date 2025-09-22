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
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.length).toBe(118);
    expect(json.data).toEqual(dataCache);
  }, 20000);
});
