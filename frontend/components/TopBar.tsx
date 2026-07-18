import Link from 'next/link';

export function TopBar({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <div className="topbar">
      <div className="shell">
        <span>IELTS coaching for ambitious learners</span>
        <div className="toplinks">
          <Link href="/resources">Insights</Link>
          <Link href="/support">Support</Link>
          {isSignedIn ? <Link href="/">My dashboard</Link> : <Link href="/login">Student login</Link>}
        </div>
      </div>
    </div>
  );
}
