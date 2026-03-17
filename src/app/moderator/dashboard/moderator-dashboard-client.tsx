'use client';

import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { logoutAction } from '@/actions/auth';
import SharedNotesTab from '@/components/SharedNotesTab';
import {
  moderatorAddMember,
  moderatorUpdateMemberPhone,
  createContributionAdjustmentRequest,
  createExpenseRequest,
} from '@/actions/data';
import {
  Loader2,
  LogOut,
  Phone,
  Receipt,
  Users,
  Wallet,
  TrendingUp,
  ChevronDown,
  BadgePlus,
  ClipboardList,
  Download,
  FileText,
} from 'lucide-react';
import { useFormStatus } from 'react-dom';

interface Member {
  _id: string;
  name: string;
  alternativeName?: string;
  phone?: string;
  isCollector?: boolean;
  totalContribution: number;
}

interface Expense {
  _id: string;
  description: string;
  amount: number;
  date: string;
  spentBy: string;
  isExpended?: boolean;
}

interface ModerationRequestItem {
  _id: string;
  type: 'member_contribution_update' | 'expense_add';
  status: 'pending' | 'approved' | 'rejected';
  payload: Record<string, unknown>;
  note?: string;
  createdAt: string;
}

interface Summary {
  totalCollected: number;
  totalExpense: number;
  remaining: number;
  memberCount: number;
  perMemberRefund: number;
}

interface SharedNote {
  _id: string;
  content: string;
  memberName?: string;
  createdBy: string;
  createdByRole: 'admin' | 'moderator';
  createdAt: string;
}

function toBn(n: number) {
  return n.toString().replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d)]);
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl border border-white/5 p-6">
      <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
        <span className="w-1.5 h-5 rounded-full bg-emerald-500 block" />
        {title}
      </h3>
      {children}
    </div>
  );
}

const tabs = [
  { id: 'memberList', label: 'সদস্য তালিকা', icon: <BadgePlus className="w-4 h-4" /> },
  { id: 'summary', label: 'সারসংক্ষেপ', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'members', label: 'সদস্য এডিট/যোগ', icon: <Users className="w-4 h-4" /> },
  { id: 'money', label: 'চাঁদা অনুরোধ', icon: <Wallet className="w-4 h-4" /> },
  { id: 'expense', label: 'খরচ অনুরোধ', icon: <Receipt className="w-4 h-4" /> },
  { id: 'notes', label: 'নোটস', icon: <FileText className="w-4 h-4" /> },
  { id: 'requests', label: 'আমার অনুরোধ', icon: <ClipboardList className="w-4 h-4" /> },
] as const;

function requestStatusLabel(status: ModerationRequestItem['status']) {
  if (status === 'approved') return 'অনুমোদিত';
  if (status === 'rejected') return 'প্রত্যাখ্যাত';
  return 'অপেক্ষমাণ';
}

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold disabled:opacity-60"
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      {label}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl border border-white/5 p-5">
      <h3 className="text-base font-bold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

function SummaryTab({ summary, members, expenses }: { summary: Summary; members: Member[]; expenses: Expense[] }) {
  const [refundType, setRefundType] = useState<'equal' | 'proportional'>('equal');
  const [includeDrafts, setIncludeDrafts] = useState(false);
  const [showAllMembers, setShowAllMembers] = useState(false);

  const expendedExpenses = expenses.filter((e) => e.isExpended);
  const draftExpenses = expenses.filter((e) => !e.isExpended);
  const expendedTotal = expendedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const draftTotal = draftExpenses.reduce((sum, e) => sum + e.amount, 0);

  const totalExpenseWithDrafts = summary.totalExpense + draftTotal;
  const remainingWithDrafts = summary.totalCollected - totalExpenseWithDrafts;

  const validMembers = members.filter((m) => m.totalContribution >= 1);
  const totalValidContribution = validMembers.reduce((sum, m) => sum + m.totalContribution, 0);
  const displayMembers = showAllMembers ? members : validMembers;

  const calculateRefund = (member: Member) => {
    if (member.totalContribution < 1) return 0;
    const remaining = includeDrafts ? remainingWithDrafts : summary.remaining;
    if (remaining <= 0) return 0;

    if (refundType === 'equal') {
      return validMembers.length > 0 ? Math.floor(remaining / validMembers.length) : 0;
    }

    const ratio = totalValidContribution > 0 ? member.totalContribution / totalValidContribution : 0;
    return Math.floor(remaining * ratio);
  };

  const displayTotalExpense = includeDrafts ? totalExpenseWithDrafts : summary.totalExpense;
  const displayRemaining = includeDrafts ? remainingWithDrafts : summary.remaining;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'মোট জমা', value: summary.totalCollected, color: 'text-emerald-400', icon: <TrendingUp className="w-5 h-5" /> },
          {
            label: 'মোট খরচ',
            value: displayTotalExpense,
            color: 'text-red-400',
            icon: <Receipt className="w-5 h-5" />,
            subtitle: includeDrafts ? 'ড্রাফটসহ' : 'প্রকাশিত',
          },
          { label: 'অবশিষ্ট', value: displayRemaining, color: 'text-yellow-400', icon: <Wallet className="w-5 h-5" /> },
          { label: 'সদস্য সংখ্যা', value: summary.memberCount, color: 'text-blue-400', icon: <Users className="w-5 h-5" />, isMember: true },
        ].map((item) => (
          <div key={item.label} className="glass-card rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-2 mb-2 text-gray-500">
              {item.icon}
              <span className="text-xs uppercase tracking-wider">{item.label}</span>
            </div>
            <p className={`text-2xl font-bold ${item.color}`}>
              {item.isMember ? toBn(item.value) : `৳ ${toBn(item.value)}`}
            </p>
            {item.subtitle ? <p className="text-xs text-gray-400 mt-1">{item.subtitle}</p> : null}
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0d1826] border border-white/10 rounded-2xl p-4 data-html2canvas-ignore no-print">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
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

          <label className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={includeDrafts}
              onChange={(e) => setIncludeDrafts(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 text-emerald-500 bg-[#0d1826] cursor-pointer"
            />
            ড্রাফটসহ খরচ দেখুন
          </label>
        </div>

        <button
          onClick={() => {
            window.print();
          }}
          className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold transition-all no-print"
        >
          <Download className="w-4 h-4" />
          পিডিএফ ডাউনলোড (Print)
        </button>
      </div>

      <div id="admin-pdf-content" className="space-y-6 printable-area">
        <div className="hidden print-header">
          <h1>ইফতার মাহফিল হিসাব-নিকাশ</h1>
          <p>
            মোট জমা: ৳ {toBn(summary.totalCollected)} |
            মোট খরচ: ৳ {toBn(summary.totalExpense)} |
            অবশিষ্ট: ৳ {toBn(summary.remaining)}
          </p>
        </div>

        {displayRemaining > 0 && validMembers.length > 0 && (
          <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 text-center">
            {refundType === 'equal' ? (
              <p className="text-lg font-bold text-emerald-400 m-0">
                প্রত্যেক সদস্য (যারা চাঁদা দিয়েছেন) ফেরত পাবেন{' '}
                <span className="text-2xl">
                  ৳ {toBn(Math.floor(displayRemaining / validMembers.length))}
                </span>{' '}
                টাকা
              </p>
            ) : (
              <p className="text-lg font-bold text-emerald-400 m-0">
                সদস্যরা তাদের জমাকৃত চাঁদার আনুপাতিক হারে ফেরত পাবেন
              </p>
            )}
          </div>
        )}

        <SectionCard title={`প্রকাশিত খরচ (খরচ হয়েছে) (${toBn(expendedExpenses.length)}টি)`}>
          {expendedExpenses.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">কোনো প্রকাশিত খরচ নেই।</p>
          ) : (
            <div className="overflow-x-auto print-overflow-visible">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left w-12">#</th>
                    <th className="px-4 py-3 text-left">বিবরণ</th>
                    <th className="px-4 py-3 text-left w-32">তারিখ</th>
                    <th className="px-4 py-3 text-left w-40">খরচকারী</th>
                    <th className="px-4 py-3 text-right w-32">পরিমাণ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {expendedExpenses.map((e, i) => (
                    <tr key={e._id}>
                      <td className="px-4 py-3 text-gray-500 text-sm">{toBn(i + 1)}</td>
                      <td className="px-4 py-3 text-white font-medium">{e.description}</td>
                      <td className="px-4 py-3 text-gray-400">{new Date(e.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className="px-4 py-3 text-gray-400">{e.spentBy}</td>
                      <td className="px-4 py-3 text-right text-red-400 font-semibold whitespace-nowrap">৳ {toBn(e.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between pt-3 border-t border-white/10">
                <span className="text-sm font-bold text-gray-400">মোট প্রকাশিত খরচ</span>
                <span className="text-sm font-bold text-red-400">৳ {toBn(expendedTotal)}</span>
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard title={`ড্রাফট / তালিকাভুক্ত খরচ (${toBn(draftExpenses.length)}টি)`}>
          {draftExpenses.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">কোনো তালিকাভুক্ত/ড্রাফট খরচ নেই।</p>
          ) : (
            <div className="overflow-x-auto print-overflow-visible">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left w-12">#</th>
                    <th className="px-4 py-3 text-left">বিবরণ</th>
                    <th className="px-4 py-3 text-left w-32">তারিখ</th>
                    <th className="px-4 py-3 text-left w-40">খরচকারী</th>
                    <th className="px-4 py-3 text-right w-32">পরিমাণ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {draftExpenses.map((e, i) => (
                    <tr key={e._id}>
                      <td className="px-4 py-3 text-gray-500 text-sm">{toBn(i + 1)}</td>
                      <td className="px-4 py-3 text-white font-medium">{e.description}</td>
                      <td className="px-4 py-3 text-gray-400">{new Date(e.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className="px-4 py-3 text-gray-400">{e.spentBy}</td>
                      <td className="px-4 py-3 text-right text-red-400 font-semibold whitespace-nowrap">৳ {toBn(e.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between pt-3 border-t border-white/10">
                <span className="text-sm font-bold text-gray-400">মোট তালিকাভুক্ত খরচ</span>
                <span className="text-sm font-bold text-red-400">৳ {toBn(draftTotal)}</span>
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard title={`সদস্যদের বিস্তারিত (${toBn(displayMembers.length)} জন)`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <p className="text-sm text-gray-400">
              {showAllMembers
                ? 'সকল সদস্য দেখানো হচ্ছে (জমা ০ সহ)'
                : 'শুরুতে শুধুমাত্র যারা ১ টাকা বা তার বেশি দান করেছেন দেখানো হচ্ছে'}
            </p>
            <label className="inline-flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showAllMembers}
                onChange={(e) => setShowAllMembers(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 text-emerald-500 bg-[#0d1826] cursor-pointer"
              />
              সব সদস্য দেখান
            </label>
          </div>

          {displayMembers.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">কোনো সদস্য নেই।</p>
          ) : (
            <div className="overflow-x-auto print-overflow-visible">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left w-12">#</th>
                    <th className="px-4 py-3 text-left">নাম</th>
                    <th className="px-4 py-3 text-right w-32">জমাকৃত</th>
                    <th className="px-4 py-3 text-right w-32">ফেরত পাবেন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {displayMembers.map((m, i) => {
                    const refundAmt = calculateRefund(m);
                    return (
                      <tr key={m._id}>
                        <td className="px-4 py-3 text-gray-500 text-sm">{toBn(i + 1)}</td>
                        <td className="px-4 py-3 text-white font-medium">{m.name}</td>
                        <td className="px-4 py-3 text-right text-yellow-400 font-semibold">৳ {toBn(m.totalContribution)}</td>
                        <td className="px-4 py-3 text-right text-emerald-400 font-semibold">৳ {toBn(refundAmt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function SearchableMemberSelect({
  members,
  hiddenInputName,
  selectedId,
  onSelect,
  placeholder,
}: {
  members: Member[];
  hiddenInputName: string;
  selectedId: string;
  onSelect: (id: string) => void;
  placeholder: string;
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedMember = useMemo(
    () => members.find((m) => m._id === selectedId),
    [members, selectedId]
  );

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((member) => {
      const name = member.name.toLowerCase();
      const alt = member.alternativeName?.toLowerCase() || '';
      const phone = member.phone?.toLowerCase() || '';
      return name.includes(q) || alt.includes(q) || phone.includes(q);
    });
  }, [members, query]);

  useEffect(() => {
    if (!selectedMember) return;
    setQuery(selectedMember.name);
  }, [selectedMember]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <input type="hidden" name={hiddenInputName} value={selectedId} />
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSelect('');
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-white text-sm focus:border-emerald-500/50 transition-colors"
        />
        <button
          type="button"
          onClick={() => setIsOpen((p) => !p)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-emerald-400"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {isOpen && (
        <ul className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded-xl border border-white/10 bg-[#070d1a] py-1 list-none p-0 m-0">
          {filteredMembers.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-400">কোনো সদস্য পাওয়া যায়নি।</li>
          ) : (
            filteredMembers.map((member) => (
              <li
                key={member._id}
                className="px-4 py-2.5 text-sm cursor-pointer transition-colors border-b border-white/5 last:border-0 hover:bg-emerald-500/15"
                onClick={() => {
                  onSelect(member._id);
                  setQuery(member.name);
                  setIsOpen(false);
                }}
              >
                <div className="flex flex-col">
                  <span className="text-white font-medium">{member.name}</span>
                  <span className="text-xs text-gray-500">
                    {member.alternativeName || '---'} {member.phone ? ` | ${member.phone}` : ''}
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default function ModeratorDashboardClient({
  members,
  requests,
  summary,
  expenses,
  notes,
}: {
  members: Member[];
  requests: ModerationRequestItem[];
  summary: Summary;
  expenses: Expense[];
  notes: SharedNote[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('memberList');
  const [selectedMemberIdForPhone, setSelectedMemberIdForPhone] = useState('');
  const [selectedMemberIdForMoney, setSelectedMemberIdForMoney] = useState('');
  const [selectedCollectorIdForMoney, setSelectedCollectorIdForMoney] = useState('');
  const [selectedCollectorIdForExpense, setSelectedCollectorIdForExpense] = useState('');
  const [memberListQuery, setMemberListQuery] = useState('');
  const collectors = useMemo(() => members.filter((m) => m.isCollector), [members]);

  const [addMemberState, addMemberAction] = useActionState(moderatorAddMember, null);
  const [phoneState, phoneAction] = useActionState(moderatorUpdateMemberPhone, null);
  const [moneyReqState, moneyReqAction] = useActionState(createContributionAdjustmentRequest, null);
  const [expenseReqState, expenseReqAction] = useActionState(createExpenseRequest, null);

  useEffect(() => {
    if ((addMemberState as { success?: string })?.success) {
      toast.success((addMemberState as { success?: string }).success);
      router.refresh();
    }
    if ((addMemberState as { error?: string })?.error) toast.error((addMemberState as { error?: string }).error);
  }, [addMemberState, router]);

  useEffect(() => {
    if ((phoneState as { success?: string })?.success) {
      toast.success((phoneState as { success?: string }).success);
      router.refresh();
    }
    if ((phoneState as { error?: string })?.error) toast.error((phoneState as { error?: string }).error);
  }, [phoneState, router]);

  useEffect(() => {
    if ((moneyReqState as { success?: string })?.success) toast.success((moneyReqState as { success?: string }).success);
    if ((moneyReqState as { error?: string })?.error) toast.error((moneyReqState as { error?: string }).error);
  }, [moneyReqState]);

  useEffect(() => {
    if ((expenseReqState as { success?: string })?.success) toast.success((expenseReqState as { success?: string }).success);
    if ((expenseReqState as { error?: string })?.error) toast.error((expenseReqState as { error?: string }).error);
  }, [expenseReqState]);

  useEffect(() => {
    if ((phoneState as { success?: string })?.success) setSelectedMemberIdForPhone('');
  }, [phoneState]);

  useEffect(() => {
    if ((moneyReqState as { success?: string })?.success) setSelectedMemberIdForMoney('');
  }, [moneyReqState]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/5 bg-[#070d1a]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-emerald-400">মডারেটর প্যানেল</p>
            <p className="text-xs text-gray-500">সীমিত অ্যাকসেস</p>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/10 transition-colors">
              <LogOut className="w-3.5 h-3.5" /> লগআউট
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-wrap gap-2 mb-2 border-b border-white/10 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'members' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Section title="নতুন সদস্য যোগ করুন">
              <form action={addMemberAction} className="space-y-3">
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="সদস্যের নাম"
                  className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm"
                />
                <input
                  type="text"
                  name="alternativeName"
                  placeholder="ইংরেজি নাম (ঐচ্ছিক)"
                  className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="ফোন নম্বর"
                  className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm"
                />
                <SaveButton label="সদস্য যোগ করুন" />
              </form>
            </Section>

            <Section title="বিদ্যমান সদস্যের ফোন আপডেট">
              <form action={phoneAction} className="space-y-3">
                <SearchableMemberSelect
                  members={members}
                  hiddenInputName="id"
                  selectedId={selectedMemberIdForPhone}
                  onSelect={setSelectedMemberIdForPhone}
                  placeholder="সদস্য খুঁজে বেছে নিন"
                />
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="নতুন ফোন নম্বর"
                  className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm"
                />
                <SaveButton label="ফোন আপডেট করুন" />
              </form>
            </Section>
          </div>
        )}

        {activeTab === 'money' && (
          <Section title="চাঁদা আপডেটের অনুরোধ পাঠান (অ্যাডমিন অনুমোদন সাপেক্ষে)">
            <form action={moneyReqAction} className="space-y-3 max-w-2xl">
              <SearchableMemberSelect
                members={members}
                hiddenInputName="memberId"
                selectedId={selectedMemberIdForMoney}
                onSelect={setSelectedMemberIdForMoney}
                placeholder="কার টাকা জমা হবে - সদস্য খুঁজে বেছে নিন"
              />
              <SearchableMemberSelect
                members={collectors}
                hiddenInputName="collectorId"
                selectedId={selectedCollectorIdForMoney}
                onSelect={setSelectedCollectorIdForMoney}
                placeholder="টাকা কে তুলতেছে - (Collector) খুঁজে বেছে নিন"
              />
              <input type="hidden" name="operation" value="add" />
              <input
                type="number"
                min="0"
                name="amount"
                required
                placeholder="টাকার পরিমাণ"
                className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm"
              />
              <textarea
                name="note"
                rows={2}
                placeholder="নোট (ঐচ্ছিক)"
                className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm resize-none"
              />
              <SaveButton label="চাঁদা অনুরোধ পাঠান" />
            </form>
          </Section>
        )}

        {activeTab === 'expense' && (
          <Section title="খরচ যোগের অনুরোধ পাঠান (অ্যাডমিন অনুমোদন সাপেক্ষে)">
            <form action={expenseReqAction} className="space-y-3 max-w-2xl">
              <SearchableMemberSelect
                members={collectors}
                hiddenInputName="collectorId"
                selectedId={selectedCollectorIdForExpense}
                onSelect={setSelectedCollectorIdForExpense}
                placeholder="কার হাত দিয়ে খরচ হয়েছে - (Collector) খুঁজে বেছে নিন"
              />
              <input
                type="text"
                name="description"
                required
                placeholder="খরচের বিবরণ"
                className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm"
              />
              <input
                type="number"
                min="0"
                name="amount"
                required
                placeholder="পরিমাণ"
                className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm"
              />
              <input
                type="date"
                name="date"
                required
                className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm"
              />
              <textarea
                name="note"
                rows={2}
                placeholder="নোট (ঐচ্ছিক)"
                className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm resize-none"
              />
              <SaveButton label="খরচ অনুরোধ পাঠান" />
            </form>
          </Section>
        )}

        {activeTab === 'notes' && (
          <SharedNotesTab members={members} notes={notes} title="অ্যাডমিন ও মডারেটরের শেয়ারড নোটস" />
        )}

        {activeTab === 'requests' && (
          <Section title="আমার অনুরোধসমূহ">
            {requests.length === 0 ? (
              <p className="text-gray-500 text-sm">এখনও কোনো অনুরোধ পাঠানো হয়নি।</p>
            ) : (
              <div className="space-y-2">
                {requests.map((r) => (
                  <div key={r._id} className="rounded-xl border border-white/10 p-3 bg-white/5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm text-white">
                        {r.type === 'member_contribution_update' ? (
                          <Wallet className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Receipt className="w-4 h-4 text-emerald-400" />
                        )}
                        <span>
                          {r.type === 'member_contribution_update' ? 'চাঁদা আপডেট অনুরোধ' : 'খরচ যোগ অনুরোধ'}
                        </span>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          r.status === 'pending'
                            ? 'bg-yellow-500/15 text-yellow-400'
                            : r.status === 'approved'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-red-500/15 text-red-400'
                        }`}
                      >
                        {requestStatusLabel(r.status)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(r.createdAt).toLocaleString('bn-BD')}
                    </p>
                    {r.note ? <p className="text-xs text-gray-400 mt-1">নোট: {r.note}</p> : null}
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        {activeTab === 'summary' && (
          <SummaryTab summary={summary} members={members} expenses={expenses} />
        )}

        {activeTab === 'memberList' && (
          <Section title="বর্তমান সদস্য তালিকা (কল বাটনসহ)">
            <div className="space-y-3">
              <input
                type="text"
                value={memberListQuery}
                onChange={(e) => setMemberListQuery(e.target.value)}
                placeholder="সদস্য খুঁজুন..."
                className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm"
              />

              <div className="space-y-2">
                {members
                  .filter((m) => {
                    const q = memberListQuery.trim().toLowerCase();
                    if (!q) return true;
                    const name = m.name.toLowerCase();
                    const alt = (m.alternativeName || '').toLowerCase();
                    const phone = (m.phone || '').toLowerCase();
                    return name.includes(q) || alt.includes(q) || phone.includes(q);
                  })
                  .map((m) => (
                    <div
                      key={m._id}
                      className="rounded-xl border border-white/10 p-3 bg-white/5 flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm text-white truncate">{m.name}</p>
                          {m.alternativeName ? (
                            <p className="text-xs text-gray-400 truncate">{m.alternativeName}</p>
                          ) : null}
                        </div>
                        <div className="text-xs text-yellow-400 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> ৳ {m.totalContribution}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs text-gray-300 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          {m.phone || 'নাই'}
                        </div>
                        {m.phone ? (
                          <a
                            href={`tel:${m.phone}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 text-xs"
                          >
                            <Phone className="w-3.5 h-3.5" /> কল করুন
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
