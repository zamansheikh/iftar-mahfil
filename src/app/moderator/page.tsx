import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import ModeratorLoginForm from './ModeratorLoginForm';

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
