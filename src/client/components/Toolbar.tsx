import { useState } from 'react';
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

  async function handleModeChange(newMode: UserMode) {
    if (newMode === 'presenter') {
      const password = prompt('Password:');
      if (password === null || !(await checkPassword(password))) {
        return;
      }
    }
    onModeChange(newMode);
  }

  return (
    <div id="toolbar">
      <div className={'tools' + (show ? ' show' : '')}>
        <form>
          <div className="form-group">
            <label>Mode :</label>
            <select
              value={mode}
              onChange={(event) => handleModeChange(event.target.value as UserMode)}
            >
              <option value="spectator">Spectator</option>
              <option value="presenter">Presenter</option>
            </select>
          </div>
          {mode === 'spectator' && (
            <div className="form-group">
              <label>Auto slide :</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={follow}
                  onChange={(event) => onFollowChange(event.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
          )}
        </form>
      </div>
      <div className="btn-show-tools">
        <i className="fa fa-arrow-circle-down" onClick={() => setShow(!show)}></i>
      </div>
    </div>
  );
}
