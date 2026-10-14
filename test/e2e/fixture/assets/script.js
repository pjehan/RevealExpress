// Stands for the Prism bundled by a slideshow: records how revealexpress prepares and refreshes the highlights
window.Prism = {
  plugins: {
    lineHighlight: {
      highlightLines(pre) {
        return () => {
          pre.dataset.highlighted = String(Number(pre.dataset.highlighted ?? 0) + 1);
        };
      },
    },
  },
};

// Presentation script using the public "loaded" event
document.getElementById('revealexpress').addEventListener('loaded', (event) => {
  document.body.dataset.totalSlides = String(event.detail.Reveal.getTotalSlides());
  // What Prism.highlightAll() would read from each block
  document.querySelectorAll('pre[data-line]').forEach((pre) => {
    pre.dataset.offsetAtLoad = pre.dataset.lineOffset ?? 'none';
  });
});
