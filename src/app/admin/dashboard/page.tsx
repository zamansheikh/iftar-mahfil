import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import {
  getEventInfo,
  getMembers,
  getPendingContributions,
  getExpenses,
  getSummary,
} from '@/actions/data';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin');

  const [eventInfo, members, pendingContributions, expenses, summary] = await Promise.all([
    getEventInfo(),
    getMembers(),
    getPendingContributions(),
    getExpenses(),
    getSummary(),
  ]);

  return (
    <AdminDashboardClient
      eventInfo={eventInfo}
      members={members}
      pendingContributions={pendingContributions}
      expenses={expenses}
      summary={summary}
    />
  );
}
