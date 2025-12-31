import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import SkipLink from "./components/SkipLink";

// Primary font: Inter - Professional, calm, readable
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600"], // Reduced weight variety
});

// Display font: Playfair Display - Premium, elegant, not startup-y
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600"],
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
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans">
        <SkipLink />
        {children}
      </body>
    </html>
  );
}

