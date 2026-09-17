import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '../../shared/types';

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/** WebSocket connected while the component is mounted (same port as the slideshow) */
export function useSocket(): AppSocket {
  const [socket] = useState<AppSocket>(() => io({ autoConnect: false }));

  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return socket;
}
