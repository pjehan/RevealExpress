import type { RevealApi } from 'reveal.js';

interface PrismLineHighlight {
  highlightLines(pre: HTMLElement): (() => void) | undefined;
}

declare global {
  interface Window {
    // Prism is bundled by the slideshow, not by RevealExpress: it may be missing
    Prism?: { plugins?: { lineHighlight?: PrismLineHighlight } };
  }
}

/**
 * With `data-start`, the line numbers shown start at that value, so `data-line` is written with the same
 * numbers. Prism's line-highlight plugin reads it relative to the first line unless `data-line-offset` is set
 * (and silently drops the ranges beyond the end of the block).
 * Must run before Prism highlights the code.
 */
export function alignLineOffsets(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('pre[data-line][data-start]').forEach((pre) => {
    const start = Number(pre.dataset.start);
    if (pre.dataset.lineOffset === undefined && Number.isFinite(start)) {
      pre.dataset.lineOffset = String(start - 1);
    }
  });
}

/**
 * Prism measures the lines when it highlights the code, but reveal.js hides the other slides, which then have
 * no height: the highlights computed at load are empty. Compute them again when a slide is displayed.
 */
export function keepLineHighlightsMeasured(deck: RevealApi) {
  const refresh = () => {
    const lineHighlight = window.Prism?.plugins?.lineHighlight;
    if (!lineHighlight) {
      return;
    }
    deck
      .getCurrentSlide()
      ?.querySelectorAll<HTMLElement>('pre[data-line]')
      .forEach((pre) => lineHighlight.highlightLines(pre)?.());
  };
  deck.on('slidechanged', refresh);
  refresh();
}
