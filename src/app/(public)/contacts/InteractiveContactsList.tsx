'use client';

import { useMemo, useState } from 'react';
import { Users, Phone } from 'lucide-react';

function toBengaliNumber(n: number | string): string {
  const d = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return n.toString().replace(/\d/g, (x) => d[parseInt(x)]);
}

interface Member {
  _id: string;
  name: string;
  alternativeName?: string;
  phone?: string;
}
interface Summary {
  memberCount: number;
}

export default function InteractiveContactsList({
  members,
  summary,
}: {
  members: Member[];
  summary: Summary;
}) {
  const [query, setQuery] = useState('');

  const filteredMembers = useMemo(() => {
    if (!query.trim()) return members;
    const q = query.trim().toLowerCase();
    return members.filter((member) => {
      const name = member.name.toLowerCase();
      const alt = member.alternativeName?.toLowerCase() ?? '';
      const phone = member.phone?.toLowerCase() ?? '';
      return name.includes(q) || alt.includes(q) || phone.includes(q);
    });
  }, [members, query]);

  return (
    <>
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
          <Users className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">যোগাযোগ তালিকা</h1>
        <p className="text-gray-400">
          মোট <span className="text-emerald-400 font-semibold">{toBengaliNumber(summary.memberCount)}</span> জন সদস্য
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="সদস্য খুঁজুন..."
            className="w-full sm:w-64 rounded-xl border border-emerald-900/50 bg-[#0c1629]/70 px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="text-sm text-gray-400">
            {query.trim()
              ? `মিলে গেছে ${toBengaliNumber(filteredMembers.length)} জন সদস্য`
              : `মোট ${toBengaliNumber(summary.memberCount)} জন সদস্য`} 
          </div>
        </div>
      </div>

      {/* Members Table */}
      {filteredMembers.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center border border-emerald-900/20">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">
            {query.trim()
              ? 'কোনো সদস্য পাওয়া যায়নি।'
              : 'এখনও কোনো সদস্য যোগ করা হয়নি।'}
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-emerald-900/20 overflow-hidden">
          {/* Desktop/table view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th className="px-5 py-4 text-left w-20">#</th>
                  <th className="px-5 py-4 text-left">নাম</th>
                  <th className="px-5 py-4 text-left">ফোন</th>
                  <th className="px-5 py-4 text-left">কল</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMembers.map((member, idx) => {
                  return (
                    <tr key={member._id} className="transition-colors">
                      <td className="px-5 py-4 text-gray-500 text-sm">{toBengaliNumber(idx + 1)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold shadow-inner">
                            {member.name.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-white text-base">{member.name}</span>
                            {member.alternativeName && (
                              <span className="text-xs text-gray-400 mt-0.5">{member.alternativeName}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-200">
                        {member.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm">{member.phone}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">নাই</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {member.phone ? (
                          <a
                            href={`tel:${member.phone}`}
                            className="inline-flex items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-sm font-semibold px-3 py-2 hover:bg-emerald-500/15 transition"
                          >
                            কল করুন
                          </a>
                        ) : (
                          <span className="text-sm text-gray-500">করণীয় নেই</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile/card view */}
          <div className="md:hidden space-y-4 px-4 py-4">
            {filteredMembers.map((member, idx) => (
              <div
                key={member._id}
                className="rounded-2xl border border-emerald-900/20 bg-[#0b1425]/70 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold shadow-inner">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-base">{member.name}</div>
                      {member.alternativeName && (
                        <div className="text-xs text-gray-400 mt-0.5">{member.alternativeName}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">#{toBengaliNumber(idx + 1)}</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-200">
                      <Phone className="w-4 h-4 text-emerald-400" />
                      {member.phone ? member.phone : <span className="text-gray-500">নাই</span>}
                    </div>
                    {member.phone ? (
                      <a
                        href={`tel:${member.phone}`}
                        className="inline-flex items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-sm font-semibold px-3 py-2 hover:bg-emerald-500/15 transition"
                      >
                        কল করুন
                      </a>
                    ) : (
                      <span className="text-sm text-gray-500">করণীয় নেই</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
