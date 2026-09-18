# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/).

## [2.0.1] - 2026-09-18

### Fixed

- Process managers loading the command with `require()`, such as pm2, failed with `ERR_REQUIRE_ESM` or `ERR_REQUIRE_ASYNC_MODULE`: the command is now a CommonJS entry point that imports the ES modules of the package.

## [2.0.0] - 2026-09-17

### Breaking changes

- Node.js 22.12 or later is required.
- The slideshow and the WebSocket server now share a single port: the `portws` option is removed (ignored if still set), and `event.detail.config` no longer contains `portws`.
- Command line arguments now take precedence over `slideshow.config.js` (the file used to override them).
- reveal.js is upgraded from 2.x to 6: the default style, controls and progress bar look slightly different, and `event.detail.Reveal` exposes the [reveal.js 6 API](https://revealjs.com/api/).
- Scripts listed in `javascripts` now run before the slideshow is initialized: wait for the `loaded` event before using the slideshow.
- HTTP requests and WebSocket connections are no longer logged.

### Added

- Spectators enabling auto slide immediately go to the presenter's current slide.
- The presenter password is asked in a masked field instead of a browser prompt.
- Presenter mode is remembered until the browser tab is closed.
- `--no-open` option to avoid opening a browser at startup (e.g. on a server).
- `lang` option for the page language (default: `fr`).
- `slideshow.config.js` can be written as an ES module (`export default`).
- The toolbar and quiz can be used with the keyboard.

### Changed

- Rewritten in TypeScript: React 19 client built with Vite, Express 5 and socket.io 4 server.
- Runtime dependencies are reduced to Express, socket.io, yargs and open.
- `true` and `false` values of `--revealjs.*` options are parsed as booleans.

### Fixed

- The presenter password was exposed by the configuration endpoint and printed in the server logs.
- Ports defined in `slideshow.config.js` were ignored.
- A presenter switching back to spectator mode kept broadcasting slide changes.
- The quiz could crash on the presenter screen when receiving an unknown answer.

### Removed

- Automatic presenter detection based on WebRTC, which no longer works in modern browsers: presenter mode requires the password.

## 1.3.2 and earlier

See the [commit history](https://github.com/pjehan/RevealExpress/commits/master).
