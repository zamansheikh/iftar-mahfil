'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { moderatorLoginAction } from '@/actions/auth';
import { Moon, Star, Lock, User, Loader2, AlertCircle } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-black transition-all duration-200 shadow-[0_0_20px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          লগইন হচ্ছে...
        </>
      ) : (
        'লগইন করুন'
      )}
    </button>
  );
}

export default function ModeratorLoginForm() {
  const [state, formAction] = useActionState(moderatorLoginAction, {});

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-pulse" />
          <Moon className="w-10 h-10 text-emerald-400" />
          <Star className="w-4 h-4 text-yellow-400 absolute -top-1 right-2" />
        </div>
        <h1 className="text-2xl font-bold text-white">মডারেটর প্যানেল</h1>
        <p className="text-gray-400 text-sm mt-1">সীমিত অ্যাকসেস</p>
      </div>

      <form
        action={formAction}
        className="glass-card rounded-2xl border border-emerald-900/30 p-8 space-y-5"
      >
        {state.error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {state.error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">ইউজারনেম</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              name="username"
              required
              placeholder="moderator"
              className="w-full bg-[#0d1826] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:border-emerald-500/50 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">পাসওয়ার্ড</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="password"
              name="password"
              required
              placeholder="2222"
              className="w-full bg-[#0d1826] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:border-emerald-500/50 transition-colors"
            />
          </div>
        </div>

        <SubmitButton />

        <p className="text-center text-xs text-gray-600 pt-2">ডিফল্ট পাসওয়ার্ড: 2222</p>
      </form>
    </div>
  );
}
