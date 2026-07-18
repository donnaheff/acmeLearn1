'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SearchOverlay } from '@/components/SearchOverlay';
import type { Profile } from '@/lib/session';

const STUDENT_LINKS: Array<[string, string]> = [
  ['/', 'Dashboard'],
  ['/learning', 'Learn'],
  ['/assignments', 'Assignments'],
  ['/lectures', 'Live classes'],
  ['/assistant', 'Assistant'],
  ['/account', 'Account'],
];

const PUBLIC_LINKS: Array<[string, string]> = [
  ['/courses', 'Courses'],
  ['/practice', 'Practice'],
  ['/resources', 'Resources'],
  ['/marketplace', 'Tutors'],
  ['/billing', 'Plans'],
];

export function MainNav({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const isSignedIn = !!profile;
  const isStaff = profile && ['admin', 'tutor'].includes(profile.role);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <nav className="mainnav">
      <div className="shell">
        <Link className="brand" href="/">
          <img className="brand-logo" src="/assets/acmelearn-logo.svg" alt="AcmeLearn logo" />
          <span>AcmeLearn</span>
        </Link>

        <div className="navlinks" style={menuOpen ? { display: 'flex', position: 'absolute', top: 82, left: 0, right: 0, background: '#fff', padding: 25, flexDirection: 'column', boxShadow: '0 15px 30px rgba(0,0,0,.1)' } : undefined}>
          {isSignedIn && profile!.role === 'student' ? (
            STUDENT_LINKS.map(([href, label]) => (
              <Link key={href} className={pathname === href ? 'active' : ''} href={href}>
                {label}
              </Link>
            ))
          ) : (
            <>
              <Link className="home-link" href="/">
                {isSignedIn ? 'Dashboard' : 'Home'}
              </Link>
              {!isSignedIn &&
                PUBLIC_LINKS.map(([href, label]) => (
                  <Link key={href} className={pathname === href ? 'active' : ''} href={href}>
                    {label}
                  </Link>
                ))}
              {isStaff && (
                <Link className="staff-link" href={profile!.role === 'admin' ? '/admin' : '/tutor'}>
                  {profile!.role === 'admin' ? 'Admin' : 'Tutor area'}
                </Link>
              )}
            </>
          )}
        </div>

        <div className="nav-actions">
          {isSignedIn ? (
            <>
              <button
                className="account-chip global-search"
                aria-label="Search AcmeLearn"
                style={{ border: 0, background: 'none' }}
                onClick={() => setSearchOpen(true)}
              >
                ⌕ Search
              </button>
              <Link className="account-chip" href="/notifications" aria-label="Notifications">
                ●{' '}
                <span
                  style={{
                    position: 'absolute',
                    width: 7,
                    height: 7,
                    background: 'var(--coral)',
                    borderRadius: '50%',
                  }}
                />
              </Link>
              <Link className="account-chip" href="/account">
                <span className="avatar">{(profile!.first_name || 'S')[0].toUpperCase()}</span>
                {profile!.first_name || 'Student'}
              </Link>
              <button className="btn btn-outline signout" onClick={signOut}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-outline" href="/login">
                Sign in
              </Link>
              <Link className="btn btn-coral" href="/signup">
                Get started <span>→</span>
              </Link>
            </>
          )}
        </div>

        <button className="mobile-menu" aria-label="Open menu" onClick={() => setMenuOpen((v) => !v)}>
          ☰
        </button>
      </div>
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </nav>
  );
}
