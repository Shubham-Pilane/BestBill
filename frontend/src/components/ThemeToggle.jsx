import React from 'react';
import { Sun, Moon } from 'lucide-react';

/**
 * Dual-icon segmented theme toggle displaying both Light (Sun) and Dark (Moon)
 * options with a highlighted pill indicator showing the active mode.
 */
const ThemeToggle = ({ isLight, onToggle }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={isLight}
      aria-label={isLight ? 'Light mode selected. Click to switch to Dark mode' : 'Dark mode selected. Click to switch to Light mode'}
      title={isLight ? 'Light Mode active — click to switch to Dark Mode' : 'Dark Mode active — click to switch to Light Mode'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        padding: '3px',
        borderRadius: '9999px',
        border: '1px solid var(--bb-border-card)',
        backgroundColor: isLight ? '#e2e8f0' : 'rgba(15, 23, 42, 0.85)',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        boxShadow: isLight ? 'inset 0 1px 2px rgba(15, 23, 42, 0.08)' : 'inset 0 1px 2px rgba(0, 0, 0, 0.35)'
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: '28px',
          height: '26px',
          borderRadius: '9999px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isLight ? '#ffffff' : 'transparent',
          color: isLight ? '#f59e0b' : '#64748b',
          boxShadow: isLight ? '0 1px 4px rgba(15, 23, 42, 0.18)' : 'none',
          transition: 'all 0.25s ease'
        }}
      >
        <Sun size={15} strokeWidth={2.4} />
      </span>

      <span
        aria-hidden="true"
        style={{
          width: '28px',
          height: '26px',
          borderRadius: '9999px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: !isLight ? '#0ea5e9' : 'transparent',
          color: !isLight ? '#ffffff' : '#64748b',
          boxShadow: !isLight ? '0 1px 6px rgba(14, 165, 233, 0.5)' : 'none',
          transition: 'all 0.25s ease'
        }}
      >
        <Moon size={14} strokeWidth={2.4} />
      </span>
    </button>
  );
};

export default ThemeToggle;

