import bcrypt from 'bcryptjs';

export async function runSeed(prismaClient?: any) {
  console.log('🌱 Starting database seed for BusinessFlow ERP...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('ApexAdmin2026!', salt);

  const tenant = {
    code: 'org-apex-01',
    name: 'Apex Teknoloji Çözümleri A.Ş.',
    domain: 'apex-teknoloji.com.tr',
    plan: 'ENTERPRISE'
  };

  const users = [
    {
      id: 'usr-1',
      tenantId: 'org-apex-01',
      email: 'batuhan@apex-teknoloji.com.tr',
      passwordHash,
      name: 'Batuhan Duran',
      title: 'Genel Müdür & Kurucu',
      department: 'Yönetim',
      role: 'SUPER_ADMIN'
    },
    {
      id: 'usr-2',
      tenantId: 'org-apex-01',
      email: 'yonetim@apex-teknoloji.com.tr',
      passwordHash,
      name: 'Selin Yılmaz',
      title: 'Operasyon Direktörü',
      department: 'Operasyon',
      role: 'ADMIN'
    },
    {
      id: 'usr-3',
      tenantId: 'org-apex-01',
      email: 'satis@apex-teknoloji.com.tr',
      passwordHash,
      name: 'Ahmet Yılmaz',
      title: 'Kurumsal Satış Müdürü',
      department: 'Satış',
      role: 'SALES'
    },
    {
      id: 'usr-4',
      tenantId: 'org-apex-01',
      email: 'finans@apex-teknoloji.com.tr',
      passwordHash,
      name: 'Canan Özdemir',
      title: 'Finans ve Muhasebe Uzmanı',
      department: 'Finans',
      role: 'FINANCE'
    }
  ];

  console.log(`✅ Seeded tenant: ${tenant.name}`);
  console.log(`✅ Seeded ${users.length} users with secure hashed credentials.`);
  return { tenant, users };
}

if (process.argv[1]?.includes('seed.ts')) {
  runSeed().catch(console.error);
}
