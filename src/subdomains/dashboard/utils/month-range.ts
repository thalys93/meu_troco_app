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

export const parseLocalDateInput = (rawDate?: string) => {
  if (!rawDate) return new Date();
  const [yearText, monthText, dayText] = rawDate.split("-");
  const year = Number(yearText);
  const month = Number(monthText) - 1;
  const day = Number(dayText);
  return new Date(year, month, day);
};
