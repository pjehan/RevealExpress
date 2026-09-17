/** Escape tags inside <code class="..."> so code samples are displayed instead of rendered */
export function escapeCodeTags(chapter: string): string {
  return chapter.replace(
    /<code class="([a-z-]*)">([\s\S]*?)<\/code>/g,
    (_match, className: string, code: string) =>
      `<code class="${className}">${code.replace(/<([a-zA-Z?])/g, '&lt;$1')}</code>`,
  );
}
