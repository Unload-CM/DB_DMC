import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SupabaseAuthProvider from '@/components/supabase-auth-provider';
import I18nProvider from '@/components/I18nProvider';

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "DMC ERP 시스템",
  description: "DMC 기업 자원 관리 시스템",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <I18nProvider>
          <SupabaseAuthProvider>
            {children}
          </SupabaseAuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
