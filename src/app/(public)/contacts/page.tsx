import { Metadata } from 'next';
import { getMembers, getSummary } from '@/actions/data';
import InteractiveContactsList from './interactive-contacts-list';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'যোগাযোগ তালিকা — ইফতার মাহফিল ব্যাচ ২০১৭',
  description: 'সদস্যদের ফোন নম্বর সহ তালিকা।',
  openGraph: {
    title: 'যোগাযোগ তালিকা — ইফতার মাহফিল ব্যাচ ২০১৭',
    description: 'সদস্যদের ফোন নম্বর সহ তালিকা।',
    url: 'https://iftar-mahfil.vercel.app/contacts',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'যোগাযোগ তালিকা — ইফতার মাহফিল',
    description: 'সদস্যদের ফোন নম্বর সহ দ্রুত যোগাযোগ তালিকা।',
  },
};

export default async function ContactsPage() {
  const [members, summary] = await Promise.all([getMembers(), getSummary()]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <InteractiveContactsList members={members} summary={summary} />
    </div>
  );
}
