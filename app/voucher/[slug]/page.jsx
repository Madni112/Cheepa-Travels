'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  initialVouchers, 
  getAllVouchers, 
  getVoucherBySlug, 
  fetchSupabaseVouchers, 
  fetchSupabaseVoucherBySlug, 
  slugify 
} from '../../../lib/vouchersData';
import { useAuth } from '../../../lib/AuthContext';
import VoucherView from '../../../components/VoucherView';
import QRCodeCard from '../../../components/QRCodeCard';
import { 
  ArrowLeft, 
  ChevronRight, 
  Search, 
  Sparkles, 
  Share2, 
  ExternalLink, 
  User, 
  Calendar, 
  Building2,
  CheckCircle2,
  Edit3,
  Printer
} from 'lucide-react';

export default function VoucherDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;
  const { isAdmin } = useAuth();

  const [vouchers, setVouchers] = useState(initialVouchers);
  const [voucher, setVoucher] = useState(() => {
    if (slug) {
      return getVoucherBySlug(slug) || initialVouchers[0];
    }
    return initialVouchers[0];
  });
  const [origin, setOrigin] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
      
      // Load instant local cache first
      const all = getAllVouchers();
      setVouchers(all);
      if (slug) {
        const found = getVoucherBySlug(slug);
        if (found) setVoucher(found);
      }

      // Fetch fresh live data from Supabase
      fetchSupabaseVouchers().then((liveList) => {
        if (liveList && liveList.length > 0) {
          setVouchers(liveList);
        }
      });

      if (slug) {
        fetchSupabaseVoucherBySlug(slug).then((liveVoucher) => {
          if (liveVoucher) {
            setVoucher(liveVoucher);
          }
        });
      }
    }
  }, [slug]);

  if (!voucher) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Loading Voucher Details...</p>
      </div>
    );
  }

  const filteredVouchers = vouchers.filter((v) =>
    (v.party || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.sheetName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Top Breadcrumb & Quick Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 no-print">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
            {isAdmin ? (
              <>
                <Link href="/" className="hover:text-emerald-700 font-medium flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-slate-400">Voucher</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </>
            ) : null}
            <span className="font-bold text-emerald-950 truncate max-w-[250px] sm:max-w-md">
              {voucher.party}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                href={`/edit/${voucher.slug || voucher.id || slug}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-600 bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs shadow-sm transition-all"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Edit Voucher</span>
              </Link>
            )}
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Official Umrah Voucher • {voucher.passengers?.length || 1} PAX
            </span>
          </div>
        </div>

        {/* Layout: Main Voucher (+ Sidebar only for Admin) */}
        <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-12 gap-8' : 'max-w-4xl mx-auto'} items-start`}>
          
          {/* Main Voucher */}
          <div className={`${isAdmin ? 'lg:col-span-8' : 'w-full'} space-y-4 mx-auto w-full`}>
            
            {/* Customer Quick Actions Bar (Visible when not logged in / on mobile) */}
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-xs no-print">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-700">Official Electronic Voucher</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') window.print();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0a192f] hover:bg-[#112a4f] text-white font-bold text-xs shadow-xs transition-all"
                >
                  <Printer className="w-3.5 h-3.5 text-[#dfba73]" />
                  <span>Print / PDF</span>
                </button>
              </div>
            </div>

            <VoucherView voucher={voucher} origin={origin} />
          </div>

          {/* SIDEBAR: QR Code Card & Switcher ONLY FOR LOGGED-IN ADMIN */}
          {isAdmin && (
            <div className="lg:col-span-4 space-y-6 no-print">
              {/* Live QR Code Box */}
              <QRCodeCard voucher={voucher} />

              {/* Switcher Drawer - ONLY FOR ADMIN */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-heading font-bold text-slate-800 text-sm">Switch Party (Admin)</h3>
                  <span className="text-xs text-slate-400">{vouchers.length} Total</span>
                </div>

                {/* Search filter in switcher */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search party or voucher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* List */}
                <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                  {filteredVouchers.map((v) => {
                    const isActive = v.id === voucher.id || v.slug === voucher.slug;
                    return (
                      <Link
                        key={v.id}
                        href={`/voucher/${v.slug || v.id}`}
                        className={`block p-2.5 rounded-xl text-xs transition-all border ${
                          isActive
                            ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm font-semibold'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/70 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate font-bold max-w-[170px]">{v.party}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            isActive ? 'bg-emerald-800 text-amber-300' : 'bg-slate-200 text-slate-600'
                          }`}>
                            #{v.id}
                          </span>
                        </div>
                        <div className={`flex items-center gap-2 mt-1 text-[11px] ${
                          isActive ? 'text-emerald-200' : 'text-slate-500'
                        }`}>
                          <span>{v.passengers?.length || 1} PAX</span>
                          <span>•</span>
                          <span className="truncate">{v.accommodations?.[0]?.hotelName || 'Umrah Package'}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
