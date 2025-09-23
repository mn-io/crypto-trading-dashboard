import { readChartCacheIfEmpty } from '../../../pages/api/chart';
import { startTestServer, stopTestServer, TestServer } from '../../baseTest';

jest.mock('fs/promises');

let testServer: TestServer;

beforeAll(async () => {
  testServer = await startTestServer();
}, 5000);

afterAll(async () => {
  await stopTestServer(testServer.serverProc);
}, 5000);

describe('API /api/chart', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns cached data if available', async () => {
    const dataCache = await readChartCacheIfEmpty();
    expect(dataCache.length).toBe(118);

    const localApi = `${process.env.NEXT_PUBLIC_HOST}/api/chart`;

    const res = await fetch(localApi);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.length).toBe(118);
    expect(json.data).toEqual(dataCache);
  });
});
