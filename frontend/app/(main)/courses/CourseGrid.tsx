'use client';

import { useState } from 'react';
import Link from 'next/link';

export type CourseRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  skill: 'writing' | 'speaking' | 'complete';
};

const FILTERS: Array<[string, string]> = [
  ['all', 'All courses'],
  ['writing', 'Writing'],
  ['speaking', 'Speaking'],
  ['complete', 'Complete prep'],
];

const SKILL_LABEL: Record<CourseRow['skill'], string> = {
  writing: 'Academic writing',
  speaking: 'Speak with confidence',
  complete: 'Complete preparation',
};

export function CourseGrid({ courses }: { courses: CourseRow[] }) {
  const [filter, setFilter] = useState('all');

  return (
    <>
      <div className="filterbar">
        <div className="shell filters">
          {FILTERS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`pill${filter === id ? ' active' : ''}`}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <main className="section section-soft">
        <div className="shell">
          <div className="course-grid">
            {courses.map((course) => (
              <article
                key={course.id}
                className="course"
                data-skill={course.skill}
                style={{ display: filter === 'all' || filter === course.skill ? 'block' : 'none' }}
              >
                <div className="course-top">
                  <span className="eyebrow">{SKILL_LABEL[course.skill]}</span>
                  <h3>{course.title}</h3>
                </div>
                <div className="course-body">
                  <p>{course.description}</p>
                  <div className="course-foot">
                    <Link href="/signup">View course →</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
