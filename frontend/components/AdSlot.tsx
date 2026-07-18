'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense script may not have loaded yet (e.g. blocked by an ad blocker).
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', minHeight: 90 }}
      data-ad-client="ca-pub-0000000000000000"
      data-ad-slot="0000000000"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
