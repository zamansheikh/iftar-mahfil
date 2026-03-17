import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import {
  getEventInfo,
  getMembers,
  getPendingContributions,
  getExpenses,
  getModerationRequests,
  getSummary,
} from '@/actions/data';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session || session.role !== 'admin') redirect('/admin');

  const [eventInfo, members, pendingContributions, expenses, moderationRequests, summary] = await Promise.all([
    getEventInfo(),
    getMembers(),
    getPendingContributions(),
    getExpenses(),
    getModerationRequests(),
    getSummary(),
  ]);

  return (
    <AdminDashboardClient
      eventInfo={eventInfo}
      members={members}
      pendingContributions={pendingContributions}
      expenses={expenses}
      moderationRequests={moderationRequests}
      summary={summary}
    />
  );
}
