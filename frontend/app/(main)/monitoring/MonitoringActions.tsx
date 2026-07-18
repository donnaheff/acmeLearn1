'use client';

import { useToast } from '@/components/ToastProvider';

export function ReplayWebhookButton() {
  const toast = useToast();
  return (
    <button className="btn btn-outline" id="replayWebhook" onClick={() => toast('Select a dead-letter event before replay. Every replay is audited.')}>
      Replay selected event
    </button>
  );
}

export function RestoreDrillButton() {
  const toast = useToast();
  return (
    <button className="btn btn-dark" onClick={() => toast('Restore drills are scheduled and run outside the staff dashboard.')}>
      Run restore drill
    </button>
  );
}
