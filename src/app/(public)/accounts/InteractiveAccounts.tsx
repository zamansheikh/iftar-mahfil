'use client';

// Imports updated
import { useState } from 'react';
import { Receipt, Users, Download } from 'lucide-react';

function toBengaliNumber(n: number | string): string {
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

interface Summary {
  totalCollected: number;
  totalExpense: number;
  remaining: number;
  memberCount: number;
}

interface Expense {
  _id: string;
  description: string;
  amount: number;
  date: string;
  spentBy: string;
}

interface Member {
  _id: string;
  name: string;
  totalContribution: number;
}

export default function InteractiveAccounts({
  summary,
  expenses,
  members,
  exactDateStr,
}: {
  summary: Summary;
  expenses: Expense[];
  members: Member[];
  exactDateStr?: string;
}) {
  const [refundType, setRefundType] = useState<'equal' | 'proportional'>('equal');

  // Determine if event has passed
  const isEventDone = (() => {
    if (!exactDateStr) return false;
    const targetDate = new Date(exactDateStr).getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;
    return Date.now() > targetDate + oneDayMs;
  })();

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

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div id="pdf-content" className="p-4 sm:p-0 printable-area">
      {/* Added specifically for print mode */}
      <div className="hidden print-header">
        <h1>ইফতার মাহফিল হিসাব-নিকাশ</h1>
        <p>
          মোট জমা: ৳ {toBengaliNumber(summary.totalCollected)} | 
          মোট খরচ: ৳ {toBengaliNumber(summary.totalExpense)} | 
          অবশিষ্ট: ৳ {toBengaliNumber(summary.remaining)}
        </p>
      </div>

      {/* Refund Banner and Controls */}
      {summary.remaining > 0 && validMembers.length > 0 && (
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0d1826] border border-white/10 rounded-2xl p-4 no-print">
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
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-yellow-500/30 text-yellow-400 text-sm font-medium hover:bg-yellow-500/10 transition-colors w-full sm:w-auto justify-center disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              পিডিএফ ডাউনলোড (Print)
            </button>
          </div>

          <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 text-center">
            {refundType === 'equal' ? (
              <>
                <p className="text-lg font-bold text-emerald-400">
                  প্রত্যেক সদস্য (যারা চাঁদা দিয়েছেন) ফেরত পাবেন{' '}
                  <span className="text-2xl">
                    ৳ {toBengaliNumber(Math.floor(summary.remaining / validMembers.length))}
                  </span>{' '}
                  টাকা
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  (শুধুমাত্র চাঁদা প্রদানকারী {toBengaliNumber(validMembers.length)} জন সদস্যের মাঝে অবশিষ্ট অর্থ সমানভাবে ভাগ করা হয়েছে)
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold text-emerald-400">
                  সদস্যরা তাদের জমাকৃত চাঁদার আনুপাতিক হারে ফেরত পাবেন
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  (যে যত শতাংশ মূল ফাণ্ডে জমা দিয়েছেন, অবশিষ্ট অর্থের তত শতাংশ ফেরত পাবেন)
                </p>
              </>
            )}
          </div>

          {/* Dynamic message based on event status */}
          <div className="p-4 rounded-2xl border border-yellow-500/30 bg-yellow-500/5 text-center">
            <p className="text-yellow-400 font-semibold text-[15px] sm:text-base">
              {isEventDone ? (
                <>🎉 সমস্ত খরচ বাদে অবশিষ্ট আছে ৳ {toBengaliNumber(summary.remaining)} টাকা, যা সদস্যদের মাঝে ফেরত দেওয়া হবে।</>
              ) : (
                <>আপাতত সম্ভাব্য হিসাব অনুযায়ী অবশিষ্ট আছে ৳ {toBengaliNumber(summary.remaining)} টাকা। ইভেন্ট শেষ হওয়ার পর আসল হিসাব ও ফেরতযোগ্য অর্থ প্রকাশ করা হবে।</>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Expense List */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-red-400" />
            খরচের বিস্তারিত
          </h2>
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
                    <th className="px-5 py-4 text-left">খরচকারী</th>
                    <th className="px-5 py-4 text-right">তারিখ</th>
                    <th className="px-5 py-4 text-right">পরিমাণ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {expenses.map((exp, idx) => (
                    <tr key={exp._id} className="transition-colors">
                      <td className="px-5 py-4 text-gray-500 text-sm">
                        {toBengaliNumber(idx + 1)}
                      </td>
                      <td className="px-5 py-4 text-white">{exp.description}</td>
                      <td className="px-5 py-4 text-emerald-400 text-sm">{exp.spentBy || '---'}</td>
                      <td className="px-5 py-4 text-right text-gray-400 text-sm">
                        {formatDate(exp.date)}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-red-400">
                        ৳ {toBengaliNumber(exp.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-red-500/20 bg-red-500/5">
                    <td colSpan={4} className="px-5 py-4 font-bold text-red-400 text-right">
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

        {validMembers.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-white/5">
            <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">এখনও কোনো সদস্য চাঁদা দেননি বা যোগ করা হয়নি।</p>
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
                  {validMembers.map((m, i) => {
                    const refundAmt = calculateRefund(m);
                    return (
                      <tr key={m._id} className="transition-colors">
                        <td className="px-5 py-4 text-gray-500 text-sm">
                          {toBengaliNumber(i + 1)}
                        </td>
                        <td className="px-5 py-4 font-medium text-white">{m.name}</td>
                        <td className="px-5 py-4 text-right text-yellow-400 font-semibold">
                          ৳ {toBengaliNumber(m.totalContribution)}
                        </td>
                        <td className="px-5 py-4 text-right text-emerald-400 font-semibold">
                          ৳ {toBengaliNumber(refundAmt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
