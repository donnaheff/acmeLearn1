'use client';

import { useState } from 'react';
import Link from 'next/link';

const SEARCH_INDEX: Array<[string, string, string]> = [
  ['Writing workspace', 'Create and submit IELTS essays', '/writing'],
  ['Speaking simulator', 'Record a private speaking response', '/speaking'],
  ['Mock exam', 'Timed four-skill practice', '/mock'],
  ['Assignments', 'Deadlines, submissions and feedback', '/assignments'],
  ['Live classes', 'Secure Zoom lectures', '/lectures'],
  ['Recordings', 'Your enrolled lecture recordings', '/recordings'],
  ['Exam readiness', 'Practice-level forecast', '/readiness'],
  ['Receipts', 'Invoices and payment history', '/receipts'],
  ['Support', 'Help articles and tickets', '/support'],
  ['Account security', 'MFA, password and devices', '/security'],
  ['Privacy controls', 'Export or delete your data', '/privacy'],
];

export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const results = SEARCH_INDEX.filter(([title, desc]) =>
    `${title} ${desc}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="search-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="search-dialog" role="dialog" aria-modal="true" aria-label="Search AcmeLearn">
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            className="search-input"
            autoFocus
            placeholder="Search lessons, feedback, help…"
            aria-label="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn btn-outline search-close" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="search-results">
          {results.length ? (
            results.map(([title, desc, href]) => (
              <Link key={href} className="search-result" href={href} onClick={onClose}>
                <b>{title}</b>
                <small>{desc}</small>
              </Link>
            ))
          ) : (
            <p>No matching content found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
