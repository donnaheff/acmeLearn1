'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

const DISMISSED_KEY = 'acme_install_dismissed';

export function InstallBanner() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISSED_KEY) === '1');
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  }

  if (!installEvent || dismissed) return null;

  return (
    <div className="install-banner" style={{ display: 'flex' }}>
      <span>
        <strong>Install AcmeLearn</strong>
        <small style={{ display: 'block', color: '#bdcbd6' }}>
          Study offline and open your dashboard faster.
        </small>
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          className="btn btn-coral"
          onClick={async () => {
            await installEvent.prompt();
            setInstallEvent(null);
          }}
        >
          Install
        </button>
        <button
          aria-label="Dismiss install prompt"
          onClick={dismiss}
          style={{
            background: 'none',
            border: 0,
            color: '#bdcbd6',
            fontSize: 20,
            lineHeight: 1,
            cursor: 'pointer',
            padding: 4,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
