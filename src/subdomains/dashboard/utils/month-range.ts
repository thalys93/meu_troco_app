export const getCurrentMonthKey = (baseDate = new Date()) => {
  const year = baseDate.getFullYear();
  const month = String(baseDate.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export const parseMonthKey = (monthKey: string) => {
  const [yearText, monthText] = monthKey.split("-");
  const year = Number(yearText);
  const month = Number(monthText) - 1;

  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    return new Date();
  }

  return new Date(year, month, 1);
};

export const shiftMonthKey = (monthKey: string, offset: number) => {
  const date = parseMonthKey(monthKey);
  date.setMonth(date.getMonth() + offset);
  return getCurrentMonthKey(date);
};

export const getMonthRangeByKey = (monthKey: string) => {
  const monthDate = parseMonthKey(monthKey);
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  const startDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
  const endDate = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;

  return { startDate, endDate };
};

export const isCurrentMonthKey = (monthKey: string) => monthKey === getCurrentMonthKey();

const formatDatePart = (value: number) => String(value).padStart(2, "0");

const formatDateToYmd = (date: Date) =>
  `${date.getFullYear()}-${formatDatePart(date.getMonth() + 1)}-${formatDatePart(
    date.getDate()
  )}`;

const isValidDateParts = (year: number, month: number, day: number) => {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }
  const parsed = new Date(year, month - 1, day);
  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
};

export const normalizeLocalDateString = (rawDate?: string): string | null => {
  if (!rawDate) return null;
  const trimmed = rawDate.trim();
  const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymdMatch) {
    const year = Number(ymdMatch[1]);
    const month = Number(ymdMatch[2]);
    const day = Number(ymdMatch[3]);
    if (!isValidDateParts(year, month, day)) return null;
    return `${year}-${formatDatePart(month)}-${formatDatePart(day)}`;
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return formatDateToYmd(parsed);
};

export const parseLocalDateInput = (rawDate?: string) => {
  if (!rawDate) return new Date();
  const normalized = normalizeLocalDateString(rawDate);
  if (!normalized) return new Date(Number.NaN);
  const [yearText, monthText, dayText] = normalized.split("-");
  const year = Number(yearText);
  const month = Number(monthText) - 1;
  const day = Number(dayText);
  return new Date(year, month, day);
};

export const startOfLocalDay = (value: Date) =>
  new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate(),
    0,
    0,
    0,
    0
  );

export const endOfLocalDay = (value: Date) =>
  new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate(),
    23,
    59,
    59,
    999
  );

export const parseLocalDateInputAtStartOfDay = (rawDate?: string) => {
  const parsed = parseLocalDateInput(rawDate);
  if (Number.isNaN(parsed.getTime())) return parsed;
  return startOfLocalDay(parsed);
};

export const parseLocalDateInputAtEndOfDay = (rawDate?: string) => {
  const parsed = parseLocalDateInput(rawDate);
  if (Number.isNaN(parsed.getTime())) return parsed;
  return endOfLocalDay(parsed);
};
