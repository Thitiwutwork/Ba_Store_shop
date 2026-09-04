import React, { useState } from 'react';
import {
  Shield, Key, Package, CreditCard, Settings, FileText, Check, X,
  Plus, Trash2, Eye, RefreshCw, Lock, AlertCircle, Sparkles, QrCode, UploadCloud, Users, ShoppingBag
} from 'lucide-react';
import AccountManager from './AccountManager';
import AdminProductManager from './AdminProductManager';

export default function AdminDashboard({
  currentUser,
  storeSettings,
  onSaveSettings,
  products = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetProductDefaults,
  stockItems = [],
  onAddStock,
  onDeleteStock,
  transactions = [],
  onApproveTransaction,
  onRejectTransaction,
  auditLogs = [],
  onShowToast,
  onElevateToAdmin,
  onAdminLogout
}) {
  // Admin Authentication: If user is logged in as admin, NEVER ask for PIN!
  const [isAuthenticated, setIsAuthenticated] = useState(currentUser?.role === 'admin');

  React.useEffect(() => {
    if (currentUser?.role === 'admin') {
      setIsAuthenticated(true);
    }
  }, [currentUser]);

  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Active Admin Sub-tab
  const [activeTab, setActiveTab] = useState('accounts'); // 'accounts' | 'products' | 'stock' | 'slips' | 'settings' | 'security'

  // New Stock Form state
  const [newStockProductId, setNewStockProductId] = useState(products[0]?.id || '');
  const [newStockTier, setNewStockTier] = useState('เมลล์ร้าน');
  const [newStockData, setNewStockData] = useState('');

  // Settings Edit state
  const [editSettings, setEditSettings] = useState({ ...storeSettings });

  React.useEffect(() => {
    if (storeSettings) {
      setEditSettings((prev) => ({ ...prev, ...storeSettings }));
    }
  }, [storeSettings]);

  // Handle PIN Unlock
  const handleUnlock = (e) => {
    e.preventDefault();
    const correctPin = storeSettings?.adminPin || '1234';
    if (enteredPin === correctPin) {
      setIsAuthenticated(true);
      setPinError(false);
      if (onElevateToAdmin) onElevateToAdmin();
      if (onShowToast) onShowToast('🔓 เข้าสู่ระบบผู้ดูแลระบบสำเร็จ', '✅');
    } else {
      setPinError(true);
      if (onShowToast) onShowToast('❌ รหัส PIN ไม่ถูกต้อง (ค่าเริ่มต้น 1234)', '⚠️');
    }
  };

  // Add Stock Handler
  const handleAddStockSubmit = (e) => {
    e.preventDefault();
    if (!newStockData.trim()) return;
    onAddStock(newStockProductId, newStockTier, newStockData.trim());
    setNewStockData('');
    if (onShowToast) onShowToast('📦 เพิ่มสต๊อกเข้าสู่ระบบสำเร็จ', '✅');
  };

  // Handle QR Image Upload for Admin
  const handleQrUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditSettings({ ...editSettings, customQrImage: reader.result });
        if (onShowToast) onShowToast('📸 แนบภาพ QR Code ร้านค้าเรียบร้อย กดบันทึกเพื่อใช้งาน', '✅');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Logo Upload
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditSettings((prev) => ({ ...prev, logoUrl: reader.result }));
        if (onShowToast) onShowToast('📸 อัปโหลดภาพโลโก้ใหม่เรียบร้อย กดบันทึกเพื่อใช้งาน', '✅');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Banner Upload
  const handleBannerUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditSettings((prev) => ({ ...prev, bannerUrl: reader.result }));
        if (onShowToast) onShowToast('📸 อัปโหลดภาพแบนเนอร์ใหม่เรียบร้อย กดบันทึกเพื่อใช้งาน', '✅');
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Settings Handler
  const handleSaveSettingsSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(editSettings);
    if (onShowToast) onShowToast('💾 บันทึกการตั้งค่าร้านค้าเรียบร้อยแล้ว', '✅');
  };

  // If not authenticated, show sleek PIN screen
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-pink-100 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center text-2xl mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-gray-800">เข้าสู่ระบบหลังบ้าน (Admin CMS)</h3>
          <p className="text-xs text-gray-500 mt-1">กรุณากรอกรหัส PIN 4 หลักเพื่อเข้าจัดการสต๊อกและสลิป</p>
          <p className="text-[11px] text-pink-500 font-semibold mt-1">รหัสเริ่มต้นทดสอบ: 1234</p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
          <input
            type="password"
            maxLength={6}
            value={enteredPin}
            onChange={(e) => setEnteredPin(e.target.value)}
            placeholder="กรอกรหัส PIN"
            className="w-full text-center tracking-widest text-2xl font-bold py-3 px-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
            autoFocus
          />

          {pinError && (
            <p className="text-xs text-red-500 font-semibold">รหัส PIN ไม่ถูกต้อง ลองใหม่อีกครั้ง</p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-sm shadow-md transition-all"
          >
            ปลดล็อกระบบแอดมิน
          </button>
        </form>
      </div>
    );
  }

  // Pending slips count
  const pendingSlips = transactions.filter((t) => t.status === 'PENDING_REVIEW');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Admin Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-400 text-xs font-bold px-3 py-1 rounded-full border border-rose-500/30">
            <Shield className="w-3.5 h-3.5" />
            <span>ADMINISTRATOR CONTROL PANEL</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mt-2">ศูนย์ควบคุมและจัดการระบบหลังบ้าน BA STORE</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            จัดการสินค้าหน้าร้าน, คลังเมล (เตรียมตัด/ตัดแล้ว), สต๊อกออโต้, ตรวจสลิป (SlipOK), และตั้งค่า QR Code
          </p>
        </div>

        <button
          onClick={() => {
            setIsAuthenticated(false);
            if (onAdminLogout) onAdminLogout();
          }}
          className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold self-start sm:self-auto transition-colors"
        >
          ออกจากระบบแอดมิน
        </button>
      </div>

      {/* Admin Navigation Pills (Wrapped cleanly - NO OVERFLOW OR CUT OFF!) */}
      <div className="flex flex-wrap gap-2">
        
        {/* Tab 1: คลังเมลเตรียมตัด & ตัดแล้ว */}
        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'accounts'
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>👥 คลังแอคเคานต์ (เตรียมตัด &amp; ตัดแล้ว)</span>
        </button>

        {/* Tab 2: จัดการสินค้าหน้าร้าน (NEW Product CRUD!) */}
        <button
          onClick={() => setActiveTab('products')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'products'
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>🛍️ จัดการสินค้าหน้าร้าน ({products.length})</span>
        </button>

        {/* Tab 3: จัดการสต๊อกหน้าร้าน */}
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'stock'
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>📦 สต๊อกส่งมอบออโต้ ({stockItems.filter((s) => s.status === 'AVAILABLE').length})</span>
        </button>

        {/* Tab 4: คิวตรวจสลิป */}
        <button
          onClick={() => setActiveTab('slips')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'slips'
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>💳 คิวตรวจสลิป</span>
          {pendingSlips.length > 0 && (
            <span className="bg-amber-400 text-slate-900 text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
              {pendingSlips.length}
            </span>
          )}
        </button>

        {/* Tab 5: ตั้งค่าร้าน & QR Code */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'settings'
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>⚙️ ตั้งค่าร้าน &amp; QR Code &amp; SlipOK</span>
        </button>

        {/* Tab 6: ความปลอดภัย & Logs */}
        <button
          onClick={() => setActiveTab('security')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'security'
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>🛡️ ความปลอดภัย &amp; Logs</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. ACCOUNT MANAGER (คลังเมลเตรียมตัด vs คลังเมลตัดแล้ว + DYNAMIC ADDER) */}
      {/* ========================================================================= */}
      {activeTab === 'accounts' && (
        <AccountManager onShowToast={onShowToast} />
      )}

      {/* ========================================================================= */}
      {/* 2. PRODUCT MANAGER (เพิ่ม / แก้ไข / ลบสินค้าหน้าร้านได้อิสระ) */}
      {/* ========================================================================= */}
      {activeTab === 'products' && (
        <AdminProductManager
          products={products}
          onAddProduct={onAddProduct}
          onUpdateProduct={onUpdateProduct}
          onDeleteProduct={onDeleteProduct}
          onResetDefaults={onResetProductDefaults}
          onShowToast={onShowToast}
        />
      )}

      {/* ========================================================================= */}
      {/* 3. STOCK MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'stock' && (
        <div className="space-y-5">
          {/* Add Stock Form */}
          <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sm space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-gray-800 flex items-center gap-2">
              <Plus className="w-4 h-4 text-rose-500" />
              <span>เพิ่มสต๊อกรหัสบัญชี / โค้ดแอพส่งมอบออโต้</span>
            </h3>

            <form onSubmit={handleAddStockSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-gray-600 block mb-1">เลือกสินค้า:</label>
                  <select
                    value={newStockProductId}
                    onChange={(e) => setNewStockProductId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-rose-400"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-600 block mb-1">ระดับราคา / รูปแบบ:</label>
                  <input
                    type="text"
                    value={newStockTier}
                    onChange={(e) => setNewStockTier(e.target.value)}
                    placeholder="เช่น เมลล์ร้าน, จอส่วนตัว 30 วัน"
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  ข้อมูลบัญชีที่ต้องการส่งให้ลูกค้า (อีเมล, รหัสผ่าน, ลิงก์):
                </label>
                <textarea
                  rows={2}
                  value={newStockData}
                  onChange={(e) => setNewStockData(e.target.value)}
                  placeholder="ตัวอย่าง: Email: netflix.user01@gmail.com | Pass: SecurePass2026 | จอ 1 (PIN: 1234)"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-mono focus:ring-2 focus:ring-rose-400"
                  required
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>บันทึกสต๊อกนี้เข้าสู่ระบบ</span>
              </button>
            </form>
          </div>

          {/* Stock Table List */}
          <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sm space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-gray-800">
              รายการสต๊อกทั้งหมดในระบบ ({stockItems.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-pink-50/50 text-gray-600 border-b border-pink-100">
                  <tr>
                    <th className="p-2.5">สินค้า</th>
                    <th className="p-2.5">ตัวเลือก</th>
                    <th className="p-2.5">ข้อมูลที่จัดส่ง</th>
                    <th className="p-2.5">สถานะ</th>
                    <th className="p-2.5 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stockItems.map((item) => {
                    const prod = products.find((p) => p.id === item.productId);
                    const isAvailable = item.status === 'AVAILABLE';

                    return (
                      <tr key={item.id} className="hover:bg-gray-50/50">
                        <td className="p-2.5 font-bold text-gray-800">{prod?.name || item.productId}</td>
                        <td className="p-2.5 text-gray-600">{item.tierLabel || '-'}</td>
                        <td className="p-2.5 font-mono text-gray-600 max-w-xs truncate">
                          {item.credentialData}
                        </td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isAvailable
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {isAvailable ? 'พร้อมส่ง' : 'ขายแล้ว'}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => onDeleteStock(item.id)}
                            className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50"
                            title="ลบสต๊อก"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MANUAL SLIP APPROVAL QUEUE */}
      {/* ========================================================================= */}
      {activeTab === 'slips' && (
        <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-gray-800">
                คิวตรวจสอบและอนุมัติสลิปโอนเงิน ({pendingSlips.length} รายการรอดำเนินการ)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                รายการที่ลูกค้าแนบสลิปมา หรือเกิดกรณีระบบอัตโนมัติส่งต่อมาให้แอดมินยืนยัน
              </p>
            </div>

            {pendingSlips.length > 1 && (
              <button
                onClick={() => {
                  if (window.confirm(`ยืนยันอนุมัติสลิปทั้งหมดจำนวน ${pendingSlips.length} รายการพร้อมกัน?`)) {
                    pendingSlips.forEach(tx => onApproveTransaction(tx.id));
                  }
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 shrink-0"
              >
                <Check className="w-4 h-4" />
                <span>อนุมัติทั้งหมด ({pendingSlips.length} รายการ)</span>
              </button>
            )}
          </div>

          {pendingSlips.length === 0 ? (
            <div className="p-8 text-center text-gray-400 space-y-2">
              <Check className="w-8 h-8 mx-auto text-emerald-500" />
              <p className="text-xs font-semibold">ไม่มีรายการสลิปค้างตรวจในขณะนี้</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingSlips.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    {tx.slipImage ? (
                      <img
                        src={tx.slipImage}
                        alt="Slip"
                        className="w-12 h-12 object-cover rounded-xl border border-amber-300 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                        ไม่มีรูป
                      </div>
                    )}
                    <div>
                      <div className="text-xs sm:text-sm font-black text-rose-600">
                        แจ้งเติมเงิน: ฿ {tx.amount.toFixed(2)}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Ref: <span className="font-mono">{tx.transRef}</span> • เวลา:{' '}
                        {new Date(tx.createdAt).toLocaleTimeString('th-TH')}
                      </div>
                      <span className="text-[9px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                        รอแอดมินอนุมัติ
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onApproveTransaction(tx.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>อนุมัติยอดเงิน</span>
                    </button>
                    <button
                      onClick={() => onRejectTransaction(tx.id)}
                      className="px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold transition-all"
                    >
                      ปฏิเสธ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. STORE SETTINGS, QR CODE & SLIPOK CONFIGURATION */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettingsSubmit} className="bg-white rounded-3xl p-5 sm:p-6 border border-pink-100 shadow-sm space-y-4">
          <h3 className="text-sm sm:text-base font-bold text-gray-800">
            ตั้งค่าร้านค้า, การเปลี่ยน QR Code และการเชื่อมต่อ SlipOK
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">ชื่อร้านค้า:</label>
              <input
                type="text"
                value={editSettings.storeName}
                onChange={(e) => setEditSettings({ ...editSettings, storeName: e.target.value })}
                className="w-full p-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">สโลแกน / ป้ายหน้าร้าน:</label>
              <input
                type="text"
                value={editSettings.badgeText}
                onChange={(e) => setEditSettings({ ...editSettings, badgeText: e.target.value })}
                className="w-full p-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-gray-700 block mb-1">คำอธิบายร้านค้า:</label>
              <input
                type="text"
                value={editSettings.description}
                onChange={(e) => setEditSettings({ ...editSettings, description: e.target.value })}
                className="w-full p-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-gray-700 block mb-1">แถบประกาศด้านบนสุด (Top Announcement Bar):</label>
              <input
                type="text"
                value={editSettings.announcement}
                onChange={(e) => setEditSettings({ ...editSettings, announcement: e.target.value })}
                className="w-full p-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-400"
              />
            </div>

            {/* 📢 CUSTOMER EMAIL / LINE NOTICE BANNER CONFIGURATION */}
            <div className="sm:col-span-2 bg-gradient-to-r from-pink-50/90 via-rose-50/90 to-pink-50/90 p-4 rounded-2xl border border-pink-200 space-y-3 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="font-bold text-rose-700 flex items-center gap-1.5 text-xs sm:text-sm">
                  <Sparkles className="w-4 h-4 text-rose-600" />
                  <span>📢 ป้ายประกาศแจ้งเตือนหน้าเว็บ (ป้ายเมลลูกค้า / ทัก LINE)</span>
                </div>
                <label className="inline-flex items-center gap-2 cursor-pointer bg-white px-3 py-1 rounded-full border border-pink-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-gray-700">เปิดแสดงป้ายนี้:</span>
                  <input
                    type="checkbox"
                    checked={editSettings.showNoticeBanner !== false}
                    onChange={(e) => setEditSettings({ ...editSettings, showNoticeBanner: e.target.checked })}
                    className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                  />
                </label>
              </div>
              <p className="text-[11px] text-gray-600">
                คุณสามารถแก้ไขข้อความ หัวข้อ และปุ่มบนแถบการ์ดสีชมพูที่แสดงอยู่เหนือรายการสินค้าหน้าแรกได้จากตรงนี้เลยครับ
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-gray-700 block mb-1">หัวข้อป้ายประกาศ:</label>
                  <input
                    type="text"
                    value={editSettings.noticeBannerTitle ?? 'ต้องการสั่งตัดแพ็กเกจด้วย "เมลตัวเอง (เมลลูกค้า)" ใช่ไหม?'}
                    onChange={(e) => setEditSettings({ ...editSettings, noticeBannerTitle: e.target.value })}
                    placeholder='เช่น ต้องการสั่งตัดแพ็กเกจด้วย "เมลตัวเอง (เมลลูกค้า)" ใช่ไหม?'
                    className="w-full p-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-400 bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-gray-700 block mb-1">ข้อความรายละเอียดบนป้าย:</label>
                  <textarea
                    rows={2}
                    value={editSettings.noticeBannerText ?? 'บนเว็บไซต์จำหน่ายเฉพาะเมลร้านพร้อมใช้และ Code เติมเอง หากต้องการตัดต่อเมลตัวเอง รบกวนทักไลน์ทางร้านแทนนะครับ'}
                    onChange={(e) => setEditSettings({ ...editSettings, noticeBannerText: e.target.value })}
                    placeholder="รายละเอียดคำแนะนำให้ลูกค้า..."
                    className="w-full p-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-400 bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">ข้อความบนปุ่มกด (Button Text):</label>
                  <input
                    type="text"
                    value={editSettings.noticeBannerBtnText ?? 'ทัก LINE สั่งตัดเมลตัวเอง'}
                    onChange={(e) => setEditSettings({ ...editSettings, noticeBannerBtnText: e.target.value })}
                    placeholder="เช่น ทัก LINE สั่งตัดเมลตัวเอง"
                    className="w-full p-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-400 bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">ลิงก์ของปุ่ม (ว่างไว้จะใช้ LINE ร้านค้า):</label>
                  <input
                    type="text"
                    value={editSettings.noticeBannerBtnUrl ?? ''}
                    onChange={(e) => setEditSettings({ ...editSettings, noticeBannerBtnUrl: e.target.value })}
                    placeholder="https://line.me/R/ti/p/@bastore (หรือเว้นว่างไว้)"
                    className="w-full p-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-400 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 🖼️ LOGO & BANNER CUSTOMIZATION SECTION */}
            <div className="sm:col-span-2 bg-gradient-to-r from-rose-50/70 via-pink-50/70 to-purple-50/70 p-4 rounded-2xl border border-pink-200/80 space-y-3">
              <div className="font-bold text-rose-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-rose-600" />
                <span>🖼️ ปรับแต่งโลโก้ &amp; แบนเนอร์หน้าร้าน (Logo &amp; Cover Banner)</span>
              </div>
              <p className="text-[11px] text-gray-600">
                คุณสามารถอัปโหลดภาพโลโก้ร้านและภาพแบนเนอร์ใหม่จากเครื่องของคุณได้ทันที หรือระบุ URL รูปภาพ
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* 1. Logo Customization */}
                <div className="bg-white p-3.5 rounded-2xl border border-pink-100 space-y-2.5 shadow-2xs">
                  <span className="font-bold text-gray-700 block text-xs">โลโก้ร้านค้า (Store Logo):</span>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-white p-1 border-2 border-pink-200 ring-2 ring-pink-100 shadow-sm shrink-0 overflow-hidden flex items-center justify-center">
                      <img
                        src={editSettings.logoUrl || '/images/logo.jpg'}
                        alt="Logo Preview"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <label className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:opacity-95 text-white font-bold cursor-pointer transition-all inline-flex items-center gap-1.5 text-xs shadow-xs">
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>เลือกรูปโลโก้ใหม่</span>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </label>
                      <button
                        type="button"
                        onClick={() => setEditSettings((prev) => ({ ...prev, logoUrl: '/images/logo.jpg' }))}
                        className="text-[10px] text-gray-400 hover:text-rose-500 block underline"
                      >
                        (คืนค่าโลโก้เริ่มต้น)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-500 block mb-0.5">หรือใส่ URL รูปภาพโลโก้:</label>
                    <input
                      type="text"
                      value={editSettings.logoUrl || ''}
                      onChange={(e) => setEditSettings({ ...editSettings, logoUrl: e.target.value })}
                      placeholder="/images/logo.jpg หรือ https://..."
                      className="w-full p-1.5 rounded-lg border border-gray-200 text-[11px] font-mono"
                    />
                  </div>
                </div>

                {/* 2. Banner Customization */}
                <div className="bg-white p-3.5 rounded-2xl border border-pink-100 space-y-2.5 shadow-2xs">
                  <span className="font-bold text-gray-700 block text-xs">ภาพแบนเนอร์หน้าร้าน (Cover Banner):</span>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-14 rounded-xl border border-pink-200 shadow-xs shrink-0 overflow-hidden bg-gray-50 flex items-center justify-center">
                      <img
                        src={editSettings.bannerUrl || '/images/banner.jpg'}
                        alt="Banner Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <label className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer transition-all inline-flex items-center gap-1.5 text-xs shadow-xs">
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>เลือกรูปแบนเนอร์ใหม่</span>
                        <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                      </label>
                      <button
                        type="button"
                        onClick={() => setEditSettings((prev) => ({ ...prev, bannerUrl: '/images/banner.jpg' }))}
                        className="text-[10px] text-gray-400 hover:text-purple-600 block underline"
                      >
                        (คืนค่าแบนเนอร์เริ่มต้น)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-500 block mb-0.5">หรือใส่ URL รูปภาพแบนเนอร์:</label>
                    <input
                      type="text"
                      value={editSettings.bannerUrl || ''}
                      onChange={(e) => setEditSettings({ ...editSettings, bannerUrl: e.target.value })}
                      placeholder="/images/banner.jpg หรือ https://..."
                      className="w-full p-1.5 rounded-lg border border-gray-200 text-[11px] font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* QR CODE CUSTOMIZATION SECTION */}
            <div className="sm:col-span-2 bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-2xl border border-pink-200 space-y-2.5">
              <div className="font-bold text-rose-700 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-rose-600" />
                <span>การตั้งค่า QR Code รับเงิน (PromptPay &amp; Custom QR)</span>
              </div>
              <p className="text-[11px] text-gray-600">
                คุณสามารถเลือกได้ว่าจะใช้ <strong>"ระบบสร้าง QR อัตโนมัติ"</strong> จากเบอร์พร้อมเพย์ หรือ <strong>"อัปโหลดภาพ QR ของร้านคุณเอง"</strong>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">เบอร์พร้อมเพย์ (สำหรับสร้าง QR ออโต้):</label>
                  <input
                    type="text"
                    value={editSettings.promptpayNumber || ''}
                    onChange={(e) => setEditSettings({ ...editSettings, promptpayNumber: e.target.value })}
                    placeholder="เช่น 0812345678"
                    className="w-full p-2 rounded-xl border border-gray-200 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">ชื่อบัญชีรับเงิน:</label>
                  <input
                    type="text"
                    value={editSettings.storeAccountName || ''}
                    onChange={(e) => setEditSettings({ ...editSettings, storeAccountName: e.target.value })}
                    className="w-full p-2 rounded-xl border border-gray-200 bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-gray-700 block mb-1">
                    อัปโหลดภาพ QR Code ของร้านเอง (ถ้ามีภาพ QR จากแอพธนาคาร):
                  </label>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <label className="px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-600 font-bold hover:bg-rose-50 cursor-pointer transition-all inline-flex items-center gap-1.5">
                      <UploadCloud className="w-4 h-4" />
                      <span>เลือกภาพ QR จากเครื่อง</span>
                      <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
                    </label>
                    {editSettings.customQrImage && (
                      <div className="flex items-center gap-2">
                        <img src={editSettings.customQrImage} alt="Custom QR" className="w-8 h-8 object-contain rounded-lg border border-gray-200 bg-white" />
                        <span className="text-[11px] text-emerald-600 font-semibold">● ใช้ภาพ QR นี้</span>
                        <button
                          type="button"
                          onClick={() => setEditSettings({ ...editSettings, customQrImage: null })}
                          className="text-[10px] text-red-500 underline"
                        >
                          (ลบออกกลับไปใช้ QR ออโต้)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">LINE ID ติดต่อ:</label>
              <input
                type="text"
                value={editSettings.lineId}
                onChange={(e) => setEditSettings({ ...editSettings, lineId: e.target.value })}
                className="w-full p-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">ลิงก์ติดต่อ LINE (เช่น https://line.me/...):</label>
              <input
                type="text"
                value={editSettings.lineUrl}
                onChange={(e) => setEditSettings({ ...editSettings, lineUrl: e.target.value })}
                className="w-full p-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-400"
              />
            </div>

            {/* 📊 LIVE COUNTER STATS & STOREFRONT ACTION SECTION */}
            <div className="sm:col-span-2 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 p-4 rounded-2xl border border-blue-200/80 space-y-2.5">
              <div className="font-bold text-blue-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                <span>📊 ปรับแต่งแถบสถิติสด (Live Counters) &amp; ปุ่มติดต่อหน้าร้าน</span>
              </div>
              <p className="text-[11px] text-gray-600">
                คุณสามารถปรับแก้ตัวเลขสถิติ 4 ช่อง (ผู้ใช้, สินค้า, สต๊อก, ยอดขาย) และข้อความบนปุ่ม LINE ได้อย่างอิสระ
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">ตัวเลขผู้ใช้ทั้งหมด (เช่น 3,480+ หรือ 5,000+):</label>
                  <input
                    type="text"
                    value={editSettings.counterUsersText || '3,480+'}
                    onChange={(e) => setEditSettings({ ...editSettings, counterUsersText: e.target.value })}
                    className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">ตัวเลขยอดขายเริ่มต้น (ระบบจะบวกเพิ่มตามออเดอร์จริง):</label>
                  <input
                    type="number"
                    value={editSettings.counterSoldBase !== undefined ? editSettings.counterSoldBase : 18924}
                    onChange={(e) => setEditSettings({ ...editSettings, counterSoldBase: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">ข้อความบนปุ่มติดต่อ LINE:</label>
                  <input
                    type="text"
                    value={editSettings.lineButtonText || 'สั่งซื้อ / สอบถามทาง LINE'}
                    onChange={(e) => setEditSettings({ ...editSettings, lineButtonText: e.target.value })}
                    className="w-full p-2 rounded-xl border border-gray-200 bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">ข้อความการันตี (แถบวงรี):</label>
                  <input
                    type="text"
                    value={editSettings.guaranteeText || 'รับประกันดูแลตลอดการใช้งาน'}
                    onChange={(e) => setEditSettings({ ...editSettings, guaranteeText: e.target.value })}
                    className="w-full p-2 rounded-xl border border-gray-200 bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">เวลาทำการร้าน (แถบวงรี):</label>
                  <input
                    type="text"
                    value={editSettings.openingHours || 'เปิด 09.00 - 23.00 น.'}
                    onChange={(e) => setEditSettings({ ...editSettings, openingHours: e.target.value })}
                    className="w-full p-2 rounded-xl border border-gray-200 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Slip Verification Status */}
            <div className="sm:col-span-2 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg shrink-0">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <span>ระบบตรวจสอบสลิปอัตโนมัติ AI (Slip2Go Active)</span>
                  </h4>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    ระบบตรวจสอบสลิปและเครดิตยอดเงิน PromptPay อัตโนมัติ 24 ชม. ทำงานผ่านเซิร์ฟเวอร์ความปลอดภัยสูงเรียบร้อยแล้ว
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2.5 py-1 rounded-full shrink-0 self-start sm:self-auto">
                🟢 พร้อมใช้งาน 24 ชม.
              </span>
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-1">รหัส PIN แอดมินใหม่ (4 หลัก):</label>
              <input
                type="password"
                maxLength={6}
                value={editSettings.adminPin}
                onChange={(e) => setEditSettings({ ...editSettings, adminPin: e.target.value })}
                className="w-full p-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-xs transition-all"
          >
            บันทึกการตั้งค่าทั้งหมด
          </button>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 6. SECURITY & AUDIT LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'security' && (
        <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-rose-400" />
                <span>บันทึกความปลอดภัยของระบบ (Audit Logs)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                ติดตามเหตุการณ์ทางการเงิน การตัดสต๊อก และการป้องกันการโจมตี
              </p>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              Anti-Replay: ACTIVE
            </span>
          </div>

          <div className="space-y-2 font-mono text-[11px] max-h-80 overflow-y-auto">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 flex items-start justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-rose-400 font-bold">[{log.event}]</span>
                    <span className="text-slate-300">{JSON.stringify(log.details)}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString('th-TH')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
