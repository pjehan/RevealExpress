// Presentation script using the public "loaded" event
document.getElementById('revealexpress').addEventListener('loaded', (event) => {
  document.body.dataset.totalSlides = String(event.detail.Reveal.getTotalSlides());
});
