'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const TABS: Array<[string, string, string]> = [
  ['/', '⌂', 'Home'],
  ['/learning', '◫', 'Learn'],
  ['/assignments', '✓', 'Tasks'],
  ['/lectures', '◉', 'Classes'],
  ['/account', '●', 'Account'],
];

// Only rendered when NEXT_PUBLIC_MOBILE_APP=true (the build bundled into the
// Capacitor Android/iOS shells). Ported from mobile/native-bridge.js.
export function NativeTabBar() {
  const pathname = usePathname();
  return (
    <nav className="native-tabs" aria-label="Primary">
      {TABS.map(([href, icon, label]) => (
        <Link key={href} className={`native-tab${pathname === href ? ' active' : ''}`} href={href}>
          <span>{icon}</span>
          {label}
        </Link>
      ))}
    </nav>
  );
}
