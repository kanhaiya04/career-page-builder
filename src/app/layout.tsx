import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppProviders } from "@/components/providers/app-providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://whitecarrot-careers-demo.vercel.app"),
  title: {
    default: "Careers Page Builder",
    template: "%s • Careers Page Builder",
  },
  description:
    "Create branded careers pages recruiters can launch in minutes. Built for the Whitecarrot ATS assignment.",
  openGraph: {
    title: "Careers Page Builder",
    description:
      "An editor + browsing experience that helps recruiters tell their story and candidates find roles fast.",
    type: "website",
    url: "https://whitecarrot-careers-demo.vercel.app",
  },
  keywords: [
    "careers",
    "ats",
    "jobs",
    "nextjs",
    "whitecarrot",
    "recruiting",
    "tailwindcss",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          "antialiased min-h-screen bg-background text-foreground"
        )}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
