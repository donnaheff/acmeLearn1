import { TopBar } from '@/components/TopBar';
import { MainNav } from '@/components/MainNav';
import { Footer } from '@/components/Footer';
import { getSessionProfile } from '@/lib/session';

const isMobileApp = process.env.NEXT_PUBLIC_MOBILE_APP === 'true';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const profile = await getSessionProfile();

  return (
    <>
      {!isMobileApp && <TopBar isSignedIn={!!profile} />}
      <MainNav profile={profile} />
      {children}
      <Footer />
    </>
  );
}
