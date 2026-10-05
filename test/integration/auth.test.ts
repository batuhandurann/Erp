import { describe, it, expect } from 'vitest';
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  revokeToken,
  hashPassword,
  comparePassword
} from '../../src/server/auth/tokens';

describe('Authentication & Cryptographic Token Verification', () => {
  it('hashes plain text password using bcrypt and successfully compares matching string', async () => {
    const raw = 'ApexSecretPassword2026!';
    const hashed = await hashPassword(raw);

    expect(hashed).not.toBe(raw);
    expect(hashed.startsWith('$2')).toBe(true);

    const isMatch = await comparePassword(raw, hashed);
    expect(isMatch).toBe(true);

    const isWrongMatch = await comparePassword('WrongPassword123', hashed);
    expect(isWrongMatch).toBe(false);
  });

  it('signs and verifies signed JWT tokens with claims and expiration', () => {
    const payload = {
      userId: 'usr-1',
      email: 'batuhan@apex-teknoloji.com.tr',
      role: 'SUPER_ADMIN',
      tenantId: 'org-apex-01',
      name: 'Batuhan Duran'
    };

    const token = signAccessToken(payload);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3); // Header.Payload.Signature

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe('usr-1');
    expect(decoded?.tenantId).toBe('org-apex-01');
    expect(decoded?.role).toBe('SUPER_ADMIN');
  });

  it('rejects tampered or forged tokens', () => {
    const forgedToken = 'eyAiYWxnIjogIkhTMjU2IiB9.eyJ1c2VySWQiOiAidXNyLTEifQ.invalidSignature';
    const decoded = verifyToken(forgedToken);
    expect(decoded).toBeNull();
  });

  it('immediately invalidates revoked token after logout', () => {
    const payload = {
      userId: 'usr-1',
      email: 'batuhan@apex-teknoloji.com.tr',
      role: 'SUPER_ADMIN',
      tenantId: 'org-apex-01',
      name: 'Batuhan Duran'
    };
    const token = signAccessToken(payload);
    expect(verifyToken(token)).not.toBeNull();

    // Revoke
    revokeToken(token);

    // Verify rejection
    expect(verifyToken(token)).toBeNull();
  });
});
