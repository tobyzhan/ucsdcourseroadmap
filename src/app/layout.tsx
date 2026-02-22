import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TranscriptProvider } from "@/context/TranscriptContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UCSD Course Roadmap",
  description: "Plan your path to graduation with intelligent prerequisite mapping",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TranscriptProvider>
          {children}
        </TranscriptProvider>
      </body>
    </html>
  );
}
