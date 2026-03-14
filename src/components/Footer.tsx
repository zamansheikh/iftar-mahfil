import Link from 'next/link';
import { Moon, Star, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-emerald-900/20 bg-[#050b15]/80 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-emerald-400" />
            <Star className="w-3 h-3 text-yellow-400" />
          </div>

          {/* Title */}
          <div className="text-center">
            <p className="text-lg font-bold" style={{ color: '#d4af37' }}>
              কান্দানিয়া উচ্চ বিদ্যালয় ব্যাচ ২০১৭
            </p>
            <p className="text-sm text-emerald-400 mt-1">ইফতার মাহফিল</p>
          </div>

          {/* Islamic verse */}
          <div className="ornate-divider w-full max-w-xs">
            <span className="text-xs text-gray-500 whitespace-nowrap px-2">✦</span>
          </div>

          <p className="text-xs text-gray-500 text-center font-arabic" dir="rtl">
            اللَّهُمَّ إِنِّي لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ
          </p>

          {/* Nav links */}
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {[
              { href: '/', label: 'হোম' },
              { href: '/members', label: 'সদস্যবৃন্দ' },
              { href: '/contribute', label: 'চাঁদা জমা' },
              { href: '/accounts', label: 'হিসাব-নিকাশ' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-gray-500 hover:text-emerald-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <p className="text-xs text-gray-600 flex items-center gap-1 mt-2">
            তৈরি করা হয়েছে <Heart className="w-3 h-3 text-red-500 fill-red-500" /> দিয়ে — ব্যাচ ২০১৭ টিম
          </p>
        </div>
      </div>
    </footer>
  );
}
