import { Metadata } from 'next';
import { getExpenses, getMembers, getSummary } from '@/actions/data';
import { Receipt, TrendingDown, Wallet, Users, RotateCcw, Download } from 'lucide-react';
import SummaryCard from '@/components/SummaryCard';
import AccountsDownload from './AccountsDownload';

export const metadata: Metadata = {
  title: 'হিসাব-নিকাশ — ইফতার মাহফিল ব্যাচ ২০১৭',
  description: 'ইফতার মাহফিলের সম্পূর্ণ আয়-ব্যয়ের হিসাব।',
};

function toBengaliNumber(n: number): string {
  const d = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return n.toString().replace(/\d/g, (x) => d[parseInt(x)]);
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function AccountsPage() {
  const [expenses, members, summary] = await Promise.all([
    getExpenses(),
    getMembers(),
    getSummary(),
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
        <SummaryCard
          title="ফেরত/সদস্য"
          value={`৳ ${toBengaliNumber(summary.perMemberRefund)}`}
          icon={<RotateCcw className="w-6 h-6 text-blue-400" />}
          color="blue"
        />
      </div>

      {/* Refund Banner */}
      {summary.memberCount > 0 && (
        <div className="mb-8 p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 text-center">
          <p className="text-lg font-bold text-emerald-400">
            খরচ শেষে প্রতি সদস্য ফেরত পাবেন{' '}
            <span className="text-2xl">৳ {toBengaliNumber(summary.perMemberRefund)}</span> টাকা
          </p>
          <p className="text-xs text-gray-500 mt-1">
            (৳{summary.totalCollected} − ৳{summary.totalExpense}) ÷ {summary.memberCount} জন সদস্য
          </p>
        </div>
      )}

      {/* Expense List */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-red-400" />
            খরচের বিস্তারিত
          </h2>
          <AccountsDownload summary={summary} expenses={expenses} members={members} />
        </div>

        {expenses.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-white/5">
            <Receipt className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">এখনও কোনো খরচ যোগ করা হয়নি।</p>
          </div>
        ) : (
          <div className="glass-card rounded-2xl border border-red-900/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th className="px-5 py-4 text-left">#</th>
                    <th className="px-5 py-4 text-left">বিবরণ</th>
                    <th className="px-5 py-4 text-right">তারিখ</th>
                    <th className="px-5 py-4 text-right">পরিমাণ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {expenses.map(
                    (
                      exp: { _id: string; description: string; amount: number; date: string },
                      idx: number
                    ) => (
                      <tr key={exp._id} className="transition-colors">
                        <td className="px-5 py-4 text-gray-500 text-sm">
                          {toBengaliNumber(idx + 1)}
                        </td>
                        <td className="px-5 py-4 text-white">{exp.description}</td>
                        <td className="px-5 py-4 text-right text-gray-400 text-sm">
                          {formatDate(exp.date)}
                        </td>
                        <td className="px-5 py-4 text-right font-semibold text-red-400">
                          ৳ {toBengaliNumber(exp.amount)}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t border-red-500/20 bg-red-500/5">
                    <td colSpan={3} className="px-5 py-4 font-bold text-red-400">
                      মোট খরচ
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-red-400">
                      ৳ {toBengaliNumber(summary.totalExpense)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Members contribution */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-emerald-400" />
          সদস্যদের চাঁদার তালিকা
        </h2>

        {members.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-white/5">
            <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">এখনও কোনো সদস্য নেই।</p>
          </div>
        ) : (
          <div className="glass-card rounded-2xl border border-emerald-900/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th className="px-5 py-4 text-left">#</th>
                    <th className="px-5 py-4 text-left">নাম</th>
                    <th className="px-5 py-4 text-right">জমাকৃত চাঁদা</th>
                    <th className="px-5 py-4 text-right">ফেরত পাবেন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {members.map(
                    (
                      member: { _id: string; name: string; totalContribution: number },
                      idx: number
                    ) => (
                      <tr key={member._id} className="transition-colors">
                        <td className="px-5 py-4 text-gray-500 text-sm">
                          {toBengaliNumber(idx + 1)}
                        </td>
                        <td className="px-5 py-4 font-medium text-white">{member.name}</td>
                        <td className="px-5 py-4 text-right text-yellow-400 font-semibold">
                          ৳ {toBengaliNumber(member.totalContribution)}
                        </td>
                        <td className="px-5 py-4 text-right text-emerald-400 font-semibold">
                          ৳ {toBengaliNumber(summary.perMemberRefund)}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
