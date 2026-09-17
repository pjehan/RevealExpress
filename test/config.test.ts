import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { CONFIG_FILENAME, loadConfig, parseBooleans } from '../src/server/config.ts';

function createFolder(files: Record<string, string> = {}): string {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'revealexpress-config-'));
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(folder, name), content);
  }
  return folder;
}

const fileConfig = `module.exports = {
  name: 'From file',
  port: 5000,
  password: 'secret',
  revealjs: { controls: false, slideNumber: 'c/t' },
  javascripts: ['assets/js/script.js'],
};`;

describe('loadConfig', () => {
  it('uses default values', () => {
    const folder = createFolder();
    assert.deepEqual(loadConfig([], folder), {
      name: 'RevealExpress',
      port: 3000,
      password: null,
      revealjs: {},
      path: folder,
      assetspath: '/assets',
      stylesheets: [],
      javascripts: [],
    });
  });

  it('uses values from slideshow.config.js', () => {
    const folder = createFolder({ [CONFIG_FILENAME]: fileConfig });
    const config = loadConfig([], folder);
    assert.equal(config.name, 'From file');
    assert.equal(config.port, 5000);
    assert.equal(config.password, 'secret');
    assert.deepEqual(config.revealjs, { controls: false, slideNumber: 'c/t' });
    assert.deepEqual(config.javascripts, ['assets/js/script.js']);
  });

  it('supports slideshow.config.js written as an ES module', () => {
    const folder = createFolder({
      'package.json': '{ "type": "module" }',
      [CONFIG_FILENAME]: "export default { name: 'ES module' };",
    });
    assert.equal(loadConfig([], folder).name, 'ES module');
  });

  it('lets command line arguments override slideshow.config.js', () => {
    const folder = createFolder({ [CONFIG_FILENAME]: fileConfig });
    const config = loadConfig(['-n', 'From CLI', '-p', '6000', '--revealjs.controls=true'], folder);
    assert.equal(config.name, 'From CLI');
    assert.equal(config.port, 6000);
    assert.equal(config.password, 'secret');
    assert.deepEqual(config.revealjs, { controls: true, slideNumber: 'c/t' });
  });

  it('finds slideshow.config.js in the folder given by --path', () => {
    const folder = createFolder({ [CONFIG_FILENAME]: fileConfig });
    const config = loadConfig(['--path', path.basename(folder)], path.dirname(folder));
    assert.equal(config.name, 'From file');
    assert.equal(config.path, folder);
  });
});

describe('parseBooleans', () => {
  it('converts "true" and "false" strings in nested objects', () => {
    assert.deepEqual(parseBooleans({ a: 'true', b: { c: 'false', d: 'fade', e: 0 } }), {
      a: true,
      b: { c: false, d: 'fade', e: 0 },
    });
  });
});
