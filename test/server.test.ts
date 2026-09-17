import assert from 'node:assert/strict';
import fs from 'node:fs';
import type http from 'node:http';
import type { AddressInfo } from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { io, type Socket } from 'socket.io-client';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SlideIndices,
} from '../src/shared/types.ts';
import type { Config } from '../src/server/config.ts';
import { createServer, listen } from '../src/server/server.ts';

type TestSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const template =
  '<html><head><!--revealexpress:head--></head><body><!--revealexpress:body--></body></html>';

function createPresentation(): string {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'revealexpress-server-'));
  fs.writeFileSync(path.join(folder, '02-second.html'), '<section>Second</section>');
  fs.writeFileSync(path.join(folder, '01-first.html'), '<section>First</section>');
  fs.writeFileSync(path.join(folder, 'notes.txt'), 'Not a chapter');
  fs.mkdirSync(path.join(folder, 'assets'));
  fs.writeFileSync(path.join(folder, 'assets', 'style.css'), 'body {}');
  return folder;
}

async function startServer(config: Partial<Config> = {}) {
  const server = createServer(
    {
      name: 'Test <slideshow>',
      port: 0,
      password: 'secret',
      revealjs: { controls: false },
      path: createPresentation(),
      assetspath: '/assets',
      stylesheets: ['assets/style.css'],
      javascripts: ['assets/script.js'],
      open: false,
      lang: 'en',
      ...config,
    },
    { middleware: (req, res, next) => next(), indexHtml: async () => template },
  );
  await listen(server, 0);
  return { server, url: `http://localhost:${(server.address() as AddressInfo).port}` };
}

function stopServer(server: http.Server): Promise<void> {
  return new Promise((resolve) => server.close(() => resolve()));
}

function checkPassword(url: string, password: unknown) {
  return fetch(`${url}/api/check-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  }).then((response) => response.json());
}

describe('HTTP routes', () => {
  let server: http.Server;
  let url: string;

  before(async () => ({ server, url } = await startServer()));
  after(() => stopServer(server));

  it('sends the public config without the password', async () => {
    const config = await fetch(`${url}/api/config`).then((response) => response.json());
    assert.deepEqual(config, { name: 'Test <slideshow>', port: 0, revealjs: { controls: false } });
  });

  it('checks the presenter password', async () => {
    assert.deepEqual(await checkPassword(url, 'secret'), { valid: true });
    assert.deepEqual(await checkPassword(url, 'wrong'), { valid: false });
    assert.deepEqual(await checkPassword(url, undefined), { valid: false });
  });

  it('sends HTML chapters in alphabetical order', async () => {
    const chapters = await fetch(`${url}/api/chapters`).then((response) => response.json());
    assert.deepEqual(chapters, ['<section>First</section>', '<section>Second</section>']);
  });

  it('renders the index with the title, stylesheets and javascripts', async () => {
    const html = await fetch(url).then((response) => response.text());
    assert.match(html, /<html lang="en">/);
    assert.match(html, /<title>Test &lt;slideshow&gt;<\/title>/);
    assert.match(html, /<link rel="stylesheet" href="assets\/style.css">/);
    assert.match(html, /<script src="assets\/script.js"><\/script>/);
  });

  it('serves the presentation assets', async () => {
    const response = await fetch(`${url}/assets/style.css`);
    assert.equal(response.status, 200);
    assert.equal(await response.text(), 'body {}');
  });
});

describe('presenter password not set', () => {
  it('refuses every password', async () => {
    const { server, url } = await startServer({ password: null });
    try {
      assert.deepEqual(await checkPassword(url, null), { valid: false });
      assert.deepEqual(await checkPassword(url, ''), { valid: false });
    } finally {
      await stopServer(server);
    }
  });
});

describe('WebSocket events', () => {
  let server: http.Server;
  let presenter: TestSocket;
  let spectator: TestSocket;

  function connect(url: string): Promise<TestSocket> {
    return new Promise((resolve, reject) => {
      const socket: TestSocket = io(url, { transports: ['websocket'], forceNew: true });
      socket.once('connect', () => resolve(socket));
      socket.once('connect_error', reject);
    });
  }

  function currentSlide(socket: TestSocket): Promise<SlideIndices | null> {
    return new Promise((resolve) => socket.emit('currentslide', resolve));
  }

  before(async () => {
    let url: string;
    ({ server, url } = await startServer());
    [presenter, spectator] = await Promise.all([connect(url), connect(url)]);
  });

  after(async () => {
    presenter.disconnect();
    spectator.disconnect();
    await stopServer(server);
  });

  it('has no current slide before the presenter shares one', async () => {
    assert.equal(await currentSlide(spectator), null);
  });

  it('broadcasts the presenter slide and remembers it for spectators who start following', async () => {
    const received = new Promise((resolve) => spectator.once('slidechanged', resolve));
    presenter.emit('slidechanged', { h: 3, v: 1 });
    assert.deepEqual(await received, { h: 3, v: 1 });
    assert.deepEqual(await currentSlide(spectator), { h: 3, v: 1 });
  });

  it('broadcasts quiz answers', async () => {
    const received = new Promise((resolve) => presenter.once('quizsubmitted', resolve));
    spectator.emit('quizsubmitted', [['browsers[]', 'Firefox']]);
    assert.deepEqual(await received, [['browsers[]', 'Firefox']]);
  });

  it('keeps running when a client asks the current slide without callback', async () => {
    (spectator as Socket).emit('currentslide');
    assert.deepEqual(await currentSlide(spectator), { h: 3, v: 1 });
  });
});
