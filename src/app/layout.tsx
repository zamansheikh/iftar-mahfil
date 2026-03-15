import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://iftar-mahfil.vercel.app'),
  title: {
    default: 'কান্দানিয়া উচ্চ বিদ্যালয় ব্যাচ ২০১৭ - ইফতার মাহফিল',
    template: '%s | কান্দানিয়া ব্যাচ ২০১৭'
  },
  description:
    'কান্দানিয়া উচ্চ বিদ্যালয় ব্যাচ ২০১৭ এর ইফতার মাহফিল — চাঁদা জমা, হিসাব-নিকাশ এবং সদস্যবৃন্দের তথ্য। রমজানের পবিত্র মুহূর্তে বন্ধুত্বের বন্ধন।',
  keywords: ['ইফতার মাহফিল', 'কান্দানিয়া', 'ব্যাচ ২০১৭', 'রমজান', 'iftar mahfil', 'kandania', '2017 batch'],
  authors: [{ name: 'Batch 2017' }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'কান্দানিয়া উচ্চ বিদ্যালয় ব্যাচ ২০১৭ ইফতার মাহফিল',
    description: 'একত্রে ইফতার — রমজানের পবিত্র মুহূর্তে বন্ধুত্বের বন্ধন। আসুন, একসাথে ইফতার করি।',
    url: 'https://iftar-mahfil.vercel.app',
    siteName: 'Iftar Mahfil 2017',
    locale: 'bn_BD',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=1200&h=630&fit=crop',
        width: 1200,
        height: 630,
        alt: 'ইফতারের সুন্দর আলোকসজ্জা',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'কান্দানিয়া উচ্চ বিদ্যালয় ব্যাচ ২০১৭ ইফতার মাহফিল',
    description: 'একত্রে ইফতার — রমজানের পবিত্র মুহূর্তে বন্ধুত্বের বন্ধন। আসুন, একসাথে ইফতার করি।',
    images: ['https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=1200&h=630&fit=crop'],
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
