import React from 'react';

export const GameUtils = ({ onNew, onLose, onWin }) => (
  <div className="game__utils">
    <button
      title="Restart"
      onClick={onNew}
      style={{
        padding: 0,
        margin: 0,
        border: 0,
        background: 'transparent',
      }}
    >
      ⟳
    </button>
    <button
      title="Lose"
      onClick={onLose}
      style={{
        padding: 0,
        margin: 0,
        border: 0,
        background: 'transparent',
      }}
    >
      ×
    </button>
    <button
      title="Win"
      onClick={onWin}
      style={{
        padding: 0,
        margin: 0,
        border: 0,
        background: 'transparent',
      }}
    >
      ✓
    </button>
  </div>
);
