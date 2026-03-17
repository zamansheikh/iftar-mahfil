import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { getMembers, getMyModerationRequests, getSummary, getExpenses, getSharedNotes } from '@/actions/data';
import ModeratorDashboardClient from './moderator-dashboard-client';

export const metadata: Metadata = {
  title: 'মডারেটর ড্যাশবোর্ড — ইফতার মাহফিল ব্যাচ ২০১৭',
  description: 'মডারেটর প্যানেল: সদস্য আপডেট, অনুরোধ, সারসংক্ষেপ ও শেয়ারড নোটস।',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'মডারেটর ড্যাশবোর্ড — ইফতার মাহফিল ব্যাচ ২০১৭',
    description: 'মডারেটর প্যানেল: সদস্য আপডেট, অনুরোধ ও শেয়ারড নোটস।',
    url: 'https://iftar-mahfil.vercel.app/moderator/dashboard',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'মডারেটর ড্যাশবোর্ড — ইফতার মাহফিল',
    description: 'মডারেটর প্যানেল: সদস্য আপডেট, অনুরোধ ও শেয়ারড নোটস।',
  },
};

export default async function ModeratorDashboardPage() {
  const session = await getAdminSession();
  if (!session || (session.role !== 'moderator' && session.role !== 'admin')) {
    redirect('/moderator');
  }

  const [members, requests, summary, expenses, notes] = await Promise.all([
    getMembers(),
    getMyModerationRequests(),
    getSummary(),
    getExpenses(),
    getSharedNotes(),
  ]);

  return <ModeratorDashboardClient members={members} requests={requests} summary={summary} expenses={expenses} notes={notes} />;
}
