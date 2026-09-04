import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Check, RefreshCw, ShoppingBag, X, Sparkles, Tag, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { APP_ICONS } from '../data/initialData';

export default function AdminProductManager({
  products = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetDefaults,
  onShowToast
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('ซีรีส์ & หนัง');
  const [tag, setTag] = useState('ยอดนิยม');
  const [devices, setDevices] = useState('1 อุปกรณ์');
  const [resolution, setResolution] = useState('Full HD 1080p');
  
  // Custom App Icon / Logo State (Supports SVG DataURL, Uploaded Base64, Image URL, or Emoji)
  const [customAppIcon, setCustomAppIcon] = useState(APP_ICONS.netflix);

  // Dynamic Multi-tier Price Rows
  const [priceTiers, setPriceTiers] = useState([
    { id: '1', label: 'เมลล์ร้าน 30 วัน', price: 35 },
    { id: '2', label: 'เมลล์ลูกค้า 30 วัน', price: 30 }
  ]);

  const categories = ['ซีรีส์ & หนัง', 'บริการ OTP & เมลล์', 'กราฟิก & ทำงาน'];

  // Add tier row
  const handleAddTierRow = () => {
    setPriceTiers([
      ...priceTiers,
      { id: Date.now().toString(), label: 'ตัวเลือกใหม่', price: 50 }
    ]);
  };

  const handleUpdateTierRow = (id, field, val) => {
    setPriceTiers(
      priceTiers.map((t) => (t.id === id ? { ...t, [field]: val } : t))
    );
  };

  const handleRemoveTierRow = (id) => {
    if (priceTiers.length > 1) {
      setPriceTiers(priceTiers.filter((t) => t.id !== id));
    }
  };

  // Open Form for New Product
  const handleOpenNew = () => {
    setIsEditing(true);
    setEditingId(null);
    setName('');
    setCategory('ซีรีส์ & หนัง');
    setTag('มาใหม่');
    setDevices('1 อุปกรณ์');
    setResolution('Full HD 1080p');
    setCustomAppIcon(APP_ICONS.netflix);
    setPriceTiers([
      { id: '1', label: 'เมลล์ร้าน 30 วัน', price: 50 },
      { id: '2', label: 'เมลล์ลูกค้า 30 วัน', price: 45 }
    ]);
  };

  // Open Form for Edit
  const handleOpenEdit = (prod) => {
    setIsEditing(true);
    setEditingId(prod.id);
    setName(prod.name || '');
    setCategory(prod.category || 'ซีรีส์ & หนัง');
    setTag(prod.tag || '');
    setDevices(prod.devices || '');
    setResolution(prod.resolution || '');
    setCustomAppIcon(prod.icon || APP_ICONS.netflix);
    setPriceTiers(
      prod.prices && prod.prices.length > 0
        ? prod.prices
        : [{ id: '1', label: 'ปกติ', price: 50 }]
    );
  };

  // Handle Custom App Icon Upload from Device (File Upload)
  const handleAppIconUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomAppIcon(reader.result);
        if (onShowToast) onShowToast('📸 เปลี่ยนโลโก้ของแอพเรียบร้อยแล้ว', '✅');
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Save Product
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const productPayload = {
      name: name.trim(),
      category,
      tag,
      devices,
      resolution,
      prices: priceTiers.map((t) => ({
        id: t.id,
        label: t.label.trim(),
        price: parseFloat(t.price) || 0
      })),
      icon: customAppIcon || '📱'
    };

    if (editingId) {
      onUpdateProduct(editingId, productPayload);
      if (onShowToast) onShowToast(`💾 แก้ไขข้อมูลสินค้า "${name}" สำเร็จ`, '✅');
    } else {
      onAddProduct(productPayload);
      if (onShowToast) onShowToast(`🎉 เพิ่มสินค้าใหม่ "${name}" หน้าร้านเรียบร้อยแล้ว`, '✅');
    }

    setIsEditing(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-5">
      
      {/* Top Header Controls */}
      <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-gray-800 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-rose-500" />
            <span>จัดการรายการสินค้าหน้าร้าน (Product Manager)</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            สามารถเพิ่มสินค้าใหม่ แก้ไขราคา หรือเปลี่ยนโลโก้/ไอคอนของแต่ละแอพได้อย่างอิสระ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetDefaults}
            className="px-3.5 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-all flex items-center gap-1.5"
            title="รีเซ็ตสินค้ากลับเป็นชุดตั้งต้นจาก workforsell"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>คืนค่าตั้งต้น</span>
          </button>

          <button
            onClick={handleOpenNew}
            className="px-4 py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ เพิ่มสินค้าใหม่</span>
          </button>
        </div>
      </div>

      {/* Product Add / Edit Modal Form */}
      {isEditing && (
        <div className="bg-white rounded-3xl p-6 border-2 border-rose-300 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h4 className="font-bold text-sm sm:text-base text-gray-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>{editingId ? 'แก้ไขข้อมูลสินค้า & โลโก้แอพ' : 'เพิ่มสินค้าและบริการใหม่หน้าร้าน'}</span>
            </h4>
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">ชื่อสินค้า / บริการ:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น Netflix 4K, Viu, Disney+"
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-400 text-xs font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">หมวดหมู่:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">ป้ายแท็ก (Badge):</label>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="เช่น ยอดนิยม, ขายดี, ราคาถูก"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">จำนวนอุปกรณ์ที่ดูได้:</label>
                <input
                  type="text"
                  value={devices}
                  onChange={(e) => setDevices(e.target.value)}
                  placeholder="เช่น 1 จอ, 2 อุปกรณ์"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">ความคมชัด / รายละเอียด:</label>
                <input
                  type="text"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="เช่น Ultra 4K HDR, Full HD"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>
            </div>

            {/* 🎨 APP LOGO & ICON CUSTOMIZATION SECTION */}
            <div className="bg-gradient-to-r from-pink-50/80 via-rose-50/70 to-purple-50/80 p-4 rounded-2xl border border-pink-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-700 flex items-center gap-1.5 text-xs">
                  <ImageIcon className="w-4 h-4 text-rose-600" />
                  <span>ปรับแต่งโลโก้ / ไอคอนของแอป (App Logo Customizer):</span>
                </span>
                <span className="text-[11px] text-gray-500">เลือกไอคอนแบรนด์สำเร็จรูป หรืออัปโหลดรูปเองได้</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                {/* 1. Live Icon Preview Box */}
                <div className="sm:col-span-3 flex items-center gap-3 bg-white p-2.5 rounded-xl border border-pink-100 shadow-2xs">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-xs border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                    {customAppIcon && (customAppIcon.startsWith('data:image') || customAppIcon.startsWith('http') || customAppIcon.startsWith('/')) ? (
                      <img src={customAppIcon} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">{customAppIcon || '📱'}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-gray-700 block">พรีวิวโลโก้</span>
                    <span className="text-[10px] text-emerald-600 font-medium">● แสดงหน้าร้าน</span>
                  </div>
                </div>

                {/* 2. Upload Custom Image or Input URL */}
                <div className="sm:col-span-9 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <label className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 text-xs shadow-xs shrink-0">
                    <UploadCloud className="w-4 h-4" />
                    <span>อัปโหลดรูปโลโก้แอพ (จากเครื่อง)</span>
                    <input type="file" accept="image/*" onChange={handleAppIconUpload} className="hidden" />
                  </label>

                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={customAppIcon.startsWith('data:image/svg') ? '(ใช้ไอคอน SVG ทางการ)' : customAppIcon}
                      onChange={(e) => setCustomAppIcon(e.target.value)}
                      placeholder="หรือพิมพ์ URL รูปภาพ / Emoji เช่น 🍿, 🎬, 🤖"
                      className="w-full p-2 rounded-xl border border-gray-200 bg-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Clickable Official App Icon Presets */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] text-gray-500 font-medium block">
                  หรือคลิกเลือกโลโก้แบรนด์ทางการ (Official Presets):
                </span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(APP_ICONS).map(([key, svgCode]) => {
                    const isSelected = customAppIcon === svgCode;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setCustomAppIcon(svgCode)}
                        className={`flex items-center gap-1.5 p-1.5 pr-2.5 rounded-xl border transition-all text-xs ${
                          isSelected
                            ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-200 shadow-xs font-bold'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-pink-300'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0">
                          <img src={svgCode} alt={key} className="w-full h-full object-cover" />
                        </div>
                        <span className="capitalize text-[11px]">{key}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Multi-tier Price Builder */}
            <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800">
                  กำหนดระดับราคาและแพ็กเกจ (เช่น เมลล์ลูกค้า, เมลล์ร้าน, 30 วัน, 90 วัน):
                </span>
                <button
                  type="button"
                  onClick={handleAddTierRow}
                  className="px-2.5 py-1 rounded-xl bg-white border border-rose-300 text-rose-600 font-bold hover:bg-rose-50 transition-colors"
                >
                  + เพิ่มระดับราคา
                </button>
              </div>

              <div className="space-y-2">
                {priceTiers.map((tier, idx) => (
                  <div key={tier.id} className="flex items-center gap-2">
                    <span className="text-gray-400 font-mono text-[11px] w-5">#{idx + 1}</span>
                    <input
                      type="text"
                      value={tier.label}
                      onChange={(e) => handleUpdateTierRow(tier.id, 'label', e.target.value)}
                      placeholder="ชื่อแพ็กเกจ เช่น เมลล์ร้าน 30 วัน"
                      className="flex-1 p-2 rounded-xl border border-gray-200 bg-white text-xs"
                    />
                    <div className="relative w-28">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">฿</span>
                      <input
                        type="number"
                        value={tier.price}
                        onChange={(e) => handleUpdateTierRow(tier.id, 'price', e.target.value)}
                        placeholder="ราคา"
                        className="w-full pl-6 pr-2.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-rose-600"
                      />
                    </div>
                    {priceTiers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTierRow(tier.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{editingId ? 'บันทึกการแก้ไข' : 'ยืนยันเพิ่มสินค้า'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Products List Grid */}
      <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-sm space-y-4">
        <h4 className="font-bold text-xs sm:text-sm text-gray-800">
          รายการสินค้าทั้งหมดหน้าร้านในขณะนี้ ({products.length} รายการ)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map((p) => {
            return (
              <div
                key={p.id}
                className="p-3.5 rounded-2xl border border-pink-100 bg-pink-50/20 hover:border-pink-300 transition-all flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-11 h-11 rounded-xl overflow-hidden shadow-2xs border border-gray-100 shrink-0 bg-white flex items-center justify-center">
                    {p.icon && (p.icon.startsWith('data:image') || p.icon.startsWith('http') || p.icon.startsWith('/')) ? (
                      <img src={p.icon} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">{p.icon || '📱'}</span>
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-gray-800 text-xs block">{p.name}</span>
                    <span className="text-[10px] text-gray-500 block">{p.category}</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {p.prices?.map((pr) => (
                        <span key={pr.id} className="text-[9px] bg-white border border-pink-200 px-1.5 py-0.2 rounded font-medium text-rose-600">
                          {pr.label}: ฿{pr.price}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="แก้ไขสินค้านี้และเปลี่ยนโลโก้"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`ยืนยันลบสินค้า "${p.name}" ออกจากหน้าร้าน?`)) {
                        onDeleteProduct(p.id);
                        if (onShowToast) onShowToast(`ลบสินค้า "${p.name}" เรียบร้อยแล้ว`, 'ℹ️');
                      }
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="ลบสินค้านี้"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
