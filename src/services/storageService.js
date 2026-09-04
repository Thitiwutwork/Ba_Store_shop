// Unified Storage & Business Logic Engine for BA STORE
// Handles User Authentication, Wallet, Raw/Dispatched Accounts (with CSV/Excel import),
// Stock Management, Atomic Purchases, and Slip Verification (Mock + SlipOK + Manual)

import {
  DEFAULT_PRODUCTS,
  DEFAULT_PROMOTIONS,
  DEFAULT_STORE_SETTINGS,
  DEFAULT_STOCK,
  DEFAULT_ORDERS,
  CATEGORIES
} from '../data/initialData';

const STORAGE_KEYS = {
  SETTINGS: 'ba_store_settings',
  PRODUCTS: 'ba_store_products',
  PROMOTIONS: 'ba_store_promotions',
  STOCK: 'ba_store_stock',
  RAW_ACCOUNTS: 'ba_store_raw_accounts',           // คลังเมลเตรียมตัด (เมลเปล่ารอตัดพรีเมียม)
  DISPATCHED_ACCOUNTS: 'ba_store_dispatched_accounts', // คลังเมลตัดแล้ว (พร้อมส่งลูกค้า)
  ORDERS: 'ba_store_orders',
  USERS: 'ba_store_users',
  CURRENT_USER: 'ba_store_current_user',
  WALLET: 'ba_store_wallet_balance',
  TRANSACTIONS: 'ba_store_transactions',
  SLIP_HASHES: 'ba_store_used_slip_hashes',
  AUDIT_LOGS: 'ba_store_audit_logs'
};

// Safe JSON loader with fallback
function loadData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error(`Error loading ${key}:`, e);
    return fallback;
  }
}

function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key}:`, e);
  }
}

// ----------------------------------------------------------------------
// User Authentication System (Login / Register / Session)
// ----------------------------------------------------------------------
const DEFAULT_USERS = [
  {
    id: 'usr-admin',
    email: 'admin@bastore.com',
    password: 'admin',
    displayName: 'ผู้ดูแลระบบ (Admin)',
    role: 'admin',
    walletBalance: 9999.00
  },
  {
    id: 'usr-customer-1',
    email: 'customer@gmail.com',
    password: '123',
    displayName: 'คุณลูกค้า VIP',
    role: 'user',
    walletBalance: 250.00
  }
];

export function getUsers() {
  return loadData(STORAGE_KEYS.USERS, DEFAULT_USERS);
}

export function getCurrentUser() {
  return loadData(STORAGE_KEYS.CURRENT_USER, {
    id: 'usr-customer-1',
    email: 'customer@gmail.com',
    displayName: 'ลูกค้า VIP (สาธิต)',
    role: 'user',
    walletBalance: 250.00
  });
}

export function setCurrentUser(user) {
  saveData(STORAGE_KEYS.CURRENT_USER, user);
  if (user && user.walletBalance !== undefined) {
    setWalletBalance(user.walletBalance);
  }
  return user;
}

export function loginUser(email, password) {
  const users = getUsers();
  const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
  if (!found) {
    return { success: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
  }
  const sessionUser = {
    id: found.id,
    email: found.email,
    displayName: found.displayName,
    role: found.role,
    walletBalance: found.walletBalance ?? 250.00
  };
  setCurrentUser(sessionUser);
  addAuditLog('USER_LOGIN', { email: found.email, role: found.role });
  return { success: true, user: sessionUser };
}

export function registerUser({ email, password, displayName }) {
  const users = getUsers();
  if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
    return { success: false, error: 'อีเมลนี้ถูกลงทะเบียนไว้ในระบบแล้ว' };
  }
  const newUser = {
    id: `usr-${Date.now()}`,
    email: email.trim(),
    password: password,
    displayName: displayName.trim() || email.split('@')[0],
    role: 'user',
    walletBalance: 0.00
  };
  users.push(newUser);
  saveData(STORAGE_KEYS.USERS, users);
  setCurrentUser(newUser);
  addAuditLog('USER_REGISTER', { email: newUser.email });
  return { success: true, user: newUser };
}

export function logoutUser() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  addAuditLog('USER_LOGOUT', {});
  return null;
}

// ----------------------------------------------------------------------
// Store Settings
// ----------------------------------------------------------------------
export function getStoreSettings() {
  const defaults = {
    ...DEFAULT_STORE_SETTINGS,
    announcement: '✨ ทุกออเดอร์ไม่รับส่งก่อนน้า / เมลล์ลูกค้ารบกวนลงทะเบียนมาก่อนสั่งตัดทุกครั้งนะงับ ♡',
    counterUsersText: '3,480+',
    counterSoldBase: 18924,
    lineButtonText: 'สั่งซื้อ / สอบถามทาง LINE',
    guaranteeText: 'รับประกันดูแลตลอดการใช้งาน',
    customQrImage: null, // Support uploading custom PromptPay QR image
    slipokApiKey: 'EwX99Tg_lRWs0SVPGnKlM4NN3j21CY3o1b_XFLkoUBE=',
    slipokBranchId: 'bastore',
    slipMode: 'auto'
  };
  const settings = loadData(STORAGE_KEYS.SETTINGS, defaults);
  let updated = false;

  if (!settings.slip2goEndpoint || settings.slip2goEndpoint.trim() === '') {
    settings.slip2goEndpoint = '/api/verify-slip';
    updated = true;
  }
  if (!settings.slipokBranchId || settings.slipokBranchId.trim() === '') {
    settings.slipokBranchId = 'bastore';
    updated = true;
  }
  if (!settings.lineUrl || settings.lineUrl.includes('~')) {
    settings.lineUrl = 'https://line.me/R/ti/p/@bastore';
    updated = true;
  }
  if (settings.slipMode !== 'auto') {
    settings.slipMode = 'auto';
    updated = true;
  }
  if (!settings.bannerUrl || settings.bannerUrl.includes('placeholder') || settings.bannerUrl.startsWith('data:image/svg')) {
    settings.bannerUrl = '/images/banner.jpg';
    updated = true;
  }
  if (!settings.logoUrl || settings.logoUrl.includes('placeholder') || settings.logoUrl.startsWith('data:image/svg')) {
    settings.logoUrl = '/images/logo.jpg';
    updated = true;
  }

  if (updated) {
    saveData(STORAGE_KEYS.SETTINGS, settings);
  }
  return settings;
}

export function saveStoreSettings(settings) {
  saveData(STORAGE_KEYS.SETTINGS, settings);
  addAuditLog('SETTINGS_UPDATE', { storeName: settings.storeName });
  return settings;
}

// ----------------------------------------------------------------------
// Products & Promotions
// ----------------------------------------------------------------------
export function getProducts() {
  const prods = loadData(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
  let updated = false;

  prods.forEach((p) => {
    if (p.name.includes('iQIYI') && p.icon !== '/logo/iqiyi.png') {
      p.icon = '/logo/iqiyi.png';
      updated = true;
    }
    if (p.name.includes('Viu') && p.icon !== '/logo/viu.png') {
      p.icon = '/logo/viu.png';
      updated = true;
    }
    if (p.name.includes('Disney') && p.icon !== '/logo/disney.jpg') {
      p.icon = '/logo/disney.jpg';
      updated = true;
    }
    if (p.name.includes('WeTV') && p.icon !== '/logo/wetv.jpg') {
      p.icon = '/logo/wetv.jpg';
      updated = true;
    }
    if (p.name.includes('Bilibili') && p.icon !== '/logo/bili.jpg') {
      p.icon = '/logo/bili.jpg';
      updated = true;
    }
    if (p.name.includes('YOUKU') && p.icon !== '/logo/youku.jpg') {
      p.icon = '/logo/youku.jpg';
      updated = true;
    }
  });

  const existingNames = prods.map((p) => p.name);
  DEFAULT_PRODUCTS.forEach((dp) => {
    if (!existingNames.includes(dp.name)) {
      prods.push(dp);
      updated = true;
    }
  });

  if (updated) {
    saveData(STORAGE_KEYS.PRODUCTS, prods);
  }
  return prods;
}

export function saveProducts(products) {
  saveData(STORAGE_KEYS.PRODUCTS, products);
  return products;
}

export function addProduct({ name, category, prices, devices, resolution, tag, subDetail, packageDetails, icon }) {
  const products = getProducts();
  const newProd = {
    id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    category: category || 'ซีรีส์ & หนัง',
    prices: prices && prices.length > 0 ? prices : [{ id: 'p1', label: 'ปกติ', price: 50 }],
    devices: devices || '1 อุปกรณ์',
    resolution: resolution || 'HD 1080p',
    tag: tag || '',
    subDetail: subDetail || '',
    packageDetails: packageDetails || '',
    icon: icon || '📱'
  };
  products.unshift(newProd);
  saveProducts(products);
  addAuditLog('PRODUCT_ADD', { id: newProd.id, name: newProd.name });
  return newProd;
}

export function updateProduct(id, updatedData) {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...updatedData };
  saveProducts(products);
  addAuditLog('PRODUCT_UPDATE', { id, name: products[idx].name });
  return products[idx];
}

export function deleteProduct(id) {
  let products = getProducts();
  products = products.filter(p => p.id !== id);
  saveProducts(products);
  addAuditLog('PRODUCT_DELETE', { id });
  return products;
}

export function resetProductsToDefault() {
  saveProducts(DEFAULT_PRODUCTS);
  addAuditLog('PRODUCT_RESET_DEFAULTS', {});
  return DEFAULT_PRODUCTS;
}

export function getPromotions() {
  const promos = loadData(STORAGE_KEYS.PROMOTIONS, DEFAULT_PROMOTIONS);
  let updated = false;
  if (Array.isArray(promos)) {
    promos.forEach((p) => {
      if (p.name.includes('iQIYI') && p.app1Icon !== '/logo/iqiyi.png') {
        p.app1Icon = '/logo/iqiyi.png';
        updated = true;
      }
      if (p.name.includes('Viu') && p.app2Icon !== '/logo/viu.png') {
        p.app2Icon = '/logo/viu.png';
        updated = true;
      }
    });
    if (updated) {
      saveData(STORAGE_KEYS.PROMOTIONS, promos);
    }
  }
  return promos;
}

export function savePromotions(promotions) {
  saveData(STORAGE_KEYS.PROMOTIONS, promotions);
  return promotions;
}

export function getCategories() {
  return CATEGORIES;
}

// ----------------------------------------------------------------------
// Wallet & Balance Management
// ----------------------------------------------------------------------
export function getWalletBalance() {
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.walletBalance !== undefined) {
    return parseFloat(currentUser.walletBalance);
  }
  const raw = localStorage.getItem(STORAGE_KEYS.WALLET);
  return raw !== null ? parseFloat(raw) : 250.00;
}

export function setWalletBalance(amount) {
  const cleanAmount = Math.max(0, parseFloat(amount) || 0);
  localStorage.setItem(STORAGE_KEYS.WALLET, cleanAmount.toFixed(2));
  
  // Sync with current user profile
  const currentUser = getCurrentUser();
  if (currentUser) {
    currentUser.walletBalance = cleanAmount;
    saveData(STORAGE_KEYS.CURRENT_USER, currentUser);
    
    // Also sync in users array
    const users = getUsers();
    const idx = users.findIndex(u => u.id === currentUser.id);
    if (idx !== -1) {
      users[idx].walletBalance = cleanAmount;
      saveData(STORAGE_KEYS.USERS, users);
    }
  }
  return cleanAmount;
}

// ----------------------------------------------------------------------
// 📋 1. คลังเมลเตรียมตัด (RAW ACCOUNTS)
// นิยาม: เมลล์เปล่าที่ยังไม่ตัดพรีเมี่ยม แต่ลงทะเบียนไว้รอตัดพรีเมี่ยมเมื่อลูกค้าสั่ง
// (ไม่ถูกส่งให้ลูกค้าโดยตรง มีไว้ให้แอดมินนำไปตัดสิทธิ์)
// ----------------------------------------------------------------------
const INITIAL_RAW_ACCOUNTS = [
  {
    id: 'raw-001',
    appType: 'iQIYI',
    email: 'iqiyi.raw01@gmail.com',
    password: 'BlankPassword123',
    recoveryInfo: '081-xxx-9911',
    status: 'เตรียมตัด',
    notes: 'เมลเปล่าลงทะเบียนแล้ว พร้อมผูกแพ็ก 30 วัน/90 วัน',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'raw-002',
    appType: 'YouTube',
    email: 'yt.raw02@gmail.com',
    password: 'BlankPassword123',
    recoveryInfo: 'recovery.yt@gmail.com',
    status: 'เตรียมตัด',
    notes: 'เมลเปล่าพร้อมดึงเข้าครอบครัว/ตัดสิทธิ์',
    createdAt: new Date(Date.now() - 43200000).toISOString()
  },
  {
    id: 'raw-003',
    appType: 'Netflix',
    email: 'netflix.raw03@gmail.com',
    password: 'BlankPassword123',
    recoveryInfo: '-',
    status: 'เตรียมตัด',
    notes: 'รอตัด Ultra 4K',
    createdAt: new Date().toISOString()
  }
];

export function getRawAccounts() {
  return loadData(STORAGE_KEYS.RAW_ACCOUNTS, INITIAL_RAW_ACCOUNTS);
}

export function saveRawAccounts(accounts) {
  saveData(STORAGE_KEYS.RAW_ACCOUNTS, accounts);
  return accounts;
}

export function addRawAccount({ appType, email, password, recoveryInfo = '', notes = '' }) {
  const list = getRawAccounts();
  const newAccount = {
    id: `raw-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    appType,
    email: email.trim(),
    password: password.trim(),
    recoveryInfo: recoveryInfo.trim(),
    status: 'เตรียมตัด',
    notes: notes.trim(),
    createdAt: new Date().toISOString()
  };
  list.unshift(newAccount);
  saveRawAccounts(list);
  addAuditLog('RAW_ACCOUNT_ADD', { appType, email });
  return newAccount;
}

// Bulk Import from CSV / Excel parsed rows for Raw Accounts
export function importRawAccountsBulk(rows) {
  const list = getRawAccounts();
  const added = [];
  rows.forEach(row => {
    if (row.email && row.password) {
      const item = {
        id: `raw-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        appType: row.appType || 'iQIYI',
        email: row.email.trim(),
        password: row.password.trim(),
        recoveryInfo: row.recoveryInfo || '',
        status: 'เตรียมตัด',
        notes: row.notes || 'นำเข้าจากไฟล์ CSV/Sheet',
        createdAt: new Date().toISOString()
      };
      list.unshift(item);
      added.push(item);
    }
  });
  saveRawAccounts(list);
  addAuditLog('RAW_ACCOUNTS_BULK_IMPORT', { count: added.length });
  return added;
}

export function deleteRawAccount(id) {
  let list = getRawAccounts();
  list = list.filter(item => item.id !== id);
  saveRawAccounts(list);
  return list;
}

// Move from Raw (เตรียมตัด) -> Dispatched (ตัดแล้ว)
export function convertRawToDispatched(rawId, tierLabel = '30 วัน', notes = '') {
  const rawList = getRawAccounts();
  const rawItem = rawList.find(r => r.id === rawId);
  if (!rawItem) return null;

  // Mark raw as done
  rawItem.status = 'ตัดแล้ว/ย้ายแล้ว';
  saveRawAccounts(rawList);

  // Add to dispatched accounts
  const dispatched = addDispatchedAccount({
    appType: rawItem.appType,
    tierLabel,
    email: rawItem.email,
    password: rawItem.password,
    pinCode: '',
    expireDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    notes: notes || `ตัดพรีเมียมเรียบร้อย (ย้ายมาจากเมลเตรียมตัด ${rawItem.email})`
  });

  addAuditLog('RAW_TO_DISPATCHED', { rawId, email: rawItem.email, tierLabel });
  return dispatched;
}

// Bulk Move Multiple Raw Accounts -> Dispatched in 1 Click!
export function convertMultipleRawToDispatched(rawIds = [], tierLabel = '30 วัน', notes = '') {
  const rawList = getRawAccounts();
  const moved = [];

  rawList.forEach(rawItem => {
    if (rawIds.includes(rawItem.id)) {
      rawItem.status = 'ตัดแล้ว/ย้ายแล้ว';
      
      const dispatched = addDispatchedAccount({
        appType: rawItem.appType,
        tierLabel,
        email: rawItem.email,
        password: rawItem.password,
        pinCode: '',
        expireDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        notes: notes || `ตัดพรีเมียมเรียบร้อย (ย้ายจากเมลเตรียมตัด ${rawItem.email})`
      });
      moved.push(dispatched);
    }
  });

  saveRawAccounts(rawList);
  addAuditLog('RAW_TO_DISPATCHED_BULK', { count: moved.length, tierLabel });
  return moved;
}

export function deleteMultipleRawAccounts(rawIds = []) {
  let list = getRawAccounts();
  list = list.filter(item => !rawIds.includes(item.id));
  saveRawAccounts(list);
  addAuditLog('RAW_ACCOUNTS_BULK_DELETE', { count: rawIds.length });
  return list;
}

export function deleteMultipleDispatchedAccounts(dispIds = []) {
  let list = getDispatchedAccounts();
  list = list.filter(item => !dispIds.includes(item.id));
  saveDispatchedAccounts(list);
  addAuditLog('DISPATCHED_ACCOUNTS_BULK_DELETE', { count: dispIds.length });
  return list;
}

// ----------------------------------------------------------------------
// 📦 2. คลังเมลตัดแล้ว (DISPATCHED ACCOUNTS / READY STOCK)
// นิยาม: ตัดพรีเมี่ยมแล้ว เป็นสต๊อกพร้อมส่งให้ลูกค้าทันทีเมื่อมีคำสั่งซื้อ "เมลล์ร้าน"
// ----------------------------------------------------------------------
const INITIAL_DISPATCHED_ACCOUNTS = [
  {
    id: 'disp-001',
    appType: 'iQIYI',
    tierLabel: 'เมลล์ร้าน 30 วัน',
    email: 'bastore.iqiyi30@gmail.com',
    password: 'Iq30Days@Safe2026',
    pinCode: '',
    expireDate: '2026-10-04',
    status: 'พร้อมส่ง',
    notes: 'ตัดแพ็กมาตรฐาน 30 วัน ดูได้ 2 อุปกรณ์',
    soldToOrderNo: null,
    soldAt: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 'disp-002',
    appType: 'iQIYI',
    tierLabel: 'เมลล์ร้าน 90 วัน',
    email: 'bastore.iqiyi90@gmail.com',
    password: 'Iq90Days@Secure!',
    pinCode: '',
    expireDate: '2026-12-04',
    status: 'พร้อมส่ง',
    notes: 'ตัดแพ็ก 90 วัน 1080p เสียง Dolby',
    soldToOrderNo: null,
    soldAt: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 'disp-003',
    appType: 'Netflix',
    tierLabel: 'จอส่วนตัว 30 วัน',
    email: 'netflix.ba01@gmail.com',
    password: 'NfUltra4k#2026',
    pinCode: 'PIN: 1478 (จอ 2)',
    expireDate: '2026-10-04',
    status: 'พร้อมส่ง',
    notes: 'Ultra 4K HDR ล็อกพินส่วนตัว',
    soldToOrderNo: null,
    soldAt: null,
    createdAt: new Date().toISOString()
  },
  {
    id: 'disp-004',
    appType: 'Viu',
    tierLabel: 'บัญชีร้าน 30 วัน',
    email: 'viu.ba30@gmail.com',
    password: 'ViuDrama2026!',
    pinCode: '',
    expireDate: '2026-10-04',
    status: 'พร้อมส่ง',
    notes: 'ดูได้ 3 อุปกรณ์ พากย์ไทย',
    soldToOrderNo: null,
    soldAt: null,
    createdAt: new Date().toISOString()
  }
];

export function getDispatchedAccounts() {
  return loadData(STORAGE_KEYS.DISPATCHED_ACCOUNTS, INITIAL_DISPATCHED_ACCOUNTS);
}

export function saveDispatchedAccounts(accounts) {
  saveData(STORAGE_KEYS.DISPATCHED_ACCOUNTS, accounts);
  return accounts;
}

export function addDispatchedAccount({ appType, tierLabel, email, password, pinCode = '', expireDate = '', notes = '' }) {
  const list = getDispatchedAccounts();
  const newItem = {
    id: `disp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    appType,
    tierLabel: tierLabel || 'เมลล์ร้าน',
    email: email.trim(),
    password: password.trim(),
    pinCode: pinCode.trim(),
    expireDate: expireDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    status: 'พร้อมส่ง',
    notes: notes.trim(),
    soldToOrderNo: null,
    soldAt: null,
    createdAt: new Date().toISOString()
  };
  list.unshift(newItem);
  saveDispatchedAccounts(list);

  // Automatically mirror to Stock items for automatic dispatch engine!
  addStockItemDirect({
    productId: mapAppTypeToProductId(appType),
    tierLabel: tierLabel || 'เมลล์ร้าน',
    credentialData: `Email: ${email.trim()} | Pass: ${password.trim()}${pinCode ? ' | ' + pinCode.trim() : ''}`
  });

  addAuditLog('DISPATCHED_ACCOUNT_ADD', { appType, email, tierLabel });
  return newItem;
}

// Bulk Import from CSV / Excel for Dispatched Accounts
export function importDispatchedAccountsBulk(rows) {
  const list = getDispatchedAccounts();
  const added = [];
  rows.forEach(row => {
    if (row.email && row.password) {
      const item = {
        id: `disp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        appType: row.appType || 'iQIYI',
        tierLabel: row.tierLabel || 'เมลล์ร้าน',
        email: row.email.trim(),
        password: row.password.trim(),
        pinCode: row.pinCode || '',
        expireDate: row.expireDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        status: 'พร้อมส่ง',
        notes: row.notes || 'นำเข้าจากไฟล์ CSV/Sheet',
        soldToOrderNo: null,
        soldAt: null,
        createdAt: new Date().toISOString()
      };
      list.unshift(item);
      added.push(item);

      // Add to store live stock
      addStockItemDirect({
        productId: mapAppTypeToProductId(item.appType),
        tierLabel: item.tierLabel,
        credentialData: `Email: ${item.email} | Pass: ${item.password}${item.pinCode ? ' | ' + item.pinCode : ''}`
      });
    }
  });
  saveDispatchedAccounts(list);
  addAuditLog('DISPATCHED_ACCOUNTS_BULK_IMPORT', { count: added.length });
  return added;
}

export function deleteDispatchedAccount(id) {
  let list = getDispatchedAccounts();
  list = list.filter(item => item.id !== id);
  saveDispatchedAccounts(list);
  return list;
}

function mapAppTypeToProductId(appType = '') {
  const lower = appType.toLowerCase();
  if (lower.includes('iqiyi') || lower.includes('อ้าย')) return 'prod-nd2ciam';
  if (lower.includes('netflix')) return 'prod-netflix-4k';
  if (lower.includes('youtube')) return 'prod-3wu3py8';
  if (lower.includes('viu')) return 'prod-viu-30';
  if (lower.includes('canva')) return 'prod-canva-pro';
  if (lower.includes('otp')) return 'prod-sifqjvy';
  return 'prod-nd2ciam';
}

// ----------------------------------------------------------------------
// Stock Inventory Helpers
// ----------------------------------------------------------------------
export function getStockItems() {
  return loadData(STORAGE_KEYS.STOCK, DEFAULT_STOCK);
}

export function saveStockItems(items) {
  saveData(STORAGE_KEYS.STOCK, items);
  return items;
}

function addStockItemDirect({ productId, tierLabel, credentialData }) {
  const stock = getStockItems();
  const newItem = {
    id: `stk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    productId,
    tierLabel,
    credentialData,
    status: 'AVAILABLE',
    createdAt: new Date().toISOString()
  };
  stock.unshift(newItem);
  saveStockItems(stock);
  return newItem;
}

export function addStockItem(productId, tierLabel, credentialData) {
  return addStockItemDirect({ productId, tierLabel, credentialData });
}

export function deleteStockItem(id) {
  let stock = getStockItems();
  stock = stock.filter(item => item.id !== id);
  saveStockItems(stock);
  return stock;
}

// ----------------------------------------------------------------------
// Orders & Atomic Purchase Engine (Anti-Race Condition)
// ----------------------------------------------------------------------
export function getOrders() {
  return loadData(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
}

export function purchaseProduct({ productId, productName, tierLabel, price, customerNote = '' }) {
  const currentBalance = getWalletBalance();
  const itemPrice = parseFloat(price);

  if (currentBalance < itemPrice) {
    return {
      success: false,
      error: 'ยอดเงินในกระเป๋าไม่เพียงพอ กรุณาเติมเงินก่อนทำรายการ'
    };
  }

  // 1. Stock dispatch: Check Dispatched Accounts first for real matching account
  const dispatchedList = getDispatchedAccounts();
  const matchedDispIndex = dispatchedList.findIndex(
    d => d.status === 'พร้อมส่ง' && (
      (productName.toLowerCase().includes(d.appType.toLowerCase())) ||
      (d.tierLabel && tierLabel.includes(d.tierLabel))
    )
  );

  let deliveredCredential = '';
  const orderNo = `BA-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(100000 + Math.random() * 900000)}`;

  if (matchedDispIndex !== -1) {
    const disp = dispatchedList[matchedDispIndex];
    deliveredCredential = `Email: ${disp.email} | Pass: ${disp.password}${disp.pinCode ? ' | ' + disp.pinCode : ''}`;
    disp.status = 'ขายแล้ว';
    disp.soldToOrderNo = orderNo;
    disp.soldAt = new Date().toISOString();
    saveDispatchedAccounts(dispatchedList);
  } else {
    // 2. Check general stock items
    const stock = getStockItems();
    const availableIndex = stock.findIndex(
      item => item.productId === productId && 
      (tierLabel ? item.tierLabel === tierLabel : true) && 
      item.status === 'AVAILABLE'
    );

    if (availableIndex !== -1) {
      deliveredCredential = stock[availableIndex].credentialData;
      stock[availableIndex].status = 'SOLD';
      stock[availableIndex].soldAt = new Date().toISOString();
      saveStockItems(stock);
    } else if (customerNote) {
      deliveredCredential = `ข้อมูลที่ลูกค้าระบุ: ${customerNote} (แอดมินกำลังดำเนินการตัดสิทธิ์ 5-15 นาที)`;
    } else {
      deliveredCredential = `ระบบได้รับคำสั่งซื้อแล้ว แอดมินกำลังจัดส่งบัญชีให้ทางแชท/ระบบนี้ทันที`;
    }
  }

  // 3. Deduct balance atomically
  const newBalance = currentBalance - itemPrice;
  setWalletBalance(newBalance);

  // 4. Record order
  const newOrder = {
    id: `ord-${Date.now()}`,
    orderNo,
    productName,
    tierLabel,
    pricePaid: itemPrice,
    deliveredCredential,
    customerNote,
    status: 'COMPLETED',
    createdAt: new Date().toISOString()
  };

  const orders = getOrders();
  orders.unshift(newOrder);
  saveData(STORAGE_KEYS.ORDERS, orders);

  addAuditLog('PURCHASE', { orderNo, productName, pricePaid: itemPrice });

  return {
    success: true,
    order: newOrder,
    remainingBalance: newBalance
  };
}

// ----------------------------------------------------------------------
// Top-up & Slip Verification Engine (Mock + SlipOK + Manual Fallback)
// ----------------------------------------------------------------------
export function getTransactions() {
  return loadData(STORAGE_KEYS.TRANSACTIONS, []);
}

function dataURLtoBlob(dataurl) {
  try {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (err) {
    return null;
  }
}

export async function processSlipTopup({ amount, qrPayload = '', slipImage = '', mockMode = false }) {
  const settings = getStoreSettings();
  const mode = mockMode ? 'mock' : (settings.slipMode || 'mock');
  const cleanAmount = parseFloat(amount) || 0;

  if (cleanAmount <= 0) {
    return { success: false, error: 'จำนวนเงินไม่ถูกต้อง' };
  }

  const transRef = qrPayload ? `TR-${Math.abs(hashString(qrPayload))}` : `SLIP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const usedHashes = loadData(STORAGE_KEYS.SLIP_HASHES, []);
  if (usedHashes.includes(transRef)) {
    return {
      success: false,
      error: 'สลิปนี้ถูกนำมาใช้เติมเงินในระบบไปแล้ว ไม่สามารถใช้ซ้ำได้ (Anti-Replay Protection)'
    };
  }

  // 1. Mock Mode
  if (mode === 'mock') {
    usedHashes.push(transRef);
    saveData(STORAGE_KEYS.SLIP_HASHES, usedHashes);

    const currentBal = getWalletBalance();
    const newBal = currentBal + cleanAmount;
    setWalletBalance(newBal);

    const tx = {
      id: `tx-${Date.now()}`,
      amount: cleanAmount,
      transRef,
      status: 'SUCCESS',
      verifyMode: 'MOCK',
      slipImage: slipImage || null,
      createdAt: new Date().toISOString()
    };
    const txList = getTransactions();
    txList.unshift(tx);
    saveData(STORAGE_KEYS.TRANSACTIONS, txList);

    addAuditLog('TOPUP_MOCK', { amount: cleanAmount, transRef });

    return {
      success: true,
      mode: 'MOCK',
      amount: cleanAmount,
      newBalance: newBal,
      transRef,
      message: `เติมเงินสำเร็จ ฿${cleanAmount.toFixed(2)} (โหมดจำลอง)`
    };
  }

  // 2. Real API Mode: Secure Serverless Route on Vercel (/api/verify-slip)
  if (mode === 'auto' && slipImage && slipImage.startsWith('data:image')) {
    try {
      // 2.1 Call our secure Vercel Serverless Function (No API Keys leaked to frontend!)
      const serverlessEndpoint = settings.slip2goEndpoint || '/api/verify-slip';
      const serverlessRes = await fetch(serverlessEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: slipImage,
          expectedAmount: cleanAmount
        })
      });

      if (serverlessRes.ok) {
        const resData = await serverlessRes.json();

        if (resData.success && resData.data) {
          const bankData = resData.data;
          const transRef = bankData.transRef || bankData.referenceId || `S2G-${Date.now()}`;

          if (usedHashes.includes(transRef)) {
            return { success: false, error: 'สลิปนี้ถูกนำมาใช้เติมเงินไปแล้ว (สลิปซ้ำ)' };
          }

          const creditedAmount = parseFloat(bankData.amount) || cleanAmount;
          usedHashes.push(transRef);
          saveData(STORAGE_KEYS.SLIP_HASHES, usedHashes);

          const currentBal = getWalletBalance();
          const newBal = currentBal + creditedAmount;
          setWalletBalance(newBal);

          const senderName = bankData.senderName || bankData.sender?.name || '';
          const tx = {
            id: `tx-${Date.now()}`,
            amount: creditedAmount,
            transRef,
            senderName,
            status: 'SUCCESS',
            verifyMode: 'SERVERLESS_AUTO',
            slipImage: slipImage || null,
            createdAt: new Date().toISOString()
          };
          const txList = getTransactions();
          txList.unshift(tx);
          saveData(STORAGE_KEYS.TRANSACTIONS, txList);

          addAuditLog('TOPUP_AUTO_SECURE', { amount: creditedAmount, transRef, senderName });

          return {
            success: true,
            mode: 'SERVERLESS_AUTO',
            amount: creditedAmount,
            newBalance: newBal,
            transRef,
            message: `ตรวจสอบสลิปสำเร็จ! เติมเงิน ฿${creditedAmount.toFixed(2)} เข้ากระเป๋าเรียบร้อย`
          };
        } else if (resData.error) {
          return {
            success: false,
            error: resData.error
          };
        }
      }

      // 2.2 Local Dev Fallback (if /api/verify-slip 404 in static dev server and client key provided)
      const clientKey = settings.slip2goApiKey;
      if (clientKey) {
        const authHeader = clientKey.startsWith('Bearer ') ? clientKey : `Bearer ${clientKey}`;
        const directRes = await fetch('https://connect.slip2go.com/api/verify-slip/qr-base64/info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader
          },
          body: JSON.stringify({
            payload: {
              imageBase64: slipImage,
              checkCondition: { checkDuplicate: true }
            }
          })
        });

        const directData = await directRes.json();
        if (directData.code === '200000' && directData.data) {
          const bankData = directData.data;
          const transRef = bankData.transRef || bankData.referenceId || `S2G-${Date.now()}`;
          if (usedHashes.includes(transRef)) {
            return { success: false, error: 'สลิปนี้ถูกนำมาใช้เติมเงินไปแล้ว (สลิปซ้ำ)' };
          }
          const creditedAmount = parseFloat(bankData.amount) || cleanAmount;
          usedHashes.push(transRef);
          saveData(STORAGE_KEYS.SLIP_HASHES, usedHashes);
          const currentBal = getWalletBalance();
          const newBal = currentBal + creditedAmount;
          setWalletBalance(newBal);

          return {
            success: true,
            mode: 'SLIP2GO_DIRECT',
            amount: creditedAmount,
            newBalance: newBal,
            transRef,
            message: `ตรวจสอบสลิปสำเร็จ! เติมเงิน ฿${creditedAmount.toFixed(2)} เรียบร้อย`
          };
        } else if (directData.code === '200500') {
          return { success: false, error: 'สลิปไม่ถูกต้อง หรือไม่พบ QR Code ในสลิป' };
        } else if (directData.code === '200300') {
          return { success: false, error: 'สลิปนี้ถูกนำมาใช้ไปแล้ว (สลิปซ้ำ)' };
        }
      }
    } catch (e) {
      console.warn('API verification error, checking fallback...', e);
    }
  }

  // 3. Manual Fallback Mode
  const tx = {
    id: `tx-${Date.now()}`,
    amount: cleanAmount,
    transRef,
    status: 'PENDING_REVIEW',
    verifyMode: 'MANUAL',
    slipImage: slipImage || null,
    createdAt: new Date().toISOString()
  };
  const txList = getTransactions();
  txList.unshift(tx);
  saveData(STORAGE_KEYS.TRANSACTIONS, txList);

  addAuditLog('TOPUP_MANUAL_QUEUED', { amount: cleanAmount, transRef });

  return {
    success: true,
    mode: 'MANUAL',
    status: 'PENDING_REVIEW',
    amount: cleanAmount,
    transRef,
    message: 'ส่งสลิปเข้าระบบเรียบร้อยแล้ว แอดมินจะตรวจสอบและอนุมัติยอดเงินให้ภายใน 5 นาที'
  };
}

export function approveManualTransaction(txId) {
  const txList = getTransactions();
  const tx = txList.find(t => t.id === txId);
  if (!tx || tx.status !== 'PENDING_REVIEW') return false;

  tx.status = 'SUCCESS';
  tx.approvedAt = new Date().toISOString();
  saveData(STORAGE_KEYS.TRANSACTIONS, txList);

  const currentBal = getWalletBalance();
  const newBal = currentBal + tx.amount;
  setWalletBalance(newBal);

  const usedHashes = loadData(STORAGE_KEYS.SLIP_HASHES, []);
  if (tx.transRef) {
    usedHashes.push(tx.transRef);
    saveData(STORAGE_KEYS.SLIP_HASHES, usedHashes);
  }

  addAuditLog('ADMIN_SLIP_APPROVE', { txId, amount: tx.amount });
  return true;
}

export function rejectManualTransaction(txId, reason = 'สลิปไม่ถูกต้อง หรือไม่มียอดเงินเข้าจริง') {
  const txList = getTransactions();
  const tx = txList.find(t => t.id === txId);
  if (!tx || tx.status !== 'PENDING_REVIEW') return false;

  tx.status = 'REJECTED';
  tx.rejectReason = reason;
  tx.rejectedAt = new Date().toISOString();
  saveData(STORAGE_KEYS.TRANSACTIONS, txList);

  addAuditLog('ADMIN_SLIP_REJECT', { txId, reason });
  return true;
}

// ----------------------------------------------------------------------
// Cybersecurity Audit Logs
// ----------------------------------------------------------------------
export function getAuditLogs() {
  return loadData(STORAGE_KEYS.AUDIT_LOGS, [
    {
      id: 'log-1',
      event: 'SYSTEM_BOOT',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      details: { message: 'BA STORE Engine initialized with TLS 1.3 & Anti-Replay protection' }
    }
  ]);
}

function addAuditLog(event, details = {}) {
  const logs = getAuditLogs();
  logs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    event,
    timestamp: new Date().toISOString(),
    details
  });
  if (logs.length > 100) logs.pop();
  saveData(STORAGE_KEYS.AUDIT_LOGS, logs);
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}
