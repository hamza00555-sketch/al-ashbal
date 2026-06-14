import type { Metadata } from "next";
import { Baloo_Bhaijaan_2 } from "next/font/google";
import "./globals.css";

const baloo = Baloo_Bhaijaan_2({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-baloo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "الأشبال",
  description:
    "تطبيق عائلي تعليمي لتنظيم دروس القرآن والتجويد والسلوك، ومتابعة تقدّم الأطفال بطريقة آمنة ومحفّزة.",
  applicationName: "الأشبال",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${baloo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
