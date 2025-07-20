import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from '../components/ui/sonner' // Your custom wrapper

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Mental Health Tracker",
  description: "An app to track your mental health",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
