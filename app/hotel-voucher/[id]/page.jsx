'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
import { 
  Building2, 
  Calendar, 
  Users, 
  MapPin, 
  Printer, 
  ArrowLeft, 
  CheckCircle2, 
  PhoneCall, 
  ShieldCheck, 
  Copy, 
  Check, 
  Bed, 
  Clock, 
  Utensils, 
  FileText,
  Star,
  User,
  ExternalLink,
  Edit3,
  X,
  Shield,
  QrCode
} from 'lucide-react';
import { getHotelVoucherById, saveHotelVoucher } from '../../../lib/erpData';

function getMealPlanLabel(code) {
  switch ((code || '').toUpperCase()) {
    case 'RO': return 'Room Only';
    case 'BB': return 'Bed & Breakfast';
    case 'HB': return 'Half Board';
    case 'FB': return 'Full Board';
    default: return 'Room Only';
  }
}

function formatCityDetails(city, index) {
  const norm = (city || '').toLowerCase();
  if (norm.includes('madin') || norm.includes('medin')) {
    return {
      cityName: 'Medinah',
      shortCity: 'Medinah',
      category: 'Central Zone Category',
      defaultAddress: 'Central Northern Area, Near Prophet\'s Mosque (Al-Masjid an-Nabawi), Madinah, KSA'
    };
  }
  if (norm.includes('jed')) {
    return {
      cityName: 'Jeddah',
      shortCity: 'Jeddah',
      category: 'Coastal Transit Category',
      defaultAddress: 'Al Madinah Al Munawwarah Rd, King Abdulaziz International Airport Zone, Jeddah, KSA'
    };
  }
  return {
    cityName: 'Makkah',
    shortCity: 'Makkah',
    category: 'Standard Star Hospitality',
    defaultAddress: 'Ajyad Road / Ibrahim Al Khalil District, Makkah, Kingdom of Saudi Arabia'
  };
}

function getStayStars(stay) {
  if (stay?.stars) return parseInt(stay.stars) || 5;
  if (stay?.starRating) return parseInt(stay.starRating) || 5;
  const name = (stay?.hotelName || '').toLowerCase();
  if (name.includes('5 star') || name.includes('5★') || name.includes('5-star')) return 5;
  if (name.includes('4 star') || name.includes('4★') || name.includes('4-star')) return 4;
  if (name.includes('3 star') || name.includes('3★') || name.includes('3-star')) return 3;
  if (name.includes('2 star') || name.includes('2★') || name.includes('2-star')) return 2;
  if (name.includes('1 star') || name.includes('1★')) return 1;
  if (typeof window !== 'undefined') {
    try {
      const saved = JSON.parse(localStorage.getItem('neh_erp_hotel_stars_v1') || '{}');
      const key = (stay?.hotelName || '').trim().toUpperCase();
      if (saved[key]) return parseInt(saved[key]) || 5;
    } catch (e) {}
  }
  if (name.includes('voco') || name.includes('fairmont') || name.includes('hilton') || name.includes('swissotel') || name.includes('clock tower') || name.includes('pullman') || name.includes('oberoi') || name.includes('dar al taqwa') || name.includes('dar al eman')) return 5;
  return 4;
}

export default function HotelVoucherViewPage() {
  const params = useParams();
  const id = params?.id ? decodeURIComponent(params.id) : '';
  
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');
  
  // Emergency contacts custom edit modal state
  const [showEditEmergency, setShowEditEmergency] = useState(false);
  const [emergencyKsaGround, setEmergencyKsaGround] = useState('+966 53 649 2846');
  const [emergencyMadinah, setEmergencyMadinah] = useState('+966 57 593 0550');
  const [emergencyPkHeadOffice, setEmergencyPkHeadOffice] = useState('MUHAMMAD FAIZAN 0311-2324764 / G.MURTAZA (HAJI) 0312-3608683');

  // Issue date inline edit state
  const [isEditingIssueDate, setIsEditingIssueDate] = useState(false);
  const [editIssueDate, setEditIssueDate] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
      const data = getHotelVoucherById(id);
      if (data) {
        setVoucher(data);
        setEditIssueDate(data.issueDate || new Date().toISOString().split('T')[0]);
        if (data.emergencyContacts) {
          setEmergencyKsaGround(data.emergencyContacts.ksaGround || '+966 53 649 2846');
          setEmergencyMadinah(data.emergencyContacts.madinah || '+966 57 593 0550');
          const pk = data.emergencyContacts.pkHeadOffice;
          setEmergencyPkHeadOffice((!pk || pk === '+92 321 8450030') ? 'MUHAMMAD FAIZAN 0311-2324764 / G.MURTAZA (HAJI) 0312-3608683' : pk);
        } else {
          setEmergencyPkHeadOffice('MUHAMMAD FAIZAN 0311-2324764 / G.MURTAZA (HAJI) 0312-3608683');
        }
      }
      setLoading(false);
    }
  }, [id]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && voucher) {
      const url = `${origin}/hotel-voucher/${voucher.id || id}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveEmergencyNumbers = (e) => {
    e.preventDefault();
    if (!voucher) return;
    const updatedVoucher = {
      ...voucher,
      emergencyContacts: {
        ksaGround: emergencyKsaGround,
        madinah: emergencyMadinah,
        pkHeadOffice: emergencyPkHeadOffice
      }
    };
    saveHotelVoucher(updatedVoucher);
    setVoucher(updatedVoucher);
    setShowEditEmergency(false);
  };

  const handleSaveIssueDate = (newDate) => {
    if (!voucher || !newDate) return;
    const updatedVoucher = {
      ...voucher,
      issueDate: newDate,
    };
    saveHotelVoucher(updatedVoucher);
    setVoucher(updatedVoucher);
    setIsEditingIssueDate(false);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-900">
        <div className="w-10 h-10 border-4 border-[#dfba73] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!voucher) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-16 text-center">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4 shadow-2xl">
          <Building2 className="w-16 h-16 text-[#dfba73] mx-auto" />
          <h2 className="text-xl font-black text-white uppercase">Accommodation Voucher Not Found</h2>
          <p className="text-slate-400 text-xs">
            No accommodation voucher exists with reference <code className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-mono">{id}</code>.
          </p>
          <Link 
            href="/erp" 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#dfba73] text-[#0a192f] rounded-xl text-xs font-black hover:bg-amber-400 transition-colors shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Operations ERP</span>
          </Link>
        </div>
      </div>
    );
  }

  const liveQrUrl = `${origin}/hotel-voucher/${voucher.id || id}`;
  const totalNights = (voucher.stays || []).reduce((acc, curr) => acc + (parseInt(curr.nights) || 0), 0);
  
  // Extract Lead Passenger / Family Head details ONLY
  const passengers = voucher.passengers || [];
  const headPax = passengers.find(p => 
    p.manifestRole === 'HEAD' || 
    p.relationship?.toLowerCase() === 'head'
  ) || passengers[0] || { name: voucher.partyName || 'LEAD GUEST' };

  const leadName = headPax.name || voucher.partyName || 'LEAD GUEST';
  const leadPrefix = headPax.prefix ? `${headPax.prefix} ` : '';
  const leadPassport = headPax.passportNo || '—';
  const leadPhone = headPax.contactPhone || voucher.contactPhone || voucher.phone || '+92 328 8189989';

  const adultCount = passengers.filter(p => (p.category || 'Adult').toLowerCase() === 'adult').length || 1;
  const childCount = passengers.filter(p => (p.category || '').toLowerCase() === 'child').length;
  const infantCount = passengers.filter(p => (p.category || '').toLowerCase() === 'infant').length;
  const totalPax = passengers.length || voucher.totalPax || 1;
  const bedsCount = passengers.filter(p => p.hasBed !== false).length;

  const currentKsaGround = voucher.emergencyContacts?.ksaGround || emergencyKsaGround;
  const currentMadinah = voucher.emergencyContacts?.madinah || emergencyMadinah;
  const rawPk = voucher.emergencyContacts?.pkHeadOffice || emergencyPkHeadOffice;
  const currentPkHeadOffice = (!rawPk || rawPk === '+92 321 8450030')
    ? 'MUHAMMAD FAIZAN 0311-2324764 / G.MURTAZA (HAJI) 0312-3608683'
    : rawPk;

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 pb-12 font-sans selection:bg-[#dfba73] selection:text-[#0a192f]">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP EXECUTIVE NAVIGATION BAR (Screen Only - Deep Navy #0a192f) */}
      {/* ------------------------------------------------------------- */}
      <header className="bg-[#0a192f] text-white border-b border-slate-800 shadow-md sticky top-0 z-40 no-print">
        <div className="max-w-[1100px] mx-auto px-4 h-14 flex items-center justify-between gap-4">
          
          {/* Left: Voucher Brand Title & Verified Badge */}
          <div className="flex items-center gap-3">
            <Link 
              href="/erp" 
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Return to ERP"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#dfba73]" />
              <span className="font-mono font-black text-xs sm:text-sm tracking-wider uppercase text-white">
                HOTEL VOUCHER • {voucher.voucherNo}
              </span>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>CONFIRMED &amp; GUARANTEED</span>
            </span>
          </div>

          {/* Center Tabs (Executive Document Viewer) */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-bold text-slate-300">
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-white border border-slate-700 shadow-xs cursor-default">
              Document Viewer
            </span>
            <span className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer">
              Stay Manifest
            </span>
            <span className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer">
              Fiscal Settlement
            </span>
            <span className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer">
              Policies &amp; Access
            </span>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold shadow-xs transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>

            <button
              onClick={() => setShowEditEmergency(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-[#dfba73] border border-[#dfba73]/40 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
              title="Edit Emergency Numbers"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Emergency #s</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-white hover:bg-slate-100 text-[#0a192f] rounded-xl text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#0a192f]" />
              <span>Print / Save as PDF</span>
            </button>
          </div>

        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. SUB PREVIEW BAR (Screen Only) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white border-b border-slate-200 py-2.5 px-4 no-print shadow-xs mb-6">
        <div className="max-w-[900px] mx-auto flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span className="font-extrabold text-slate-900">Executive Voucher Preview Mode</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
              A4 Portrait (210x297mm)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-slate-400">Zoom: <strong className="text-slate-700">Fit Width</strong></span>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0a192f] hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5 text-[#dfba73]" />
              <span>Print Voucher</span>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. A4 CERTIFIED ACCOMMODATION VOUCHER SHEET */}
      {/* ------------------------------------------------------------- */}
      <main className="max-w-[880px] mx-auto bg-white shadow-2xl border border-slate-300 print:shadow-none print:border-none print:m-0 print:p-0 p-6 sm:p-9 text-[11px] leading-tight print:w-full print:max-w-full print:text-black">
        
        {/* ========================================================= */}
        {/* A. HEADER: LOGO AT LEFT, CENTER TITLE, CONFIRMED AT RIGHT */}
        {/* ========================================================= */}
        <section className="relative flex flex-col sm:flex-row items-center justify-between border-b-2 border-slate-900 pb-4 mb-4 gap-4 min-h-[110px]">
          {/* Left: Company Logo */}
          <div className="flex items-center justify-start shrink-0 z-10">
            <img 
              src={voucher.logo || "/logo.png"} 
              alt={voucher.companyName || "Cheepa Travels Logo"} 
              className="h-24 sm:h-28 max-w-[240px] sm:max-w-[280px] w-auto object-contain drop-shadow-sm" 
            />
          </div>

          {/* Center: Hotel Voucher Heading */}
          <div className="sm:absolute sm:inset-0 flex items-center justify-center pointer-events-none">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0a192f] tracking-tight uppercase text-center pointer-events-auto">
              HOTEL VOUCHER
            </h1>
          </div>

          {/* Top Right: Confirmed Badge (same styling as Party Head) */}
          <div className="flex items-center justify-end shrink-0 z-10">
            <span className="px-3 py-1 rounded-md text-[10px] font-black uppercase bg-[#0a192f] text-[#dfba73] tracking-wider shadow-2xs inline-flex items-center gap-1.5">
              <Check className="w-3 h-3 text-[#dfba73] stroke-[3]" />
              <span>CONFIRMED</span>
            </span>
          </div>
        </section>

        {/* ========================================================= */}
        {/* B. KEY METRIC TILES (3 BOXES) */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              VOUCHER REFERENCE
            </span>
            <span className="font-mono font-black text-xs text-slate-900 block mt-0.5">
              {voucher.voucherNo}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl relative group">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                ISSUE DATE
              </span>
              <button
                type="button"
                onClick={() => setIsEditingIssueDate(!isEditingIssueDate)}
                className="no-print opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-200 rounded text-slate-500 transition cursor-pointer"
                title="Edit Issue Date"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            </div>
            {isEditingIssueDate ? (
              <div className="no-print mt-1 flex items-center gap-1">
                <input
                  type="date"
                  value={editIssueDate}
                  onChange={(e) => setEditIssueDate(e.target.value)}
                  className="px-2 py-0.5 border border-slate-300 rounded font-bold text-xs bg-white text-slate-900 outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => handleSaveIssueDate(editIssueDate)}
                  className="p-1 bg-[#0a192f] hover:bg-slate-800 text-[#dfba73] rounded text-xs cursor-pointer"
                  title="Save Date"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingIssueDate(false)}
                  className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs cursor-pointer"
                  title="Cancel"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <span className="font-bold text-xs text-slate-900 block mt-0.5">
                {voucher.issueDate}
              </span>
            )}
            {/* Print version always clean */}
            {isEditingIssueDate && (
              <span className="font-bold text-xs text-slate-900 hidden print:block mt-0.5">
                {voucher.issueDate}
              </span>
            )}
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              TOTAL DURATION
            </span>
            <span className="font-black text-xs text-slate-900 block mt-0.5">
              {totalNights} Nights
            </span>
          </div>
        </section>

        {/* ========================================================= */}
        {/* C. PRIMARY LEAD GUEST BLOCK (ONLY FAMILY HEAD NAME) */}
        {/* ========================================================= */}
        <section className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 mb-5 relative overflow-hidden">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Left: Lead Guest Info */}
            <div className="space-y-3 flex-1">

              {/* Single Guest Card for Family Head */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-[#0a192f] flex items-center justify-center font-bold shrink-0">
                    <User className="w-4 h-4 text-slate-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-xs sm:text-sm text-slate-900 uppercase">
                        {leadPrefix}{leadName}
                      </h4>
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-[#0a192f] text-[#dfba73] tracking-wider shadow-2xs">
                        Party Head
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Adult • Passport #{leadPassport}
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary Stats Row */}
              <div className="flex items-center pt-0.5">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-[#0a192f] text-[#dfba73] tracking-wider shadow-2xs inline-flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#dfba73]" />
                  <span>PAX: {totalPax}</span>
                </span>
              </div>

            </div>

            {/* Right: Live QR Node */}
            <div className="flex items-center justify-center p-2.5 bg-white border border-slate-200 rounded-2xl shrink-0 shadow-2xs self-center">
              <div className="p-1.5 bg-white rounded-xl border border-slate-100">
                <QRCodeSVG 
                  value={liveQrUrl} 
                  size={96} 
                  level="M" 
                  includeMargin={false} 
                />
              </div>
            </div>

          </div>

        </section>

        {/* ========================================================= */}
        {/* D. CHRONOLOGICAL ACCOMMODATION STAYS (AS MANY AS CONFIGURED) */}
        {/* ========================================================= */}
        <section className="space-y-3.5 mb-5">
          {(voucher.stays || []).map((stay, idx) => {
            const cityInfo = formatCityDetails(stay.city, idx);
            const stayNights = parseInt(stay.nights) || 1;
            const mealLabel = getMealPlanLabel(stay.mealPlan);
            const starCount = getStayStars(stay);
            const roomTypeRaw = (stay.roomType || 'QUAD').toUpperCase();
            const roomTypeDisplay = (roomTypeRaw.includes('ROOM') || roomTypeRaw.includes('SHARING')) 
              ? roomTypeRaw 
              : `${roomTypeRaw} ROOM`;

            return (
              <div 
                key={stay.id || idx}
                className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs space-y-3 break-inside-avoid"
              >
                {/* Stay Header Bar */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center">
                    <span className="px-3 py-1 rounded-lg bg-[#0a192f] text-white flex items-center justify-center font-black text-xs uppercase tracking-wider shadow-2xs">
                      {cityInfo.cityName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-800 border border-slate-200">
                      {stayNights} NIGHTS
                    </span>
                    <span className="font-mono text-[10px] text-slate-600 font-bold">
                      {stay.hcn || 'HCN-108047'}
                    </span>
                  </div>
                </div>

                {/* Hotel Property Title & Dynamic Category Rating */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h4 className="font-black text-sm sm:text-base text-slate-900 uppercase tracking-tight">
                      {stay.hotelName}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5 sm:self-start shrink-0">
                    <div className="flex items-center text-amber-500">
                      {Array.from({ length: starCount }).map((_, sIdx) => (
                        <Star key={sIdx} className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
                      ))}
                    </div>
                    <span className="text-[9.5px] font-bold text-slate-500">
                      {stay.category || `${starCount} Star Hotel`}
                    </span>
                  </div>
                </div>

                {/* 4 Clean Metric Boxes for Stay Information */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  
                  {/* Box 1: Check-in */}
                  <div className="p-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      CHECK-IN
                    </span>
                    <span className="font-mono font-black text-xs text-slate-900 block mt-0.5">
                      {stay.checkIn}
                    </span>
                    <span className="text-[9px] text-slate-500 font-medium block mt-0.5">
                      From 16:00 (Standard)
                    </span>
                  </div>

                  {/* Box 2: Check-out */}
                  <div className="p-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      CHECK-OUT
                    </span>
                    <span className="font-mono font-black text-xs text-slate-900 block mt-0.5">
                      {stay.checkOut}
                    </span>
                    <span className="text-[9px] text-slate-500 font-medium block mt-0.5">
                      Until 12:00 PM
                    </span>
                  </div>

                  {/* Box 3: Room Type */}
                  <div className="p-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      Room Type :
                    </span>
                    <span className="font-black text-xs text-slate-900 block mt-0.5 uppercase">
                      {roomTypeDisplay}
                    </span>
                  </div>

                  {/* Box 4: Meal Basis */}
                  <div className="p-2.5 bg-slate-50/80 border border-slate-200/90 rounded-xl">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      MEAL BASIS
                    </span>
                    <span className="font-black text-xs text-slate-900 block mt-0.5 uppercase">
                      {stay.mealPlan || 'RO'} ({mealLabel})
                    </span>
                    <span className="text-[9px] text-slate-500 font-medium block mt-0.5">
                      Taxes &amp; VAT Inc.
                    </span>
                  </div>

                </div>

              </div>
            );
          })}
        </section>

        {/* ========================================================= */}
        {/* ========================================================= */}
        {/* E. BOTTOM: ADVISORIES (BIG) & 24-HR EMERGENCY HELPLINE (SMALL BOTTOM RIGHT) */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-4 break-inside-avoid items-stretch">
          
          {/* Column 1 (BIG): Important Remarks & Guest Advisories */}
          <div className="sm:col-span-8 border border-slate-200 rounded-2xl p-4 bg-slate-50/60 flex flex-col justify-between space-y-2.5">
            <div>
              <div className="flex items-center gap-1.5 border-b border-slate-200/80 pb-2 mb-2">
                <FileText className="w-4 h-4 text-slate-700" />
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 uppercase tracking-tight">
                  Important Remarks &amp; Guest Advisories
                </h4>
              </div>

              <ul className="text-[10px] text-slate-600 space-y-1.5 list-disc list-inside leading-snug">
                <li>Standard check-in begins at 16:00; check-out deadline is strictly 12:00 PM. Late check-out incurs a full-night tariff.</li>
                <li>Original Passports, Umrah Visas, and this voucher must be surrendered upon front desk arrival for check-in registry.</li>
                <li>Room allocation is strictly as reserved. Upgrades or adjustments are subject to availability and direct hotel fee.</li>
                <li>Municipal city taxes and KSA VAT (15%) are fully prepaid. Incidentals (minibar, room phone) are billed directly to guests.</li>
              </ul>
            </div>

            {/* Urdu Compliance Note */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 text-right font-sans" dir="rtl">
              <p className="text-[10.5px] text-amber-950 font-bold leading-relaxed">
                ضروری ہدایات: ہوٹل چیک آؤٹ وقت دوپہر 12 بجے ہے اور باقاعدہ واؤچر کا ہمراہ ہونا ضروری ہے۔
              </p>
            </div>
          </div>

          {/* Column 2 (SMALL AT BOTTOM RIGHT): 24-Hour Emergency (Helpline) */}
          <div className="sm:col-span-4 border border-slate-200 rounded-2xl p-3 bg-slate-50/60 flex flex-col justify-between space-y-2 self-end w-full">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5 mb-2">
                <div className="flex items-center gap-1.5">
                  <PhoneCall className="w-3 h-3 text-emerald-700" />
                  <h4 className="font-extrabold text-[10.5px] text-slate-900 uppercase tracking-tight">
                    24-Hour Emergency (Helpline)
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditEmergency(true)}
                  className="no-print text-[9px] font-bold text-slate-400 hover:text-slate-800 inline-flex items-center gap-0.5 cursor-pointer"
                >
                  <Edit3 className="w-2.5 h-2.5" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="space-y-1.5 text-[9.5px]">
                <div className="flex items-center justify-between p-1.5 bg-white border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-500">KSA Ground:</span>
                  <span className="font-mono font-black text-slate-900">{currentKsaGround}</span>
                </div>

                <div className="flex items-center justify-between p-1.5 bg-white border border-slate-200 rounded-lg">
                  <span className="font-bold text-slate-500">Madinah:</span>
                  <span className="font-mono font-black text-slate-900">{currentMadinah}</span>
                </div>

                <div className="p-1.5 bg-white border border-slate-200 rounded-lg space-y-0.5">
                  <span className="font-bold text-slate-500 block text-[9px]">PK Head Office:</span>
                  <span className="font-mono font-black text-slate-900 block text-[9.5px] leading-tight">
                    {currentPkHeadOffice}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* ========================================================= */}
        {/* F. DOCUMENT LEGAL FOOTER */}
        {/* ========================================================= */}
        <footer className="border-t border-slate-200 pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[9px] text-slate-400 font-medium text-center sm:text-left">
          <span>
            Official Corporate Itinerary &amp; Hospitality Settlement Archive • ISO 216 Ready
          </span>
          <span className="font-mono">
            CRS Reference: {voucher.pnr || voucher.voucherNo} • Voucher Valid for Direct Check-In Surrender
          </span>
        </footer>

      </main>

      {/* ------------------------------------------------------------- */}
      {/* 4. MODAL: EDIT EMERGENCY NUMBERS (Screen Only) */}
      {/* ------------------------------------------------------------- */}
      {showEditEmergency && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 no-print">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">Custom Emergency Numbers</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowEditEmergency(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEmergencyNumbers} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1 text-[11px] uppercase tracking-wider">
                  KSA Ground Ops Number
                </label>
                <input 
                  type="text" 
                  value={emergencyKsaGround} 
                  onChange={(e) => setEmergencyKsaGround(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                  placeholder="+966 53 649 2846"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 text-[11px] uppercase tracking-wider">
                  Madinah Helpline Number
                </label>
                <input 
                  type="text" 
                  value={emergencyMadinah} 
                  onChange={(e) => setEmergencyMadinah(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                  placeholder="+966 57 593 0550"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 text-[11px] uppercase tracking-wider">
                  Pakistan Head Office Number
                </label>
                <input 
                  type="text" 
                  value={emergencyPkHeadOffice} 
                  onChange={(e) => setEmergencyPkHeadOffice(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800"
                  placeholder="MUHAMMAD FAIZAN 0311-2324764 / G.MURTAZA (HAJI) 0312-3608683"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditEmergency(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-md"
                >
                  Save Emergency Numbers
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
