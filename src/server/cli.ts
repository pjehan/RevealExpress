#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import express from 'express';
import { hideBin } from 'yargs/helpers';
import { loadConfig } from './config.ts';
import { start } from './start.ts';

// Built client files are next to the built server: dist/client and dist/server
const clientDir = path.join(import.meta.dirname, '..', 'client');
const indexHtml = fs.readFile(path.join(clientDir, 'index.html'), 'utf-8');

const config = loadConfig(hideBin(process.argv));

await start(
  config,
  {
    middleware: express.static(clientDir, { index: false }),
    indexHtml: () => indexHtml,
  },
  { openBrowser: config.open },
);
