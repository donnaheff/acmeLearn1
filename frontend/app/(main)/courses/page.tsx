import { createClient } from '@/lib/supabase/server';
import { CourseGrid, type CourseRow } from './CourseGrid';

function skillFor(slug: string): 'writing' | 'speaking' | 'complete' {
  if (slug.includes('writing')) return 'writing';
  if (slug.includes('speaking')) return 'speaking';
  return 'complete';
}

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('courses')
    .select('id,slug,title,description')
    .eq('active', true)
    .order('title', { ascending: true });

  const courses: CourseRow[] = (data ?? []).map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description,
    skill: skillFor(c.slug),
  }));

  return (
    <>
      <header className="page-hero">
        <div className="shell">
          <div className="crumb">Home / Courses</div>
          <span className="eyebrow">Learn with purpose</span>
          <h1>Choose the route to your target band.</h1>
          <p>
            Short, focused courses and complete preparation programmes—taught by IELTS specialists
            and shaped around real examiner criteria.
          </p>
        </div>
      </header>
      <CourseGrid courses={courses} />
    </>
  );
}
