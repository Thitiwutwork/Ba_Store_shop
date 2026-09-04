import React from 'react';
import { Users, LayoutGrid, PackageCheck, Flame } from 'lucide-react';

export default function LiveCounterBar({
  totalProducts = 8,
  availableStock = 0,
  soldCount = 0,
  storeSettings = {}
}) {
  const usersText = storeSettings.counterUsersText || '3,480+';
  const baseSold = storeSettings.counterSoldBase !== undefined && storeSettings.counterSoldBase !== ''
    ? parseInt(storeSettings.counterSoldBase) || 0
    : 18924;
  const displaySold = (baseSold + soldCount).toLocaleString();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      
      {/* 1. Total Users */}
      <div className="bg-white rounded-3xl p-3.5 sm:p-5 border border-pink-100 shadow-xs flex items-center justify-between hover:border-pink-300 transition-all">
        <div>
          <p className="text-[11px] sm:text-xs text-gray-500 font-medium">ผู้ใช้ทั้งหมด</p>
          <h3 className="text-lg sm:text-2xl font-black text-gray-800 mt-0.5 sm:mt-1">{usersText}</h3>
          <p className="text-[9px] sm:text-[10px] text-emerald-600 font-semibold mt-0.5">● สมาชิกไว้วางใจ</p>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      {/* 2. Total Products */}
      <div className="bg-white rounded-3xl p-3.5 sm:p-5 border border-pink-100 shadow-xs flex items-center justify-between hover:border-pink-300 transition-all">
        <div>
          <p className="text-[11px] sm:text-xs text-gray-500 font-medium">สินค้าทั้งหมด</p>
          <h3 className="text-lg sm:text-2xl font-black text-gray-800 mt-0.5 sm:mt-1">{totalProducts} รายการ</h3>
          <p className="text-[9px] sm:text-[10px] text-pink-600 font-semibold mt-0.5">ครบทุกความบันเทิง</p>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
          <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      {/* 3. Available Stock */}
      <div className="bg-white rounded-3xl p-3.5 sm:p-5 border border-pink-100 shadow-xs flex items-center justify-between hover:border-pink-300 transition-all">
        <div>
          <p className="text-[11px] sm:text-xs text-gray-500 font-medium">สต๊อกพร้อมส่ง</p>
          <h3 className="text-lg sm:text-2xl font-black text-emerald-600 mt-0.5 sm:mt-1">{availableStock} ชิ้น</h3>
          <p className="text-[9px] sm:text-[10px] text-emerald-500 font-semibold mt-0.5">● ตัดอัตโนมัติ 24 ชม.</p>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <PackageCheck className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      {/* 4. Total Sold */}
      <div className="bg-white rounded-3xl p-3.5 sm:p-5 border border-pink-100 shadow-xs flex items-center justify-between hover:border-pink-300 transition-all">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-500 animate-ping"></span>
            <p className="text-[11px] sm:text-xs text-gray-500 font-medium">ขายแล้วทั้งหมด</p>
          </div>
          <h3 className="text-lg sm:text-2xl font-black text-rose-600 mt-0.5 sm:mt-1">{displaySold}+</h3>
          <p className="text-[9px] sm:text-[10px] text-rose-500 font-semibold mt-0.5">การันตีดูแล 100%</p>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
          <Flame className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

    </div>
  );
}
