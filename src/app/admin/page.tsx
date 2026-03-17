import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import AdminLoginForm from './AdminLoginForm';

export const metadata: Metadata = {
  title: 'অ্যাডমিন লগইন — ইফতার মাহফিল ব্যাচ ২০১৭',
  description: 'ইফতার মাহফিল অ্যাপের অ্যাডমিন লগইন পেজ।',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'অ্যাডমিন লগইন — ইফতার মাহফিল',
    description: 'ইফতার মাহফিল অ্যাপের অ্যাডমিন লগইন পেজ।',
    url: 'https://iftar-mahfil.vercel.app/admin',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'অ্যাডমিন লগইন — ইফতার মাহফিল',
    description: 'ইফতার মাহফিল অ্যাপের অ্যাডমিন লগইন পেজ।',
  },
};

export default async function AdminPage() {
  const session = await getAdminSession();
  if (session?.role === 'admin') redirect('/admin/dashboard');

  return (
    <div className="islamic-pattern min-h-screen flex items-center justify-center p-4">
      <AdminLoginForm />
    </div>
  );
}
