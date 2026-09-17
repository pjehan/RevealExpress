import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import yargs from 'yargs';
import type { PublicConfig } from '../shared/types.ts';

export interface Config extends PublicConfig {
  password: string | null;
  path: string;
  assetspath: string;
  stylesheets: string[];
  javascripts: string[];
}

export const CONFIG_FILENAME = 'slideshow.config.js';

const require = createRequire(import.meta.url);

/** Convert "true" and "false" strings from command line (e.g. --revealjs.controls=false) to booleans */
export function parseBooleans(value: unknown): unknown {
  if (value === 'true' || value === 'false') {
    return value === 'true';
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, parseBooleans(val)]));
  }
  return value;
}

function parseArgs(argv: string[], fileConfig: Record<string, unknown>, cwd: string) {
  return yargs(argv)
    .scriptName('revealexpress')
    .config(fileConfig)
    .options({
      name: { alias: 'n', describe: 'Slideshow name', default: 'RevealExpress', type: 'string' },
      port: { alias: 'p', describe: 'Slideshow port', default: 3000, type: 'number' },
      password: { describe: 'Presenter password', type: 'string' },
      // Object built by yargs from dot notation (e.g. --revealjs.slideNumber=false)
      revealjs: { describe: 'RevealJS parameters', default: {}, coerce: parseBooleans },
      path: { describe: 'Folder path', default: cwd, type: 'string' },
      assetspath: { describe: 'Assets path', default: '/assets', type: 'string' },
      stylesheets: { alias: 'css', describe: 'Stylesheets', default: [], type: 'array' },
      javascripts: { alias: 'js', describe: 'JavaScripts', default: [], type: 'array' },
    })
    .parseSync();
}

function loadConfigFile(configPath: string): Record<string, unknown> {
  const module = require(configPath);
  // Support both `module.exports = {}` and `export default {}`
  return module?.default ?? module;
}

/** Build the configuration: command line > slideshow.config.js > default values */
export function loadConfig(argv: string[], cwd = process.cwd()): Config {
  // The folder path is needed to find slideshow.config.js
  const configPath = path.resolve(cwd, parseArgs(argv, {}, cwd).path, CONFIG_FILENAME);
  const args = parseArgs(argv, fs.existsSync(configPath) ? loadConfigFile(configPath) : {}, cwd);

  return {
    name: args.name,
    port: args.port,
    password: args.password || null,
    revealjs: (args.revealjs ?? {}) as Record<string, unknown>,
    path: path.resolve(cwd, args.path),
    assetspath: args.assetspath,
    stylesheets: args.stylesheets.map(String),
    javascripts: args.javascripts.map(String),
  };
}
