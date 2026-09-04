import React, { useState } from 'react';
import { CreditCard, QrCode, ShieldCheck, UploadCloud, CheckCircle2, ArrowRight, Copy, Check } from 'lucide-react';
import { getPromptPayQrUrl, getFallbackQrUrl } from '../utils/promptpay';

export default function TopupPage({
  storeSettings,
  walletBalance,
  onProcessTopup,
  onSwitchTab
}) {
  const [amount, setAmount] = useState(200);
  const [customAmount, setCustomAmount] = useState('200');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [copiedPromptPay, setCopiedPromptPay] = useState(false);

  const handleCopyPromptPay = () => {
    const num = storeSettings?.promptpayNumber || '0982824986';
    navigator.clipboard.writeText(num);
    setCopiedPromptPay(true);
    setTimeout(() => setCopiedPromptPay(false), 2000);
  };

  const handleSelectPreset = (val) => {
    setAmount(val);
    setCustomAmount(val.toString());
  };

  const handleCustomChange = (val) => {
    setCustomAmount(val);
    const num = parseFloat(val) || 0;
    setAmount(num);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (amount <= 0) {
      alert('กรุณาระบุจำนวนเงินที่ต้องการเติม');
      return;
    }
    if (!selectedImage) {
      alert('กรุณาแนบรูปภาพสลิปการโอนเงินเพื่อตรวจสอบ');
      return;
    }

    setIsProcessing(true);
    try {
      await onProcessTopup({
        amount,
        slipImage: selectedImage
      });
      setSelectedImage(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Page Title & Balance Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-sm space-y-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-3xl mx-auto shadow-inner">
          💳
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-800">
            เติมเงินเข้ากระเป๋า (Top Up)
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md mx-auto">
            สแกน QR Code แล้วแนบสลิป ระบบ AI ตรวจสอบยอดเงินและเติมเข้ากระเป๋าอัตโนมัติทันที
          </p>
        </div>

        {/* Current Balance Display */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 px-5 py-2 rounded-2xl">
          <span className="text-xs text-gray-600 font-medium">ยอดเงินคงเหลือของคุณ:</span>
          <span className="text-lg font-black text-rose-600">฿ {walletBalance.toFixed(2)}</span>
        </div>
      </div>

      {/* Main Top-up Steps Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-sm space-y-6">
        
        {/* Step 1. Select Amount */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-gray-700 block">
            1. เลือกหรือระบุจำนวนเงินที่ต้องการเติม:
          </label>
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[50, 100, 200, 500].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleSelectPreset(val)}
                className={`py-3 rounded-2xl text-xs sm:text-sm font-bold border transition-all ${
                  amount === val
                    ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-xs'
                    : 'border-gray-200 text-gray-600 hover:border-pink-300'
                }`}
              >
                ฿ {val}
              </button>
            ))}
          </div>

          <div className="relative mt-2">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">฿</span>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => handleCustomChange(e.target.value)}
              placeholder="ระบุจำนวนเงินเอง"
              className="w-full pl-9 pr-4 py-3 rounded-2xl border border-gray-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
        </div>

        {/* Step 2. PromptPay QR Code Display */}
        <div className="bg-pink-50/40 rounded-3xl p-6 border border-pink-100 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-[#003B70] text-white text-[10px] font-bold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
            <QrCode className="w-3.5 h-3.5" />
            <span>2. สแกน QR CODE เพื่อโอนเงิน (PromptPay)</span>
          </div>

          {/* QR Box: Shows Custom Uploaded QR or Real Dynamic PromptPay QR (100% unobstructed) */}
          <div className="w-64 h-64 mx-auto bg-white p-4 rounded-3xl shadow-md border border-pink-100 flex items-center justify-center relative">
            {storeSettings?.customQrImage ? (
              <img
                src={storeSettings.customQrImage}
                alt="Shop QR Code"
                className="w-full h-full object-contain rounded-2xl"
              />
            ) : (
              <img
                key={`${storeSettings?.promptpayNumber || '0982824986'}-${amount}`}
                src={getPromptPayQrUrl(storeSettings?.promptpayNumber || '0982824986', amount)}
                alt={`PromptPay QR Code ฿${amount}`}
                className="w-full h-full object-contain rounded-xl"
                onError={(e) => {
                  const fallback = getFallbackQrUrl(storeSettings?.promptpayNumber || '0982824986', amount);
                  if (e.currentTarget.src !== fallback) {
                    e.currentTarget.src = fallback;
                  }
                }}
              />
            )}
          </div>

          {/* Reference Pill Outside QR Code (Never overlaps QR) */}
          <div className="flex justify-center">
            <span className="bg-white px-3 py-1 rounded-full text-[10px] text-gray-500 font-mono shadow-2xs border border-pink-100">
              REF: BA-PAY-{Math.abs(amount * 997).toString().substring(0, 8)}
            </span>
          </div>

          <div className="text-xs space-y-1.5 max-w-sm mx-auto">
            <div className="font-bold text-gray-900 text-sm">
              {storeSettings?.storeAccountName || 'บจก. บีเอ สโตร์ ดิจิทัล (BA Store)'}
            </div>
            
            <div className="flex items-center justify-center gap-2 text-gray-600 bg-white py-1 px-3 rounded-xl border border-pink-100 shadow-2xs inline-flex">
              <span>พร้อมเพย์:</span>
              <span className="font-mono font-bold text-gray-900 text-sm">{storeSettings?.promptpayNumber || '0982824986'}</span>
              <button
                type="button"
                onClick={handleCopyPromptPay}
                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
                title="คัดลอกเลขพร้อมเพย์"
              >
                {copiedPromptPay ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="text-gray-500 text-[11px]">
              {storeSettings?.storeBankName || 'ธนาคารกสิกรไทย (KBANK)'}
            </div>

            <div className="text-gray-800 font-semibold pt-1">
              ยอดที่ต้องโอน: <span className="text-rose-600 font-black text-lg">฿ {amount.toFixed(2)}</span>
            </div>

            <p className="text-[10px] text-emerald-600 font-medium">
              ● QR Code พร้อมเพย์แท้ ล็อคยอด ฿{amount.toFixed(2)} พอดี สแกนได้ด้วยทุกแอปธนาคาร
            </p>
          </div>
        </div>

        {/* Step 3. Slip Upload */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-700 block">
            3. แนบสลิปหลักฐานการโอนเงิน:
          </label>

          {/* File Input Box */}
          <div className="border-2 border-dashed border-pink-200 hover:border-pink-400 rounded-2xl p-5 text-center bg-pink-50/20 cursor-pointer relative transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <UploadCloud className="w-8 h-8 text-pink-400 mx-auto mb-1.5" />
            <div className="text-xs font-bold text-gray-700">
              {selectedImage ? '✅ เลือกรูปสลิปเรียบร้อยแล้ว (คลิกหากต้องการเปลี่ยนรูป)' : 'คลิกเพื่อเลือกรูปสลิปจากมือถือหรือคอมพิวเตอร์'}
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">รองรับไฟล์ภาพ JPG, PNG จากแอพธนาคารทุกแห่ง</p>
          </div>

          {/* Slip Preview if selected */}
          {selectedImage && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-pink-200 shadow-2xs animate-in fade-in">
              <img src={selectedImage} alt="Slip Preview" className="w-14 h-14 object-cover rounded-xl border border-gray-100 shrink-0" />
              <div className="text-xs flex-1 truncate">
                <span className="font-bold text-emerald-600 block">✓ แนบรูปสลิปแล้ว</span>
                <span className="text-[11px] text-gray-500">พร้อมส่งตรวจกับระบบ AI SlipOK</span>
              </div>
            </div>
          )}
        </div>

        {/* Security Note */}
        <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-100 text-left flex items-start gap-2.5 text-xs text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">ระบบตรวจสอบอัตโนมัติ AI 24 ชม.:</span>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              ตรวจสลิปแท้จากธนาคารทันที ไม่ต้องรอแอดมินยืนยัน ปลอดภัยด้วยระบบ Anti-Replay ป้องกันสลิปซ้ำ
            </p>
          </div>
        </div>

        {/* Submit Topup Button */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleSubmit}
            disabled={isProcessing || amount <= 0}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 hover:opacity-95 active:scale-98 text-white font-bold text-sm shadow-md hover:shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <span>⏳ กำลังตรวจสอบสลิปกับระบบ SlipOK...</span>
            ) : (
              <>
                <span>✨ ยืนยันการเติมเงิน ฿{amount.toFixed(2)}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            onClick={() => onSwitchTab('store')}
            className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 font-medium"
          >
            กลับสู่หน้าร้านค้า
          </button>
        </div>

      </div>
    </div>
  );
}
