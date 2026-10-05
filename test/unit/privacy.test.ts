import { describe, it, expect } from 'vitest';
import { maskTaxNumber, maskPhone, maskEmail } from '../../src/utils/privacy';

describe('KVKK & Privacy Data Masking', () => {
  it('masks Turkish VKN / TCKN tax numbers securely', () => {
    expect(maskTaxNumber('1234567890')).toBe('123****890');
    expect(maskTaxNumber('9988776655')).toBe('998****655');
  });

  it('masks phone numbers keeping prefix and trailing digits', () => {
    const masked = maskPhone('+90 532 111 2233');
    expect(masked).toContain('***');
    expect(masked.endsWith('33')).toBe(true);
  });

  it('masks email addresses preserving domain', () => {
    expect(maskEmail('batuhan@apex-teknoloji.com.tr')).toBe('b***n@apex-teknoloji.com.tr');
    expect(maskEmail('info@test.com')).toBe('i***o@test.com');
  });
});
