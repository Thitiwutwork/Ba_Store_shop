import React from 'react';

export default function Toast({ message, icon = '✨', isVisible, onClose }) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 transform transition-all duration-300 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-5">
      <span className="text-lg">{icon}</span>
      <span className="font-medium text-slate-100">{message}</span>
    </div>
  );
}
