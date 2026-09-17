import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import express, { type RequestHandler } from 'express';
import { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  PublicConfig,
  ServerToClientEvents,
  SlideIndices,
} from '../shared/types.ts';
import type { Config } from './config.ts';
import { renderIndex } from './html.ts';

/** How the browser client is served: Vite middleware in development, static files in production */
export interface ClientHandler {
  middleware: RequestHandler;
  indexHtml: (url: string) => Promise<string>;
}

/** Read every .html file of the presentation folder, in alphabetical order */
export async function readChapters(folder: string): Promise<string[]> {
  const files = (await fs.readdir(folder)).filter((file) => path.extname(file) === '.html').sort();
  return Promise.all(files.map((file) => fs.readFile(path.join(folder, file), 'utf-8')));
}

/** Create the HTTP server serving the slideshow, with the WebSocket server on the same port */
export function createServer(config: Config, client: ClientHandler): http.Server {
  const app = express();
  const server = http.createServer(app);
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, { serveClient: false });

  let currentSlide: SlideIndices | null = null;

  io.on('connection', (socket) => {
    socket.on('slidechanged', (indices) => {
      currentSlide = indices;
      socket.broadcast.emit('slidechanged', indices);
    });
    socket.on('currentslide', (callback) => {
      // A missing callback would throw and stop the server
      if (typeof callback === 'function') {
        callback(currentSlide);
      }
    });
    socket.on('quizsubmitted', (answers) => socket.broadcast.emit('quizsubmitted', answers));
  });

  const publicConfig: PublicConfig = {
    name: config.name,
    port: config.port,
    revealjs: config.revealjs,
  };

  app.get('/api/config', (req, res) => {
    res.json(publicConfig);
  });

  app.get('/api/chapters', async (req, res) => {
    res.json(await readChapters(config.path));
  });

  app.post('/api/check-password', express.json(), (req, res) => {
    const password: unknown = req.body?.password;
    res.json({ valid: config.password !== null && password === config.password });
  });

  app.use(config.assetspath, express.static(path.join(config.path, config.assetspath)));

  app.get(['/', '/index.html'], async (req, res) => {
    res.type('html').send(renderIndex(await client.indexHtml(req.originalUrl), config));
  });

  app.use(client.middleware);

  return server;
}

export function listen(server: http.Server, port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, () => {
      server.off('error', reject);
      resolve();
    });
  });
}
