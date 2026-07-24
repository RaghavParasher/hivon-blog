import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import Navbar from "@/lib/components/Navbar";

export const metadata: Metadata = {
  title: "Chronicle AI | Premium AI-Powered Blogging",
  description: "A futuristic blogging platform built with Next.js, Supabase, and Google AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="container animate-fade-in" style={{ padding: '3rem 2rem' }}>
            {children}
          </main>
          <footer style={{ borderTop: '1px solid var(--glass-border)', padding: '4rem 0', marginTop: '4rem' }}>
            <div className="container text-center text-muted">
              <p>&copy; {new Date().getFullYear()} Chronicle AI. All rights reserved.</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
