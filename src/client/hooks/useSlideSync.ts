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

    deck.on('slidechanged', shareSlide);
    return () => deck.off('slidechanged', shareSlide);
  }, [deck, socket, mode]);

  useEffect(() => {
    if (!deck || mode !== 'spectator' || !follow) {
      return;
    }

    const goToSlide = ({ h, v }: SlideIndices) => deck.slide(h, v);

    socket.on('slidechanged', goToSlide);
    return () => {
      socket.off('slidechanged', goToSlide);
    };
  }, [deck, socket, mode, follow]);
}
