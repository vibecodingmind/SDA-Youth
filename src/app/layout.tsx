import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/lib/query-provider";
import { CookieConsent } from "@/components/legal/cookie-consent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BUSYBEES - SDA Youth Ministry Platform",
  description: "A Christ-centered platform empowering Seventh-day Adventist youth to grow in faith, serve with love, and connect in community.",
  keywords: ["SDA", "Youth Ministry", "Church", "Community", "Faith", "BUSYBEES"],
  authors: [{ name: "BUSYBEES SDA Youth Ministry" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "BUSYBEES - SDA Youth Ministry Platform",
    description: "A Christ-centered platform empowering Seventh-day Adventist youth",
    url: "https://busybees.church",
    siteName: "BUSYBEES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BUSYBEES - SDA Youth Ministry Platform",
    description: "A Christ-centered platform empowering Seventh-day Adventist youth",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <QueryProvider>
          {children}
          <Toaster />
          <CookieConsent />
        </QueryProvider>
      </body>
    </html>
  );
}
