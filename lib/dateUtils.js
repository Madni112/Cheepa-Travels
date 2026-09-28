const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const monthMap = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
};

export function formatVoucherDate(dateVal) {
  if (!dateVal) return '—';
  const str = String(dateVal).trim();
  
  // Format: YYYY-MM-DD (e.g. 2026-10-01)
  const ymd = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (ymd) {
    const y = ymd[1];
    const m = parseInt(ymd[2], 10) - 1;
    const d = String(parseInt(ymd[3], 10)).padStart(2, '0');
    if (m >= 0 && m < 12) {
      return `${d}-${monthNames[m]}-${y}`;
    }
  }

  // Format: DD-MM-YYYY (e.g. 01-10-2026)
  const dmy = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmy) {
    const d = String(parseInt(dmy[1], 10)).padStart(2, '0');
    const m = parseInt(dmy[2], 10) - 1;
    const y = dmy[3];
    if (m >= 0 && m < 12) {
      return `${d}-${monthNames[m]}-${y}`;
    }
  }

  // Format: DD-MMM (e.g. 01-OCT or 10-Oct)
  const dm = str.match(/^(\d{1,2})-([A-Za-z]{3})$/);
  if (dm) {
    const d = String(parseInt(dm[1], 10)).padStart(2, '0');
    const mon = dm[2].charAt(0).toUpperCase() + dm[2].slice(1, 3).toLowerCase();
    return `${d}-${mon}-2026`;
  }

  // Format: DD-MMM-YYYY (e.g. 01-OCT-2026 or 10-Oct-2026)
  const dmyText = str.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (dmyText) {
    const d = String(parseInt(dmyText[1], 10)).padStart(2, '0');
    const mon = dmyText[2].charAt(0).toUpperCase() + dmyText[2].slice(1, 3).toLowerCase();
    return `${d}-${mon}-${dmyText[3]}`;
  }

  try {
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      const d = String(parsed.getDate()).padStart(2, '0');
      const m = monthNames[parsed.getMonth()];
      const y = parsed.getFullYear() || 2026;
      return `${d}-${m}-${y}`;
    }
  } catch (e) {}

  return str;
}

export function parseDateObj(dateVal) {
  if (!dateVal) return null;
  const str = String(dateVal).trim();
  
  // Format: YYYY-MM-DD
  const ymd = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (ymd) {
    return new Date(parseInt(ymd[1], 10), parseInt(ymd[2], 10) - 1, parseInt(ymd[3], 10));
  }

  // Format: DD-MM-YYYY
  const dmy = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmy) {
    return new Date(parseInt(dmy[3], 10), parseInt(dmy[2], 10) - 1, parseInt(dmy[1], 10));
  }

  // Format: DD-MMM-YYYY (e.g. 15-Oct-2026 or 15-OCT-2026)
  const dmyText = str.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (dmyText) {
    const mon = dmyText[2].toLowerCase();
    if (monthMap[mon] !== undefined) {
      return new Date(parseInt(dmyText[3], 10), monthMap[mon], parseInt(dmyText[1], 10));
    }
  }

  // Format: DD-MMM (e.g. 15-OCT)
  const dm = str.match(/^(\d{1,2})-([A-Za-z]{3})$/);
  if (dm) {
    const mon = dm[2].toLowerCase();
    if (monthMap[mon] !== undefined) {
      return new Date(2026, monthMap[mon], parseInt(dm[1], 10));
    }
  }

  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d;
  } catch (e) {}

  return null;
}

export function calculateNights(checkIn, checkOut, fallback = 0) {
  const dIn = parseDateObj(checkIn);
  const dOut = parseDateObj(checkOut);
  if (dIn && dOut) {
    const diffMs = dOut.getTime() - dIn.getTime();
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (days >= 0) return days;
  }
  return parseInt(fallback) || 0;
}

export function computePaxSummary(paxList = []) {
  if (!paxList || paxList.length === 0) {
    return 'GENT(S): 0  LAD(IES): 0  CHILD(REN): 0  INFANT(S): 0';
  }

  let gents = 0;
  let ladies = 0;
  let children = 0;
  let infants = 0;

  paxList.forEach((p) => {
    const prefix = (p.prefix || '').toUpperCase();
    const name = (p.name || '').toUpperCase();

    if (
      prefix.startsWith('INF') || 
      prefix === 'INFANT' || 
      name.includes('/INF') || 
      name.includes('/INFANT')
    ) {
      infants++;
    } else if (
      prefix.startsWith('CHD') || 
      prefix === 'CHILD' || 
      prefix === 'MSTR' || 
      name.includes('/CHD') || 
      name.includes('/CHILD') || 
      name.includes('MSTR')
    ) {
      children++;
    } else if (
      prefix === 'MRS' || 
      prefix === 'MS' || 
      prefix === 'MISS' || 
      prefix === 'LADY' || 
      name.includes('/MRS') || 
      name.includes('/MISS') || 
      name.includes('/MS') || 
      name.includes('BEGUM') || 
      name.includes('PARVEEN') || 
      name.includes('KHATOON') || 
      name.includes('BIBI')
    ) {
      ladies++;
    } else {
      gents++;
    }
  });

  return `GENT(S): ${gents}  LAD(IES): ${ladies}  CHILD(REN): ${children}  INFANT(S): ${infants}`;
}
