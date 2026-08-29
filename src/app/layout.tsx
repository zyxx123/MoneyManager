import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "Pundi",
  description: "Personal Finance Manager PWA",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pundi",
  },
};

export const viewport: Viewport = {
  themeColor: "#FEF08A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import BottomNav from "@/components/BottomNav";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-text-main">
        <main className="flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
