import './globals.css';
import Navbar from '../components/Navbar';
import { AuthProvider } from '../lib/AuthContext';

export const metadata = {
  title: 'Noor E Haram Travel & Tours — Umrah Package Vouchers & QR Portal',
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
              <p className="font-semibold text-emerald-100">NOOR E HARAM TRAVEL &amp; TOURS • UMRAH VOUCHER MANAGEMENT SYSTEM</p>
              <p className="text-emerald-400/60">Mob: Ubaid Raza +92-311-2264567 / +92-348-3138424 | Emergency: +966 50 627 7492</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
