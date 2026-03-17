import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { getMembers, getMyModerationRequests, getSummary, getExpenses } from '@/actions/data';
import ModeratorDashboardClient from './moderator-dashboard-client';

export default async function ModeratorDashboardPage() {
  const session = await getAdminSession();
  if (!session || (session.role !== 'moderator' && session.role !== 'admin')) {
    redirect('/moderator');
  }

  const [members, requests, summary, expenses] = await Promise.all([
    getMembers(),
    getMyModerationRequests(),
    getSummary(),
    getExpenses(),
  ]);

  return <ModeratorDashboardClient members={members} requests={requests} summary={summary} expenses={expenses} />;
}
