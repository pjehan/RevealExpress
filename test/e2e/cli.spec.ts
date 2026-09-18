import { execFile } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { expect, test } from '@playwright/test';

// The command published in package.json, as installed by "npm install -g"
const { bin: binaries } = JSON.parse(readFileSync('package.json', 'utf-8')) as {
  bin: Record<string, string>;
};
const bin = path.join(process.cwd(), binaries.revealexpress);
const run = promisify(execFile);

// Node.js before 22.12 cannot require() an ES module at all, whatever this package does
test('the command is a CommonJS entry point', () => {
  expect(bin).toMatch(/\.cjs$/);
});

test('the command runs with node', async () => {
  const { stdout } = await run('node', [bin, '--help']);
  expect(stdout).toContain('Slideshow port');
});

test('the command can be loaded with require(), as process managers like pm2 do', async () => {
  const { stdout } = await run('node', ['-e', 'require(process.argv[1])', bin, '--help']);
  expect(stdout).toContain('Slideshow port');
});
