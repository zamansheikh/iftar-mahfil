import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import AdminLoginForm from './AdminLoginForm';

export default async function AdminPage() {
  const session = await getAdminSession();
  if (session) redirect('/admin/dashboard');

  return (
    <div className="islamic-pattern min-h-screen flex items-center justify-center p-4">
      <AdminLoginForm />
    </div>
  );
}
