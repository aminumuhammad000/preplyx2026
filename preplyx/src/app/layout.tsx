import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import BackendStatus from "@/components/BackendStatus";

export const metadata: Metadata = {
  title: "Preplyx | JAMB, WAEC & NECO CBT Platform",
  description: "Prepare for JAMB, WAEC, and NECO with real past questions, AI assistance, and performance analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="desktop-background">
        <div className="app-window">
          <AuthProvider>
            <BackendStatus />
            <main className="flex flex-col flex-1" style={{ overflowY: 'auto', position: 'relative' }}>
              {children}
            </main>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
