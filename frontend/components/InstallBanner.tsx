'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

export function InstallBanner() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!installEvent) return null;

  return (
    <div className="install-banner" style={{ display: 'flex' }}>
      <span>
        <strong>Install AcmeLearn</strong>
        <small style={{ display: 'block', color: '#bdcbd6' }}>
          Study offline and open your dashboard faster.
        </small>
      </span>
      <button
        className="btn btn-coral"
        onClick={async () => {
          await installEvent.prompt();
          setInstallEvent(null);
        }}
      >
        Install
      </button>
    </div>
  );
}
