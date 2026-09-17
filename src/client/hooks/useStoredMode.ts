import { useEffect, useState } from 'react';
import type { UserMode } from '../../shared/types';

const STORAGE_KEY = 'revealexpress:mode';

function readStoredMode(): UserMode {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === 'presenter' ? 'presenter' : 'spectator';
  } catch {
    return 'spectator'; // Storage can be unavailable (e.g. blocked by the browser)
  }
}

/** User mode kept for the browser tab session, so the presenter doesn't retype the password on reload */
export function useStoredMode() {
  const [mode, setMode] = useState<UserMode>(readStoredMode);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // The mode is simply not remembered
    }
  }, [mode]);

  return [mode, setMode] as const;
}
