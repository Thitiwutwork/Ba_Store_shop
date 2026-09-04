import React from 'react';
import { ShoppingBag, CreditCard, Package, Shield, Plus, User, LogIn, LogOut, Users, KeyRound } from 'lucide-react';

export default function Navbar({
  currentTab,
  onSelectTab,
  walletBalance,
  orderCount,
  storeSettings,
  currentUser,
  onOpenAuth,
  onLogout
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <div 
          className="flex items-center gap-3 cursor-pointer group shrink-0"
          onClick={() => onSelectTab('store')}
        >
          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-xs ring-2 ring-pink-200 group-hover:scale-105 transition-transform bg-white flex items-center justify-center">
            {storeSettings?.logoUrl ? (
              <img src={storeSettings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl">🌸</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 bg-clip-text text-transparent font-['Prompt']">
                {storeSettings?.storeName || 'BA STORE'}
              </span>
              <span className="text-[10px] bg-pink-100 text-pink-700 font-bold px-2 py-0.5 rounded-md">
                {storeSettings?.badgeText || 'ราคาส่ง'}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-500 font-normal">ระบบจำหน่ายแอพอัตโนมัติ 24 ชม.</p>
          </div>
        </div>

        {/* Center Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-pink-50/60 p-1.5 rounded-2xl border border-pink-100 text-xs sm:text-sm">
          <button
            onClick={() => onSelectTab('store')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
              currentTab === 'store'
                ? 'bg-white text-rose-600 shadow-xs font-bold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>หน้าร้านค้า</span>
          </button>

          <button
            onClick={() => onSelectTab('topup')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
              currentTab === 'topup'
                ? 'bg-white text-rose-600 shadow-xs font-bold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>เติมเงิน (PromptPay)</span>
          </button>

          <button
            onClick={() => onSelectTab('orders')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
              currentTab === 'orders'
                ? 'bg-white text-rose-600 shadow-xs font-bold'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>ประวัติ &amp; คลังของฉัน</span>
            {orderCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {orderCount}
              </span>
            )}
          </button>

          <a
            href={storeSettings?.otpUrl || "/otp"}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl font-medium text-gray-600 hover:text-indigo-600 hover:bg-white/50 transition-all flex items-center gap-1.5 cursor-pointer"
            title="เปิดหน้าเว็บรับรหัส OTP เมลล์ (แท็บใหม่)"
          >
            <KeyRound className="w-4 h-4 text-indigo-500" />
            <span>รับรหัส OTP</span>
          </a>

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => onSelectTab('admin')}
              className={`px-3.5 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                currentTab === 'admin'
                  ? 'bg-white text-rose-600 shadow-xs font-bold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Shield className="w-4 h-4 text-rose-500" />
              <span>จัดการหลังบ้าน (Admin)</span>
            </button>
          )}
        </nav>

        {/* Right Controls: Wallet & User Profile / Login */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* User Wallet Pill */}
          <div
            onClick={() => onSelectTab('topup')}
            className="cursor-pointer bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-2xl px-3 py-1.5 flex items-center gap-2 hover:border-rose-300 hover:shadow-xs transition-all"
            title="คลิกเพื่อเติมเงินกระเป๋า"
          >
            <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              ฿
            </div>
            <div className="text-left">
              <div className="text-[9px] text-gray-500 leading-none">กระเป๋าเงิน</div>
              <div className="text-xs sm:text-sm font-black text-rose-600 leading-tight">
                ฿ {walletBalance.toFixed(2)}
              </div>
            </div>
            <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full hover:bg-rose-600 transition-colors ml-0.5 hidden sm:inline">
              + เติม
            </span>
          </div>

          {/* User Account / Login Button */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-pink-200">
              <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center text-xs font-bold shrink-0">
                {currentUser.displayName ? currentUser.displayName.slice(0, 2).toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block text-left leading-none">
                <span className="text-xs font-bold block text-gray-800 truncate max-w-[100px]">
                  {currentUser.displayName}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">
                  {currentUser.role === 'admin' ? '🛡️ แอดมิน' : '● ออนไลน์'}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 transition-colors"
                title="ออกจากระบบ"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                if (currentTab === 'login') {
                  onOpenAuth();
                } else {
                  onSelectTab('login');
                }
              }}
              className={`px-3.5 py-1.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentTab === 'login'
                  ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">เข้าสู่ระบบ / สมัคร</span>
              <span className="sm:hidden">เข้าสู่ระบบ</span>
            </button>
          )}

        </div>

      </div>

      {/* Mobile / Tablet Sticky Navigation Sub-bar */}
      <div className="lg:hidden flex border-t border-pink-100 bg-white/95 text-xs font-medium px-2 py-1.5 justify-around">
        <button
          onClick={() => onSelectTab('store')}
          className={`py-1.5 px-3 rounded-xl flex items-center gap-1 ${
            currentTab === 'store' ? 'text-rose-600 font-bold bg-pink-50' : 'text-gray-600'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>หน้าร้าน</span>
        </button>

        <button
          onClick={() => onSelectTab('topup')}
          className={`py-1.5 px-3 rounded-xl flex items-center gap-1 ${
            currentTab === 'topup' ? 'text-rose-600 font-bold bg-pink-50' : 'text-gray-600'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>เติมเงิน</span>
        </button>

        <button
          onClick={() => onSelectTab('orders')}
          className={`py-1.5 px-2.5 rounded-xl flex items-center gap-1 ${
            currentTab === 'orders' ? 'text-rose-600 font-bold bg-pink-50' : 'text-gray-600'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>คลังรหัส</span>
          {orderCount > 0 && (
            <span className="bg-rose-500 text-white text-[9px] px-1 rounded-full font-bold">
              {orderCount}
            </span>
          )}
        </button>

        <a
          href={storeSettings?.otpUrl || "/otp"}
          target="_blank"
          rel="noopener noreferrer"
          className="py-1.5 px-2.5 rounded-xl flex items-center gap-1 text-gray-600 hover:text-indigo-600 font-medium"
        >
          <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
          <span>รับ OTP</span>
        </a>

        {currentUser?.role === 'admin' && (
          <button
            onClick={() => onSelectTab('admin')}
            className={`py-1.5 px-3 rounded-xl flex items-center gap-1 ${
              currentTab === 'admin' ? 'text-rose-600 font-bold bg-pink-50' : 'text-gray-600'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-rose-500" />
            <span>แอดมิน</span>
          </button>
        )}
      </div>
    </header>
  );
}
