import type { Config } from './config.ts';

const HEAD_PLACEHOLDER = '<!--revealexpress:head-->';
const BODY_PLACEHOLDER = '<!--revealexpress:body-->';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/** Inject the slides language, title, stylesheets and javascripts into the client index.html */
export function renderIndex(template: string, config: Config): string {
  const head = [
    `<title>${escapeHtml(config.name)}</title>`,
    ...config.stylesheets.map((href) => `<link rel="stylesheet" href="${escapeHtml(href)}">`),
  ];
  const body = config.javascripts.map((src) => `<script src="${escapeHtml(src)}"></script>`);

  return template
    .replace('<html>', `<html lang="${escapeHtml(config.lang)}">`)
    .replace(HEAD_PLACEHOLDER, head.join('\n'))
    .replace(BODY_PLACEHOLDER, body.join('\n'));
}
