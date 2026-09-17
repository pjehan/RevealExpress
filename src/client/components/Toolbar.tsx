import { useState, type FormEvent } from 'react';
import type { UserMode } from '../../shared/types';
import { checkPassword } from '../api';

interface ToolbarProps {
  mode: UserMode;
  onModeChange: (mode: UserMode) => void;
  follow: boolean;
  onFollowChange: (follow: boolean) => void;
}

export default function Toolbar({ mode, onModeChange, follow, onFollowChange }: ToolbarProps) {
  const [show, setShow] = useState(false);
  const [askPassword, setAskPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [wrongPassword, setWrongPassword] = useState(false);

  function handleModeChange(newMode: UserMode) {
    if (newMode === 'presenter') {
      setAskPassword(true);
    } else {
      onModeChange(newMode);
    }
  }

  function closePasswordForm() {
    setAskPassword(false);
    setPassword('');
    setWrongPassword(false);
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await checkPassword(password)) {
      closePasswordForm();
      onModeChange('presenter');
    } else {
      setWrongPassword(true);
    }
  }

  return (
    <div id="toolbar">
      {/* Hidden tools must not be reachable with the keyboard */}
      <div id="revealexpress-tools" className={'tools' + (show ? ' show' : '')} inert={!show}>
        <form onSubmit={submitPassword}>
          {askPassword ? (
            // Masked field: the screen may be projected in front of the audience
            <div className="form-group">
              <label htmlFor="revealexpress-password">Password :</label>
              <input
                id="revealexpress-password"
                type="password"
                value={password}
                autoFocus
                aria-invalid={wrongPassword}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setWrongPassword(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    event.stopPropagation(); // Escape would also open reveal.js overview
                    closePasswordForm();
                  }
                }}
              />
              <button type="submit">OK</button>
              <button type="button" onClick={closePasswordForm}>
                Cancel
              </button>
              {wrongPassword && (
                <span className="error" role="alert">
                  Wrong password
                </span>
              )}
            </div>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="revealexpress-mode">Mode :</label>
                <select
                  id="revealexpress-mode"
                  value={mode}
                  onChange={(event) => handleModeChange(event.target.value as UserMode)}
                >
                  <option value="spectator">Spectator</option>
                  <option value="presenter">Presenter</option>
                </select>
              </div>
              {mode === 'spectator' && (
                <div className="form-group">
                  <label htmlFor="revealexpress-follow">Auto slide :</label>
                  <label className="switch">
                    <input
                      id="revealexpress-follow"
                      type="checkbox"
                      checked={follow}
                      onChange={(event) => onFollowChange(event.target.checked)}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              )}
            </>
          )}
        </form>
      </div>
      <button
        type="button"
        className="btn-show-tools"
        aria-label={show ? 'Hide tools' : 'Show tools'}
        aria-expanded={show}
        aria-controls="revealexpress-tools"
        onClick={() => setShow(!show)}
      >
        <i className="fa fa-arrow-circle-down" aria-hidden="true"></i>
      </button>
    </div>
  );
}
