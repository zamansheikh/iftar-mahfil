import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import {
  getEventInfo,
  getMembers,
  getPendingContributions,
  getExpenses,
  getModerationRequests,
  getSharedNotes,
  getSummary,
} from '@/actions/data';
import AdminDashboardClient from './AdminDashboardClient';

export const metadata: Metadata = {
  title: 'অ্যাডমিন ড্যাশবোর্ড — ইফতার মাহফিল ব্যাচ ২০১৭',
  description: 'ইফতার মাহফিলের অ্যাডমিন কন্ট্রোল প্যানেল: সদস্য, চাঁদা, খরচ, মডারেশন এবং শেয়ারড নোটস।',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'অ্যাডমিন ড্যাশবোর্ড — ইফতার মাহফিল ব্যাচ ২০১৭',
    description: 'অ্যাডমিন কন্ট্রোল প্যানেল: সদস্য, চাঁদা, খরচ ও নোটস ব্যবস্থাপনা।',
    url: 'https://iftar-mahfil.vercel.app/admin/dashboard',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'অ্যাডমিন ড্যাশবোর্ড — ইফতার মাহফিল',
    description: 'অ্যাডমিন কন্ট্রোল প্যানেল: সদস্য, চাঁদা, খরচ ও নোটস ব্যবস্থাপনা।',
  },
};

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session || session.role !== 'admin') redirect('/admin');

  const [eventInfo, members, pendingContributions, expenses, moderationRequests, notes, summary] = await Promise.all([
    getEventInfo(),
    getMembers(),
    getPendingContributions(),
    getExpenses(),
    getModerationRequests(),
    getSharedNotes(),
    getSummary(),
  ]);

  return (
    <AdminDashboardClient
      eventInfo={eventInfo}
      members={members}
      pendingContributions={pendingContributions}
      expenses={expenses}
      moderationRequests={moderationRequests}
      notes={notes}
      summary={summary}
    />
  );
}
