'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getVoucherBySlug, updateVoucher, slugify } from '../../../lib/vouchersData';
import { calculateNights } from '../../../lib/dateUtils';
import { useAuth } from '../../../lib/AuthContext';
import AdminLoginForm from '../../../components/AdminLoginForm';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Check, 
  Building2, 
  Bus, 
  Plane, 
  Users, 
  ShieldCheck, 
  FileText,
  Save
} from 'lucide-react';

export default function EditVoucherPage() {
  const router = useRouter();
  const params = useParams();
  const { isAdmin, isLoaded } = useAuth();
  const slug = params?.slug;

  const [loading, setLoading] = useState(true);
  const [voucher, setVoucher] = useState(null);

  const [party, setParty] = useState('');
  const [ubNumber, setUbNumber] = useState('');
  const [groundTransport, setGroundTransport] = useState('+92 328 8189989');
  const [makkahHelpline, setMakkahHelpline] = useState('+966 53 649 2846');
  const [madinahHelpline, setMadinahHelpline] = useState('+966 57 593 0550');
  const [pakistanHelpline, setPakistanHelpline] = useState('+92 311 2264567');
  const [companyName, setCompanyName] = useState('NOOR E HARAM TRAVEL & TOURS');
  const [executive, setExecutive] = useState('ADMIN');
  const [paxCounts, setPaxCounts] = useState('GENT(S):1 LAD(IES):1 CHILD(REN): 0 INFANT(S):0');
  const [passengers, setPassengers] = useState([]);
  const [accommodations, setAccommodations] = useState([]);
  const [transports, setTransports] = useState([]);
  const [flights, setFlights] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (slug) {
      const found = getVoucherBySlug(slug);
      if (found) {
        const defaultUb = `UB-${100000 + parseInt(found.id || 1) * 1111}`;
        setVoucher(found);
        setParty(found.party || '');
        setUbNumber(found.ubNumber || found.voucherRefNo || defaultUb);
        setGroundTransport(found.groundTransport || found.ksaGroundTransport || '+92 328 8189989');
        setMakkahHelpline(found.makkahHelpline || found.ksaMakkah || '+966 53 649 2846');
        setMadinahHelpline(found.madinahHelpline || found.ksaMadinah || '+966 57 593 0550');
        setPakistanHelpline(found.pakistanHelpline || '+92 311 2264567');
        setCompanyName(found.companyName || 'NOOR E HARAM TRAVEL & TOURS');
        setExecutive(found.executive || 'ADMIN');
        setPaxCounts(found.paxCounts || 'GENT(S):1 LAD(IES):1 CHILD(REN): 0 INFANT(S):0');
        setPassengers(found.passengers && found.passengers.length > 0 ? found.passengers : [
          { sNo: '1', name: '', passportNo: '', group: '', visaNo: '' }
        ]);
        setAccommodations(found.accommodations && found.accommodations.length > 0 ? found.accommodations : [
          { city: 'MAKKAH', hotelCode: '378', hotelName: '', roomType: 'DOUBLE', checkIn: '', checkOut: '', nights: '5' }
        ]);
        setTransports(found.transports && found.transports.length > 0 ? found.transports : [
          { sNo: '1', tnNo: '317', service: 'JED AIRPORT TO MAKKAH HOTEL', vehicle: 'BUS', pickupDate: '', contactPerson: '', bookingRefNo: '' }
        ]);
        setFlights(found.flights && found.flights.length > 0 ? found.flights : [
          { pnr: 'GDKHVK', date: '2026-10-01', flight: 'F3-830', from: 'KHI', to: 'JED', departure: '08:00', arrival: '10:05' },
          { pnr: 'GDKHVK', date: '2026-10-19', flight: 'F3-829', from: 'JED', to: 'KHI', departure: '12:45', arrival: '07:00' }
        ]);
      }
      setLoading(false);
    }
  }, [slug]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return <AdminLoginForm />;
  }

  if (!voucher) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Voucher Not Found</h2>
        <p className="text-slate-500 mt-2">The requested voucher could not be loaded for editing.</p>
        <Link href="/" className="inline-block mt-4 px-4 py-2 bg-emerald-700 text-white rounded-lg font-bold">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Add passenger row
  const addPassenger = () => {
    setPassengers([
      ...passengers,
      { sNo: (passengers.length + 1).toString(), name: '', passportNo: '', group: '', visaNo: '' },
    ]);
  };

  const removePassenger = (index) => {
    setPassengers(passengers.filter((_, i) => i !== index));
  };

  const updatePassenger = (index, field, value) => {
    const copy = [...passengers];
    copy[index][field] = value;
    setPassengers(copy);
  };

  // Add Accommodation
  const addAccommodation = () => {
    setAccommodations([
      ...accommodations,
      { city: 'MAKKAH', hotelCode: '378', hotelName: '', roomType: 'DOUBLE', checkIn: '', checkOut: '', nights: '1' },
    ]);
  };

  const removeAccommodation = (index) => {
    setAccommodations(accommodations.filter((_, i) => i !== index));
  };

  const updateAccommodation = (index, field, value) => {
    const copy = [...accommodations];
    copy[index] = { ...copy[index], [field]: value };
    
    // Automatically recalculate nights when dates are updated
    if (field === 'checkIn' || field === 'checkOut') {
      const computedNights = calculateNights(copy[index].checkIn, copy[index].checkOut, copy[index].nights);
      if (computedNights > 0) {
        copy[index].nights = String(computedNights);
      }
    }
    setAccommodations(copy);
  };

  // Add Transport
  const addTransport = () => {
    setTransports([
      ...transports,
      { sNo: (transports.length + 1).toString(), tnNo: '317', service: '', vehicle: 'BUS', pickupDate: '', contactPerson: '', bookingRefNo: '' },
    ]);
  };

  const removeTransport = (index) => {
    setTransports(transports.filter((_, i) => i !== index));
  };

  const updateTransport = (index, field, value) => {
    const copy = [...transports];
    copy[index][field] = value;
    setTransports(copy);
  };

  // Add Flight
  const addFlight = () => {
    setFlights([
      ...flights,
      { pnr: '', date: '', flight: '', from: 'KHI', to: 'JED', departure: '', arrival: '' },
    ]);
  };

  const removeFlight = (index) => {
    setFlights(flights.filter((_, i) => i !== index));
  };

  const updateFlight = (index, field, value) => {
    const copy = [...flights];
    copy[index][field] = value;
    setFlights(copy);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!party.trim()) {
      alert('Please provide a Party Name / Family Head');
      return;
    }

    setIsSubmitting(true);

    const updatedData = {
      ...voucher,
      companyName,
      party: party.trim(),
      ubNumber: ubNumber.trim(),
      voucherRefNo: ubNumber.trim(),
      groundTransport: groundTransport.trim(),
      makkahHelpline: makkahHelpline.trim(),
      madinahHelpline: madinahHelpline.trim(),
      pakistanHelpline: pakistanHelpline.trim(),
      slug: voucher.slug || slugify(party),
      executive,
      paxCounts,
      totalPax: passengers.length,
      passengers,
      accommodations,
      transports,
      flights,
    };

    updateVoucher(voucher.slug || voucher.id || slug, updatedData);

    setTimeout(() => {
      setIsSubmitting(false);
      router.push(`/voucher/${updatedData.slug || slug}`);
    }, 400);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <Link 
          href={`/voucher/${slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Voucher</span>
        </Link>
        <span className="text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
          Editing Voucher: {voucher.party}
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-400/30 text-amber-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-heading">
                Edit Umrah Voucher
              </h1>
              <p className="text-emerald-300 text-xs sm:text-sm mt-0.5">
                Update passenger, hotel, flight, or transport information for this package voucher.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          
          {/* General Information */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Users className="w-4 h-4 text-emerald-700" />
              General Voucher Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Family Head / Party Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  required
                  value={party}
                  onChange={(e) => setParty(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  UB / Voucher Number <span className="text-emerald-700 font-bold">(e.g. UB-101111)</span>
                </label>
                <input 
                  type="text"
                  required
                  value={ubNumber}
                  onChange={(e) => setUbNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono font-bold text-emerald-950 uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Executive / Agent
                </label>
                <input 
                  type="text"
                  value={executive}
                  onChange={(e) => setExecutive(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-bold text-slate-700 mb-1">
                  PAX Breakdown Text
                </label>
                <input 
                  type="text"
                  value={paxCounts}
                  onChange={(e) => setPaxCounts(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Operational & Helpline Numbers */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Operational &amp; Helpline Numbers
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ground Transport Helpline
                </label>
                <input 
                  type="text"
                  value={groundTransport}
                  onChange={(e) => setGroundTransport(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  placeholder="+92 328 8189989"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Makkah Helpline
                </label>
                <input 
                  type="text"
                  value={makkahHelpline}
                  onChange={(e) => setMakkahHelpline(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  placeholder="+966 53 649 2846"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Madinah Helpline
                </label>
                <input 
                  type="text"
                  value={madinahHelpline}
                  onChange={(e) => setMadinahHelpline(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  placeholder="+966 57 593 0550"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pakistan 24/7 Helpline
                </label>
                <input 
                  type="text"
                  value={pakistanHelpline}
                  onChange={(e) => setPakistanHelpline(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono font-bold text-emerald-800"
                  placeholder="+92 311 2264567"
                />
              </div>
            </div>
          </div>

          {/* Passengers / Mutamers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                Mutamers &amp; Pilgrims List ({passengers.length})
              </h2>
              <button
                type="button"
                onClick={addPassenger}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg font-bold text-xs hover:bg-emerald-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Mutamer
              </button>
            </div>

            <div className="space-y-2">
              {passengers.map((pax, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 items-center text-xs">
                  <div className="col-span-1 text-center font-bold text-slate-500">
                    #{idx + 1}
                  </div>
                  <div className="col-span-4">
                    <input 
                      type="text"
                      placeholder="Mutamer Full Name"
                      value={pax.name}
                      onChange={(e) => updatePassenger(idx, 'name', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-semibold text-slate-900 uppercase"
                    />
                  </div>
                  <div className="col-span-3">
                    <input 
                      type="text"
                      placeholder="Passport No"
                      value={pax.passportNo}
                      onChange={(e) => updatePassenger(idx, 'passportNo', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono uppercase"
                    />
                  </div>
                  <div className="col-span-3">
                    <input 
                      type="text"
                      placeholder="Group No (optional)"
                      value={pax.group || ''}
                      onChange={(e) => updatePassenger(idx, 'group', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono text-slate-600"
                    />
                  </div>
                  <div className="col-span-1 text-right">
                    {passengers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePassenger(idx)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accommodations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700" />
                Accommodations / Hotels ({accommodations.length})
              </h2>
              <button
                type="button"
                onClick={addAccommodation}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg font-bold text-xs hover:bg-emerald-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Hotel
              </button>
            </div>

            <div className="space-y-2">
              {accommodations.map((acc, idx) => {
                const computedNights = calculateNights(acc.checkIn, acc.checkOut, acc.nights);
                return (
                  <div key={idx} className="grid grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 items-center text-xs">
                    <div className="col-span-2">
                      <select
                        value={acc.city}
                        onChange={(e) => updateAccommodation(idx, 'city', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white font-bold text-slate-800"
                      >
                        <option value="MAKKAH">Makkah</option>
                        <option value="MADINAH">Madinah</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input 
                        type="text"
                        placeholder="Hotel Name"
                        value={acc.hotelName}
                        onChange={(e) => updateAccommodation(idx, 'hotelName', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white font-semibold text-slate-900"
                      />
                    </div>
                    <div className="col-span-2">
                      <input 
                        type="text"
                        placeholder="Room Type"
                        value={acc.roomType}
                        onChange={(e) => updateAccommodation(idx, 'roomType', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white"
                      />
                    </div>
                    <div className="col-span-1">
                      <input 
                        type="text"
                        placeholder="HCN#"
                        value={acc.hcn !== undefined ? acc.hcn : (acc.hotelCode || '')}
                        onChange={(e) => updateAccommodation(idx, 'hcn', e.target.value)}
                        className="w-full px-1.5 py-1.5 border border-slate-300 rounded bg-white font-mono text-center text-[11px]"
                        title="Hotel Confirmation / Contract Number (HCN#)"
                      />
                    </div>
                    <div className="col-span-2">
                      <input 
                        type="text"
                        placeholder="Check-in (e.g. 01-Oct-2026)"
                        value={acc.checkIn}
                        onChange={(e) => updateAccommodation(idx, 'checkIn', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-[11px]"
                      />
                    </div>
                    <div className="col-span-2">
                      <input 
                        type="text"
                        placeholder="Check-out (e.g. 06-Oct-2026)"
                        value={acc.checkOut}
                        onChange={(e) => updateAccommodation(idx, 'checkOut', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-[11px]"
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-end gap-1">
                      <span className="px-1.5 py-1 bg-amber-100 text-amber-900 font-bold rounded text-[11px] whitespace-nowrap" title="Calculated Nights">
                        {computedNights}N
                      </span>
                      {accommodations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAccommodation(idx)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                          title="Remove Hotel"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transport Services */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bus className="w-4 h-4 text-emerald-700" />
                Transport Services ({transports.length})
              </h2>
              <button
                type="button"
                onClick={addTransport}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg font-bold text-xs hover:bg-emerald-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Sector
              </button>
            </div>

            <div className="space-y-2">
              {transports.map((t, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 items-center text-xs">
                  <div className="col-span-3">
                    <input 
                      type="text"
                      placeholder="Transporter (e.g. Company Transport)"
                      value={t.transporter !== undefined ? t.transporter : (idx === 0 || t.vehicle?.toUpperCase() === 'BUS' ? 'Company Transport' : 'Private Transport')}
                      onChange={(e) => updateTransport(idx, 'transporter', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-semibold text-slate-900"
                    />
                  </div>
                  <div className="col-span-3">
                    <input 
                      type="text"
                      placeholder="Type (e.g. Economy By Bus, GMC)"
                      value={t.vehicle || ''}
                      onChange={(e) => updateTransport(idx, 'vehicle', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div className="col-span-3">
                    <input 
                      type="text"
                      placeholder="Sector (e.g. JED AIRPORT TO MAKKAH HOTEL)"
                      value={t.service || ''}
                      onChange={(e) => updateTransport(idx, 'service', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-medium text-slate-800"
                    />
                  </div>
                  <div className="col-span-2">
                    <input 
                      type="text"
                      placeholder="Date (01-Oct-2026)"
                      value={t.pickupDate || ''}
                      onChange={(e) => updateTransport(idx, 'pickupDate', e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-[11px]"
                    />
                  </div>
                  <div className="col-span-1 text-right">
                    {transports.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTransport(idx)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Remove Sector"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Flights */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plane className="w-4 h-4 text-emerald-700" />
                Flight Schedule ({flights.length})
              </h2>
              <button
                type="button"
                onClick={addFlight}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg font-bold text-xs hover:bg-emerald-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Flight
              </button>
            </div>

            <div className="space-y-2">
              {flights.map((f, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 items-center text-xs">
                  <div className="col-span-2">
                    <input 
                      type="text"
                      placeholder="Flight (F3-830)"
                      value={f.flight}
                      onChange={(e) => updateFlight(idx, 'flight', e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white font-mono font-bold"
                    />
                  </div>
                  <div className="col-span-2">
                    <input 
                      type="text"
                      placeholder="Date (01-Oct-2026)"
                      value={f.date}
                      onChange={(e) => updateFlight(idx, 'date', e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-[11px]"
                    />
                  </div>
                  <div className="col-span-2">
                    <input 
                      type="text"
                      placeholder="From (KHI)"
                      value={f.from}
                      onChange={(e) => updateFlight(idx, 'from', e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <input 
                      type="text"
                      placeholder="To (JED)"
                      value={f.to}
                      onChange={(e) => updateFlight(idx, 'to', e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                  <div className="col-span-3 flex items-center gap-1">
                    <input 
                      type="text"
                      placeholder="Dep (08:00)"
                      value={f.departure}
                      onChange={(e) => updateFlight(idx, 'departure', e.target.value)}
                      className="w-1/2 px-2 py-1.5 border border-slate-300 rounded bg-white font-mono text-[11px]"
                    />
                    <input 
                      type="text"
                      placeholder="Arr (10:05)"
                      value={f.arrival}
                      onChange={(e) => updateFlight(idx, 'arrival', e.target.value)}
                      className="w-1/2 px-2 py-1.5 border border-slate-300 rounded bg-white font-mono text-[11px]"
                    />
                  </div>
                  <div className="col-span-1 text-right">
                    {flights.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFlight(idx)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <Link 
              href={`/voucher/${slug}`}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-900/20 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>{isSubmitting ? 'Saving Changes...' : 'Save & Update Voucher'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
