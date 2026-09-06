import React from 'react';
import { Flame, ShoppingCart, Sparkles, CheckCircle2 } from 'lucide-react';
import { normalizeProductIcon, getBrandIconByName } from '../data/initialData';

export default function PromotionSection({ promotions = [], onSelectPromo }) {
  if (!promotions || promotions.length === 0) return null;

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm sm:text-lg font-bold text-gray-800 flex items-center gap-2">
          <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 fill-rose-500" />
          <span>โปรโมชั่นแพ็กคู่สุดคุ้ม (Duo Bundle)</span>
        </h2>
        <span className="text-[11px] sm:text-xs bg-rose-50 text-rose-600 font-semibold px-2.5 py-1 rounded-full border border-rose-100 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>คุ้มกว่าซื้อแยก</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {promotions.map((promo) => {
          const original = parseFloat(promo.originalPrice) || 0;
          const current = parseFloat(promo.promoPrice) || 0;
          const discount = Math.max(0, original - current);
          const icon1 = normalizeProductIcon(promo.app1Icon, promo.app1Name || promo.name);
          const icon2 = promo.app2Icon ? normalizeProductIcon(promo.app2Icon, promo.app2Name || promo.name) : null;

          return (
            <div
              key={promo.id}
              className="rounded-3xl bg-white border border-rose-200/80 p-4 sm:p-5 hover:shadow-lg transition-all flex flex-col justify-between gap-3 relative"
            >
              {/* Header: Icons + Title + Discount Badge (No overlap!) */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Apps Overlapping Icons */}
                  <div className="flex -space-x-3.5 shrink-0">
                    {icon1 && (
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden shadow-sm ring-2 ring-white z-10 bg-white relative">
                        <img
                          src={icon1}
                          alt={promo.app1Name || 'App 1'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const fallback = getBrandIconByName(promo.app1Name || promo.name);
                            if (fallback && !e.currentTarget.getAttribute('data-fallback-applied')) {
                              e.currentTarget.setAttribute('data-fallback-applied', 'true');
                              e.currentTarget.src = fallback;
                            } else {
                              e.currentTarget.style.display = 'none';
                              const fb = e.currentTarget.parentElement?.querySelector('.icon-fallback-badge');
                              if (fb) fb.style.display = 'flex';
                            }
                          }}
                        />
                        <div className="icon-fallback-badge hidden w-full h-full items-center justify-center bg-rose-50 text-rose-600 font-bold text-xs">
                          {(promo.app1Name || promo.name)?.[0] || '🎁'}
                        </div>
                      </div>
                    )}
                    {icon2 && (
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden shadow-sm ring-2 ring-white z-20 bg-white relative">
                        <img
                          src={icon2}
                          alt={promo.app2Name || 'App 2'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const fallback = getBrandIconByName(promo.app2Name);
                            if (fallback && !e.currentTarget.getAttribute('data-fallback-applied')) {
                              e.currentTarget.setAttribute('data-fallback-applied', 'true');
                              e.currentTarget.src = fallback;
                            } else {
                              e.currentTarget.style.display = 'none';
                              const fb = e.currentTarget.parentElement?.querySelector('.icon-fallback-badge');
                              if (fb) fb.style.display = 'flex';
                            }
                          }}
                        />
                        <div className="icon-fallback-badge hidden w-full h-full items-center justify-center bg-rose-50 text-rose-600 font-bold text-xs">
                          {(promo.app2Name)?.[0] || '🎁'}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-xs sm:text-sm md:text-base text-gray-800 leading-snug truncate">
                      {promo.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 truncate">
                      {promo.devices || 'รวม 2 แอพยอดนิยม • ดูแลตลอดอายุ'}
                    </p>
                  </div>
                </div>

                {/* Inline Discount Badge without collision */}
                {discount > 0 && (
                  <span className="shrink-0 bg-rose-500 text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                    🔥 เซฟ ฿{discount}
                  </span>
                )}
              </div>

              {/* Package Inclusions List */}
              {promo.inclusions && (
                <div className="bg-pink-50/50 rounded-2xl p-2.5 sm:p-3 space-y-1 text-[11px] sm:text-xs text-gray-600 border border-pink-100/60">
                  {promo.inclusions.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 truncate">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Price & Action Row */}
              <div className="pt-2 border-t border-pink-50 flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl sm:text-2xl font-black text-rose-600">
                      ฿ {current}
                    </span>
                    {original > current && (
                      <span className="text-xs text-gray-400 line-through">
                        ฿{original}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400">
                    / {promo.period || '30 วัน'}
                  </span>
                </div>

                <button
                  onClick={() => onSelectPromo(promo)}
                  className="px-4 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 shrink-0"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>สั่งซื้อแพ็กคู่นี้</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
