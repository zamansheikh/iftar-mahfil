import { Metadata } from 'next';
import { getCollectorsForForms, getMemberNames } from '@/actions/data';
import ContributeForm from './ContributeForm';

export const metadata: Metadata = {
  title: 'চাঁদা জমা — ইফতার মাহফিল ব্যাচ ২০১৭',
  description: 'ইফতার মাহফিলে আপনার চাঁদা জমা দিন।',
  openGraph: {
    title: 'চাঁদা জমা — ইফতার মাহফিল ব্যাচ ২০১৭',
    description: 'ইফতার মাহফিলে আপনার চাঁদা জমা দিন।',
    url: 'https://iftar-mahfil.vercel.app/contribute',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'চাঁদা জমা — ইফতার মাহফিল',
    description: 'অনলাইনে দ্রুত চাঁদা জমা দিন।',
  },
};

export default async function ContributePage() {
  const [memberNames, collectors] = await Promise.all([
    getMemberNames(),
    getCollectorsForForms(),
  ]);
  return <ContributeForm memberNames={memberNames} collectors={collectors} />;
}
