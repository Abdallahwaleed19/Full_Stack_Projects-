/**
 * التوقيت المصري (Africa/Cairo) — جميع الحسابات تعتمد على التوقيت الرسمي لمصر.
 */
const EGYPT_TZ = 'Africa/Cairo';

export function getEgyptDateParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: EGYPT_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value || '';
  return { year: get('year'), month: get('month'), day: get('day') };
}

/** تاريخ اليوم بتوقيت مصر YYYY-MM-DD */
export function getEgyptDateString(date = new Date()) {
  const { year, month, day } = getEgyptDateParts(date);
  return `${year}-${month}-${day}`;
}

function daysSinceEpoch(y, m, d) {
  const year = parseInt(y, 10);
  const month = parseInt(m, 10);
  const day = parseInt(d, 10);
  const isLeap = (yy) => (yy % 4 === 0 && yy % 100 !== 0) || yy % 400 === 0;
  const daysInMonth = (yy, mm) => {
    if (mm === 2) return isLeap(yy) ? 29 : 28;
    if ([4, 6, 9, 11].includes(mm)) return 30;
    return 31;
  };
  let total = 0;
  for (let i = 1970; i < year; i++) total += isLeap(i) ? 366 : 365;
  for (let i = 1; i < month; i++) total += daysInMonth(year, i);
  total += day;
  return total;
}

/** رقم اليوم المتسلسل بتوقيت مصر (لاختيار حديث اليوم) */
export function getEgyptEpochDay(date = new Date()) {
  const { year, month, day } = getEgyptDateParts(date);
  return daysSinceEpoch(year, month, day);
}

/** أجزاء التاريخ الهجري الحالي بتوقيت مصر: { day, monthIndex, year } (monthIndex 0–11) */
export function getEgyptHijriDateParts(date = new Date()) {
  const adjustedDate = new Date(date.getTime() - 24 * 60 * 60 * 1000); // إرجاع التاريخ الهجري يوماً واحداً
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: EGYPT_TZ,
    calendar: 'islamic-umalqura',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(adjustedDate);
  const get = (type) => parts.find((p) => p.type === type)?.value || '0';
  const year = parseInt(get('year'), 10);
  const month = parseInt(get('month'), 10);
  const day = parseInt(get('day'), 10);
  return { day, monthIndex: month - 1, year };
}

/** التاريخ الهجري بتوقيت مصر (قصير) */
export function getEgyptHijriShort(date = new Date(), lang = 'ar') {
  const adjustedDate = new Date(date.getTime() - 24 * 60 * 60 * 1000); // إرجاع التاريخ الهجري يوماً واحداً
  const loc = lang === 'ar' ? 'ar-EG' : 'en';
  return new Intl.DateTimeFormat(loc, {
    timeZone: EGYPT_TZ,
    calendar: 'islamic-umalqura',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(adjustedDate);
}

/** الميلي ثانية حتى منتصف الليل بتوقيت مصر */
export function getMsUntilEgyptMidnight(now = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: EGYPT_TZ,
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = formatter.formatToParts(now);
  const get = (t) => parts.find((p) => p.type === t)?.value || '0';
  const h = parseInt(get('hour'), 10);
  const m = parseInt(get('minute'), 10);
  const s = parseInt(get('second'), 10);
  const msElapsed = (h * 3600 + m * 60 + s) * 1000;
  return 24 * 60 * 60 * 1000 - msElapsed;
}
