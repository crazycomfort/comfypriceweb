import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SkipLink from "./components/SkipLink";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "COMFYpri\u00A2e - HVAC Ballpark Estimator",
  description: "Get a transparent, detailed HVAC estimate for your home",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <SkipLink />
        {children}
      </body>
    </html>
  );
}

