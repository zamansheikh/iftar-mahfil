'use client';

import { Download } from 'lucide-react';

interface Summary {
  totalCollected: number;
  totalExpense: number;
  remaining: number;
  memberCount: number;
  perMemberRefund: number;
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

export default function AccountsDownload({
  summary,
  expenses,
  members,
}: {
  summary: Summary;
  expenses: Expense[];
  members: Member[];
}) {
  const handleDownload = () => {
    const rows: string[][] = [];

    rows.push(['=== ইফতার মাহফিল ব্যাচ ২০১৭ — হিসাব-নিকাশ ===']);
    rows.push([]);
    rows.push(['--- আর্থিক সারসংক্ষেপ ---']);
    rows.push(['মোট জমা', `${summary.totalCollected} টাকা`]);
    rows.push(['মোট খরচ', `${summary.totalExpense} টাকা`]);
    rows.push(['অবশিষ্ট', `${summary.remaining} টাকা`]);
    rows.push(['সদস্য সংখ্যা', `${summary.memberCount} জন`]);
    rows.push(['প্রতি সদস্য ফেরত', `${summary.perMemberRefund} টাকা`]);
    rows.push([]);
    rows.push(['--- খরচের বিবরণ ---']);
    rows.push(['#', 'বিবরণ', 'কে খরচ করেছে', 'তারিখ', 'পরিমাণ']);
    expenses.forEach((e, i) => {
      rows.push([
        `${i + 1}`,
        e.description,
        e.spentBy || '---',
        new Date(e.date).toLocaleDateString('bn-BD'),
        `${e.amount} টাকা`,
      ]);
    });
    rows.push([]);
    rows.push(['--- সদস্যদের চাঁদা ---']);
    rows.push(['#', 'নাম', 'জমাকৃত চাঁদা', 'ফেরত পাবেন']);
    members.forEach((m, i) => {
      rows.push([
        `${i + 1}`,
        m.name,
        `${m.totalContribution} টাকা`,
        `${summary.perMemberRefund} টাকা`,
      ]);
    });

    const csvContent = '\uFEFF' + rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'iftar-mahfil-hisab.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-yellow-500/30 text-yellow-400 text-sm font-medium hover:bg-yellow-500/10 transition-colors"
    >
      <Download className="w-4 h-4" />
      CSV ডাউনলোড
    </button>
  );
}
