import React, { useState } from 'react';
import { Package, Copy, Check, ShieldCheck, Clock, ExternalLink, KeyRound } from 'lucide-react';

export default function OrderHistoryPage({ orders = [], onSwitchTab, onShowToast, onGoToOtp }) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (onShowToast) onShowToast('📋 คัดลอกข้อมูลบัญชีลงคลิปบอร์ดแล้ว', '✅');
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-gray-800">
              📦 ประวัติคำสั่งซื้อ & คลังรหัสของฉัน
            </h2>
            <span className="bg-rose-50 text-rose-600 font-bold text-xs px-2.5 py-0.5 rounded-full border border-rose-100">
              {orders.length} รายการ
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            ข้อมูลบัญชีและรหัสผ่านที่คุณสั่งซื้อจะถูกจัดเก็บอย่างปลอดภัยในหน้านี้ สามารถเข้ามาดูและคัดลอกได้ตลอด 24 ชม.
          </p>
        </div>

        <button
          onClick={() => onSwitchTab('store')}
          className="px-4 py-2 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white text-xs font-bold transition-all shrink-0 self-start sm:self-auto"
        >
          + สั่งซื้อสินค้าเพิ่ม
        </button>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-pink-100 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-400 flex items-center justify-center text-3xl mx-auto">
            🛒
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800">ยังไม่มีประวัติคำสั่งซื้อ</h3>
            <p className="text-xs text-gray-500 mt-1">เลือกซื้อแอพพรีเมียมราคาถูก ได้วันใช้งานครบแน่นอน</p>
          </div>
          <button
            onClick={() => onSwitchTab('store')}
            className="px-6 py-2.5 rounded-2xl bg-rose-500 text-white text-xs font-bold shadow-md hover:bg-rose-600 transition-all"
          >
            เลือกดูสินค้าหน้าร้าน
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {orders.map((order) => {
            const isCopied = copiedId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-pink-100 p-5 shadow-xs hover:border-pink-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left info */}
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-xl shrink-0 font-black shadow-xs">
                    🎁
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm sm:text-base text-gray-800">
                        {order.productName}
                      </h4>
                      <span className="text-[10px] bg-pink-100 text-pink-700 font-bold px-2 py-0.5 rounded-md">
                        {order.tierLabel}
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>สำเร็จ</span>
                      </span>
                    </div>

                    <div className="text-xs text-gray-400 flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-gray-500">{order.orderNo}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(order.createdAt).toLocaleString('th-TH')}</span>
                      </span>
                    </div>

                    <div className="text-xs font-bold text-rose-600 pt-0.5">
                      ยอดชำระ: ฿ {parseFloat(order.pricePaid || 0).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Right: Delivered Credentials Box */}
                <div className="bg-pink-50/60 rounded-2xl p-3.5 border border-pink-100 text-xs space-y-2 md:min-w-[320px] max-w-full">
                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ข้อมูลบัญชีที่ได้รับ:</span>
                    </span>
                    <button
                      onClick={() => handleCopy(order.id, order.deliveredCredential)}
                      className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 hover:underline"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">คัดลอกแล้ว!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>คัดลอกรหัส</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="font-mono text-gray-700 bg-white px-3 py-2 rounded-xl text-xs border border-pink-100 break-all select-all">
                    {order.deliveredCredential || 'ไม่มีข้อมูลรหัส'}
                  </div>

                  {(() => {
                    const emailMatch = (order.deliveredCredential || '').match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
                    const credEmail = emailMatch ? emailMatch[1] : null;
                    if (!credEmail) return null;

                    return (
                      <button
                        type="button"
                        onClick={() => onGoToOtp && onGoToOtp(credEmail)}
                        className="w-full py-1.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                        <span>📬 เช็ครหัส OTP ของเมลนี้</span>
                      </button>
                    );
                  })()}

                  <div className="text-[10px] text-gray-400 flex items-center justify-between">
                    <span>สถานะ: บัญชีแท้ ได้วันครบ 100%</span>
                    <span className="text-emerald-600 font-medium">● มีการรับประกัน</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
