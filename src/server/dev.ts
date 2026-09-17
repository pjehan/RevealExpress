// Development entry point: serve the client through Vite (hot reload) instead of the built files
import fs from 'node:fs/promises';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import { hideBin } from 'yargs/helpers';
import { loadConfig } from './config.ts';
import { start } from './start.ts';

const rootDir = path.join(import.meta.dirname, '..', '..');

const vite = await createViteServer({
  configFile: path.join(rootDir, 'vite.config.ts'),
  server: { middlewareMode: true },
  appType: 'custom',
});

await start(
  loadConfig(hideBin(process.argv)),
  {
    middleware: vite.middlewares,
    indexHtml: async (url) =>
      vite.transformIndexHtml(
        url,
        await fs.readFile(path.join(rootDir, 'src/client/index.html'), 'utf-8'),
      ),
  },
  { openBrowser: false },
);
