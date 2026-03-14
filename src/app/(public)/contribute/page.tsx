import { Metadata } from 'next';
import { getMemberNames } from '@/actions/data';
import ContributeForm from './ContributeForm';

export const metadata: Metadata = {
  title: 'চাঁদা জমা — ইফতার মাহফিল ব্যাচ ২০১৭',
  description: 'ইফতার মাহফিলে আপনার চাঁদা জমা দিন।',
};

export default async function ContributePage() {
  const memberNames = await getMemberNames();
  return <ContributeForm memberNames={memberNames} />;
}
