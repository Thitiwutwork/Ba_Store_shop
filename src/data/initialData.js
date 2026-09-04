// Official Logo Icons (Loaded from /logo/ and high-res vector SVGs)
export const APP_ICONS = {
  iqiyi: "/logo/iqiyi.png",
  viu: "/logo/viu.png",
  disney: "/logo/disney.jpg",
  wetv: "/logo/wetv.jpg",
  bilibili: "/logo/bili.jpg",
  youku: "/logo/youku.jpg",
  
  netflix: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="%23141414"/><path d="M32 20h11.5v60H32zm24.5 0H68v60H56.5z" fill="%23E50914"/><path d="M32 20h12l24 60H56z" fill="%23B81D24"/></svg>`,
  youtube: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="%23FF0000"/><path d="M72 36c-.8-3-3.2-5.4-6.2-6.2C60.3 28 50 28 50 28s-10.3 0-15.8 1.8c-3 .8-5.4 3.2-6.2 6.2C26 41.5 26 50 26 50s0 8.5 1.8 14c.8 3 3.2 5.4 6.2 6.2 5.5 1.8 15.8 1.8 15.8 1.8s10.3 0 15.8-1.8c3-.8 5.4-3.2 6.2-6.2 1.8-5.5 1.8-14 1.8-14s0-8.5-1.8-14z" fill="white"/><polygon points="45,42 45,58 59,50" fill="%23FF0000"/></svg>`,
  spotify: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="%23191414"/><circle cx="50" cy="50" r="38" fill="%231DB954"/><path d="M31 39c14-4 30-2 42 5" stroke="%23191414" stroke-width="6.5" stroke-linecap="round" fill="none"/><path d="M33 49c12-3 26-2 36 4" stroke="%23191414" stroke-width="5.5" stroke-linecap="round" fill="none"/><path d="M36 59c10-2 21-1 30 4" stroke="%23191414" stroke-width="4.5" stroke-linecap="round" fill="none"/></svg>`,
  canva: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2300C4CC"/><stop offset="100%" stop-color="%237D2AE8"/></linearGradient></defs><rect width="100" height="100" rx="22" fill="url(%23cg)"/><text x="50" y="60" fill="white" font-size="30" font-family="Brush Script MT,cursive,Arial" font-weight="bold" text-anchor="middle">Canva</text></svg>`,
  chatgpt: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="%2310A37F"/><circle cx="50" cy="50" r="28" fill="none" stroke="white" stroke-width="5"/><text x="50" y="57" fill="white" font-size="20" font-family="Arial,sans-serif" font-weight="bold" text-anchor="middle">AI</text></svg>`,
  capcut: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="%23111111"/><path d="M26 36l24 14-24 14zm48 0L50 50l24 14z" fill="white"/></svg>`,
  otp: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="%23F3F4F6"/><rect x="28" y="15" width="44" height="70" rx="8" fill="none" stroke="%23374151" stroke-width="4"/><circle cx="50" cy="76" r="3" fill="%23374151"/><circle cx="50" cy="42" r="16" fill="none" stroke="%23E11D48" stroke-width="3"/><text x="50" y="46" fill="%23E11D48" font-size="10" font-family="Arial,sans-serif" font-weight="900" text-anchor="middle">OTP</text></svg>`
};

// Store information configuration
export const DEFAULT_STORE_SETTINGS = {
  storeName: "BA STORE",
  badgeText: "รับตัดแอพราคาส่ง",
  description: "ขายส่งแอพพรีเมี่ยมราคาถูกม๊ากก 💖",
  subDescription: "โยนหรือใช้เองก็ได้ไม่บวกเพิ่ม ได้วันใช้งานครบแน่นอน",
  openingHours: "เปิด 09:00 - 23:00 น.",
  announcement: "📢 หากต้องการสั่งตัดต่อแบบ \"เมลลูกค้า (เมลตัวเอง)\" รบกวนทัก LINE ทางร้านแทนนะงับ ♡",
  
  bannerUrl: "/images/banner.jpg",
  bannerFit: "auto",
  bannerPosition: "center",
  logoUrl: "/images/logo.jpg",
  
  lineId: "@bastore",
  lineUrl: "https://line.me/R/ti/p/@bastore",
  otpUrl: "",

  // Customer Email Cut Notice Banner on Storefront
  showNoticeBanner: true,
  noticeBannerTitle: 'ต้องการสั่งตัดแพ็กเกจด้วย "เมลตัวเอง (เมลลูกค้า)" ใช่ไหม?',
  noticeBannerText: 'บนเว็บไซต์จำหน่ายเฉพาะเมลร้านพร้อมใช้และ Code เติมเอง หากต้องการตัดต่อเมลตัวเอง รบกวนทักไลน์ทางร้านแทนนะครับ',
  noticeBannerBtnText: 'ทัก LINE สั่งตัดเมลตัวเอง',
  noticeBannerBtnUrl: '',
  badge1Title: "ได้วันใช้งานครบ 100%",
  badge1Sub: "ของแท้ ปลอดภัย",
  badge2Title: "ใช้เวลาตัดไม่นาน",
  badge2Sub: "เปิดบริการทุกวัน",
  badge3Title: "ดูแลตลอดการใช้งาน",
  
  // Payment & Slip Settings (Slip2Go / SlipOK)
  slipMode: "auto", // 'auto' (Slip2Go) | 'manual' | 'mock'
  slip2goApiKey: "",
  slip2goEndpoint: "/api/verify-slip",
  slipokApiKey: "",
  slipokBranchId: "bastore",
  promptpayNumber: "0982824986",
  storeBankName: "ธนาคารกสิกรไทย (KBANK)",
  storeAccountName: "บจก. บีเอ สโตร์ ดิจิทัล (BA Store)",
  storeBankAccount: "123-4-56789-0",

  adminPin: "1234",
  isMaintenance: false
};

// Categories
export const CATEGORIES = [
  "ทั้งหมด",
  "ซีรีส์ & หนัง",
  "บริการ OTP & เมลล์",
  "กราฟิก & ทำงาน"
];

// Products with multi-tier pricing extracted from workforsell
export const DEFAULT_PRODUCTS = [
  {
    id: "prod-pgvqxnw",
    name: "iQIYI มาตรฐาน ( 90 วัน )",
    category: "ซีรีส์ & หนัง",
    tag: "🔥 ยอดนิยม",
    tagColor: "pink",
    devices: "ดูพร้อมกันได้ 2 อุปกรณ์",
    resolution: "ความคมชัด 1080P (Full HD)",
    packageDetails: "- ไม่มีโฆษณาคั่น\n- รับชมหนังสุดฮอตก่อนใคร\n- ระบบเสียง Dolby",
    subDetail: "ใช้ได้หลายอุปกรณ์",
    icon: APP_ICONS.iqiyi,
    inStock: true,
    prices: [
      { id: "price-2", label: "เมลล์ร้าน (90 วัน)", price: "209", period: "90 วัน", note: "ทางร้านจัดส่งเมลพร้อมรหัสให้ทันที" }
    ]
  },
  {
    id: "prod-nd2ciam",
    name: "iQIYI มาตรฐาน ( 30 วัน )",
    category: "ซีรีส์ & หนัง",
    tag: "⭐ ขายดีอันดับ 1",
    tagColor: "pink",
    devices: "ดูพร้อมกันได้ 2 อุปกรณ์",
    resolution: "ความคมชัด 1080P (Full HD)",
    packageDetails: "- ไม่มีโฆษณาคั่น\n- รับชมหนังสุดฮอตก่อนใคร\n- ระบบเสียง Dolby",
    subDetail: "ใช้ได้หลายอุปกรณ์",
    icon: APP_ICONS.iqiyi,
    inStock: true,
    prices: [
      { id: "price-2", label: "เมลล์ร้าน (30 วัน)", price: "59", period: "30 วัน", note: "ทางร้านจัดส่งเมลพร้อมรหัสให้ทันที" }
    ]
  },
  {
    id: "prod-h8cv3jj",
    name: "iQIYI มาตรฐาน ( 7 วัน )",
    category: "ซีรีส์ & หนัง",
    tag: "ทดลองใช้",
    tagColor: "pink",
    devices: "ดูพร้อมกันได้ 2 อุปกรณ์",
    resolution: "ความคมชัด 1080P (Full HD)",
    packageDetails: "- ไม่มีโฆษณาคั่น\n- รับชมหนังสุดฮอตก่อนใคร\n- ระบบเสียง Dolby",
    subDetail: "ใช้ได้หลายอุปกรณ์",
    icon: APP_ICONS.iqiyi,
    inStock: true,
    prices: [
      { id: "price-2", label: "เมลล์ร้าน (7 วัน)", price: "15", period: "7 วัน", note: "ทางร้านจัดส่งเมลพร้อมรหัสให้ทันที" }
    ]
  },
  {
    id: "prod-3wu3py8",
    name: "Youtube สั้น",
    category: "ซีรีส์ & หนัง",
    tag: "🔥 ฮิตมาก",
    tagColor: "pink",
    devices: "ใช้อีเมลตัวเอง ดูได้ทุกอุปกรณ์",
    resolution: "ไม่มีโฆษณาคั่น ฟังเพลงจอดับได้",
    packageDetails: "บริการตัดพรีเมี่ยม และปลดยืนยันสิทธิ์สำหรับเมลที่สิทธิ์เต็ม",
    subDetail: "ทำรายการไว 5 นาที",
    icon: APP_ICONS.youtube,
    inStock: true,
    prices: [
      { id: "price-1", label: "ปลดยืนยันสิทธิ์ (ส่งโค้ด)", price: "7", period: "ครั้ง", note: "สำหรับคนสิทธิ์เต็ม ปลดสิทธิ์ครอบครัวเดิม" }
    ]
  },
  {
    id: "prod-sifqjvy",
    name: "OTP (รหัสยืนยันเบอร์โทร)",
    category: "บริการ OTP & เมลล์",
    tag: "⚡ ออโต้โค้ด",
    tagColor: "pink",
    devices: "ระบบรับโค้ดรวดเร็ว",
    resolution: "จัดส่ง OTP ภายใน 3-5 นาที",
    packageDetails: "บริการรับรหัสยืนยัน OTP สำหรับสมัครและเข้าสู่ระบบแอพต่างๆ",
    subDetail: "มีทั้งแบบเก็บเบอร์และไม่เก็บเบอร์",
    icon: APP_ICONS.otp,
    inStock: true,
    prices: [
      { id: "price-1", label: "Gmail (ไม่เก็บเบอร์)", price: "10", period: "ครั้ง", note: "รับ OTP สมัครหรือกู้เมล 1 ครั้ง" },
      { id: "price-2", label: "Gmail (เก็บเบอร์)", price: "35", period: "7 วัน", note: "เก็บรักษาเบอร์ให้ 7 วัน ปลอดภัย" },
      { id: "price-3", label: "Netflix", price: "10", period: "ครั้ง", note: "รับ OTP สำหรับ Netflix" },
      { id: "price-4", label: "Facebook", price: "10", period: "ครั้ง", note: "รับ OTP สำหรับยืนยันตัวตน Facebook" },
      { id: "price-5", label: "Tiktok", price: "20", period: "ครั้ง", note: "รับ OTP สำหรับ TikTok Shop / Creator" },
      { id: "price-6", label: "Shopee", price: "20", period: "ครั้ง", note: "รับ OTP สำหรับ Shopee" }
    ]
  },
  {
    id: "prod-netflix-4k",
    name: "Netflix Premium 4K",
    category: "ซีรีส์ & หนัง",
    tag: "ยอดนิยม",
    tagColor: "rose",
    devices: "1 จอส่วนตัว (ล็อกอินได้มือถือ/ทีวี)",
    resolution: "Ultra HD 4K + Spatial Audio",
    packageDetails: "• 1 จอส่วนตัว ไม่ชนกับคนอื่น\n• คุณภาพ Ultra HD 4K คมชัดสูงสุด\n• มีประวัติการดูส่วนตัว ล็อคพินโปรไฟล์ได้",
    subDetail: "บัญชีแท้ 100%",
    icon: APP_ICONS.netflix,
    inStock: true,
    prices: [
      { id: "price-1", label: "จอส่วนตัว 30 วัน", price: "119", period: "30 วัน", note: "จัดส่งเมลและรหัสพร้อมใช้งานทันที" }
    ]
  },
  {
    id: "prod-canva-pro",
    name: "Canva Pro ทีมแท้",
    category: "กราฟิก & ทำงาน",
    tag: "คุ้มค่า",
    tagColor: "purple",
    devices: "ใช้อีเมลตัวเอง ทุกอุปกรณ์",
    resolution: "ปลดล็อคเทมเพลตและฟังก์ชัน AI ครบ",
    packageDetails: "• ใช้อีเมลของลูกค้าเอง ไม่ต้องเปลี่ยนเมล\n• ปลดล็อคเทมเพลตพรีเมียม ฟอนต์ และคลังภาพไม่อั้น\n• ปรับขนาดภาพอัตโนมัติ ลบพื้นหลัง 1 คลิก",
    subDetail: "รับประกันเต็มเวลา",
    icon: APP_ICONS.canva,
    inStock: true,
    prices: [
      { id: "price-1", label: "ทีมแท้ 1 ปีเต็ม", price: "89", period: "1 ปี", note: "เชิญเข้าทีม Pro ทันทีผ่านลิงก์อีเมล" }
    ]
  },
  {
    id: "prod-viu-30",
    name: "Viu Premium ( 30 วัน )",
    category: "ซีรีส์ & หนัง",
    tag: "เกาหลีฟินๆ",
    tagColor: "amber",
    devices: "ดูได้ 3 อุปกรณ์ (มือถือ 2 / เว็บ 1)",
    resolution: "Full HD 1080p พากย์ไทย & ซับไทย",
    packageDetails: "• ดูซีรีส์เกาหลี ซีรีส์ไทย ไม่มีโฆษณาคั่น\n• อัปเดตตอนใหม่พร้อมเกาหลีแบบ Full HD\n• ดาวน์โหลดไว้ดูออฟไลน์ได้",
    subDetail: "ดูแลตลอด 30 วัน",
    icon: APP_ICONS.viu,
    inStock: true,
    prices: [
      { id: "price-1", label: "บัญชีร้าน 30 วัน", price: "35", period: "30 วัน", note: "จัดส่งเมลและรหัสพร้อมใช้งานทันที" }
    ]
  },
  {
    id: "prod-wetv-30",
    name: "WeTV VIP ( 30 วัน )",
    category: "ซีรีส์ & หนัง",
    tag: "ซีรีส์จีนสุดฮิต",
    tagColor: "orange",
    devices: "ดูพร้อมกันได้ 2 อุปกรณ์",
    resolution: "Full HD 1080p เสียงพากย์ไทย",
    packageDetails: "• ชมซีรีส์จีน อนิเมะจีน ตอนพิเศษ Fast Track ก่อนใคร\n• ระบบเสียง Dolby คมชัด\n• ไม่มีโฆษณาคั่นตลอดการรับชม",
    subDetail: "จัดส่งรวดเร็ว",
    icon: APP_ICONS.wetv,
    inStock: true,
    prices: [
      { id: "price-1", label: "เมลล์ร้าน 30 วัน", price: "45", period: "30 วัน", note: "จัดส่งเมลและรหัสพร้อมใช้งานทันที" }
    ]
  },
  {
    id: "prod-bilibili-30",
    name: "Bilibili Premium ( 30 วัน )",
    category: "ซีรีส์ & หนัง",
    tag: "อนิเมะถูกลิขสิทธิ์",
    tagColor: "pink",
    devices: "ดูได้ทุกอุปกรณ์ มือถือ/แท็บเล็ต/ทีวี",
    resolution: "Full HD 1080p / 4K ชัดจัดเต็ม",
    packageDetails: "• คลังอนิเมะถูกลิขสิทธิ์เยอะที่สุดในไทย\n• ปลดล็อคเสียงพากย์และซับไตเติลภาษาไทย\n• ไม่มีโฆษณาคั่นตลอดการรับชม",
    subDetail: "อนิเมะครบครัน",
    icon: APP_ICONS.bilibili,
    inStock: true,
    prices: [
      { id: "price-1", label: "เมลล์ร้าน 30 วัน", price: "39", period: "30 วัน", note: "จัดส่งเมลและรหัสพร้อมใช้งานทันที" }
    ]
  },
  {
    id: "prod-youku-30",
    name: "YOUKU VIP ( 30 วัน )",
    category: "ซีรีส์ & หนัง",
    tag: "ซีรีส์จีนยอดนิยม",
    tagColor: "blue",
    devices: "ดูพร้อมกันได้ 2 อุปกรณ์",
    resolution: "Full HD 1080p คมชัดระดับสูง",
    packageDetails: "• รับชมซีรีส์จีนและรายการวาไรตี้สุดฮิตจาก YOUKU\n• ปลดล็อคตอนใหม่ก่อนใคร ไม่มีโฆษณาคั่น",
    subDetail: "ซีรีส์จีนฟินๆ",
    icon: APP_ICONS.youku,
    inStock: true,
    prices: [
      { id: "price-1", label: "เมลล์ร้าน 30 วัน", price: "40", period: "30 วัน", note: "จัดส่งเมลและรหัสพร้อมใช้งานทันที" }
    ]
  },
  {
    id: "prod-disney-30",
    name: "Disney+ Hotstar ( 30 วัน )",
    category: "ซีรีส์ & หนัง",
    tag: "ภาพยนตร์ระดับโลก",
    tagColor: "blue",
    devices: "1 อุปกรณ์ส่วนตัว",
    resolution: "Ultra HD 4K + Dolby Vision",
    packageDetails: "• คลังภาพยนตร์ Marvel, Disney, Pixar, Star Wars ไม่อั้น\n• คมชัดระดับสูงสุด 4K HDR",
    subDetail: "พรีเมียมของแท้",
    icon: APP_ICONS.disney,
    inStock: true,
    prices: [
      { id: "price-1", label: "จอส่วนตัว 30 วัน", price: "79", period: "30 วัน", note: "จัดส่งบัญชีพร้อมใช้งานทันที" }
    ]
  }
];

// Duo Bundle Promotions
export const DEFAULT_PROMOTIONS = [
  {
    id: "promo-1",
    name: "แพ็กคู่สุดคุ้ม: iQIYI (7 วัน) + Viu Premium (7 วัน)",
    tag: "🔥 โปรคู่สุดฮิต",
    tagColor: "rose",
    app1Name: "iQIYI",
    app1Icon: APP_ICONS.iqiyi,
    app1Devices: "ดูพร้อมกันได้ 2 อุปกรณ์",
    app1Resolution: "Full HD 1080p คมชัดระดับสูง",
    app2Name: "Viu",
    app2Icon: APP_ICONS.viu,
    app2Devices: "ดูได้ 3 อุปกรณ์ ( ทรส 2 / เว็บ 1 )",
    app2Resolution: "Full HD 1080p ไม่มีโฆษณาคั่น",
    originalPrice: "30",
    promoPrice: "25",
    pricePeriod: "/ 7 วัน",
    devices: "iQIYI 2 อุปกรณ์ / Viu 3 อุปกรณ์",
    resolution: "Full HD 1080p คมชัดระดับสูง",
    packageDetails: "• ได้รับ 2 แอพพร้อมกัน: iQIYI 7 วัน + Viu 7 วัน\n• iQIYI: ดูพร้อมกันได้ 2 อุปกรณ์\n• Viu: ดูได้ 3 อุปกรณ์ (ทรส 2 / เว็บ 1)\n• ประหยัดทันที ฿5 จากราคาปกติ ฿30 เหลือเพียง ฿25\n• บัญชีแท้ 100% จัดส่งไว ดูแลตลอดการใช้งาน",
    inStock: true
  },
  {
    id: "promo-2",
    name: "แพ็กคู่บันเทิงคูณสอง: Netflix 4K + YouTube Premium (30 วัน)",
    tag: "⭐ เซฟคุ้มสุด",
    tagColor: "amber",
    app1Name: "Netflix",
    app1Icon: APP_ICONS.netflix,
    app1Devices: "1 จอ (ล็อกอินได้มือถือ / แท็บเล็ต / ทีวี)",
    app1Resolution: "Ultra HD 4K + ระบบเสียง Spatial Audio",
    app2Name: "YouTube",
    app2Icon: APP_ICONS.youtube,
    app2Devices: "ใช้อีเมลตัวเอง ดูได้ทุกอุปกรณ์",
    app2Resolution: "ไม่มีโฆษณาคั่น ฟังเพลงจอดับได้",
    originalPrice: "250",
    promoPrice: "219",
    pricePeriod: "/ 30 วัน",
    devices: "Netflix 1 จอ / YouTube ใช้อีเมลตัวเอง",
    resolution: "Ultra HD 4K + ไม่มีโฆษณา",
    packageDetails: "• แพ็กเกจสุดฮิตตลอดกาล Netflix 4K + YouTube Premium\n• Netflix: รับชมได้ 1 จอ ความคมชัด Ultra HD 4K\n• YouTube: ใช้อีเมลตัวเอง ฟังเพลงจอดับได้ ไม่มีโฆษณาคั่น\n• ประหยัดทันที ฿31 คุ้มกว่าซื้อแยกเดี่ยว\n• บัญชีแท้ ไม่เด้ง ดูแลตลอด 30 วันเต็ม",
    inStock: true
  }
];

// Initial stock inventory for automated dispatch
export const DEFAULT_STOCK = [
  {
    id: "stk-001",
    productId: "prod-pgvqxnw",
    tierLabel: "เมลล์ร้าน",
    credentialData: "Email: bastore.iqiyi90@gmail.com | Pass: Iq90Days@Secure!",
    status: "AVAILABLE",
    createdAt: new Date().toISOString()
  },
  {
    id: "stk-002",
    productId: "prod-nd2ciam",
    tierLabel: "เมลล์ร้าน",
    credentialData: "Email: bastore.iqiyi30@gmail.com | Pass: Iq30Days@Safe2026",
    status: "AVAILABLE",
    createdAt: new Date().toISOString()
  },
  {
    id: "stk-003",
    productId: "prod-h8cv3jj",
    tierLabel: "เมลล์ร้าน",
    credentialData: "Email: bastore.iqiyi7d@gmail.com | Pass: Iq7Trial#992",
    status: "AVAILABLE",
    createdAt: new Date().toISOString()
  },
  {
    id: "stk-004",
    productId: "prod-netflix-4k",
    tierLabel: "จอส่วนตัว 30 วัน",
    credentialData: "Email: netflix.ba01@gmail.com | Pass: NfUltra4k#2026 | Profile: จอ 2 (PIN: 1478)",
    status: "AVAILABLE",
    createdAt: new Date().toISOString()
  },
  {
    id: "stk-005",
    productId: "prod-viu-30",
    tierLabel: "บัญชีร้าน 30 วัน",
    credentialData: "Email: viu.ba30@gmail.com | Pass: ViuDrama2026!",
    status: "AVAILABLE",
    createdAt: new Date().toISOString()
  },
  {
    id: "stk-006",
    productId: "prod-canva-pro",
    tierLabel: "ทีมแท้ 1 ปีเต็ม",
    credentialData: "ลิ้งก์เข้าร่วมทีม Canva Pro แท้: https://www.canva.com/brand/join?token=ba_store_pro_invite_2026",
    status: "AVAILABLE",
    createdAt: new Date().toISOString()
  }
];

// Sample past orders
export const DEFAULT_ORDERS = [
  {
    id: "ord-sample-1",
    orderNo: "BA-20260904-789123",
    productName: "iQIYI มาตรฐาน ( 30 วัน )",
    tierLabel: "เมลล์ร้าน",
    pricePaid: 59.00,
    deliveredCredential: "Email: bastore_user99@gmail.com | Pass: IqiyiPass2026!",
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];
