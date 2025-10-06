export const parsePrice = (value: string | number): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const formatCurrency = (
  value: number | string,
  locale: string = 'es-PE',
  currency: string = 'PEN',
): string => {
  const amount = parsePrice(value);
  return amount.toLocaleString(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  });
};
