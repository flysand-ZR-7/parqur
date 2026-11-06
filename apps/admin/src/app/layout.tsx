import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '../components/Sidebar';

export const metadata: Metadata = {
  title: 'PARQUR Central Admin Console',
  description: 'Operations, TrustGate Verification, and Territory Management for PARQUR',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
