import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The pages themselves handle auth redirects
  return <div className="min-h-screen">{children}</div>;
}
