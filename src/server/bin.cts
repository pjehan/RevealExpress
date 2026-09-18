#!/usr/bin/env node
// Entry point kept in CommonJS: process managers such as pm2 load it with require(),
// which cannot load the ES modules of this package.
import('./cli.js').catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
