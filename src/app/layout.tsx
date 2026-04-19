import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';

import '../styles/index.css';
import { Header } from '../app-old/components/header';
import { Footer } from '../app-old/components/footer';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sinhvientot.id.vn';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Linh Kiện Chuẩn Giá - Linh kiện điện tử',
    template: '%s | Linh Kiện Chuẩn Giá',
  },
  description: 'Nền tảng mua sắm linh kiện điện tử số 1 Việt Nam',
  applicationName: 'Linh Kiện Chuẩn Giá',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: '/',
    siteName: 'Linh Kiện Chuẩn Giá',
    title: 'Linh Kiện Chuẩn Giá - Linh kiện điện tử',
    description: 'Nền tảng mua sắm linh kiện điện tử số 1 Việt Nam',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
