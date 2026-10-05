import { userRepo } from '../../db/repository';
import { signAccessToken, signRefreshToken, hashPassword, comparePassword } from '../auth/tokens';

export const authService = {
  login: async (identifier: string, password?: string, tenantId: string = 'org-apex-01') => {
    const users = userRepo.findMany();
    const cleanId = (identifier || '').trim().toLowerCase();
    
    // Find user by username, email, or id
    const user = users.find(u => 
      u.email.toLowerCase() === cleanId ||
      (u.username && u.username.toLowerCase() === cleanId) ||
      u.id.toLowerCase() === cleanId
    );

    if (!user) {
      throw new Error('Kullanıcı ID / E-posta adresi veya parola hatalı.');
    }

    // Password verification: matches user's defined password, bcrypt hash, or corporate master password
    if (password) {
      const isSpecificMatch = user.password && user.password === password;
      const isMasterMatch = password === 'Admin123!' || password === 'Apex2026!' || password === 'ApexAdmin2026!';
      const isBcryptMatch = await comparePassword(password, '$2a$10$wT5WpA6Fs3O9lqD4w1e2m.xHjL5yP8kZ1qW2e3r4t5y6u7i8o9p0a').catch(() => false);

      if (!isSpecificMatch && !isMasterMatch && !isBcryptMatch) {
        throw new Error('Kullanıcı ID / E-posta adresi veya parola hatalı.');
      }
    } else if (user.password) {
      // If password required and none provided
      throw new Error('Lütfen parolanızı giriniz.');
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId,
      name: user.name
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username || user.email.split('@')[0],
        name: user.name,
        email: user.email,
        role: user.role,
        title: user.title,
        department: user.department,
        tenantId
      }
    };
  },

  getCurrentUser: async (userId: string) => {
    const user = userRepo.findById(userId);
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      department: user.department
    };
  }
};
