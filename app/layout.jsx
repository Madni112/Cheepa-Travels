import './globals.css';
import Navbar from '../components/Navbar';
import { AuthProvider } from '../lib/AuthContext';

export const metadata = {
  title: 'Cheepa FJ Travels — Umrah Package Vouchers & QR Portal',
  description: 'Official Umrah Package Vouchers with instant QR code verification and redirect portal.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-100/70 min-h-screen flex flex-col antialiased selection:bg-amber-200 selection:text-emerald-950">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-emerald-950 text-emerald-300/80 py-6 border-t border-emerald-900 text-xs text-center no-print">
            <div className="max-w-7xl mx-auto px-4 space-y-1">
              <p className="font-semibold text-emerald-100">CHEEPA FJ TRAVELS • UMRAH VOUCHER MANAGEMENT SYSTEM</p>
              <p className="text-emerald-400/60">MUHAMMAD FAIZAN 03112324764 | G.MURTAZA (HAJI) 0312360 8683</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
