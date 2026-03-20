export const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const dateOnly = (value) => {
  const date = parseDate(value);
  return date ? date.toISOString().slice(0, 10) : null;
};

export const statusFromDates = (startDate, endDate, isActive) => {
  if (!isActive) return "expired";

  const now = new Date();
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (start && start.getTime() > now.getTime()) return "future";
  if (end && end.getTime() < now.getTime()) return "expired";
  return "active";
};
