import Script from 'next/script';
import { getSessionProfile } from '@/lib/session';
import { getHomeContent } from '@/lib/siteContent';
import { getFeatureFlags } from '@/lib/featureFlags';
import { createClient } from '@/lib/supabase/server';
import { LandingPage } from './LandingPage';
import { Dashboard, type DashboardLecture } from './Dashboard';

export default async function HomePage() {
  const profile = await getSessionProfile();

  if (!profile) {
    const content = await getHomeContent();
    return (
      <>
        <LandingPage content={content} />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0000000000000000"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </>
    );
  }

  const supabase = await createClient();

  const [flags, { data: diagnostics }, { data: scores }, { data: recommendations }, { data: lectures }, { data: completedEnrollments }, { count: attendanceCount }, { data: assignments }] =
    await Promise.all([
      getFeatureFlags(profile),
      supabase
        .from('diagnostic_attempts')
        .select('*')
        .eq('user_id', profile.id)
        .order('started_at', { ascending: false })
        .limit(1),
      supabase
        .from('skill_scores')
        .select('skill,score,recorded_at')
        .eq('user_id', profile.id)
        .order('recorded_at', { ascending: false }),
      supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', profile.id)
        .eq('status', 'active')
        .order('priority', { ascending: false })
        .limit(3),
      supabase
        .from('lectures')
        .select('id,title,starts_at,platform,courses(title)')
        .in('status', ['scheduled', 'live'])
        .order('starts_at', { ascending: true })
        .limit(1),
      supabase.from('enrollments').select('id').eq('user_id', profile.id).eq('status', 'completed').limit(1),
      supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
      supabase.from('assignments').select('status').eq('student_id', profile.id),
    ]);

  return (
    <Dashboard
      profile={profile}
      diagnostic={diagnostics?.[0] ?? null}
      scores={scores ?? []}
      recommendations={recommendations ?? []}
      nextLecture={(lectures?.[0] as unknown as DashboardLecture) ?? null}
      hasCompletedCourse={!!completedEnrollments?.length}
      classesAttended={attendanceCount ?? 0}
      assignments={assignments ?? []}
      flags={flags}
    />
  );
}
