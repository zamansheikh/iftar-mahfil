import { Metadata } from 'next';
import { getMembers, getSummary } from '@/actions/data';
import InteractiveMembersList from './InteractiveMembersList';

export const metadata: Metadata = {
  title: 'সদস্যবৃন্দ — ইফতার মাহফিল ব্যাচ ২০১৭',
  description: 'ব্যাচ ২০১৭ এর সকল সদস্যদের চাঁদার তথ্য ও ফেরতের হিসাব।',
};

export default async function MembersPage() {
  const [members, summary] = await Promise.all([getMembers(), getSummary()]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <InteractiveMembersList members={members} summary={summary} />
    </div>
  );
}
