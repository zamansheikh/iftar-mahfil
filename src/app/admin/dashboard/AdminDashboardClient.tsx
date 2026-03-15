'use client';

import { useState, useActionState, useEffect, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import {
  logoutAction,
} from '@/actions/auth';
import {
  updateEventInfo,
  addMember,
  deleteMember,
  approveContribution,
  rejectContribution,
  addExpense,
  deleteExpense,
  updateExpense,
  updateMember,
} from '@/actions/data';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Moon, Star, LogOut, CalendarDays, Users, HandCoins,
  Receipt, TrendingUp, Plus, Trash2, Check, X, Loader2,
  AlertCircle, CheckCircle, Clock, ChevronRight, Edit,
  RotateCcw, Wallet, Download
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EventInfo {
  title: string; date: string; time: string; location: string; description: string;
}
interface Member { _id: string; name: string; alternativeName?: string; phone?: string; totalContribution: number; }
interface PendingContribution {
  _id: string; name: string; amount: number; paymentMethod: string;
  transactionId?: string; phone: string; message?: string; submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}
interface Expense { _id: string; description: string; amount: number; date: string; spentBy: string; }
interface Summary {
  totalCollected: number; totalExpense: number; remaining: number;
  memberCount: number; perMemberRefund: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toBn(n: number) {
  return n.toString().replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d)]);
}

function Btn({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function SaveBtn({ label = 'সংরক্ষণ করুন' }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-black transition-all"
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      {label}
    </button>
  );
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

// ─── Tab: Event Info ──────────────────────────────────────────────────────────

function EventTab({ eventInfo }: { eventInfo: EventInfo }) {
  const [state, formAction] = useActionState(updateEventInfo, null);

  useEffect(() => {
    if (state?.success) toast.success(state.success);
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <SectionCard title="ইভেন্টের তথ্য সম্পাদনা">
      <form action={formAction} className="space-y-4">
        {[
          { name: 'title', label: 'শিরোনাম', defaultValue: eventInfo.title, placeholder: 'ইভেন্টের শিরোনাম' },
          { name: 'date', label: 'তারিখ', defaultValue: eventInfo.date, placeholder: '১৫ রমজান ১৪৪৬' },
          { name: 'time', label: 'সময়', defaultValue: eventInfo.time, placeholder: 'মাগরিবের আযানের ৩০ মিনিট পূর্বে' },
          { name: 'location', label: 'স্থান', defaultValue: eventInfo.location, placeholder: 'কান্দানিয়া উচ্চ বিদ্যালয় মাঠ' },
        ].map((f) => (
          <div key={f.name}>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">{f.label}</label>
            <input
              type="text"
              name={f.name}
              defaultValue={f.defaultValue}
              placeholder={f.placeholder}
              className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-500/50 transition-colors"
            />
          </div>
        ))}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">বিবরণ</label>
          <textarea
            name="description"
            defaultValue={eventInfo.description}
            rows={3}
            className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-500/50 transition-colors resize-none"
          />
        </div>
        <SaveBtn />
      </form>
    </SectionCard>
  );
}

// ─── Tab: Members ─────────────────────────────────────────────────────────────

function MembersTab({ members }: { members: Member[] }) {
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [addState, addFormAction] = useActionState(addMember, null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [updateState, updateFormAction] = useActionState(updateMember, null);
  const [isPending, startTransition] = useTransition();

  // Using standard state update for now, but handle success trigger correctly
  useEffect(() => {
    if (addState?.success) { 
        toast.success(addState.success); 
        setIsAddingMember(false);
    }
    if (addState?.error) toast.error(addState.error);
  }, [addState]);

  useEffect(() => {
    if (updateState?.success) { 
      toast.success(updateState.success); 
      setEditingId(null); 
    }
    if (updateState?.error) toast.error(updateState.error);
  }, [updateState]);

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`"${name}" কে সদস্য তালিকা থেকে মুছে ফেলবেন?`)) return;
    startTransition(async () => {
      const res = await deleteMember(id);
      if (res.success) toast.success(res.success);
      else toast.error('সদস্য মুছতে সমস্যা হয়েছে।');
    });
  };

  const editingMember = members.find((m) => m._id === editingId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#070d1a] border border-white/5 rounded-2xl p-5 mb-4 shadow-sm">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" />
          সদস্য ব্যবস্থাপনা
        </h2>
        <button
          onClick={() => setIsAddingMember(!isAddingMember)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black text-sm font-bold rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" />
          নতুন সদস্য
        </button>
      </div>

      {isAddingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#070d1a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-emerald-500 block" />
              নতুন সদস্য যোগ করুন
            </h3>
            <button
              onClick={() => setIsAddingMember(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
            <form action={addFormAction} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">নাম</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="সদস্যের নাম"
                  className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">ইংরেজিতে নাম</label>
                <input
                  type="text"
                  name="alternativeName"
                  placeholder="ইংরেজিতে নাম (ঐচ্ছিক)"
                  className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">ফোন নম্বর</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="ফোন নম্বর (ঐচ্ছিক)"
                  className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">জমাকৃত চাঁদা (৳)</label>
                <input
                  type="number"
                  name="totalContribution"
                  placeholder="চাঁদা (ঐচ্ছিক)"
                  className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Btn type="button" onClick={() => setIsAddingMember(false)} className="flex-1 justify-center border border-white/10 text-gray-400 hover:border-white/20">
                  বাতিল
                </Btn>
                <div className="flex-1">
                  <SaveBtn label="যোগ করুন" />
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingId && editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#070d1a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-emerald-500 block" />
              সদস্য সম্পাদনা
            </h3>
            <button
              onClick={() => setEditingId(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
            <form action={updateFormAction} className="space-y-4">
              <input type="hidden" name="id" value={editingId} />
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">নাম</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingMember.name}
                  required
                  className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">ইংরেজিতে নাম</label>
                <input
                  type="text"
                  name="alternativeName"
                  defaultValue={editingMember.alternativeName || ''}
                  className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">ফোন নম্বর</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={editingMember.phone || ''}
                  className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">জমাকৃত চাঁদা (৳)</label>
                <input
                  type="number"
                  name="totalContribution"
                  defaultValue={editingMember.totalContribution || 0}
                  className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Btn type="button" onClick={() => setEditingId(null)} className="flex-1 justify-center border border-white/10 text-gray-400 hover:border-white/20">
                  বাতিল
                </Btn>
                <div className="flex-1">
                  <SaveBtn label="আপডেট" />
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <SectionCard title={`সদস্য তালিকা (${toBn(members.length)} জন)`}>
        {members.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">কোনো সদস্য নেই।</p>
        ) : (
          <div className="space-y-2">
            {members.map((m) => (
              <div
                key={m._id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5 hover:border-emerald-500/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 text-xs font-bold">
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{m.name}</p>
                    <div className="flex items-center gap-2">
                      {m.alternativeName && <p className="text-xs text-emerald-400/80">{m.alternativeName}</p>}
                      {m.phone && <p className="text-xs text-gray-500">{m.phone}</p>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-yellow-400">৳ {toBn(m.totalContribution)}</span>
                  <Btn onClick={() => setEditingId(m._id)} className="border border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
                    <Edit className="w-3.5 h-3.5" />
                  </Btn>
                  <Btn onClick={() => handleDelete(m._id, m.name)} disabled={isPending} className="border border-red-500/30 text-red-400 hover:bg-red-500/10">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ─── Tab: Pending Contributions ──────────────────────────────────────────────

function PendingTab({ contributions }: { contributions: PendingContribution[] }) {
  const [isPending, startTransition] = useTransition();

  const handleApprove = (id: string) => {
    startTransition(async () => {
      const res = await approveContribution(id);
      if (res.success) toast.success(res.success);
      else if (res.error) toast.error(res.error);
    });
  };

  const handleReject = (id: string) => {
    startTransition(async () => {
      const res = await rejectContribution(id);
      if (res.success) toast.success(res.success);
    });
  };

  const pending = contributions.filter((c) => c.status === 'pending');
  const processed = contributions.filter((c) => c.status !== 'pending');

  return (
    <div className="space-y-6">
      <SectionCard title={`অপেক্ষমান চাঁদা (${toBn(pending.length)}টি)`}>
        {pending.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-10 h-10 text-emerald-500/40 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">সব চাঁদা প্রক্রিয়া করা হয়েছে।</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((c) => (
              <div key={c._id} className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white">{c.name}</p>
                      <span className="badge-gold px-2 py-0.5 rounded-full text-xs">{c.paymentMethod}</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-400">৳ {toBn(c.amount)}</p>
                    <p className="text-xs text-gray-400">📞 {c.phone}</p>
                    {c.transactionId && (
                      <p className="text-xs text-gray-500 font-mono">TXN: {c.transactionId}</p>
                    )}
                    {c.message && (
                      <p className="text-xs text-gray-500 italic">&ldquo;{c.message}&rdquo;</p>
                    )}
                    <p className="text-xs text-gray-600">
                      {new Date(c.submittedAt).toLocaleString('bn-BD')}
                    </p>
                  </div>
                  <div className="flex gap-2 sm:flex-col">
                    <button
                      onClick={() => handleApprove(c._id)}
                      disabled={isPending}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-all disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" /> অনুমোদন
                    </button>
                    <button
                      onClick={() => handleReject(c._id)}
                      disabled={isPending}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" /> প্রত্যাখ্যান
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {processed.length > 0 && (
        <SectionCard title="প্রক্রিয়াকৃত চাঁদা">
          <div className="space-y-2">
            {processed.map((c) => (
              <div key={c._id} className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5">
                <div>
                  <p className="text-sm font-medium text-white">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.paymentMethod} — ৳ {toBn(c.amount)}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${c.status === 'approved' ? 'badge-emerald' : 'badge-red'}`}>
                  {c.status === 'approved' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

// ─── Tab: Expenses ────────────────────────────────────────────────────────────

function ExpensesTab({ expenses }: { expenses: Expense[] }) {
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [state, formAction] = useActionState(addExpense, null);
  const [updateState, updateFormAction] = useActionState(updateExpense, null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (state?.success) {
        toast.success(state.success);
        setIsAddingExpense(false);
    }
    if (state?.error) toast.error(state.error);
  }, [state]);

  useEffect(() => {
    if (updateState?.success) {
        toast.success(updateState.success);
        setEditingExpenseId(null);
    }
    if (updateState?.error) toast.error(updateState.error);
  }, [updateState]);

  const handleDelete = (id: string, desc: string) => {
    if (!confirm(`"${desc}" খরচটি মুছে ফেলবেন?`)) return;
    startTransition(async () => {
      const res = await deleteExpense(id);
      if (res.success) toast.success(res.success);
    });
  };

  const today = new Date().toISOString().split('T')[0];

  const editingExpense = expenses.find((e) => e._id === editingExpenseId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#070d1a] border border-white/5 rounded-2xl p-5 mb-4 shadow-sm">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Receipt className="w-5 h-5 text-emerald-400" />
          খরচ ব্যবস্থাপনা
        </h2>
        <button
          onClick={() => setIsAddingExpense(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black text-sm font-bold rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" />
          নতুন খরচ
        </button>
      </div>

      {isAddingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#070d1a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-emerald-500 block" />
              নতুন খরচ যোগ করুন
            </h3>
            <button
              onClick={() => setIsAddingExpense(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
            <form action={formAction} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">বিবরণ</label>
                <input
                  type="text"
                  name="description"
                  required
                  placeholder="খরচের বিবরণ"
                  className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">পরিমাণ (৳)</label>
                <input
                  type="number"
                  name="amount"
                  required
                  min="0"
                  className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">তারিখ</label>
                <input
                  type="date"
                  name="date"
                  defaultValue={today}
                  required
                  className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">কে খরচ করেছে?</label>
                <input
                  type="text"
                  name="spentBy"
                  required
                  placeholder="নাম"
                  className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Btn type="button" onClick={() => setIsAddingExpense(false)} className="flex-1 justify-center border border-white/10 text-gray-400 hover:border-white/20">
                  বাতিল
                </Btn>
                <div className="flex-1">
                  <SaveBtn label="যোগ করুন" />
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingExpenseId && editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#070d1a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-blue-500 block" />
              খরচ সম্পাদনা করুন
            </h3>
            <button
              onClick={() => setEditingExpenseId(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
            <form action={updateFormAction} className="space-y-4">
              <input type="hidden" name="id" value={editingExpenseId} />
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">বিবরণ</label>
                <input
                  type="text"
                  name="description"
                  defaultValue={editingExpense.description}
                  required
                  className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">পরিমাণ (৳)</label>
                <input
                  type="number"
                  name="amount"
                  defaultValue={editingExpense.amount}
                  required
                  min="0"
                  className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">তারিখ</label>
                <input
                  type="date"
                  name="date"
                  defaultValue={new Date(editingExpense.date).toISOString().split('T')[0]}
                  required
                  className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">কে খরচ করেছে?</label>
                <input
                  type="text"
                  name="spentBy"
                  defaultValue={editingExpense.spentBy}
                  required
                  className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Btn type="button" onClick={() => setEditingExpenseId(null)} className="flex-1 justify-center border border-white/10 text-gray-400 hover:border-white/20">
                  বাতিল
                </Btn>
                <div className="flex-1">
                  <SaveBtn label="আপডেট" />
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <SectionCard title={`খরচের তালিকা (${toBn(expenses.length)}টি)`}>
        {expenses.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-6">কোনো খরচ নেই।</p>
        ) : (
          <div className="space-y-2">
            {expenses.map((e) => (
              <div key={e._id} className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5 hover:border-red-500/20 transition-colors">
                <div>
                  <p className="text-sm font-medium text-white">{e.description} <span className="text-xs text-yellow-500/80">({e.spentBy})</span></p>
                  <p className="text-xs text-gray-500">{new Date(e.date).toLocaleDateString('bn-BD')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-red-400">৳ {toBn(e.amount)}</span>
                  <Btn onClick={() => setEditingExpenseId(e._id)} disabled={isPending} className="border border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
                    <Edit className="w-3.5 h-3.5" />
                  </Btn>
                  <Btn onClick={() => handleDelete(e._id, e.description)} disabled={isPending} className="border border-red-500/30 text-red-400 hover:bg-red-500/10">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Btn>
                </div>
              </div>
            ))}
            <div className="flex justify-between pt-3 border-t border-white/10">
              <span className="text-sm font-bold text-gray-400">মোট খরচ</span>
              <span className="text-sm font-bold text-red-400">৳ {toBn(expenses.reduce((s, e) => s + e.amount, 0))}</span>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ─── Tab: Summary ─────────────────────────────────────────────────────────────

function SummaryTab({ summary, members }: { summary: Summary; members: Member[] }) {
  const [refundType, setRefundType] = useState<'equal' | 'proportional'>('equal');
  const [isDownloading, setIsDownloading] = useState(false);

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
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'মোট জমা', value: summary.totalCollected, color: 'text-emerald-400', icon: <TrendingUp className="w-5 h-5" /> },
          { label: 'মোট খরচ', value: summary.totalExpense, color: 'text-red-400', icon: <Receipt className="w-5 h-5" /> },
          { label: 'অবশিষ্ট', value: summary.remaining, color: 'text-yellow-400', icon: <Wallet className="w-5 h-5" /> },
          { label: 'সদস্য সংখ্যা', value: summary.memberCount, color: 'text-blue-400', icon: <Users className="w-5 h-5" />, isMember: true },
        ].map((item) => (
          <div key={item.label} className="glass-card rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-2 mb-2 text-gray-500">{item.icon}<span className="text-xs uppercase tracking-wider">{item.label}</span></div>
            <p className={`text-2xl font-bold ${item.color}`}>
              {item.isMember ? toBn(item.value) : `৳ ${toBn(item.value)}`}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0d1826] border border-white/10 rounded-2xl p-4 data-html2canvas-ignore">
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
          onClick={async () => {
            setIsDownloading(true);
            try {
              const element = document.getElementById('admin-pdf-content');
              if (!element) return;

              const containers = element.querySelectorAll('.overflow-x-auto');
              const originalClasses: string[] = [];
              
              containers.forEach((el) => {
                originalClasses.push(el.className);
                el.className = el.className.replace('overflow-x-auto', '');
              });

              const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#070d1a',
                windowWidth: 1200,
              });

              containers.forEach((el, index) => {
                el.className = originalClasses[index];
              });

              const imgData = canvas.toDataURL('image/png');
              const pdf = new jsPDF('p', 'mm', 'a4');
              
              const pdfWidth = pdf.internal.pageSize.getWidth();
              const pageHeight = pdf.internal.pageSize.getHeight();
              
              const margin = 10;
              const printWidth = pdfWidth - (margin * 2);
              const printHeight = (canvas.height * printWidth) / canvas.width;
              
              let position = margin;
              let heightLeft = printHeight;

              pdf.addImage(imgData, 'PNG', margin, position, printWidth, printHeight);
              heightLeft -= (pageHeight - margin * 2);

              while (heightLeft > 0) {
                position = heightLeft - printHeight - margin; 
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', margin, position, printWidth, printHeight);
                heightLeft -= (pageHeight - margin * 2);
              }

              pdf.save(`admin-hisab-${refundType}.pdf`);
            } catch (error) {
              console.error('Error generating PDF:', error);
              alert('পিডিএফ তৈরি বার্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।');
            } finally {
              setIsDownloading(false);
            }
          }}
          disabled={isDownloading}
          className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isDownloading ? 'ডাউনলোড হচ্ছে...' : 'পিডিএফ ডাউনলোড'}
        </button>
      </div>

      <div id="admin-pdf-content" className="space-y-6">
        {summary.remaining > 0 && validMembers.length > 0 && (
        <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 text-center">
            {refundType === 'equal' ? (
              <p className="text-lg font-bold text-emerald-400">
                ✅ প্রত্যেক সদস্য (যারা চাঁদা দিয়েছেন) ফেরত পাবেন{' '}
                <span className="text-2xl">
                  ৳ {toBn(Math.floor(summary.remaining / validMembers.length))}
                </span>{' '}
                টাকা
              </p>
            ) : (
              <p className="text-lg font-bold text-emerald-400">
                ✅ সদস্যরা তাদের জমাকৃত চাঁদার আনুপাতিক হারে ফেরত পাবেন
              </p>
            )}
        </div>
      )}

      <SectionCard title="সদস্যদের বিস্তারিত">
        {members.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">কোনো সদস্য নেই।</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">নাম</th>
                  <th className="px-4 py-3 text-right">জমাকৃত</th>
                  <th className="px-4 py-3 text-right">ফেরত পাবেন</th>
                  <th className="px-4 py-3 text-right">নেট (ফেরত − ব্যক্তিগত)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {members.map((m, i) => {
                  const refundAmt = calculateRefund(m);
                  const net = refundAmt - m.totalContribution;
                  return (
                    <tr key={m._id}>
                      <td className="px-4 py-3 text-gray-500 text-sm">{toBn(i + 1)}</td>
                      <td className="px-4 py-3 text-white font-medium">{m.name}</td>
                      <td className="px-4 py-3 text-right text-yellow-400 font-semibold">৳ {toBn(m.totalContribution)}</td>
                      <td className="px-4 py-3 text-right text-emerald-400 font-semibold">৳ {toBn(refundAmt)}</td>
                      <td className={`px-4 py-3 text-right font-bold ${net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {net >= 0 ? '+' : ''}৳ {toBn(Math.abs(net))}
                      </td>
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

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const tabs = [
  { id: 'event', label: 'ইভেন্ট', icon: <CalendarDays className="w-4 h-4" /> },
  { id: 'members', label: 'সদস্য', icon: <Users className="w-4 h-4" /> },
  { id: 'pending', label: 'চাঁদা', icon: <HandCoins className="w-4 h-4" /> },
  { id: 'expenses', label: 'খরচ', icon: <Receipt className="w-4 h-4" /> },
  { id: 'summary', label: 'সারসংক্ষেপ', icon: <TrendingUp className="w-4 h-4" /> },
];

export default function AdminDashboardClient({
  eventInfo,
  members,
  pendingContributions,
  expenses,
  summary,
}: {
  eventInfo: EventInfo;
  members: Member[];
  pendingContributions: PendingContribution[];
  expenses: Expense[];
  summary: Summary;
}) {
  const [activeTab, setActiveTab] = useState('summary');
  
  useEffect(() => {
    const saved = localStorage.getItem('adminDashboardTab');
    if (saved) setActiveTab(saved);
  }, []);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    localStorage.setItem('adminDashboardTab', id);
  };

  const pendingCount = pendingContributions.filter((c) => c.status === 'pending').length;

  return (
    <div className="min-h-screen">
      {/* Top Bar */}
      <header className="border-b border-white/5 bg-[#070d1a]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20" />
              <Moon className="w-5 h-5 text-emerald-400" />
              <Star className="w-2.5 h-2.5 text-yellow-400 absolute -top-0.5 right-0.5" />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: '#d4af37' }}>অ্যাডমিন প্যানেল</p>
              <p className="text-xs text-gray-500">ইফতার মাহফিল ব্যাচ ২০১৭</p>
            </div>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/10 transition-colors">
              <LogOut className="w-3.5 h-3.5" /> লগআউট
            </button>
          </form>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'pending' && pendingCount > 0 && (
                <span className="ml-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'event' && <EventTab eventInfo={eventInfo} />}
        {activeTab === 'members' && <MembersTab members={members} />}
        {activeTab === 'pending' && <PendingTab contributions={pendingContributions} />}
        {activeTab === 'expenses' && <ExpensesTab expenses={expenses} />}
        {activeTab === 'summary' && <SummaryTab summary={summary} members={members} />}
      </div>
    </div>
  );
}
