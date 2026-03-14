import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'কান্দানিয়া উচ্চ বিদ্যালয় ব্যাচ ২০১৭ - ইফতার মাহফিল',
  description:
    'কান্দানিয়া উচ্চ বিদ্যালয় ব্যাচ ২০১৭ এর ইফতার মাহফিল — চাঁদা জমা, হিসাব-নিকাশ এবং সদস্যবৃন্দের তথ্য।',
  keywords: ['ইফতার মাহফিল', 'কান্দানিয়া', 'ব্যাচ ২০১৭', 'রমজান'],
  openGraph: {
    title: 'কান্দানিয়া উচ্চ বিদ্যালয় ব্যাচ ২০১৭ ইফতার মাহফিল',
    description: 'একত্রে ইফতার — রমজানের পবিত্র মুহূর্তে বন্ধুত্বের বন্ধন।',
    locale: 'bn_BD',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="islamic-pattern min-h-screen antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(13, 24, 38, 0.95)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#e2f8f0',
            },
          }}
        />
      </body>
    </html>
  );
}
