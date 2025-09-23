import { spawn, ChildProcess } from 'child_process';

export type TestServer = {
  serverProc: ChildProcess;
  host: string;
};

// process.env.NEXT_PUBLIC_HOST is populated in jest.setup.ts

export async function startTestServer(
  host: string = process.env.NEXT_PUBLIC_HOST || 'http://localhost:3002',
): Promise<TestServer> {
  let port: number;
  try {
    const url = new URL(host);
    port = url.port ? parseInt(url.port, 10) : -1;
  } catch {
    throw new Error(`Port malformed in NEXT_PUBLIC_HOST '${host}' in .env.test`);
  }

  if (port === -1) {
    throw new Error(`Port malformed in NEXT_PUBLIC_HOST '${host}' in .env.test`);
  }

  const serverProc = spawn('next', ['dev', '--turbopack', '--port', String(port)], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env },
  });

  serverProc.stdout.on('data', (data) => console.log('SERVER STDOUT:', data.toString()));
  serverProc.stderr.on('data', (data) => console.error('SERVER STDERR:', data.toString()));

  const url = `${host}/favicon.png`;
  const start = Date.now();
  const maxTimeout = 15_000;

  while (Date.now() - start < maxTimeout - 1000) {
    try {
      console.log(`Polling ${url} until server is ready.`);
      const res = await fetch(url);
      if (res.ok) {
        console.log('Server is ready');
        break;
      }
    } catch {
      // ignore and retry
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return { serverProc, host };
}

export async function stopTestServer(serverProc: ChildProcess) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  serverProc.kill('SIGTERM');

  await new Promise((resolve) => setTimeout(resolve, 1000));
  if (serverProc.stdout) {
    serverProc.stdout.on('data', () => {});
  }
  if (serverProc.stderr) {
    serverProc.stderr.on('data', () => {});
  }
}
