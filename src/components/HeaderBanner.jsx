import React from 'react';
import { Clock, ShieldCheck, Sparkles, MessageCircle, KeyRound } from 'lucide-react';

export default function HeaderBanner({ storeSettings }) {
  const {
    storeName = 'BA STORE',
    description = 'ขายส่งแอพพรีเมี่ยมราคาถูกม๊ากก 💖',
    openingHours = 'เปิด 09.00 - 23.00 น.',
    announcement = '📢 หากต้องการสั่งตัดต่อแบบ "เมลลูกค้า (เมลตัวเอง)" รบกวนทัก LINE ทางร้านแทนนะงับ ♡',
    bannerUrl = '/images/banner.jpg',
    logoUrl = '/images/logo.jpg',
    lineUrl = 'https://line.me/ti/p/~@bastore',
    lineId = '@bastore',
    lineButtonText = 'สั่งซื้อ / สอบถามทาง LINE',
    guaranteeText = 'รับประกันดูแลตลอดการใช้งาน'
  } = storeSettings || {};

  return (
    <header className="relative w-full max-w-6xl xl:max-w-7xl mx-auto px-2 sm:px-4 pt-1 sm:pt-2">

      {/* 1. Top Announcement Bar (Matching Screenshot Exactly) */}
      {announcement && (
        <a
          href="https://line.me/R/ti/p/@bastore"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            const cleanId = (lineId || '@bastore').replace(/^@/, '');
            const targetUrl = lineUrl && !lineUrl.includes('~') 
              ? lineUrl 
              : `https://line.me/R/ti/p/@${cleanId}`;
            window.open(targetUrl, '_blank', 'noopener,noreferrer');
            e.preventDefault();
          }}
          className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 text-white text-[11px] sm:text-xs md:text-sm py-2 px-4 text-center font-medium shadow-xs flex items-center justify-center gap-1.5 overflow-hidden rounded-t-2xl sm:rounded-t-3xl hover:opacity-95 transition-opacity cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0 animate-pulse text-yellow-200" />
          <span className="truncate tracking-wide">{announcement}</span>
        </a>
      )}

      {/* 2. Cover Banner Graphic Box (Never clips logo below) */}
      <div className="relative w-full overflow-hidden shadow-xs bg-[#FDF5F8] rounded-b-2xl sm:rounded-b-3xl border-x border-b border-pink-200/70">
        <img
          src={bannerUrl || '/images/banner.jpg'}
          alt="Store Banner"
          className="w-full h-auto max-h-[360px] md:max-h-[440px] object-cover object-center"
        />
      </div>

      {/* 3. Shop Profile Section (Outside banner container to prevent any clipping) */}
      <div className="relative px-4 pt-0 pb-2 text-center">
        
        {/* Overlapping Circular Logo with Green Verified Shield Badge */}
        <div className="relative -mt-10 sm:-mt-14 md:-mt-18 mb-2.5 flex justify-center z-20">
          <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-white p-1 shadow-lg border-2 border-pink-200 ring-4 ring-pink-100 hover:scale-105 transition-transform duration-300">
            <img
              src={logoUrl || '/images/logo.jpg'}
              alt={storeName}
              className="w-full h-full object-cover rounded-full"
            />
            {/* Green Shield Verified Badge */}
            <div
              className="absolute bottom-0 right-0 sm:bottom-1 sm:right-1 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white shadow-sm"
              title="ร้านค้าได้รับการยืนยันความปลอดภัย"
            >
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Store Title */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight font-['Prompt']">
          {storeName}
        </h1>

        {/* Pink Description Tagline */}
        <p className="text-xs sm:text-sm md:text-base text-pink-600 font-semibold mt-0.5">
          {description}
        </p>

        {/* Opening Hours & Guarantee Rounded Pills */}
        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2 text-xs">
          <div className="inline-flex items-center gap-1.5 bg-white px-3 py-1 rounded-full shadow-2xs border border-pink-100 text-slate-700 font-medium">
            <Clock className="w-3.5 h-3.5 text-pink-500" />
            <span>{openingHours}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{guaranteeText}</span>
          </div>
        </div>

        {/* Action Buttons: LINE Contact + Standalone OTP Mailbox Button */}
        <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2.5 max-w-md sm:max-w-lg mx-auto">
          <a
            href="https://line.me/R/ti/p/@bastore"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              const cleanId = (lineId || '@bastore').replace(/^@/, '');
              const targetUrl = lineUrl && !lineUrl.includes('~') 
                ? lineUrl 
                : `https://line.me/R/ti/p/@${cleanId}`;
              window.open(targetUrl, '_blank', 'noopener,noreferrer');
              e.preventDefault();
            }}
            className="flex-1 min-w-[190px] py-2.5 px-5 rounded-2xl bg-[#06C755] hover:bg-[#05B34C] active:scale-98 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>{lineButtonText} {lineId}</span>
          </a>

          <a
            href="/otp"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 active:scale-98 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-indigo-400/30 shrink-0"
            title="คลิกเพื่อเปิดหน้าเว็บรับรหัส OTP เมลล์ (เปิดแท็บใหม่)"
          >
            <KeyRound className="w-4 h-4 text-yellow-300 animate-pulse" />
            <span>📬 OTP เมลล์</span>
          </a>
        </div>

      </div>

    </header>
  );
}
