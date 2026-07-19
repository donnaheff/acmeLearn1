'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/useSupabase';
import { useToast } from '@/components/ToastProvider';

const DURATION_MINUTES = 50;

function formatSlot(iso: string) {
  return new Intl.DateTimeFormat('en-NG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Africa/Lagos',
  }).format(new Date(iso));
}

export function BookCoachingForm({
  slots,
  tutorId,
  profileId,
  sessionPrice,
}: {
  slots: string[];
  tutorId: string | null;
  profileId: string | null;
  sessionPrice: string;
}) {
  const supabase = useSupabase();
  const router = useRouter();
  const toast = useToast();
  const [selected, setSelected] = useState(slots[0]);
  const [booking, setBooking] = useState(false);
  const [bookedSlot, setBookedSlot] = useState<string | null>(null);

  async function reserve() {
    if (!profileId) {
      router.push('/login?required=1&returnTo=/meet-your-tutor');
      return;
    }
    if (!tutorId) {
      toast('Coaching bookings are not configured yet — contact support.');
      return;
    }
    setBooking(true);
    const startsAt = new Date(selected);
    const endsAt = new Date(startsAt.getTime() + DURATION_MINUTES * 60000);
    const { error } = await supabase.from('coaching_bookings').insert({
      student_id: profileId,
      tutor_id: tutorId,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
    });
    setBooking(false);
    if (error) {
      toast(error.message);
      return;
    }
    setBookedSlot(selected);
    toast('Coaching session requested — you will be notified once confirmed.');
  }

  return (
    <div className="panel">
      <span className="eyebrow">Next available sessions</span>
      <h3 style={{ margin: '10px 0 18px' }}>Book 1:1 coaching</h3>
      {bookedSlot ? (
        <p>
          Requested: <strong>{formatSlot(bookedSlot)}</strong>. A tutor will confirm shortly — track
          it from your account.
        </p>
      ) : (
        <>
          {slots.map((slot) => (
            <label className="option" key={slot}>
              <input
                type="radio"
                name="slot"
                value={slot}
                checked={selected === slot}
                onChange={() => setSelected(slot)}
              />{' '}
              {formatSlot(slot)}
            </label>
          ))}
          <div className="course-foot" style={{ margin: '20px 0' }}>
            <strong>{sessionPrice}</strong>
            <span>{DURATION_MINUTES} minutes</span>
          </div>
          <button
            className="btn btn-coral"
            id="bookCoaching"
            style={{ width: '100%' }}
            disabled={booking}
            onClick={reserve}
          >
            {booking ? 'Requesting…' : 'Reserve selected time →'}
          </button>
          <p style={{ fontSize: 11, color: 'var(--muted)' }}>
            Sessions are delivered through AcmeLearn Zoom access. Off-platform payments are
            prohibited.
          </p>
        </>
      )}
    </div>
  );
}
