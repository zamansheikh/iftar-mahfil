import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { getMembers, getMyModerationRequests } from '@/actions/data';
import ModeratorDashboardClient from './moderator-dashboard-client';

export default async function ModeratorDashboardPage() {
  const session = await getAdminSession();
  if (!session || (session.role !== 'moderator' && session.role !== 'admin')) {
    redirect('/moderator');
  }

  const [members, requests] = await Promise.all([
    getMembers(),
    getMyModerationRequests(),
  ]);

  return <ModeratorDashboardClient members={members} requests={requests} />;
}
