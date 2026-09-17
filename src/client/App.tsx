import { useEffect, useState } from 'react';
import type { PublicConfig, UserMode } from '../shared/types';
import { fetchConfig } from './api';
import Slideshow from './components/Slideshow';
import Toolbar from './components/Toolbar';
import { useSocket } from './hooks/useSocket';

export default function App() {
  const socket = useSocket();
  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [mode, setMode] = useState<UserMode>('spectator');
  const [follow, setFollow] = useState(false);

  useEffect(() => {
    fetchConfig().then(setConfig, console.error);
  }, []);

  return (
    <>
      <Toolbar mode={mode} onModeChange={setMode} follow={follow} onFollowChange={setFollow} />
      {config && <Slideshow config={config} socket={socket} mode={mode} follow={follow} />}
    </>
  );
}
