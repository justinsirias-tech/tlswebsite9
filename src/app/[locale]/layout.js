import { Inter } from "next/font/google";
import "../globals.css";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';

const inter = Inter({ subsets: ["latin"] });

import LayoutWrapper from "../../components/LayoutWrapper";

export const metadata = {
  title: "Premium Laundry Service & Dry Cleaning | That Laundry Shop",
  description: "Professional laundry services, dry cleaning, and ironing in Bangkok. Fast, reliable, and premium care for your clothes.",
};

export default async function RootLayout({ children, params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            link.media = 'print';
            link.onload = function() { this.media = 'all'; };
            document.head.appendChild(link);
          })();
        ` }} />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
