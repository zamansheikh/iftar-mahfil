'use client';

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
      </div>

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
                  <th className="px-5 py-4 text-left w-20">#</th>
                  <th className="px-5 py-4 text-left">নাম</th>
                  <th className="px-5 py-4 text-left">ফোন</th>
                  <th className="px-5 py-4 text-left">কল</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {members.map((member, idx) => {
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
        </div>
      )}
    </>
  );
}
