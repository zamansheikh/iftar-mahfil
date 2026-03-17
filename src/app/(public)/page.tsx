import { Metadata } from 'next';
import Image from 'next/image';
import { MapPin, Clock, CalendarDays, Users, TrendingUp, Wallet, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getEventInfo, getSummary } from '@/actions/data';
import SummaryCard from '@/components/SummaryCard';
import { CountdownTimer, DynamicRemainingMessage } from '@/components/HomeClientFeatures';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'হোম — কান্দানিয়া উচ্চ বিদ্যালয় ব্যাচ ২০১৭ ইফতার মাহফিল',
  description: 'কান্দানিয়া উচ্চ বিদ্যালয় ব্যাচ ২০১৭ এর ইফতার মাহফিল আয়োজনের বিস্তারিত তথ্য।',
  openGraph: {
    title: 'হোম — কান্দানিয়া উচ্চ বিদ্যালয় ব্যাচ ২০১৭ ইফতার মাহফিল',
    description: 'কান্দানিয়া উচ্চ বিদ্যালয় ব্যাচ ২০১৭ এর ইফতার মাহফিল আয়োজনের বিস্তারিত তথ্য।',
    url: 'https://iftar-mahfil.vercel.app/',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'হোম — কান্দানিয়া ব্যাচ ২০১৭ ইফতার মাহফিল',
    description: 'ইভেন্টের তথ্য, লাইভ হিসাব ও অংশগ্রহণের সবকিছু একসাথে।',
  },
};

function toBengaliNumber(n: number): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return n.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
}

export default async function HomePage() {
  const [eventInfo, summary] = await Promise.all([getEventInfo(), getSummary()]);

  return (
    <>
      {/* ──── Hero Section ──── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=1600&q=80"
            alt="ইফতারের সুন্দর আলোকসজ্জা"
            fill
            className="object-cover opacity-15"
            priority
          />
          <div className="absolute inset-0 hero-gradient" />
          {/* Animated geometric overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cg fill='none' stroke='%23d4af37' stroke-width='0.5' opacity='0.6'%3E%3Cpolygon points='60,5 115,35 115,85 60,115 5,85 5,35' /%3E%3Cpolygon points='60,20 100,42 100,78 60,100 20,78 20,42' /%3E%3Cpolygon points='60,35 85,50 85,70 60,85 35,70 35,50' /%3E%3Ccircle cx='60' cy='60' r='12'/%3E%3C/g%3E%3C/svg%3E\")",
              backgroundSize: '160px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 mb-8">
            <span className="text-yellow-400 text-xs font-medium tracking-wider uppercase">
              🌙 রমজান মোবারক ১৪৪৬
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-4">
            <span className="gold-text">কান্দানিয়া উচ্চ বিদ্যালয়</span>
            <br />
            <span className="text-white">ব্যাচ ২০১৭</span>
          </h1>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-400 mb-6">
            ইফতার মাহফিল
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            প্রিয় বন্ধুদের সাথে একত্রে ইফতার করার এই পবিত্র আয়োজনে আপনাকে স্বাগতম।
            রমজানের বরকতময় মুহূর্তে আমরা একসাথে।
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contribute"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-black transition-all duration-200 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
            >
              চাঁদা জমা দিন <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/accounts"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 transition-all duration-200"
            >
              হিসাব দেখুন
            </Link>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#070d1a] to-transparent z-10" />
      </section>

      {/* ──── Event Details ──── */}
      <section className="section max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-emerald-400 text-sm uppercase tracking-widest mb-2">ইভেন্টের তথ্য</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">{eventInfo.title}</h2>
          <p className="text-gray-400 max-w-xl mx-auto">{eventInfo.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto px-1 sm:px-0">
          {[
            { icon: <CalendarDays className="w-6 h-6 text-yellow-400" />, label: 'তারিখ', value: eventInfo.date, bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
            { icon: <Clock className="w-6 h-6 text-emerald-400" />, label: 'সময়', value: eventInfo.time, bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
            { icon: <MapPin className="w-6 h-6 text-blue-400" />, label: 'স্থান', value: eventInfo.location, bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
          ].map((item) => (
            <div
              key={item.label}
              className={`glass-card card-hover rounded-2xl p-6 text-center border ${item.border}`}
            >
              <div className={`${item.bg} w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                {item.icon}
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{item.label}</p>
              <p className="text-white font-semibold text-sm leading-relaxed">{item.value}</p>
            </div>
          ))}
        </div>

        {eventInfo.exactDate && (
          <CountdownTimer exactDateStr={eventInfo.exactDate} />
        )}
      </section>

      {/* ──── Live Summary ──── */}
      <section className="section max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-0">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="relative w-2.5 h-2.5 pulse-dot">
              <span className="block w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </span>
            <p className="text-emerald-400 text-sm uppercase tracking-widest">লাইভ হিসাব</p>
          </div>
          <h2 className="text-3xl font-bold text-white">আর্থিক সারসংক্ষেপ</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-1 sm:px-0">
          <SummaryCard
            title="মোট জমা"
            value={`৳ ${toBengaliNumber(summary.totalCollected)}`}
            icon={<TrendingUp className="w-6 h-6 text-emerald-400" />}
            color="emerald"
          />
          <SummaryCard
            title="মোট খরচ"
            value={`৳ ${toBengaliNumber(summary.totalExpense)}`}
            icon={<Wallet className="w-6 h-6 text-red-400" />}
            color="red"
          />
          <SummaryCard
            title="অবশিষ্ট"
            value={`৳ ${toBengaliNumber(summary.remaining)}`}
            icon={<Wallet className="w-6 h-6 text-yellow-400" />}
            color="gold"
          />
          <SummaryCard
            title="সদস্য সংখ্যা"
            value={toBengaliNumber(summary.memberCount)}
            icon={<Users className="w-6 h-6 text-blue-400" />}
            color="blue"
            subtitle="মোট সদস্য"
          />
        </div>

        {summary.remaining > 0 && (
          <div className="px-1 sm:px-0">
            <DynamicRemainingMessage remaining={summary.remaining} exactDateStr={eventInfo.exactDate} />
          </div>
        )}
      </section>

      {/* ──── Dua Section ──── */}
      <section className="section max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 pt-0">
        <div className="glass-card gold-border rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden mx-1 sm:mx-0">
          <div className="shimmer absolute inset-0 rounded-3xl" />
          <div className="relative z-10">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-6">ইফতারের দোয়া</p>
            <p
              className="text-3xl sm:text-4xl font-bold text-yellow-300 leading-relaxed mb-6"
              dir="rtl"
              lang="ar"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              اللَّهُمَّ إِنِّي لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ
            </p>
            <div className="ornate-divider max-w-xs mx-auto mb-6">
              <span className="text-yellow-500/50 text-sm px-2">✦</span>
            </div>
            <p className="text-gray-300 text-base leading-relaxed max-w-lg mx-auto">
              &ldquo;হে আল্লাহ! আমি তোমার জন্য রোজা রেখেছি, তোমার প্রতি ঈমান এনেছি,
              তোমার উপর তাওয়াক্কুল করেছি এবং তোমার রিযিক দিয়ে ইফতার করেছি।&rdquo;
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
