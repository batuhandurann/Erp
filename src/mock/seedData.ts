import {
  Customer,
  Product,
  Quote,
  Proforma,
  Contract,
  Sale,
  ProductSerial,
  Payment,
  AuditLog,
  CompanySettings,
  User,
  AppNotification
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    username: 'admin',
    name: 'Batuhan Duran',
    email: 'batuhan.duran@apexteknoloji.com.tr',
    role: 'Super Admin',
    title: 'Genel Müdür & Kurucu',
    department: 'Yönetim',
    password: 'Admin123!'
  },
  {
    id: 'usr-2',
    username: 'selin',
    name: 'Selin Karaca',
    email: 'selin.karaca@apexteknoloji.com.tr',
    role: 'Admin',
    title: 'Operasyon & Satış Direktörü',
    department: 'Satış & Pazarlama',
    password: 'Selin123!'
  },
  {
    id: 'usr-3',
    username: 'ahmet',
    name: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@apexteknoloji.com.tr',
    role: 'Satış Personeli',
    title: 'Kıdemli Kurumsal Müşteri Yöneticisi',
    department: 'Satış',
    password: 'Satis123!'
  },
  {
    id: 'usr-4',
    username: 'deniz',
    name: 'Deniz Aksoy',
    email: 'deniz.aksoy@apexteknoloji.com.tr',
    role: 'Finans',
    title: 'Finans & Muhasebe Müdürü',
    department: 'Finans',
    password: 'Finans123!'
  },
  {
    id: 'usr-5',
    username: 'caner',
    name: 'Caner Erkin',
    email: 'caner.erkin@apexteknoloji.com.tr',
    role: 'Operasyon / Teknik',
    title: 'Teknik Destek & Envanter Lideri',
    department: 'Teknik Servis',
    password: 'Teknik123!'
  },
  {
    id: 'usr-6',
    username: 'zeynep',
    name: 'Zeynep Demir',
    email: 'zeynep.demir@apexteknoloji.com.tr',
    role: 'Sadece Görüntüleme',
    title: 'Yönetim Kurulu Danışmanı',
    department: 'Denetim',
    password: 'Denetim123!'
  }
];

export const INITIAL_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'Apex Teknoloji Bilişim ve Donanım Sistemleri A.Ş.',
  commercialTitle: 'Apex Teknoloji Bilişim ve Donanım Sistemleri Anonim Şirketi',
  taxNumber: '0810482912',
  taxOffice: 'Maslak Vergi Dairesi',
  address: 'Büyükdere Cad. No: 195 K: 14 Levent / Beşiktaş / İstanbul',
  phone: '+90 (212) 444 89 20',
  email: 'operasyon@apexteknoloji.com.tr',
  website: 'www.apexteknoloji.com.tr',
  bankName: 'T. Garanti Bankası A.Ş. - Levent Kurumsal Şubesi',
  branch: 'Levent Kurumsal (Şube Kodu: 1204)',
  accountHolder: 'Apex Teknoloji A.Ş.',
  iban: 'TR32 0006 2000 0001 2345 6789 01',
  swift: 'TGBATRIS',
  authorizedSignatory: 'Batuhan Duran',
  authorizedSignatoryTitle: 'Yönetim Kurulu Başkanı / Genel Müdür',
  sequences: {
    quoteCurrent: 125,
    proformaCurrent: 88,
    contractCurrent: 44,
    saleCurrent: 82,
    productCurrent: 455,
    year: 2026
  }
};

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cst-1',
    code: 'MSR-2026-0001',
    name: 'ABC Teknoloji Çözümleri A.Ş.',
    taxNumber: '1234567890',
    taxOffice: 'Büyük Mükellefler V.D.',
    address: 'Ayazağa Mah. Mimar Sinan Sok. Seba Office No: 21 Kat: 4 Maslak / İstanbul',
    city: 'İstanbul',
    phone: '+90 (212) 350 20 00',
    email: 'tedarik@abcteknoloji.com.tr',
    industry: 'Bilgi Teknolojileri & Telekomünikasyon',
    creditLimit: 5000000,
    notes: 'Tier-1 Kurumsal veri merkezi müşterisi. 30 gün vade onayı mevcut.',
    createdAt: '2026-01-15T10:00:00.000Z',
    contacts: [
      {
        name: 'Murat Koçak',
        title: 'Satın Alma Direktörü',
        email: 'murat.kocak@abcteknoloji.com.tr',
        phone: '+90 (532) 111 22 33',
        isPrimary: true
      },
      {
        name: 'Elif Şimşek',
        title: 'BT Altyapı Mimarı',
        email: 'elif.simsek@abcteknoloji.com.tr',
        phone: '+90 (533) 222 33 44',
        isPrimary: false
      }
    ]
  },
  {
    id: 'cst-2',
    code: 'MSR-2026-0002',
    name: 'Bosphorus Global Lojistik Hizmetleri A.Ş.',
    taxNumber: '9876543210',
    taxOffice: 'Mecidiyeköy V.D.',
    address: 'Atatürk Cad. Lojistik Plaza No: 88 Güneşli / Bağcılar / İstanbul',
    city: 'İstanbul',
    phone: '+90 (212) 654 32 10',
    email: 'satinalma@bosphoruslogistics.com',
    industry: 'Lojistik & Taşımacılık',
    creditLimit: 2500000,
    notes: 'Depo el terminalleri ve barkod otomasyon projeleri müşterisi.',
    createdAt: '2026-02-01T09:15:00.000Z',
    contacts: [
      {
        name: 'Serkan Öztürk',
        title: 'Operasyon & Filo Müdürü',
        email: 'serkan.ozturk@bosphoruslogistics.com',
        phone: '+90 (542) 333 44 55',
        isPrimary: true
      }
    ]
  },
  {
    id: 'cst-3',
    code: 'MSR-2026-0003',
    name: 'Anadolu Otomotiv Sanayi ve Ticaret A.Ş.',
    taxNumber: '4567890123',
    taxOffice: 'Kocaeli İhtisas V.D.',
    address: 'TOSB Otomotiv Yan Sanayi İhtisas OSB 3. Cad. No: 12 Çayırova / Kocaeli',
    city: 'Kocaeli',
    phone: '+90 (262) 678 90 00',
    email: 'info@anadoluoto.com.tr',
    industry: 'Otomotiv Yan Sanayi',
    creditLimit: 7500000,
    notes: 'Endüstriyel ağ altyapısı ve yedek güç sistemleri ana sağlayıcısıyız.',
    createdAt: '2026-02-10T14:30:00.000Z',
    contacts: [
      {
        name: 'Hakan Aslan',
        title: 'Fabrika BT Müdürü',
        email: 'hakan.aslan@anadoluoto.com.tr',
        phone: '+90 (535) 444 55 66',
        isPrimary: true
      }
    ]
  },
  {
    id: 'cst-4',
    code: 'MSR-2026-0004',
    name: 'Marmara Yenilenebilir Enerji Sistemleri Ltd. Şti.',
    taxNumber: '7890123456',
    taxOffice: 'Bursa Osmangazi V.D.',
    address: 'Nilüfer Organize Sanayi Bölgesi Pembe Cad. No: 4 Bursa',
    city: 'Bursa',
    phone: '+90 (224) 443 12 12',
    email: 'proje@marmaraenerji.com.tr',
    industry: 'Enerji & Altyapı',
    creditLimit: 1800000,
    notes: 'SCADA kontrol ve endüstriyel anahtarlama donanımları.',
    createdAt: '2026-03-01T11:20:00.000Z',
    contacts: [
      {
        name: 'Derya Çetin',
        title: 'Teknik Proje Yöneticisi',
        email: 'derya.cetin@marmaraenerji.com.tr',
        phone: '+90 (530) 555 66 77',
        isPrimary: true
      }
    ]
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prd-base-1',
    sku: 'SRV-DL-R760',
    name: 'Dell PowerEdge R760 2U Rack Sunucu',
    category: 'Sunucu & Veri Merkezi',
    brand: 'Dell Technologies',
    model: 'PowerEdge R760 Intel Xeon Gold 6430 / 128GB RAM / 4x1.92TB NVMe SSD',
    unitPrice: 165000,
    currency: 'TRY',
    taxRate: 20,
    stockQuantity: 14,
    warrantyMonths: 36,
    description: 'Yüksek performanslı çift soket 2U rack sunucu. Kurumsal iş yükleri, sanallaştırma ve veri tabanları için optimize edilmiş, ProSupport Plus garantili.'
  },
  {
    id: 'prd-base-2',
    sku: 'NET-CS-C9300',
    name: 'Cisco Catalyst 9300 48-Port PoE+ Ağ Anahtarı',
    category: 'Ağ & Altyapı',
    brand: 'Cisco',
    model: 'C9300-48P-A Modular Uplink 715W AC',
    unitPrice: 94000,
    currency: 'TRY',
    taxRate: 20,
    stockQuantity: 22,
    warrantyMonths: 60,
    description: 'Yeni nesil kurumsal omurga ve kenar anahtar. Cisco DNA Advantage lisansı ve ömür boyu sınırlı donanım garantisi.'
  },
  {
    id: 'prd-base-3',
    sku: 'SEC-FG-200F',
    name: 'Fortinet FortiGate 200F Kurumsal Güvenlik Duvarı',
    category: 'Siber Güvenlik',
    brand: 'Fortinet',
    model: 'FG-200F-BDL-950-36 (3 Yıllık Unified Threat Protection Paketi)',
    unitPrice: 148000,
    currency: 'TRY',
    taxRate: 20,
    stockQuantity: 9,
    warrantyMonths: 36,
    description: 'Donanım hızlandırmalı yeni nesil kurumsal firewall (NGFW). 27 Gbps firewall throughput, SSL denetimi ve SD-WAN yetenekleri.'
  },
  {
    id: 'prd-base-4',
    sku: 'PWR-APC-10K',
    name: 'APC Smart-UPS RT 10kVA On-Line Kesintisiz Güç Kaynağı',
    category: 'Güç & Enerji',
    brand: 'APC by Schneider Electric',
    model: 'SRT10KXLI 230V LCD Rack/Tower',
    unitPrice: 112000,
    currency: 'TRY',
    taxRate: 20,
    stockQuantity: 6,
    warrantyMonths: 24,
    description: 'Çift çevrim online koruma sağlayan rack veya dikey kullanılabilir yüksek yoğunluklu güç kaynağı. Web SNMP yönetim kartı dahil.'
  },
  {
    id: 'prd-base-5',
    sku: 'TER-ZB-TC58',
    name: 'Zebra TC58 Endüstriyel El Terminali & Barkod Okuyucu',
    category: 'Otomasyon & Saha Donanımı',
    brand: 'Zebra Technologies',
    model: 'TC58 5G/Wi-Fi 6E SE4720 1D/2D Barkod Okuyucu',
    unitPrice: 38500,
    currency: 'TRY',
    taxRate: 20,
    stockQuantity: 45,
    warrantyMonths: 24,
    description: 'Depo, saha operasyonları ve lojistik için IP68 dayanımlı 6 inç dokunmatik ekranlı endüstriyel mobil bilgisayar.'
  },
  {
    id: 'prd-base-6',
    sku: 'STR-SYN-DS3622',
    name: 'Synology DiskStation DS3622xs+ 12 Yuvalı NAS Depolama',
    category: 'Veri Depolama',
    brand: 'Synology',
    model: 'DS3622xs+ Intel Xeon D-1531 6-Core 16GB ECC',
    unitPrice: 82000,
    currency: 'TRY',
    taxRate: 20,
    stockQuantity: 8,
    warrantyMonths: 60,
    description: 'Büyük ölçekli işletmeler için yüksek performanslı ve genişletilebilir merkezi depolama ve yedekleme çözümü.'
  }
];

export const INITIAL_QUOTES: Quote[] = [
  {
    id: 'qte-1',
    quoteNumber: 'TKL-2026-000124',
    customerId: 'cst-1',
    customerName: 'ABC Teknoloji Çözümleri A.Ş.',
    customerTaxNumber: '1234567890',
    customerTaxOffice: 'Büyük Mükellefler V.D.',
    customerAddress: 'Ayazağa Mah. Mimar Sinan Sok. Seba Office No: 21 Maslak / İstanbul',
    customerPhone: '+90 (212) 350 20 00',
    customerEmail: 'tedarik@abcteknoloji.com.tr',
    contactPerson: 'Murat Koçak',
    salesPersonId: 'usr-3',
    salesPersonName: 'Ahmet Yılmaz',
    date: '2026-10-01',
    validUntil: '2026-10-25',
    currency: 'TRY',
    paymentTerms: '%50 Sipariş Onayında Peşin, %50 Mal Teslimatında 30 Gün Vadeli',
    deliveryTerms: 'Apex Lojistik Tarafından Müşteri Veri Merkezine Adreste Teslim (7 İş Günü)',
    items: [
      {
        id: 'qi-1-1',
        productId: 'prd-base-1',
        productSku: 'SRV-DL-R760',
        productName: 'Dell PowerEdge R760 2U Rack Sunucu',
        quantity: 5,
        unitPrice: 165000,
        currency: 'TRY',
        discountRate: 5,
        discountAmount: 41250,
        taxRate: 20,
        taxAmount: 156750,
        netAmount: 783750,
        total: 940500
      },
      {
        id: 'qi-1-2',
        productId: 'prd-base-2',
        productSku: 'NET-CS-C9300',
        productName: 'Cisco Catalyst 9300 48-Port PoE+ Ağ Anahtarı',
        quantity: 2,
        unitPrice: 94000,
        currency: 'TRY',
        discountRate: 4,
        discountAmount: 7520,
        taxRate: 20,
        taxAmount: 36096,
        netAmount: 180480,
        total: 216576
      }
    ],
    subtotal: 1013000,
    discountTotal: 48770,
    taxTotal: 192846,
    grandTotal: 1157076,
    status: 'ACCEPTED', // Ready to convert to Proforma!
    notes: 'Ürünlerin kurulumu ve veri merkezi raf montajı fiyata dahildir. 3 Yıl 7/24 ProSupport desteği Dell Türkiye garantisi altındadır.',
    revision: 1,
    createdAt: '2026-10-01T11:00:00.000Z',
    updatedAt: '2026-10-03T16:20:00.000Z'
  },
  {
    id: 'qte-2',
    quoteNumber: 'TKL-2026-000125',
    customerId: 'cst-2',
    customerName: 'Bosphorus Global Lojistik Hizmetleri A.Ş.',
    customerTaxNumber: '9876543210',
    customerTaxOffice: 'Mecidiyeköy V.D.',
    customerAddress: 'Atatürk Cad. Lojistik Plaza No: 88 Güneşli / İstanbul',
    customerPhone: '+90 (212) 654 32 10',
    customerEmail: 'satinalma@bosphoruslogistics.com',
    contactPerson: 'Serkan Öztürk',
    salesPersonId: 'usr-3',
    salesPersonName: 'Ahmet Yılmaz',
    date: '2026-10-02',
    validUntil: '2026-10-16',
    currency: 'TRY',
    paymentTerms: 'Sözleşme İmzası akabinde 45 Gün Vadeli Çek',
    deliveryTerms: 'Güneşli Depo Teslim, Barkod Konfigürasyonu Dahil',
    items: [
      {
        id: 'qi-2-1',
        productId: 'prd-base-5',
        productSku: 'TER-ZB-TC58',
        productName: 'Zebra TC58 Endüstriyel El Terminali & Barkod Okuyucu',
        quantity: 10,
        unitPrice: 38500,
        currency: 'TRY',
        discountRate: 8,
        discountAmount: 30800,
        taxRate: 20,
        taxAmount: 70840,
        netAmount: 354200,
        total: 425040
      }
    ],
    subtotal: 385000,
    discountTotal: 30800,
    taxTotal: 70840,
    grandTotal: 425040,
    status: 'SENT',
    notes: 'Depo personeline yarım günlük terminal kullanım eğitimi ücretsiz sağlanacaktır.',
    revision: 1,
    createdAt: '2026-10-02T14:15:00.000Z',
    updatedAt: '2026-10-02T15:00:00.000Z'
  },
  {
    id: 'qte-3',
    quoteNumber: 'TKL-2026-000123',
    customerId: 'cst-4',
    customerName: 'Marmara Yenilenebilir Enerji Sistemleri Ltd. Şti.',
    customerTaxNumber: '7890123456',
    customerTaxOffice: 'Bursa Osmangazi V.D.',
    customerAddress: 'Nilüfer OSB Pembe Cad. No: 4 Bursa',
    customerPhone: '+90 (224) 443 12 12',
    customerEmail: 'proje@marmaraenerji.com.tr',
    contactPerson: 'Derya Çetin',
    salesPersonId: 'usr-2',
    salesPersonName: 'Selin Karaca',
    date: '2026-09-28',
    validUntil: '2026-10-12',
    currency: 'TRY',
    paymentTerms: '%100 Peşin Havale',
    deliveryTerms: 'Kargo ile Adrese Teslim',
    items: [
      {
        id: 'qi-3-1',
        productId: 'prd-base-4',
        productSku: 'PWR-APC-10K',
        productName: 'APC Smart-UPS RT 10kVA On-Line Kesintisiz Güç Kaynağı',
        quantity: 2,
        unitPrice: 112000,
        currency: 'TRY',
        discountRate: 5,
        discountAmount: 11200,
        taxRate: 20,
        taxAmount: 42560,
        netAmount: 212800,
        total: 255360
      }
    ],
    subtotal: 224000,
    discountTotal: 11200,
    taxTotal: 42560,
    grandTotal: 255360,
    status: 'CONVERTED',
    convertedToProformaId: 'prof-1',
    notes: 'Proforma fatura kesilerek müşteri muhasebesine iletildi.',
    revision: 1,
    createdAt: '2026-09-28T09:00:00.000Z',
    updatedAt: '2026-09-29T10:30:00.000Z'
  }
];

export const INITIAL_PROFORMAS: Proforma[] = [
  {
    id: 'prof-1',
    proformaNumber: 'PRO-2026-000087',
    quoteId: 'qte-3',
    quoteNumber: 'TKL-2026-000123',
    customerId: 'cst-4',
    customerName: 'Marmara Yenilenebilir Enerji Sistemleri Ltd. Şti.',
    customerTaxNumber: '7890123456',
    customerTaxOffice: 'Bursa Osmangazi V.D.',
    customerAddress: 'Nilüfer OSB Pembe Cad. No: 4 Bursa',
    customerPhone: '+90 (224) 443 12 12',
    customerEmail: 'proje@marmaraenerji.com.tr',
    date: '2026-09-29',
    dueDate: '2026-10-15',
    currency: 'TRY',
    paymentTerms: '%100 Peşin Havale / EFT',
    deliveryTerms: 'Kargo ile Adrese Teslim',
    items: [
      {
        id: 'pfi-1',
        productId: 'prd-base-4',
        productSku: 'PWR-APC-10K',
        productName: 'APC Smart-UPS RT 10kVA On-Line Kesintisiz Güç Kaynağı',
        quantity: 2,
        unitPrice: 112000,
        currency: 'TRY',
        discountRate: 5,
        discountAmount: 11200,
        taxRate: 20,
        taxAmount: 42560,
        netAmount: 212800,
        total: 255360
      }
    ],
    subtotal: 224000,
    discountTotal: 11200,
    taxTotal: 42560,
    grandTotal: 255360,
    paidAmount: 125000,
    remainingAmount: 130360,
    paymentStatus: 'PARTIAL',
    bankDetails: {
      bankName: 'T. Garanti Bankası A.Ş. - Levent Kurumsal',
      accountHolder: 'Apex Teknoloji A.Ş.',
      iban: 'TR32 0006 2000 0001 2345 6789 01',
      swift: 'TGBATRIS'
    },
    notes: 'Avans ödemesi 125.000 TL tahsil edildi. Kalan bakiye teslimat öncesi kapatılacaktır.',
    createdAt: '2026-09-29T10:30:00.000Z'
  }
];

export const INITIAL_CONTRACTS: Contract[] = [
  {
    id: 'cnt-1',
    contractNumber: 'SOZ-2026-000043',
    quoteId: 'qte-prev',
    quoteNumber: 'TKL-2026-000118',
    proformaId: 'prof-prev',
    proformaNumber: 'PRO-2026-000084',
    customerId: 'cst-3',
    customerName: 'Anadolu Otomotiv Sanayi ve Ticaret A.Ş.',
    customerTaxNumber: '4567890123',
    customerTaxOffice: 'Kocaeli İhtisas V.D.',
    customerAddress: 'TOSB OSB 3. Cad. No: 12 Çayırova / Kocaeli',
    customerRepresentative: 'Hakan Aslan',
    customerTitle: 'Fabrika BT Direktörü',
    sellerName: 'Apex Teknoloji Bilişim ve Donanım Sistemleri A.Ş.',
    sellerTaxNumber: '0810482912',
    sellerTaxOffice: 'Maslak V.D.',
    sellerAddress: 'Büyükdere Cad. No: 195 K: 14 Levent / İstanbul',
    sellerRepresentative: 'Batuhan Duran',
    sellerTitle: 'Genel Müdür',
    contractDate: '2026-09-15',
    deliveryDate: '2026-09-25',
    warrantyTerms: '36 Ay Parça ve İşçilik Dahil Yerinde Üretici Garantisi',
    paymentTerms: '%50 Sözleşme İmzası, %50 Kabul Tutanağı Tanziminden 30 Gün Sonra',
    deliveryTerms: 'Kocaeli Çayırova Fabrikası Sahasında Anahtar Teslim Montaj',
    specialClauses: [
      'Madde 1: Satıcı, sözleşme konusu ürünleri eksiksiz, orijinal kutusunda ve sıfır km olarak teslim etmeyi taahhüt eder.',
      'Madde 2: Donanım arızalarında 4 saat içinde uzaktan müdahale ve azami 24 saat içinde yerinde servis parça değişimi sağlanacaktır.',
      'Madde 3: Alıcı, kabul tutanağını imzaladıktan sonra kalan bakiye için düzenlenecek faturayı 30 gün içinde satıcının banka hesabına havale edecektir.',
      'Madde 4: Uyuşmazlık halinde İstanbul Merkez (Çağlayan) Mahkemeleri ve İcra Daireleri yetkilidir.'
    ],
    items: [
      {
        id: 'ci-1',
        productId: 'prd-base-3',
        productSku: 'SEC-FG-200F',
        productName: 'Fortinet FortiGate 200F Kurumsal Güvenlik Duvarı',
        quantity: 2,
        unitPrice: 148000,
        currency: 'TRY',
        discountRate: 6,
        discountAmount: 17760,
        taxRate: 20,
        taxAmount: 55648,
        netAmount: 278240,
        total: 333888
      }
    ],
    grandTotal: 333888,
    currency: 'TRY',
    status: 'SIGNED',
    signedDate: '2026-09-16',
    notes: 'Islak imzalı ve e-imzalı sözleşme nüshaları karşılıklı teyit edilmiştir.',
    createdAt: '2026-09-15T13:00:00.000Z'
  }
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'sal-1',
    saleNumber: 'SAT-2026-000081',
    quoteId: 'qte-prev',
    quoteNumber: 'TKL-2026-000118',
    contractId: 'cnt-1',
    contractNumber: 'SOZ-2026-000043',
    customerId: 'cst-3',
    customerName: 'Anadolu Otomotiv Sanayi ve Ticaret A.Ş.',
    date: '2026-09-22',
    invoiceNumber: 'FAT-2026-00341',
    items: [
      {
        id: 'si-1',
        productId: 'prd-base-3',
        productSku: 'SEC-FG-200F',
        productName: 'Fortinet FortiGate 200F Kurumsal Güvenlik Duvarı',
        quantity: 2,
        unitPrice: 148000,
        currency: 'TRY',
        discountRate: 6,
        discountAmount: 17760,
        taxRate: 20,
        taxAmount: 55648,
        netAmount: 278240,
        total: 333888
      }
    ],
    grandTotal: 333888,
    currency: 'TRY',
    paymentStatus: 'PAID',
    deliveryStatus: 'DELIVERED',
    paidAmount: 333888,
    generatedSerialIds: ['prd-ser-452', 'prd-ser-453'],
    notes: 'Kocaeli fabrikasında devreye alındı. Seri numaraları sisteme işlendi.',
    createdAt: '2026-09-22T10:00:00.000Z'
  }
];

export const INITIAL_PRODUCT_SERIALS: ProductSerial[] = [
  {
    id: 'prd-ser-452',
    internalId: 'PRD-2026-000452',
    serialNumber: 'SN-FG200F-892193',
    productId: 'prd-base-3',
    productName: 'Fortinet FortiGate 200F Kurumsal Güvenlik Duvarı',
    category: 'Siber Güvenlik',
    brand: 'Fortinet',
    model: 'FG-200F High Availability Node 1',
    customerId: 'cst-3',
    customerName: 'Anadolu Otomotiv Sanayi ve Ticaret A.Ş.',
    saleId: 'sal-1',
    saleNumber: 'SAT-2026-000081',
    quoteId: 'qte-prev',
    quoteNumber: 'TKL-2026-000118',
    contractId: 'cnt-1',
    contractNumber: 'SOZ-2026-000043',
    status: 'ACTIVE',
    deliveryDate: '2026-09-24',
    warrantyStartDate: '2026-09-24',
    warrantyEndDate: '2029-09-24',
    notes: 'Fabrika Ana Sistem Odası Rack 3 / U14 lokasyonunda çalışıyor.',
    createdAt: '2026-09-22T10:15:00.000Z',
    movements: [
      {
        date: '2026-09-22 10:15',
        fromStatus: 'STOCK',
        toStatus: 'SOLD',
        action: 'Satış faturası oluşturuldu ve rezerve edildi',
        performedBy: 'Ahmet Yılmaz',
        note: 'SAT-2026-000081 nolu satış faturası'
      },
      {
        date: '2026-09-24 14:00',
        fromStatus: 'SOLD',
        toStatus: 'DELIVERED',
        action: 'Müşteri adresine sevk edildi ve teslim tutanağı imzalandı',
        performedBy: 'Caner Erkin',
        note: 'İrsaliye No: IRS-2026-00091'
      },
      {
        date: '2026-09-25 16:30',
        fromStatus: 'DELIVERED',
        toStatus: 'ACTIVE',
        action: 'Rack montajı tamamlandı, firmware v7.4 yüklendi ve aktif edildi',
        performedBy: 'Caner Erkin',
        note: 'Cluster HA yapılandırması kuruldu'
      }
    ],
    serviceRecords: []
  },
  {
    id: 'prd-ser-453',
    internalId: 'PRD-2026-000453',
    serialNumber: 'SN-FG200F-892194',
    productId: 'prd-base-3',
    productName: 'Fortinet FortiGate 200F Kurumsal Güvenlik Duvarı',
    category: 'Siber Güvenlik',
    brand: 'Fortinet',
    model: 'FG-200F High Availability Node 2 (Yedek)',
    customerId: 'cst-3',
    customerName: 'Anadolu Otomotiv Sanayi ve Ticaret A.Ş.',
    saleId: 'sal-1',
    saleNumber: 'SAT-2026-000081',
    quoteId: 'qte-prev',
    quoteNumber: 'TKL-2026-000118',
    contractId: 'cnt-1',
    contractNumber: 'SOZ-2026-000043',
    status: 'ACTIVE',
    deliveryDate: '2026-09-24',
    warrantyStartDate: '2026-09-24',
    warrantyEndDate: '2029-09-24',
    notes: 'Cluster HA ikincil cihazı.',
    createdAt: '2026-09-22T10:15:00.000Z',
    movements: [
      {
        date: '2026-09-22 10:15',
        fromStatus: 'STOCK',
        toStatus: 'SOLD',
        action: 'Satış faturası oluşturuldu',
        performedBy: 'Ahmet Yılmaz'
      },
      {
        date: '2026-09-24 14:00',
        fromStatus: 'SOLD',
        toStatus: 'DELIVERED',
        action: 'Teslim edildi',
        performedBy: 'Caner Erkin'
      },
      {
        date: '2026-09-25 16:30',
        fromStatus: 'DELIVERED',
        toStatus: 'ACTIVE',
        action: 'Devreye alındı',
        performedBy: 'Caner Erkin'
      }
    ],
    serviceRecords: []
  },
  {
    id: 'prd-ser-454',
    internalId: 'PRD-2026-000454',
    serialNumber: 'SN-DL-R760-481902',
    productId: 'prd-base-1',
    productName: 'Dell PowerEdge R760 2U Rack Sunucu',
    category: 'Sunucu & Veri Merkezi',
    brand: 'Dell Technologies',
    model: 'PowerEdge R760',
    customerId: 'cst-1',
    customerName: 'ABC Teknoloji Çözümleri A.Ş.',
    saleId: 'sal-prev-0',
    saleNumber: 'SAT-2026-000075',
    status: 'SERVICE',
    deliveryDate: '2025-11-10',
    warrantyStartDate: '2025-11-10',
    warrantyEndDate: '2028-11-10',
    notes: 'Power Supply 2 arızası nedeniyle serviste fan ve modül değişimi yapılıyor.',
    createdAt: '2025-11-08T09:00:00.000Z',
    movements: [
      {
        date: '2025-11-10 11:00',
        fromStatus: 'SOLD',
        toStatus: 'DELIVERED',
        action: 'Müşteri veri merkezine teslim edildi',
        performedBy: 'Caner Erkin'
      },
      {
        date: '2026-10-02 09:30',
        fromStatus: 'ACTIVE',
        toStatus: 'SERVICE',
        action: 'PSU modülü arıza bildirimi alındı, bakım moduna alındı',
        performedBy: 'Caner Erkin',
        note: 'Dell garanti kapsamında parça değişimi başlatıldı'
      }
    ],
    serviceRecords: [
      {
        id: 'srv-1',
        date: '2026-10-02',
        type: 'PARCA_DEGISIMI',
        issueDescription: 'PSU 2 ünitesinde amber hata ışığı ve fan dönüş hızı uyarısı',
        resolution: 'Dell yerinde destek ekibince orijinal 1400W PSU değişimi sağlandı, firmware senkronize edildi.',
        technician: 'Caner Erkin & Dell Saha Mühendisi',
        cost: 0,
        status: 'RESOLVED',
        resolvedDate: '2026-10-03'
      }
    ]
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    paymentNumber: 'OD-2026-000101',
    saleId: 'sal-1',
    saleNumber: 'SAT-2026-000081',
    customerId: 'cst-3',
    customerName: 'Anadolu Otomotiv Sanayi ve Ticaret A.Ş.',
    amount: 333888,
    currency: 'TRY',
    paymentDate: '2026-09-22',
    paymentMethod: 'HAVALE/EFT',
    referenceNo: 'GR-892180491',
    recordedBy: 'Deniz Aksoy',
    notes: 'Garanti Bankası kurumsal hesaba tam bedel havale intikal etti.'
  },
  {
    id: 'pay-2',
    paymentNumber: 'OD-2026-000102',
    proformaId: 'prof-1',
    proformaNumber: 'PRO-2026-000087',
    customerId: 'cst-4',
    customerName: 'Marmara Yenilenebilir Enerji Sistemleri Ltd. Şti.',
    amount: 125000,
    currency: 'TRY',
    paymentDate: '2026-09-30',
    paymentMethod: 'HAVALE/EFT',
    referenceNo: 'TR-481920401',
    recordedBy: 'Deniz Aksoy',
    notes: 'Proforma avans tahsilatı (%49)'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    timestamp: '2026-10-03 16:20',
    userId: 'usr-3',
    userName: 'Ahmet Yılmaz',
    userRole: 'Satış Personeli',
    entityType: 'QUOTE',
    entityId: 'qte-1',
    entityCode: 'TKL-2026-000124',
    action: 'Teklif Durumu Güncellendi',
    details: 'Teklif durumu SENT → ACCEPTED (Müşteri Satın Alma Müdürü Murat Koçak teklifi onayladı)'
  },
  {
    id: 'aud-2',
    timestamp: '2026-10-02 15:00',
    userId: 'usr-3',
    userName: 'Ahmet Yılmaz',
    userRole: 'Satış Personeli',
    entityType: 'QUOTE',
    entityId: 'qte-2',
    entityCode: 'TKL-2026-000125',
    action: 'Teklif Müşteriye İletildi',
    details: '10 Adet Zebra TC58 için 425.040 ₺ tutarlı teklif e-posta ile müşteriye sevk edildi'
  },
  {
    id: 'aud-3',
    timestamp: '2026-10-01 11:00',
    userId: 'usr-3',
    userName: 'Ahmet Yılmaz',
    userRole: 'Satış Personeli',
    entityType: 'QUOTE',
    entityId: 'qte-1',
    entityCode: 'TKL-2026-000124',
    action: 'Yeni Teklif Oluşturuldu',
    details: 'ABC Teknoloji için 1.157.076 ₺ tutarında 5 adet Dell Server ve 2 adet Cisco Switch teklifi hazırlandı'
  },
  {
    id: 'aud-4',
    timestamp: '2026-09-29 10:30',
    userId: 'usr-2',
    userName: 'Selin Karaca',
    userRole: 'Admin',
    entityType: 'PROFORMA',
    entityId: 'prof-1',
    entityCode: 'PRO-2026-000087',
    action: 'Tekliften Proforma Üretildi',
    details: 'TKL-2026-000123 nolu tekliften otomatik olarak PRO-2026-000087 oluşturuldu ve banka bilgileri eklendi'
  },
  {
    id: 'aud-5',
    timestamp: '2026-09-22 10:15',
    userId: 'usr-1',
    userName: 'Batuhan Duran',
    userRole: 'Super Admin',
    entityType: 'SERIAL',
    entityId: 'prd-ser-452',
    entityCode: 'PRD-2026-000452',
    action: 'Benzersiz Ürün Seri Numaraları Üretildi',
    details: 'SAT-2026-000081 nolu satış faturası onaylandı ve 2 adet FortiGate cihazı için PRD-2026-000452 ve PRD-2026-000453 ID leri envantere bağlandı'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Teklif Onaylandı',
    message: 'TKL-2026-000124 nolu teklif ABC Teknoloji tarafından onaylandı. Proforma fatura oluşturulması bekleniyor.',
    type: 'SUCCESS',
    date: '2026-10-03 16:20',
    linkType: 'quote',
    targetId: 'qte-1',
    read: false
  },
  {
    id: 'notif-2',
    title: 'Teklif Geçerlilik Uyarısı',
    message: 'TKL-2026-000123 nolu teklifin geçerlilik süresinin dolmasına 3 gün kaldı.',
    type: 'WARNING',
    date: '2026-10-04 09:00',
    linkType: 'quote',
    targetId: 'qte-3',
    read: false
  },
  {
    id: 'notif-3',
    title: 'Garanti & Servis Bildirimi',
    message: 'PRD-2026-000454 nolu Dell R760 sunucu için parça değişimi başarıyla tamamlandı.',
    type: 'INFO',
    date: '2026-10-03 11:45',
    linkType: 'serial',
    targetId: 'prd-ser-454',
    read: true
  }
];
