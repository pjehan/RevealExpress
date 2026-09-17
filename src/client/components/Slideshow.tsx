import { useEffect, useRef, useState } from 'react';
import Reveal, { type RevealApi } from 'reveal.js';
import type { PublicConfig, UserMode } from '../../shared/types';
import { fetchChapters } from '../api';
import { escapeCodeTags } from '../chapters';
import { useQuiz } from '../hooks/useQuiz';
import { useSlideSync } from '../hooks/useSlideSync';
import type { AppSocket } from '../hooks/useSocket';

interface SlideshowProps {
  config: PublicConfig;
  socket: AppSocket;
  mode: UserMode;
  follow: boolean;
}

export default function Slideshow({ config, socket, mode, follow }: SlideshowProps) {
  const revealElement = useRef<HTMLDivElement>(null);
  const [chapters, setChapters] = useState<string[] | null>(null);
  const [deck, setDeck] = useState<RevealApi | null>(null);
  const deckQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let cancelled = false;
    fetchChapters().then((result) => {
      if (!cancelled) {
        setChapters(result.map(escapeCodeTags));
      }
    }, console.error);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!chapters || !revealElement.current) {
      return;
    }

    const element = revealElement.current;
    let newDeck: RevealApi | null = null;
    let destroyed = false;

    // A deck can't be destroyed while initializing (e.g. effects run twice by React StrictMode):
    // wait for the previous deck to be destroyed before creating a new one
    const initialized = deckQueue.current.then(async () => {
      if (destroyed) {
        return;
      }
      newDeck = new Reveal(element, {
        history: true,
        slideNumber: true,
        ...config.revealjs, // Load params from config file
      });
      await newDeck.initialize();
      if (destroyed) {
        return;
      }
      setDeck(newDeck);
      // Let presentation scripts interact with the slideshow
      document.getElementById('revealexpress')?.dispatchEvent(
        new CustomEvent('loaded', {
          detail: { config: { name: config.name, port: config.port }, Reveal: newDeck },
        }),
      );
    });
    deckQueue.current = initialized.catch(console.error);

    return () => {
      destroyed = true;
      setDeck(null);
      deckQueue.current = deckQueue.current.then(() => newDeck?.destroy());
    };
  }, [chapters, config]);

  useSlideSync(deck, socket, mode, follow);
  useQuiz(deck, socket, mode);

  return (
    <div className="reveal" ref={revealElement}>
      <div className="slides" dangerouslySetInnerHTML={{ __html: chapters?.join('') ?? '' }}></div>
    </div>
  );
}
