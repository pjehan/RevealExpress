import { useEffect } from 'react';
import type { RevealApi } from 'reveal.js';
import type { SlideIndices, UserMode } from '../../shared/types';
import type { AppSocket } from './useSocket';

/** The presenter shares the current slide, spectators following the presenter go to the same slide */
export function useSlideSync(
  deck: RevealApi | null,
  socket: AppSocket,
  mode: UserMode,
  follow: boolean,
) {
  useEffect(() => {
    if (!deck || mode !== 'presenter') {
      return;
    }

    const shareSlide = () => {
      const { h, v } = deck.getIndices();
      socket.emit('slidechanged', { h, v });
    };

    shareSlide(); // Spectators immediately go to the presenter's slide
    deck.on('slidechanged', shareSlide);
    return () => deck.off('slidechanged', shareSlide);
  }, [deck, socket, mode]);

  useEffect(() => {
    if (!deck || mode !== 'spectator' || !follow) {
      return;
    }

    let active = true;
    const goToSlide = (indices: SlideIndices | null) => {
      if (active && indices) {
        deck.slide(indices.h, indices.v);
      }
    };

    socket.on('slidechanged', goToSlide);
    socket.emit('currentslide', goToSlide); // Don't wait for the presenter's next slide
    return () => {
      active = false;
      socket.off('slidechanged', goToSlide);
    };
  }, [deck, socket, mode, follow]);
}
