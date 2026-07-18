import type { Metadata } from 'next';
import { Manrope, DM_Sans } from 'next/font/google';
import './globals.css';
import { NativeTabBar } from '@/components/NativeTabBar';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import { ToastProvider } from '@/components/ToastProvider';

const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-manrope' });
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-dm-sans' });

export const metadata: Metadata = {
  title: 'AcmeLearn — IELTS coaching, built around you',
  description: 'Personal IELTS coaching, practice and feedback to reach your target band.',
  manifest: '/manifest.webmanifest',
  // Favicon/apple-icon are picked up automatically from app/icon.png,
  // app/apple-icon.png and app/favicon.ico (Next.js file-based convention).
};

export const viewport = {
  themeColor: '#0b2037',
};

const isMobileApp = process.env.NEXT_PUBLIC_MOBILE_APP === 'true';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${dmSans.variable}`}>
      <body className={isMobileApp ? 'native-app' : ''}>
        <ToastProvider>
          {children}
          <ServiceWorkerRegistration />
          {isMobileApp && <NativeTabBar />}
        </ToastProvider>
      </body>
    </html>
  );
}
