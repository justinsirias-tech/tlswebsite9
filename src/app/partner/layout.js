import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Partner Portal | That Laundry Shop",
  description: "Exclusive portal for That Laundry Shop commercial partners, concierge, and affiliates.",
};

export default function PartnerRootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body className={inter.className} style={{ margin: 0, padding: 0, minHeight: "100vh", backgroundColor: "#f8fafc" }}>
        {children}
      </body>
    </html>
  );
}
