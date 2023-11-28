import i18next from 'i18next';

export const addDaysToDate = (d, days) =>
  new Date(new Date(d).setDate(d.getDate() + days));

export const formatDate = (dateString, includeTime = true) => {
  if (!dateString) return null;
  try {
    return getLocaleString(toDate(dateString), includeTime);
  } catch (e) {
    return dateString;
  }
};

export const getDaysBetween = (d1, d2) => {
  const oneDayMillis = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((d1 - d2) / oneDayMillis));
};

export const getLocaleString = (d1, includeTime = true) => {
  let lang = i18next.language;
  if (lang.includes('en')) {
    lang = 'en-FI'; // Don't show AM/PM time
  }
  let conf = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  };
  if (includeTime) {
    conf = {
      ...conf,
      hour: '2-digit',
      minute: '2-digit',
    };
  }
  return d1.toLocaleString(lang, conf);
};

export const getDateFnsLocale = () => {
  let locale = 'en';
  const lang = i18next.language;
  if (lang.includes('fi')) {
    locale = 'fi';
  } else if (lang.includes('sv')) {
    locale = 'sv';
  }
  return locale;
};

export const toDate = (dateString) => {
  try {
    return new Date(dateString);
  } catch (e) {
    return dateString;
  }
};

export const toUTC = (dateInt, addOffset = false) => {
  const date = !dateInt || dateInt.length < 1 ? new Date() : new Date(dateInt);
  if (typeof dateInt === 'string') {
    return date;
  }
  const offset = addOffset
    ? date.getTimezoneOffset()
    : -date.getTimezoneOffset();
  const offsetDate = new Date();
  offsetDate.setTime(date.getTime() + offset * 60000);
  return offsetDate;
};

export const toISODate = (d) =>
  `${d.toISOString().split('T')[0]}T00:00:00+00:00`;
