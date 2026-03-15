import { Metadata } from 'next';
import { getPublicExpenses, getEventInfo, getMembers, getSummary } from '@/actions/data';
import { Receipt, TrendingDown, Wallet, Users, RotateCcw } from 'lucide-react';
import SummaryCard from '@/components/SummaryCard';
import InteractiveAccounts from './InteractiveAccounts';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'হিসাব-নিকাশ — ইফতার মাহফিল ব্যাচ ২০১৭',
  description: 'ইফতার মাহফিলের সম্পূর্ণ আয়-ব্যয়ের হিসাব।',
};

function toBengaliNumber(n: number): string {
  const d = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return n.toString().replace(/\d/g, (x) => d[parseInt(x)]);
}



export default async function AccountsPage() {
  const [expenses, members, summary, eventInfo] = await Promise.all([
    getPublicExpenses(),
    getMembers(),
    getSummary(),
    getEventInfo(),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 mb-4">
          <Receipt className="w-8 h-8 text-yellow-400" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">হিসাব-নিকাশ</h1>
        <p className="text-gray-400">সম্পূর্ণ আয়-ব্যয়ের স্বচ্ছ হিসাব</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          title="মোট জমা"
          value={`৳ ${toBengaliNumber(summary.totalCollected)}`}
          icon={<TrendingDown className="w-6 h-6 text-emerald-400" />}
          color="emerald"
        />
        <SummaryCard
          title="মোট খরচ"
          value={`৳ ${toBengaliNumber(summary.totalExpense)}`}
          icon={<Wallet className="w-6 h-6 text-red-400" />}
          color="red"
        />
        <SummaryCard
          title="অবশিষ্ট"
          value={`৳ ${toBengaliNumber(summary.remaining)}`}
          icon={<Wallet className="w-6 h-6 text-yellow-400" />}
          color="gold"
        />
      </div>

      <InteractiveAccounts summary={summary} expenses={expenses} members={members} exactDateStr={eventInfo.exactDate} />
    </div>
  );
}
