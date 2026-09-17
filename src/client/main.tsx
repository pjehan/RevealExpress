import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'reveal.js/reveal.css';
import 'reveal.js/theme/solarized.css';
import 'font-awesome/css/font-awesome.css';
import './styles/style.scss';
import App from './App';

createRoot(document.getElementById('revealexpress')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
