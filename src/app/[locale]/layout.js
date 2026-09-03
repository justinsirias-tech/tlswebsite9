import { Inter } from "next/font/google";
import "../globals.css";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ["latin"] });

import LayoutWrapper from "../../components/LayoutWrapper";
import PopupBanner from "../../components/PopupBanner";
import Script from "next/script";

export const metadata = {
  title: "Premium Laundry Service & Dry Cleaning | That Laundry Shop",
  description: "Professional laundry services, dry cleaning, and ironing in Bangkok. Fast, reliable, and premium care for your clothes.",
};

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'th' }, { locale: 'cn' }];
}

export default async function RootLayout({ children, params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preload" href="/assets/hero_bg_v2.webp" as="image" type="image/webp" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
        <link rel="preconnect" href="https://maps.googleapis.com" />
        <link rel="preconnect" href="https://maps.gstatic.com" />
        <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" as="style" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" precedence="default" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-545113254" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-545113254');
          `}
        </Script>
        <NextIntlClientProvider messages={messages}>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <PopupBanner />
        </NextIntlClientProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
