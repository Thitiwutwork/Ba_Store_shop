import React from 'react';
import { ShoppingCart, CheckCircle2, Shield } from 'lucide-react';

export default function ProductCard({ product, onSelectProduct, stockCount = 0 }) {
  // Filter out customer email tiers
  const visiblePrices = (product.prices || []).filter(
    (tier) =>
      !tier.label?.includes('เมลล์ลูกค้า') &&
      !tier.label?.includes('เมลลูกค้า') &&
      !tier.label?.includes('อีเมลลูกค้า')
  );
  const displayPrices = visiblePrices.length > 0 ? visiblePrices : (product.prices || []);

  // Find minimum starting price among active tiers
  const minPrice = displayPrices && displayPrices.length > 0
    ? Math.min(...displayPrices.map(p => parseFloat(p.price) || 0))
    : 0;

  return (
    <div className="bg-white rounded-3xl border border-pink-100 p-4 sm:p-5 flex flex-col justify-between hover:border-pink-300 hover:shadow-md transition-all group">
      <div>
        {/* Top Header: App Icon & Stock Tag */}
        <div className="flex items-start justify-between gap-2">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-xs shrink-0 flex items-center justify-center bg-gray-50 border border-gray-100">
            {product.icon && (product.icon.startsWith('/') || product.icon.startsWith('http') || product.icon.startsWith('data:image')) ? (
              <img src={product.icon} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">{product.icon || '📱'}</span>
            )}
          </div>

          <div className="flex flex-col items-end gap-1">
            {product.tag && (
              <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded-full border border-rose-100">
                {product.tag}
              </span>
            )}
            <span className="text-[10px] bg-emerald-50 text-emerald-600 font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>พร้อมส่ง</span>
            </span>
          </div>
        </div>

        {/* Title & Specs */}
        <div className="mt-3.5 space-y-1">
          <h3 className="font-bold text-sm sm:text-base text-gray-800 group-hover:text-rose-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {product.devices ? `${product.devices} • ` : ''}{product.resolution || product.subDetail || 'ของแท้ รับประกันตลอดอายุ'}
          </p>
        </div>

        {/* Multi-tier Prices List */}
        {displayPrices && displayPrices.length > 0 && (
          <div className="mt-3.5 bg-pink-50/50 rounded-2xl p-2.5 space-y-1.5 text-xs border border-pink-100/60">
            {displayPrices.map((tier) => (
              <div key={tier.id} className="flex items-center justify-between font-medium">
                <span className="text-gray-600 truncate mr-2">{tier.label}:</span>
                <span className="font-bold text-rose-600 shrink-0">฿{tier.price}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer: Starting Price & Buy Button */}
      <div className="mt-4 pt-3.5 border-t border-pink-50 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] text-gray-400 block leading-none">
            {displayPrices.length > 1 ? 'เริ่มต้น' : 'ราคา'}
          </span>
          <div className="text-lg sm:text-xl font-black text-rose-600 leading-tight">
            ฿ {minPrice}
          </div>
        </div>

        <button
          onClick={() => onSelectProduct(product)}
          className="px-4 py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-xs font-bold shadow-md hover:shadow-rose-200 transition-all flex items-center gap-1.5"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>เลือกซื้อ</span>
        </button>
      </div>
    </div>
  );
}
