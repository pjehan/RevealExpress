import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import open from 'open';
import type { Config } from './config.ts';
import { createServer, listen, type ClientHandler } from './server.ts';

/** Return the first external IPv4 address of this machine, so the audience can reach the slideshow */
export function getIpAddress(): string {
  for (const addresses of Object.values(os.networkInterfaces())) {
    for (const address of addresses ?? []) {
      if (address.family === 'IPv4' && !address.internal) {
        return address.address;
      }
    }
  }
  return '127.0.0.1';
}

export async function start(
  config: Config,
  client: ClientHandler,
  options: { openBrowser: boolean },
) {
  const assetsPath = path.join(config.path, config.assetspath);
  if (!fs.existsSync(assetsPath)) {
    console.warn(`Assets directory ${assetsPath} does not exist`);
  }

  const server = createServer(config, client);
  try {
    await listen(server, config.port);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'EADDRINUSE' || code === 'EACCES') {
      console.error(
        code === 'EADDRINUSE'
          ? `Port ${config.port} is already in use`
          : `Port ${config.port} requires elevated privileges`,
      );
      process.exit(1);
    }
    throw error;
  }

  const url = `http://${getIpAddress()}:${config.port}`;
  console.log(`Slideshow "${config.name}" available at ${url}`);

  if (options.openBrowser) {
    await open(url).catch(() => console.warn('Unable to open the browser'));
  }
}
