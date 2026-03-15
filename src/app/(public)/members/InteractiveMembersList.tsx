'use client';

import { useState } from 'react';
import { Users, Trophy, RotateCcw } from 'lucide-react';

function toBengaliNumber(n: number | string): string {
  const d = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return n.toString().replace(/\d/g, (x) => d[parseInt(x)]);
}

interface Member {
  _id: string;
  name: string;
  totalContribution: number;
}

interface Summary {
  memberCount: number;
  totalCollected: number;
  totalExpense: number;
  perMemberRefund: number;
  remaining: number;
}

export default function InteractiveMembersList({
  members,
  summary,
}: {
  members: Member[];
  summary: Summary;
}) {
  const [refundType, setRefundType] = useState<'equal' | 'proportional'>('equal');

  const validMembers = members.filter((m) => m.totalContribution >= 1);
  const totalValidContribution = validMembers.reduce((sum, m) => sum + m.totalContribution, 0);

  const calculateRefund = (member: Member) => {
    if (member.totalContribution < 1) return 0;
    if (summary.remaining <= 0) return 0;

    if (refundType === 'equal') {
      return validMembers.length > 0 ? Math.floor(summary.remaining / validMembers.length) : 0;
    } else {
      const ratio = totalValidContribution > 0 ? member.totalContribution / totalValidContribution : 0;
      return Math.floor(summary.remaining * ratio);
    }
  };

  return (
    <>
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
      {summary.remaining > 0 && validMembers.length > 0 && (
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0d1826] border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-300">ফেরত হিসাবের ধরণ:</span>
              <div className="flex bg-white/5 rounded-xl p-1">
                <button
                  onClick={() => setRefundType('equal')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    refundType === 'equal'
                      ? 'bg-emerald-500 text-black shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  সমানভাবে
                </button>
                <button
                  onClick={() => setRefundType('proportional')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    refundType === 'proportional'
                      ? 'bg-emerald-500 text-black shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  জমাকৃত হার অনুযায়ী
                </button>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/15 p-2.5 rounded-xl">
                <RotateCcw className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">ফেরতের হিসাব</p>
                {refundType === 'equal' ? (
                  <p className="text-sm text-gray-300">
                    অবশিষ্ট ({toBengaliNumber(summary.remaining)}৳) ÷ শুধুমাত্র চাঁদা প্রদানকারী {toBengaliNumber(validMembers.length)} জন সদস্য
                  </p>
                ) : (
                  <p className="text-sm text-gray-300">
                    সদস্যদের জমাকৃত চাঁদার আনুপাতিক হারে
                  </p>
                )}
              </div>
            </div>
            {refundType === 'equal' ? (
              <div className="text-right">
                <p className="text-xs text-gray-400">প্রতি সদস্য পাবেন</p>
                <p className="text-2xl font-bold text-emerald-400">
                  ৳ {toBengaliNumber(Math.floor(summary.remaining / validMembers.length))}
                </p>
              </div>
            ) : null}
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
                {members.map((member, idx) => {
                  const refund = calculateRefund(member);
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
                })}
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
                    {summary.remaining > 0
                       ? `৳ ${toBengaliNumber(summary.remaining)} (অবশিষ্ট)`
                       : '—'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
