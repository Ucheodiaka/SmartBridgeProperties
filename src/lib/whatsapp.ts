const digitsOnly = (value: string) => value.replace(/\D/g, '');

export const normalizeWhatsAppNumber = (phone?: string): string | null => {
  if (!phone) return null;

  let digits = digitsOnly(phone);
  if (!digits) return null;

  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = `234${digits.slice(1)}`;

  return digits.length >= 10 && digits.length <= 15 ? digits : null;
};

export const createWhatsAppHandoffUrl = (phone: string | undefined, message: string): string | null => {
  const number = normalizeWhatsAppNumber(phone);
  if (!number) return null;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
};
