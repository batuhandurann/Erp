/**
 * KVKK (Personal Data Protection Law) & Privacy Utility for BusinessFlow ERP
 * Masks sensitive tax, phone, and personal identifier data in non-privileged UI or audit logs.
 */

export function maskTaxNumber(taxNo: string | null | undefined): string {
  if (!taxNo) return '';
  const clean = taxNo.trim();
  if (clean.length < 5) return '***';
  return `${clean.slice(0, 3)}****${clean.slice(-3)}`;
}

export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  const clean = phone.trim();
  if (clean.length < 7) return '***';
  // e.g. +90 532 111 2233 -> +90 532 *** **33
  return `${clean.slice(0, clean.length - 6)}*** **${clean.slice(-2)}`;
}

export function maskEmail(email: string | null | undefined): string {
  if (!email || !email.includes('@')) return '***@***.***';
  const [user, domain] = email.split('@');
  if (user.length <= 2) {
    return `${user[0]}*@${domain}`;
  }
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
}
