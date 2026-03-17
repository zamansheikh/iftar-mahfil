'use client';

import { useState, useRef } from 'react';
import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { submitContribution, ContributeFormState } from '@/actions/data';
import { HandCoins, CheckCircle, AlertCircle, Loader2, ChevronDown, Copy } from 'lucide-react';
import { toast } from 'sonner';

const paymentMethods = [
  { value: 'নগদ', label: 'নগদ (হাতে হাতে)' },
  { value: 'বিকাশ', label: 'বিকাশ' },
  { value: 'নগদ_মোবাইল', label: 'নগদ (মোবাইল ব্যাংকিং)' },
  { value: 'রকেট', label: 'রকেট' },
  { value: 'হাতে_হাতে', label: 'হাতে হাতে (অর্থ সংগ্রহকারী: আরিফুল)' },
  { value: 'অন্যান্য', label: 'অন্যান্য' },
];

export interface MemberOption {
  name: string;
  alternativeName?: string;
}

function SearchableCombobox({ items, name }: { items: MemberOption[], name: string }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredItems = items.filter(item => {
    const term = query.toLowerCase();
    return item.name.toLowerCase().includes(term) || 
           (item.alternativeName && item.alternativeName.toLowerCase().includes(term));
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          name={name}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          required
          autoComplete="off"
          placeholder="আপনার নাম বেছে নিন অথবা লিখুন"
          className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-3 pr-10 text-white text-sm focus:border-emerald-500/50 transition-colors"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-emerald-400 transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 max-h-56 overflow-auto bg-[#070d1a] border border-white/10 rounded-xl shadow-2xl py-1 list-none p-0 m-0 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-400">নাম পাওয়া যায়নি। আপনার নাম টাইপ করুন।</li>
          ) : (
            filteredItems.map(item => (
              <li
                key={item.name}
                className="px-4 py-2.5 text-sm cursor-pointer transition-colors border-b border-white/5 last:border-0 hover:bg-emerald-500/15"
                onClick={() => {
                  setQuery(item.name);
                  setIsOpen(false);
                }}
              >
                <div className="flex flex-col">
                  <span className="text-white hover:text-emerald-400 font-medium">{item.name}</span>
                  {item.alternativeName && (
                    <span className="text-xs text-gray-500 mt-0.5">{item.alternativeName}</span>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-black transition-all duration-200 shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.45)] flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          পাঠানো হচ্ছে...
        </>
      ) : (
        <>
          <HandCoins className="w-4 h-4" />
          চাঁদা জমা দিন
        </>
      )}
    </button>
  );
}

export default function ContributeForm({ memberNames }: { memberNames: MemberOption[] }) {
  const initialState: ContributeFormState = {};
  const [state, formAction] = useActionState(submitContribution, initialState);

  async function copyToClipboard(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success('নম্বর কপি হয়েছে');
    } catch (error) {
      toast.error('কপি করতে ব্যর্থ হয়েছে');
    }
  }

  useEffect(() => {
    if (state.success) toast.success(state.success);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
          <HandCoins className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">চাঁদা জমা</h1>
        <p className="text-gray-400">ইফতার মাহফিলে আপনার চাঁদা জমা দিন</p>
      </div>

      {/* Success state */}
      {state.success ? (
        <div className="glass-card rounded-2xl border border-emerald-500/30 p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-emerald-400 mb-3">অনুরোধ গৃহীত হয়েছে!</h2>
          <p className="text-gray-400 leading-relaxed mb-6">{state.success}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/10 transition-colors"
          >
            আরেকটি জমা দিন
          </button>
        </div>
      ) : (
        <>
          {/* Payment Instructions */}
          <div className="glass-card mb-8 rounded-2xl border border-emerald-900/30 p-6 bg-emerald-500/5">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <HandCoins className="w-5 h-5 text-emerald-400" />
              চাঁদা পাঠানোর মাধ্যম
            </h2>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-sm font-medium text-white">Zaman</span>
                <div className="sm:text-right mt-1 sm:mt-0 flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <p className="text-emerald-400 font-bold font-mono text-lg">01735069723</p>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('01735069723')}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/15 text-gray-200 transition"
                      aria-label="নম্বর কপি করুন"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">বিকাশ, নগদ, রকেট (Personal)</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-sm font-medium text-white">Mehedi</span>
                <div className="sm:text-right mt-1 sm:mt-0 flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <p className="text-emerald-400 font-bold font-mono text-lg">01701509966</p>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('01701509966')}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/15 text-gray-200 transition"
                      aria-label="নম্বর কপি করুন"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">বিকাশ (Personal)</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-sm font-medium text-white">আরিফুল ইসলাম</span>
                <div className="sm:text-right mt-1 sm:mt-0 flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <p className="text-emerald-400 font-bold font-mono text-lg">01631-140820</p>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('01631-140820')}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/15 text-gray-200 transition"
                      aria-label="নম্বর কপি করুন"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    হাতে হাতে টাকা দিতে আরিফুল এর সাথে যোগাযোগ করুন (কান্দানিয়া বাজারে থাকবে)
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-yellow-400 mt-4 font-medium px-2 pb-1">
              * টাকা পাঠানোর পর নিচের ফর্মটি পূরণ করুন যাতে হিসাব রাখা সহজ হয়।
            </p>
          </div>

          <form action={formAction} className="glass-card rounded-2xl border border-emerald-900/30 p-6 sm:p-8 space-y-5">
          {state.error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {state.error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              নাম<span className="text-red-400">*</span>
            </label>
            <SearchableCombobox items={memberNames} name="name" />
            <p className="text-xs text-gray-500 mt-1">
              * সঠিক সদস্য নাম দিন অথবা নিজের নাম লিখুন।
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ফোন নম্বর <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              required
              placeholder="01XXXXXXXXX"
              className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-emerald-500/50 transition-colors"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              চাঁদার পরিমাণ (টাকা) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-sm">৳</span>
              <input
                type="number"
                name="amount"
                required
                min="1"
                placeholder="০"
                className="w-full bg-[#0d1826] border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:border-emerald-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              পেমেন্টের মাধ্যম <span className="text-red-400">*</span>
            </label>
            <select
              name="paymentMethod"
              required
              className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500/50 transition-colors appearance-none"
              defaultValue=""
            >
              <option value="" disabled>মাধ্যম বেছে নিন</option>
              {paymentMethods.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Transaction ID */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ট্রানজেকশন আইডি{' '}
              <span className="text-gray-500 text-xs">(ঐচ্ছিক)</span>
            </label>
            <input
              type="text"
              name="transactionId"
              placeholder="e.g. 8NH7XP2QR3"
              className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-emerald-500/50 transition-colors font-mono"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              মন্তব্য <span className="text-gray-500 text-xs">(ঐচ্ছিক)</span>
            </label>
            <textarea
              name="message"
              rows={3}
              placeholder="কিছু বলতে চাইলে লিখুন..."
              className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-emerald-500/50 transition-colors resize-none"
            />
          </div>

          <SubmitButton />
        </form>
        </>
      )}
    </div>
  );
}
