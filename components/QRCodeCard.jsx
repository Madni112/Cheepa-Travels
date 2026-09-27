'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { QrCode, Copy, Check, ExternalLink, Download, Smartphone, Share2, Globe } from 'lucide-react';

export default function QRCodeCard({ voucher, customUrl }) {
  const [currentUrl, setCurrentUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [baseUrlOverride, setBaseUrlOverride] = useState('');
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const canvasRef = useRef(null);

  const slug = voucher.slug || voucher.id;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const finalUrl = customUrl || `${origin}/voucher/${slug}`;
      setCurrentUrl(finalUrl);
    }
  }, [slug, customUrl]);

  const activeUrl = baseUrlOverride
    ? `${baseUrlOverride.replace(/\/$/, '')}/voucher/${slug}`
    : currentUrl;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById(`qr-canvas-${voucher.id || slug}`);
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `QR-Voucher-${slug}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-emerald-100/80 p-5 no-print">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-slate-800 text-base">Live Redirect QR Code</h3>
            <p className="text-xs text-slate-500">Scan to open this voucher on mobile</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live Active
        </span>
      </div>

      <div className="flex flex-col items-center">
        {/* QR Code Graphic Frame */}
        <div className="relative p-4 bg-gradient-to-b from-amber-50/60 to-emerald-50/60 rounded-2xl border-2 border-dashed border-amber-300/80 shadow-inner group">
          <div className="bg-white p-3 rounded-xl shadow-sm">
            {activeUrl && (
              <>
                <QRCodeSVG
                  value={activeUrl}
                  size={170}
                  level="H"
                  includeMargin={false}
                  imageSettings={{
                    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23064e3b'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E",
                    x: undefined,
                    y: undefined,
                    height: 28,
                    width: 28,
                    excavate: true,
                  }}
                />
                {/* Hidden canvas for download */}
                <div className="hidden">
                  <QRCodeCanvas
                    id={`qr-canvas-${voucher.id || slug}`}
                    value={activeUrl}
                    size={400}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Target URL display */}
        <div className="w-full mt-4 bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-xs text-slate-600">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
            <span>SCANS REDIRECT TO:</span>
            <button
              onClick={() => setIsEditingUrl(!isEditingUrl)}
              className="text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
            >
              <Globe className="w-3 h-3" />
              {isEditingUrl ? 'Close domain edit' : 'Change host domain'}
            </button>
          </div>

          {isEditingUrl ? (
            <div className="space-y-1.5 pt-1">
              <input
                type="text"
                placeholder="e.g. https://umrahvouchers.com"
                value={baseUrlOverride}
                onChange={(e) => setBaseUrlOverride(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-slate-400">
                Type your production domain so printed QR codes point to your live website.
              </p>
            </div>
          ) : (
            <div className="font-mono text-emerald-900 font-semibold truncate bg-white px-2 py-1 rounded border border-slate-200">
              {activeUrl || 'Loading URL...'}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 w-full mt-3">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadQR}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save QR Image</span>
          </button>
        </div>
      </div>
    </div>
  );
}
