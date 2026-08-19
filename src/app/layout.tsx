import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SafarLoad — سفر لوڈ | Pakistan's #1 Truck Dispatching Platform",
  description: "Find loads, track shipments, and get paid — all in one app. Pakistan's first professional truck dispatching and freight marketplace platform with Urdu voice interface, JazzCash/Easypaisa payments, and real-time GPS tracking.",
  keywords: "truck dispatching, Pakistan, freight marketplace, load board, GPS tracking, JazzCash, Easypaisa, trucking, logistics, fleet management, Urdu, سفر لوڈ",
  openGraph: {
    title: "SafarLoad — سفر لوڈ | Pakistan's #1 Truck Dispatching Platform",
    description: "Find loads, track shipments, and get paid — all in one app.",
    type: "website",
    locale: "en_PK",
  },
};

import WhatsAppAgentModal from "@/components/WhatsAppAgentModal";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0F172A" />
      </head>
      <body suppressHydrationWarning>
        {children}
        <WhatsAppAgentModal />
      </body>
    </html>
  );
}
