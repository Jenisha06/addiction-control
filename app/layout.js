import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Control | Your Recovery Companion",
  description: "A gamified recovery journey for addiction. Transform your path to sobriety into an adventure of growth and self-discovery.",
};

import { AppProvider } from "@/context/AppContext";


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <AppProvider>
          {children}
         
        </AppProvider>
      </body>
    </html>
  );
}