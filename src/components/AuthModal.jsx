import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, ArrowRight, Sparkles } from 'lucide-react';
import { loginUser, registerUser } from '../services/storageService';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, onShowToast }) {
  if (!isOpen) return null;

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
          onAuthSuccess(res.user);
          if (onShowToast) onShowToast(`👋 ยินดีต้อนรับคุณ ${res.user.displayName}`, '🎉');
          onClose();
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
          onAuthSuccess(res.user);
          if (onShowToast) onShowToast(`🎉 สมัครสมาชิกสำเร็จ ยินดีต้อนรับ!`, '✨');
          onClose();
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 border border-pink-100 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center space-y-1">
          <div className="w-14 h-14 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center text-2xl mx-auto shadow-inner">
            🌸
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-gray-800">
            {mode === 'login' ? 'เข้าสู่ระบบลูกค้า' : 'สมัครสมาชิกใหม่'}
          </h3>
          <p className="text-xs text-gray-500">
            เข้าถึงกระเป๋าเงิน เติมเงิน และคลังรหัสแอพส่วนตัวของคุณ
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 bg-pink-50/70 p-1 rounded-2xl text-xs font-bold border border-pink-100">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'login' ? 'bg-white text-rose-600 shadow-xs' : 'text-gray-500'
            }`}
          >
            เข้าสู่ระบบ
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'register' ? 'bg-white text-rose-600 shadow-xs' : 'text-gray-500'
            }`}
          >
            สมัครสมาชิก
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium border border-red-200">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">ชื่อเรียก / ชื่อเล่น:</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="เช่น คุณมิ้นท์"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">อีเมล:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">รหัสผ่าน:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านของคุณ"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 text-white font-bold text-xs sm:text-sm shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5 pt-3"
          >
            <span>{mode === 'login' ? 'เข้าสู่ระบบทันที' : 'ยืนยันการสมัครสมาชิก'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>



      </div>
    </div>
  );
}
