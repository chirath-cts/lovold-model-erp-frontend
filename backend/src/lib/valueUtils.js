export const numberValue = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const integerValue = (value, fallback = 0) => {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isInteger(parsed) ? parsed : fallback;
};

export const isNonNegativeNumber = (value) =>
  Number.isFinite(Number(value)) && Number(value) >= 0;

export const isNonNegativeInteger = (value) =>
  Number.isInteger(Number(value)) && Number(value) >= 0;
