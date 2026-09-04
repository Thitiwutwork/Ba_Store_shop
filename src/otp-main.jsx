import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import OtpMailboxPage from './components/OtpMailboxPage';
import Toast from './components/Toast';
import { ArrowLeft, KeyRound, Sparkles, ShoppingBag } from 'lucide-react';

function StandaloneOtpApp() {
  const [toast, setToast] = useState({ isVisible: false, message: '', icon: '✨' });

  // Read initial email from URL query if present (e.g. /otp?email=...)
  const getInitialEmailFromUrl = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('email') || '';
    } catch {
      return '';
    }
  };

  const [initialEmail] = useState(getInitialEmailFromUrl);

  const showToast = (message, icon = '✨') => {
    setToast({ isVisible: true, message, icon });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, isVisible: false }));
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col justify-between font-['Prompt'] text-gray-800 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Standalone Top Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Name */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-gray-900">
                  BA STORE
                </span>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-md">
                  Mailbox OTP
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-normal">ระบบดึงรหัสยืนยัน OTP อัตโนมัติ 24 ชม.</p>
            </div>
          </a>

          {/* Return to Main Storefront Button */}
          <a
            href="/"
            className="px-4 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 hover:text-gray-900 font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <ShoppingBag className="w-4 h-4 text-rose-500" />
            <span>กลับหน้าหลักร้านค้า</span>
          </a>

        </div>
      </header>

      {/* Main Mailbox Content */}
      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-10 w-full flex-1">
        <OtpMailboxPage
          initialEmail={initialEmail}
          onSwitchTab={(tab) => {
            if (tab === 'store') {
              window.location.href = '/';
            }
          }}
          onShowToast={showToast}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 BA STORE — ระบบอัตโนมัติ 24 ชม.</span>
          <span className="text-gray-400">ให้บริการกล่องข้อความและรับรหัส OTP อย่างปลอดภัย</span>
        </div>
      </footer>

      {/* Toast Notification */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        icon={toast.icon}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />

    </div>
  );
}

ReactDOM.createRoot(document.getElementById('otp-root')).render(
  <React.StrictMode>
    <StandaloneOtpApp />
  </React.StrictMode>
);
