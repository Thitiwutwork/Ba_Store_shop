import React, { useState } from 'react';
import { Lock, Mail, User, ArrowRight, Sparkles, LogIn, ShoppingBag, ShieldCheck, LogOut } from 'lucide-react';
import { loginUser, registerUser } from '../services/storageService';

export default function LoginPage({
  storeSettings,
  currentUser,
  onLoginSuccess,
  onGoToStore,
  onLogout,
  onShowToast
}) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await loginUser(email, password);
        if (res.success) {
          if (onShowToast) onShowToast(`👋 ยินดีต้อนรับคุณ ${res.user.displayName}`, '🎉');
          onLoginSuccess(res.user);
        } else {
          setError(res.error || 'เข้าสู่ระบบไม่สำเร็จ');
        }
      } else {
        if (!email || !password) {
          setError('กรุณากรอกอีเมลและรหัสผ่าน');
          setLoading(false);
          return;
        }
        const res = await registerUser({ email, password, displayName });
        if (res.success) {
          if (onShowToast) onShowToast(`🎉 สมัครสมาชิกสำเร็จ ยินดีต้อนรับ!`, '✨');
          onLoginSuccess(res.user);
        } else {
          setError(res.error || 'สมัครสมาชิกไม่สำเร็จ');
        }
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อระบบ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-6 px-4">
      <div className="max-w-md w-full space-y-6">
        
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-xl relative overflow-hidden text-center space-y-6">
          
          {/* Subtle decorative glow */}
          <div className="absolute -top-14 -right-14 w-32 h-32 bg-pink-200/50 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-14 -left-14 w-32 h-32 bg-rose-200/50 rounded-full blur-2xl pointer-events-none" />

          {/* Store Logo & Branding Header */}
          <div className="space-y-2 relative">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xs ring-2 ring-pink-200 bg-white mx-auto flex items-center justify-center group-hover:scale-105 transition-transform">
              {storeSettings?.logoUrl ? (
                <img src={storeSettings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">🌸</span>
              )}
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-pink-600 text-[11px] font-bold border border-pink-100 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{storeSettings?.badgeText || 'รับตัดแอพราคาส่ง 24 ชม.'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 bg-clip-text text-transparent font-['Prompt']">
                {storeSettings?.storeName || 'BA STORE'}
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                ระบบจำหน่ายแอพพรีเมียมราคาส่ง ได้วันครบ 100%
              </p>
            </div>
          </div>

          {/* Already Logged In Card */}
          {currentUser ? (
            <div className="space-y-4 pt-2">
              <div className="bg-pink-50/70 border border-pink-100 rounded-2xl p-4 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-lg mx-auto shadow-xs">
                  {currentUser.displayName ? currentUser.displayName.slice(0, 2).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="text-xs text-gray-500">เข้าสู่ระบบอยู่ในชื่อ</div>
                  <div className="font-bold text-gray-900 text-base">{currentUser.displayName}</div>
                  <div className="text-[11px] text-gray-500">{currentUser.email}</div>
                </div>
                <div className="pt-1">
                  <span className="inline-block bg-white px-3 py-1 rounded-full border border-pink-200 text-xs font-bold text-rose-600 shadow-2xs">
                    ยอดเงินคงเหลือ: ฿{parseFloat(currentUser.walletBalance || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={onGoToStore}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 hover:opacity-95 active:scale-98 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>เข้าสู่หน้าร้านค้า (/store)</span>
                </button>

                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 active:scale-98 text-gray-600 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>ออกจากระบบ</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Mode Tabs */}
              <div className="grid grid-cols-2 gap-1.5 bg-pink-50/70 p-1 rounded-2xl text-xs font-bold border border-pink-100">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === 'login' ? 'bg-white text-rose-600 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>เข้าสู่ระบบ</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); }}
                  className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === 'register' ? 'bg-white text-rose-600 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>สมัครสมาชิก</span>
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl text-xs font-medium border border-red-200 text-left">
                  ⚠️ {error}
                </div>
              )}

              {/* Login / Register Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
                {mode === 'register' && (
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      ชื่อเรียก / ชื่อเล่น:
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="เช่น คุณมิ้นท์"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none bg-gray-50/50 hover:bg-white focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    อีเมล:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="customer@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none bg-gray-50/50 hover:bg-white focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    รหัสผ่าน:
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="กรอกรหัสผ่านของคุณ"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none bg-gray-50/50 hover:bg-white focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 hover:opacity-95 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-2"
                >
                  <span>
                    {loading
                      ? 'กำลังตรวจสอบข้อมูล...'
                      : mode === 'login'
                      ? 'เข้าสู่ระบบ (ไปหน้าร้านค้า)'
                      : 'สมัครสมาชิกและไปหน้าร้านค้า'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Guest / Direct View Store Link */}
              <div className="pt-2 border-t border-pink-100 text-center">
                <button
                  type="button"
                  onClick={onGoToStore}
                  className="text-xs text-gray-500 hover:text-rose-600 font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-pink-400" />
                  <span>เข้าชมหน้าร้านค้าโดยไม่ต้องเข้าสู่ระบบ (/store)</span>
                </button>
              </div>
            </>
          )}

        </div>

        {/* Security Trust Badge */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>ระบบความปลอดภัย 256-bit • เชื่อมต่อฐานข้อมูลคลาวด์แบบเรียลไทม์</span>
        </div>

      </div>
    </div>
  );
}
