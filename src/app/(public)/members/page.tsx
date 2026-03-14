import { Metadata } from 'next';
import { Users, Trophy, RotateCcw } from 'lucide-react';
import { getMembers, getSummary } from '@/actions/data';

export const metadata: Metadata = {
  title: 'সদস্যবৃন্দ — ইফতার মাহফিল ব্যাচ ২০১৭',
  description: 'ব্যাচ ২০১৭ এর সকল সদস্যদের চাঁদার তথ্য ও ফেরতের হিসাব।',
};

function toBengaliNumber(n: number): string {
  const d = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return n.toString().replace(/\d/g, (x) => d[parseInt(x)]);
}

export default async function MembersPage() {
  const [members, summary] = await Promise.all([getMembers(), getSummary()]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
          <Users className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">সদস্যবৃন্দ</h1>
        <p className="text-gray-400">
          মোট <span className="text-emerald-400 font-semibold">{toBengaliNumber(summary.memberCount)}</span> জন সদস্য
        </p>
      </div>

      {/* Refund Banner */}
      {summary.memberCount > 0 && (
        <div className="mb-8 p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/15 p-2.5 rounded-xl">
              <RotateCcw className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">ফেরতের হিসাব</p>
              <p className="text-sm text-gray-300">
                মোট জমা ({toBengaliNumber(summary.totalCollected)}৳) − মোট খরচ ({toBengaliNumber(summary.totalExpense)}৳) ÷ {toBengaliNumber(summary.memberCount)} জন সদস্য
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">প্রতি সদস্য পাবেন</p>
            <p className="text-2xl font-bold text-emerald-400">৳ {toBengaliNumber(summary.perMemberRefund)}</p>
          </div>
        </div>
      )}

      {/* Members Table */}
      {members.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center border border-emerald-900/20">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">এখনও কোনো সদস্য যোগ করা হয়নি।</p>
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
                  ) => {
                    const refund = summary.perMemberRefund;
                    return (
                      <tr key={member._id} className="transition-colors">
                        <td className="px-5 py-4 text-gray-500 text-sm">
                          {toBengaliNumber(idx + 1)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">
                              {member.name.charAt(0)}
                            </div>
                            <span className="font-medium text-white">{member.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="font-semibold text-yellow-400">
                            ৳ {toBengaliNumber(member.totalContribution)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                              refund > 0
                                ? 'badge-emerald'
                                : 'bg-gray-800 text-gray-400'
                            }`}
                          >
                            {refund > 0 && <Trophy className="w-3 h-3" />}
                            {refund > 0 ? `৳ ${toBengaliNumber(refund)}` : '—'}
                          </span>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
              {/* Footer row */}
              <tfoot>
                <tr className="border-t border-yellow-500/20 bg-yellow-500/5">
                  <td colSpan={2} className="px-5 py-4 font-bold text-yellow-400">
                    মোট
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-yellow-400">
                    ৳ {toBengaliNumber(summary.totalCollected)}
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-emerald-400">
                    {summary.memberCount > 0
                      ? `৳ ${toBengaliNumber(summary.perMemberRefund)} × ${toBengaliNumber(summary.memberCount)}`
                      : '—'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
