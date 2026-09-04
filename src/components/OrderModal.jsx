import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Sparkles, Wallet, MessageCircle } from 'lucide-react';

export default function OrderModal({
  isOpen,
  onClose,
  product,
  walletBalance,
  onConfirmPurchase,
  onGoToTopup
}) {
  if (!isOpen || !product) return null;

  // Set default selected tier
  const [selectedTier, setSelectedTier] = useState(null);
  const [customerNote, setCustomerNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter out 'เมลล์ลูกค้า' tiers as customer email cut is now handled via LINE
  const availablePrices = (product?.prices || []).filter(
    (tier) =>
      !tier.label?.includes('เมลล์ลูกค้า') &&
      !tier.label?.includes('เมลลูกค้า') &&
      !tier.label?.includes('อีเมลลูกค้า')
  );

  useEffect(() => {
    if (product) {
      if (availablePrices.length > 0) {
        setSelectedTier(availablePrices[0]);
      } else if (product.prices && product.prices.length > 0) {
        setSelectedTier(product.prices[0]);
      } else {
        setSelectedTier({
          label: product.tag || 'สั่งซื้อแพ็กเกจ',
          price: product.promoPrice || product.price || '0',
          period: product.pricePeriod || ''
        });
      }
      setCustomerNote('');
    }
  }, [product]);

  const priceNum = selectedTier ? parseFloat(selectedTier.price) || 0 : 0;
  const hasEnoughBalance = walletBalance >= priceNum;

  const handlePurchase = () => {
    if (!hasEnoughBalance) {
      onGoToTopup();
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirmPurchase({
        productId: product.id,
        productName: product.name,
        tierLabel: selectedTier?.label || 'มาตรฐาน',
        price: priceNum,
        customerNote: customerNote.trim()
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-pink-100 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 pr-8">
          <div className="w-13 h-13 rounded-2xl overflow-hidden shadow-xs shrink-0 flex items-center justify-center bg-gray-50 border border-gray-100">
            {product.icon && (product.icon.startsWith('/') || product.icon.startsWith('http') || product.icon.startsWith('data:image')) ? (
              <img src={product.icon} alt={product.name} className="w-full h-full object-cover" />
            ) : product.app1Icon ? (
              <img src={product.app1Icon} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">{product.icon || '🛍️'}</span>
            )}
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-gray-900 leading-snug">
              {product.name}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {product.devices ? `${product.devices} • ` : ''}{product.resolution || 'กรุณาเลือกตัวเลือกที่ต้องการ'}
            </p>
          </div>
        </div>

        {/* Options / Tiers Selector */}
        {(availablePrices.length > 0 || (product.prices && product.prices.length > 0)) && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 block">
              เลือกรูปแบบแพ็กเกจ (เมลร้าน / Code เติม):
            </label>
            <div className="grid grid-cols-1 gap-2">
              {(availablePrices.length > 0 ? availablePrices : product.prices).map((tier) => {
                const isSelected = selectedTier?.id === tier.id || selectedTier?.label === tier.label;
                return (
                  <div
                    key={tier.id || tier.label}
                    onClick={() => setSelectedTier(tier)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/60 shadow-xs'
                        : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                        isSelected ? 'bg-rose-500 text-white' : 'border border-gray-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-3" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-800">{tier.label}</span>
                        {tier.period && (
                          <span className="text-[11px] text-gray-500 ml-1.5 font-normal">
                            ({tier.period})
                          </span>
                        )}
                        {tier.note && (
                          <p className="text-[11px] text-gray-500 mt-0.5">{tier.note}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-black text-rose-600 shrink-0 ml-2">
                      ฿ {tier.price}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Notice for Customer Email Cut via LINE */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-3.5 rounded-2xl border border-emerald-200/80 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <span className="text-xl shrink-0">💡</span>
            <div>
              <h4 className="text-xs font-bold text-emerald-900">
                ต้องการสั่งตัดสิทธิ์ด้วย "เมลตัวเอง" ?
              </h4>
              <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                บนเว็บจำหน่ายเฉพาะเมลร้านพร้อมใช้งานและโค้ดเติม หากต้องการต่อเมลตัวเอง รบกวนทักไลน์ทางร้านแทนนะครับ
              </p>
            </div>
          </div>
          <a
            href="https://line.me/R/ti/p/@bastore"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#06C755] hover:bg-[#05B34C] active:scale-95 text-white px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white" />
            <span>ทัก LINE</span>
          </a>
        </div>

        {/* Price Summary & Wallet Status */}
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-2xl border border-pink-100 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-500">ยอดที่ต้องชำระสุทธิ:</div>
            <div className="text-2xl font-black text-rose-600 leading-tight">
              ฿ {priceNum.toFixed(2)}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-gray-500 flex items-center justify-end gap-1">
              <Wallet className="w-3 h-3 text-gray-400" />
              <span>กระเป๋าเงินคงเหลือ:</span>
            </div>
            <div className={`text-sm font-bold ${hasEnoughBalance ? 'text-emerald-600' : 'text-red-500'}`}>
              ฿ {walletBalance.toFixed(2)}
            </div>
            {!hasEnoughBalance && (
              <span className="text-[10px] text-red-500 font-semibold block">ยอดเงินไม่พอ</span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-2 pt-1">
          {hasEnoughBalance ? (
            <button
              onClick={handlePurchase}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 active:scale-98 text-white font-bold text-sm shadow-md hover:shadow-rose-200 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'กำลังทำรายการ...' : '⚡ ยืนยันการสั่งซื้อทันที (หักเงินจาก Wallet)'}</span>
            </button>
          ) : (
            <button
              onClick={onGoToTopup}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 active:scale-98 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              <span>ยอดเงินไม่พอ • คลิกเติมเงินกระเป๋าตอนนี้</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-800 font-medium"
          >
            ยกเลิก
          </button>
        </div>

      </div>
    </div>
  );
}
