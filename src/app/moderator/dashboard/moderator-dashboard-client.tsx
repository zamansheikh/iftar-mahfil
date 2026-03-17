'use client';

import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { logoutAction } from '@/actions/auth';
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
  ChevronDown,
  BadgePlus,
  ClipboardList,
} from 'lucide-react';
import { useFormStatus } from 'react-dom';

interface Member {
  _id: string;
  name: string;
  alternativeName?: string;
  phone?: string;
  totalContribution: number;
}

interface ModerationRequestItem {
  _id: string;
  type: 'member_contribution_update' | 'expense_add';
  status: 'pending' | 'approved' | 'rejected';
  payload: Record<string, unknown>;
  note?: string;
  createdAt: string;
}

const tabs = [
  { id: 'members', label: 'সদস্য', icon: <Users className="w-4 h-4" /> },
  { id: 'money', label: 'চাঁদা অনুরোধ', icon: <Wallet className="w-4 h-4" /> },
  { id: 'expense', label: 'খরচ অনুরোধ', icon: <Receipt className="w-4 h-4" /> },
  { id: 'requests', label: 'আমার অনুরোধ', icon: <ClipboardList className="w-4 h-4" /> },
  { id: 'memberList', label: 'সদস্য তালিকা', icon: <BadgePlus className="w-4 h-4" /> },
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
}: {
  members: Member[];
  requests: ModerationRequestItem[];
}) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('members');
  const [selectedMemberIdForPhone, setSelectedMemberIdForPhone] = useState('');
  const [selectedMemberIdForMoney, setSelectedMemberIdForMoney] = useState('');

  const [addMemberState, addMemberAction] = useActionState(moderatorAddMember, null);
  const [phoneState, phoneAction] = useActionState(moderatorUpdateMemberPhone, null);
  const [moneyReqState, moneyReqAction] = useActionState(createContributionAdjustmentRequest, null);
  const [expenseReqState, expenseReqAction] = useActionState(createExpenseRequest, null);

  useEffect(() => {
    if ((addMemberState as { success?: string })?.success) toast.success((addMemberState as { success?: string }).success);
    if ((addMemberState as { error?: string })?.error) toast.error((addMemberState as { error?: string }).error);
  }, [addMemberState]);

  useEffect(() => {
    if ((phoneState as { success?: string })?.success) toast.success((phoneState as { success?: string }).success);
    if ((phoneState as { error?: string })?.error) toast.error((phoneState as { error?: string }).error);
  }, [phoneState]);

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
                placeholder="সদস্য খুঁজে বেছে নিন"
              />
              <select
                name="operation"
                defaultValue="add"
                className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm"
              >
                <option value="add">যোগ করুন (Add)</option>
                <option value="set">সেট করুন (Set)</option>
              </select>
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
              <input
                type="text"
                name="spentBy"
                required
                placeholder="কে খরচ করেছে"
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

        {activeTab === 'memberList' && (
          <Section title="বর্তমান সদস্য তালিকা (কল বাটনসহ)">
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m._id} className="rounded-xl border border-white/10 p-3 bg-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{m.name}</p>
                    {m.alternativeName ? <p className="text-xs text-gray-400 truncate">{m.alternativeName}</p> : null}
                  </div>
                  <div className="flex items-center gap-3">
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
                    <div className="text-xs text-yellow-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />৳ {m.totalContribution}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
