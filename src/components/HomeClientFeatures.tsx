'use client';

import { useState, useEffect } from 'react';

function toBengaliNumber(n: number): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return n.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
}

export function CountdownTimer({ exactDateStr }: { exactDateStr?: string }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!exactDateStr) return;

    const targetDate = new Date(exactDateStr).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft(null);
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [exactDateStr]);

  if (!isClient || !exactDateStr) {
    return (
      <div className="mt-8 max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-emerald-500/20 bg-black/20 p-6">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin" />
          <p className="text-gray-400 text-sm text-center">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!timeLeft) {
    return (
      <div className="mt-8 max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-emerald-400 font-bold text-lg mb-1">ইফতার মাহফিল চলমান বা সম্পন্ন হয়েছে</p>
          <p className="text-sm text-gray-400">আপনাদের অংশগ্রহণের জন্য ধন্যবাদ!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 max-w-2xl w-full mx-auto px-4 sm:px-0">
      <p className="text-emerald-400 text-sm uppercase tracking-widest mb-4 text-center">
        ইভেন্ট শুরু হতে বাকি
      </p>
      <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
        {[
          { label: 'দিন', value: timeLeft.days },
          { label: 'ঘণ্টা', value: timeLeft.hours },
          { label: 'মিনিট', value: timeLeft.minutes },
          { label: 'সেকেন্ড', value: timeLeft.seconds },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center min-w-[72px]">
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center glass-card border border-emerald-500/30 rounded-2xl shadow-[0_0_15px_rgba(16,185,129,0.15)] mb-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {toBengaliNumber(item.value).padStart(2, '০')}
              </span>
            </div>
            <span className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider text-center">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DynamicRemainingMessage({ remaining, exactDateStr }: { remaining: number; exactDateStr?: string }) {
  const [isExpired, setIsExpired] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!exactDateStr) return;
    
    // Check if current date is passed the event date + 1 day (grace period for calculations)
    const targetDate = new Date(exactDateStr).getTime();
    const now = new Date().getTime();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    
    if (now > targetDate + oneDayInMs) {
      setIsExpired(true);
    }
  }, [exactDateStr]);

  if (remaining <= 0) return null;
  
  // To avoid hydration mismatch, render a generic structure first if needed, 
  // but since we want to be safe, we just handle client-only text.
  if (!isClient) {
    return (
      <div className="mt-6 mx-1 sm:mx-0 p-5 rounded-2xl border border-yellow-500/30 bg-yellow-500/5 text-center">
          <p className="text-yellow-400 font-semibold text-lg">
             লাইভ হিসাব ক্যালকুলেট হচ্ছে...
          </p>
      </div>
    );
  }

  return (
    <div className="mt-6 mx-1 sm:mx-0 p-5 rounded-2xl border border-yellow-500/30 bg-yellow-500/5 text-center transition-all duration-500">
      <p className="text-yellow-400 font-semibold text-[17px] sm:text-lg">
        {isExpired ? (
          <>🎉 সমস্ত খরচ বাদে অবশিষ্ট আছে ৳ {toBengaliNumber(remaining)} টাকা, যা সদস্যদের মাঝে ফেরত দেওয়া হবে।</>
        ) : (
          <>আপাতত সম্ভাব্য হিসাব অনুযায়ী অবশিষ্ট আছে ৳ {toBengaliNumber(remaining)} টাকা। ইভেন্ট শেষ হওয়ার পর আসল হিসাব ও ফেরতযোগ্য অর্থ প্রকাশ করা হবে।</>
        )}
      </p>
    </div>
  );
}
