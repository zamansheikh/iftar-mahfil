import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import ModeratorLoginForm from './ModeratorLoginForm';

export const metadata: Metadata = {
  title: 'মডারেটর লগইন — ইফতার মাহফিল ব্যাচ ২০১৭',
  description: 'ইফতার মাহফিল অ্যাপের মডারেটর লগইন পেজ।',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'মডারেটর লগইন — ইফতার মাহফিল',
    description: 'ইফতার মাহফিল অ্যাপের মডারেটর লগইন পেজ।',
    url: 'https://iftar-mahfil.vercel.app/moderator',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'মডারেটর লগইন — ইফতার মাহফিল',
    description: 'ইফতার মাহফিল অ্যাপের মডারেটর লগইন পেজ।',
  },
};

export default async function ModeratorPage() {
  const session = await getAdminSession();
  if (session?.role === 'moderator' || session?.role === 'admin') {
    redirect('/moderator/dashboard');
  }

  return (
    <div className="islamic-pattern min-h-screen flex items-center justify-center p-4">
      <ModeratorLoginForm />
    </div>
  );
}
