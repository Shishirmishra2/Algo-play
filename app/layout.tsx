import "@/styles.css";
import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "AlgoPlay",
  description: "From Bugs to Bonuses Master Coding with Fun!",
  icons: "/logo/logo.png",
};

const insans = Instrument_Sans({
  weight: "variable",
  subsets: ["latin"],
  variable: "--font-insans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`max-w-lg mx-auto antialiased bg-gradient-to-b from-[#010101] to-[#270035] min-h-screen font-sans ${insans.variable}`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
