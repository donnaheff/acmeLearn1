'use client';

import { useToast } from '@/components/ToastProvider';

export function RestoreDrillButton() {
  const toast = useToast();
  return (
    <button className="btn btn-dark" onClick={() => toast('Restore drills are scheduled and run outside the staff dashboard.')}>
      Run restore drill
    </button>
  );
}
