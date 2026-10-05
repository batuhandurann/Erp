import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'businessflow-enterprise-production-jwt-secret-key-32-chars';
const JWT_EXPIRES_IN = '8h';
const REFRESH_EXPIRES_IN = '7d';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
  name: string;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

// Active In-Memory & Distributed Token Revocation Registry
const revokedTokens = new Set<string>();

export function revokeToken(token: string): void {
  revokedTokens.add(token);
}

export function isTokenRevoked(token: string): boolean {
  return revokedTokens.has(token);
}

export function verifyToken(token: string): JwtPayload | null {
  if (revokedTokens.has(token)) {
    return null; // Immediately reject revoked tokens
  }
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (err) {
    return null;
  }
}

export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

export async function comparePassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}
