'use client';

import { useActionState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { addSharedNote } from '@/actions/data';
import { Loader2, StickyNote, UserRound } from 'lucide-react';
import { useFormStatus } from 'react-dom';

type MemberOption = {
  _id: string;
  name: string;
};

type SharedNote = {
  _id: string;
  content: string;
  memberName?: string;
  createdBy: string;
  createdByRole: 'admin' | 'moderator';
  createdAt: string;
};

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold disabled:opacity-60"
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      নোট সংরক্ষণ
    </button>
  );
}

export default function SharedNotesTab({
  members,
  notes,
  title,
}: {
  members: MemberOption[];
  notes: SharedNote[];
  title?: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(addSharedNote, null);

  const memberOptions = useMemo(
    () => [...members].sort((a, b) => a.name.localeCompare(b.name)),
    [members]
  );

  useEffect(() => {
    if ((state as { success?: string })?.success) {
      toast.success((state as { success?: string }).success);
      formRef.current?.reset();
      router.refresh();
    }
    if ((state as { error?: string })?.error) {
      toast.error((state as { error?: string }).error);
    }
  }, [router, state]);

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl border border-white/5 p-6">
        <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-emerald-500 block" />
          {title || 'নতুন নোট যোগ করুন'}
        </h3>

        <form ref={formRef} action={formAction} className="space-y-4 max-w-3xl">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">নোটের ধরন</label>
            <select
              name="memberId"
              defaultValue=""
              className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm"
            >
              <option value="">সাধারণ নোট (সবাইয়ের জন্য)</option>
              {memberOptions.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">নোট</label>
            <textarea
              name="content"
              rows={4}
              required
              placeholder="এখানে নোট লিখুন..."
              className="w-full bg-[#0d1826] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm resize-none"
            />
          </div>

          <SaveButton />
        </form>
      </div>

      <div className="glass-card rounded-2xl border border-white/5 p-6">
        <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-blue-500 block" />
          শেয়ারড নোটস ({notes.length})
        </h3>

        {notes.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">এখনও কোনো নোট যোগ করা হয়নি।</p>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note._id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-emerald-500/15 text-emerald-300">
                    <StickyNote className="w-3 h-3" />
                    {note.memberName ? `${note.memberName} নোট` : 'সাধারণ নোট'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-500/15 text-blue-300">
                    <UserRound className="w-3 h-3" />
                    {note.createdByRole === 'admin' ? 'Admin' : 'Moderator'}: {note.createdBy}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(note.createdAt).toLocaleString('bn-BD')}
                  </span>
                </div>
                <p className="text-sm text-gray-200 whitespace-pre-wrap">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
