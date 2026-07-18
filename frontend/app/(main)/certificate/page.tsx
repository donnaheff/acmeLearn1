import { getSessionProfile } from '@/lib/session';
import { createClient } from '@/lib/supabase/server';
import { PrintButton } from './PrintButton';

type CertificateRow = {
  verification_code: string;
  issued_at: string;
  course_id: string;
  courses: { title: string } | null;
};

export default async function CertificatePage() {
  const profile = await getSessionProfile();
  const supabase = await createClient();

  const { data } = await supabase
    .from('certificates')
    .select('verification_code,issued_at,course_id,courses(title)')
    .eq('user_id', profile!.id)
    .order('issued_at', { ascending: false })
    .limit(1);

  const cert = (data?.[0] || null) as unknown as CertificateRow | null;

  return (
    <main className="section section-soft">
      <div className="shell">
        {cert ? (
          <>
            <div
              style={{
                maxWidth: 900,
                margin: 'auto',
                background: '#fff',
                border: '12px solid var(--navy)',
                padding: 70,
                textAlign: 'center',
                boxShadow: 'var(--shadow)',
              }}
            >
              <img src="/assets/acmelearn-logo.svg" width="70" alt="" />
              <span className="eyebrow" style={{ display: 'block', marginTop: 25 }}>
                Certificate of completion
              </span>
              <h1 style={{ fontSize: 58, margin: '15px 0' }}>{cert.courses?.title || 'AcmeLearn course'}</h1>
              <p style={{ fontSize: 19, color: 'var(--muted)' }}>This confirms that</p>
              <h2 style={{ color: 'var(--coral)' }}>
                {profile!.first_name} {profile!.last_name}
              </h2>
              <p style={{ fontSize: 18, color: 'var(--muted)', maxWidth: 650, margin: '24px auto' }}>
                completed the AcmeLearn preparation programme, including four-skills practice, live instruction
                and assessed coursework.
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  borderTop: '1px solid var(--line)',
                  paddingTop: 28,
                  marginTop: 40,
                }}
              >
                <span>
                  <b>{new Date(cert.issued_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</b>
                  <small style={{ display: 'block' }}>Issue date</small>
                </span>
                <span>
                  <b>{cert.verification_code}</b>
                  <small style={{ display: 'block' }}>Verification code</small>
                </span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 35 }}>
                This is a course-completion certificate and is not an official IELTS qualification or score report.
              </p>
            </div>
            <div style={{ textAlign: 'center', marginTop: 25 }}>
              <PrintButton />
            </div>
          </>
        ) : (
          <div
            style={{
              maxWidth: 700,
              margin: 'auto',
              background: '#fff',
              border: '1px solid var(--line)',
              padding: 60,
              textAlign: 'center',
            }}
          >
            <span className="eyebrow">Certificate of completion</span>
            <h1 style={{ fontSize: 36, margin: '15px 0' }}>No certificate yet.</h1>
            <p style={{ color: 'var(--muted)' }}>
              You don&apos;t have a completed course on record. Certificates are issued automatically once you finish
              an enrolled course&apos;s assessed coursework.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
