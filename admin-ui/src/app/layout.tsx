import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/i18n/client";
import { ThemeProvider } from "@/context/ThemeContext";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "VelocitySales - Admin Dashboard",
  description: "Admin dashboard for VelocitySales AI Sales Agents Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" data-theme="dark" suppressHydrationWarning>
      <body
        className={`${sora.variable} ${inter.variable} font-sans antialiased`}
        style={{ background: "var(--background)" }}
      >
        <ThemeProvider>
          <LocaleProvider>
            {children}
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
