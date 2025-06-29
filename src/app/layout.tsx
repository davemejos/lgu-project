import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from '@/components/providers/ReduxProvider';
import { SupabaseAuthProvider } from '@/components/providers/SupabaseAuthProvider';


import ChatBot from '@/components/chatbot/ChatBot';
import CloudinarySchedulerInit from '@/components/CloudinarySchedulerInit';
import ClientOnly from '@/components/ClientOnly';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LGU Project App - Admin Dashboard",
  description: "Admin dashboard for managing users and system operations",
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
        <ReduxProvider>
          <SupabaseAuthProvider>
            {children}
            <ClientOnly>
              <ChatBot />
              <CloudinarySchedulerInit />
            </ClientOnly>
          </SupabaseAuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
