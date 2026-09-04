import React, { useState } from 'react';
import {
  Inbox, CheckCircle2, Plus, UploadCloud, FileSpreadsheet, Trash2,
  ArrowRight, Search, Filter, ShieldCheck, Sparkles, AlertCircle, Copy, X, CheckSquare, Square
} from 'lucide-react';
import {
  getRawAccounts,
  addRawAccount,
  importRawAccountsBulk,
  deleteRawAccount,
  convertRawToDispatched,
  convertMultipleRawToDispatched,
  deleteMultipleRawAccounts,
  getDispatchedAccounts,
  addDispatchedAccount,
  importDispatchedAccountsBulk,
  deleteDispatchedAccount,
  deleteMultipleDispatchedAccounts
} from '../services/storageService';

export default function AccountManager({ onShowToast }) {
  const [activeAccountTab, setActiveAccountTab] = useState('raw'); // 'raw' (เตรียมตัด) | 'dispatched' (ตัดแล้ว)
  
  // Stored Data States
  const [rawAccounts, setRawAccounts] = useState(getRawAccounts());
  const [dispatchedAccounts, setDispatchedAccounts] = useState(getDispatchedAccounts());

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterApp, setFilterApp] = useState('ทั้งหมด');
  const [filterDispStatus, setFilterDispStatus] = useState('ทั้งหมด'); // 'ทั้งหมด' | 'พร้อมส่ง' | 'ขายแล้ว'

  const appOptions = ['iQIYI', 'YouTube', 'Netflix', 'Viu', 'Canva', 'Disney+', 'Spotify', 'OTP', 'อื่นๆ'];
  const tierPresets = ['30 วัน', '90 วัน', '7 วัน', '1 จอ 4K', 'จอส่วนตัว 30 วัน', 'เมลล์ร้าน', '1 ปี'];

  // =========================================================================
  // MULTI-SELECT STATE (สำหรับเลือก 10, 50, 100 แอค แล้วกดตัด/ย้าย/ลบ พร้อมกันทีเดียว!)
  // =========================================================================
  const [selectedRawIds, setSelectedRawIds] = useState([]);
  const [bulkConvertTier, setBulkConvertTier] = useState('30 วัน');

  const [selectedDispIds, setSelectedDispIds] = useState([]);

  // =========================================================================
  // DYNAMIC MULTI-ROW ADDER STATE ("เพิ่มได้ไม่จำกัดแถว แล้วกดบันทึกทีเดียว")
  // =========================================================================
  const [rawDraftRows, setRawDraftRows] = useState([
    { id: 1, appType: 'iQIYI', email: '', password: '', recovery: '', notes: '' }
  ]);

  const [dispDraftRows, setDispDraftRows] = useState([
    { id: 1, appType: 'iQIYI', tier: '30 วัน', email: '', password: '', pin: '', notes: '' }
  ]);

  // Draft Row Handlers
  const handleAddRawRow = () => {
    setRawDraftRows((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), appType: 'iQIYI', email: '', password: '', recovery: '', notes: '' }
    ]);
  };

  const handleAddDispRow = () => {
    setDispDraftRows((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), appType: 'iQIYI', tier: '30 วัน', email: '', password: '', pin: '', notes: '' }
    ]);
  };

  const handleRemoveRawRow = (rowId) => {
    setRawDraftRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== rowId) : prev));
  };

  const handleRemoveDispRow = (rowId) => {
    setDispDraftRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== rowId) : prev));
  };

  const handleUpdateRawRow = (rowId, field, val) => {
    setRawDraftRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: val } : r))
    );
  };

  const handleUpdateDispRow = (rowId, field, val) => {
    setDispDraftRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: val } : r))
    );
  };

  const handleSaveAllRawRows = () => {
    const validRows = rawDraftRows.filter((r) => r.email.trim() && r.password.trim());
    if (validRows.length === 0) {
      alert('กรุณากรอกอีเมลและรหัสผ่านอย่างน้อย 1 แถวก่อนกดบันทึก');
      return;
    }

    const payload = validRows.map((r) => ({
      appType: r.appType,
      email: r.email,
      password: r.password,
      recoveryInfo: r.recovery,
      notes: r.notes || 'เพิ่มผ่านตารางด่วน'
    }));

    importRawAccountsBulk(payload);
    setRawAccounts(getRawAccounts());
    setRawDraftRows([{ id: Date.now(), appType: 'iQIYI', email: '', password: '', recovery: '', notes: '' }]);
    if (onShowToast) onShowToast(`💾 บันทึกข้อมูลเมลเตรียมตัดสำเร็จ ${validRows.length} รายการ`, '✅');
  };

  const handleSaveAllDispRows = () => {
    const validRows = dispDraftRows.filter((r) => r.email.trim() && r.password.trim());
    if (validRows.length === 0) {
      alert('กรุณากรอกอีเมลและรหัสผ่านอย่างน้อย 1 แถวก่อนกดบันทึก');
      return;
    }

    const payload = validRows.map((r) => ({
      appType: r.appType,
      tierLabel: r.tier,
      email: r.email,
      password: r.password,
      pinCode: r.pin,
      notes: r.notes || 'เพิ่มผ่านตารางด่วน'
    }));

    importDispatchedAccountsBulk(payload);
    setDispatchedAccounts(getDispatchedAccounts());
    setDispDraftRows([{ id: Date.now(), appType: 'iQIYI', tier: '30 วัน', email: '', password: '', pin: '', notes: '' }]);
    if (onShowToast) onShowToast(`💾 บันทึกเข้าสต๊อกเมลตัดแล้วสำเร็จ ${validRows.length} รายการ`, '✅');
  };

  // =========================================================================
  // BATCH ACTIONS: SELECTION & 1-CLICK BULK MOVE (แก้ปัญหาย้าย 100 แอค!)
  // =========================================================================
  const handleToggleSelectRaw = (id) => {
    setSelectedRawIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllRaw = (filteredList) => {
    const readyItems = filteredList.filter((item) => item.status === 'เตรียมตัด');
    if (selectedRawIds.length === readyItems.length) {
      setSelectedRawIds([]);
    } else {
      setSelectedRawIds(readyItems.map((item) => item.id));
    }
  };

  // 1-Click Move All Selected Raw -> Dispatched
  const handleBulkMoveRawToDispatched = () => {
    if (selectedRawIds.length === 0) return;

    convertMultipleRawToDispatched(selectedRawIds, bulkConvertTier);
    setRawAccounts(getRawAccounts());
    setDispatchedAccounts(getDispatchedAccounts());
    const count = selectedRawIds.length;
    setSelectedRawIds([]);
    if (onShowToast) onShowToast(`✨ ตัดพรีเมียม (${bulkConvertTier}) และย้ายเข้าคลังพร้อมส่งแล้ว ${count} รายการ!`, '🎉');
  };

  // Bulk Copy Credentials (format: email:password)
  const handleBulkCopyRaw = () => {
    const items = rawAccounts.filter((r) => selectedRawIds.includes(r.id));
    const text = items.map((i) => `${i.email}:${i.password}`).join('\n');
    navigator.clipboard.writeText(text);
    if (onShowToast) onShowToast(`📋 คัดลอกข้อมูล ${items.length} รายการเข้า Clipboard แล้ว`, '✅');
  };

  // Bulk Delete Selected Raw
  const handleBulkDeleteRaw = () => {
    if (window.confirm(`ยืนยันลบเมลที่เลือกจำนวน ${selectedRawIds.length} รายการออกจากคลังเตรียมตัด?`)) {
      const updated = deleteMultipleRawAccounts(selectedRawIds);
      setRawAccounts(updated);
      setSelectedRawIds([]);
      if (onShowToast) onShowToast('ลบรายการที่เลือกเรียบร้อยแล้ว', 'ℹ️');
    }
  };

  // Dispatched Multi-Select
  const handleToggleSelectDisp = (id) => {
    setSelectedDispIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllDisp = (filteredList) => {
    if (selectedDispIds.length === filteredList.length) {
      setSelectedDispIds([]);
    } else {
      setSelectedDispIds(filteredList.map((item) => item.id));
    }
  };

  const handleBulkCopyDisp = () => {
    const items = dispatchedAccounts.filter((d) => selectedDispIds.includes(d.id));
    const text = items.map((i) => `${i.email}:${i.password}${i.pinCode ? ' PIN: ' + i.pinCode : ''}`).join('\n');
    navigator.clipboard.writeText(text);
    if (onShowToast) onShowToast(`📋 คัดลอกข้อมูลสต๊อก ${items.length} รายการแล้ว`, '✅');
  };

  const handleBulkDeleteDisp = () => {
    if (window.confirm(`ยืนยันลบเมลสต๊อกที่เลือกจำนวน ${selectedDispIds.length} รายการ?`)) {
      const updated = deleteMultipleDispatchedAccounts(selectedDispIds);
      setDispatchedAccounts(updated);
      setSelectedDispIds([]);
      if (onShowToast) onShowToast('ลบรายการที่เลือกเรียบร้อยแล้ว', 'ℹ️');
    }
  };

  // Bulk CSV / Excel Paste State
  const [showImporter, setShowImporter] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkAppType, setBulkAppType] = useState('iQIYI');
  const [bulkTier, setBulkTier] = useState('30 วัน');

  const handleBulkImport = () => {
    if (!bulkText.trim()) return;

    const lines = bulkText.split('\n');
    const parsedRows = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      let parts = [];
      if (trimmed.includes('\t')) parts = trimmed.split('\t');
      else if (trimmed.includes(',')) parts = trimmed.split(',');
      else if (trimmed.includes('|')) parts = trimmed.split('|');
      else if (trimmed.includes(':')) parts = trimmed.split(':');
      else parts = trimmed.split(/\s+/);

      if (parts.length >= 2) {
        parsedRows.push({
          appType: bulkAppType,
          email: parts[0].trim(),
          password: parts[1].trim(),
          tierLabel: bulkTier,
          recoveryInfo: parts[2] ? parts[2].trim() : '',
          notes: 'นำเข้าจากชุดข้อมูลไฟล์/ตาราง Sheet'
        });
      }
    });

    if (parsedRows.length === 0) {
      alert('ไม่พบรูปแบบ Email และ Password ที่ถูกต้อง (ต้องมีอย่างน้อย 2 คอลัมน์ต่อบรรทัด เช่น email,password หรือ email[Tab]password)');
      return;
    }

    if (activeAccountTab === 'raw') {
      importRawAccountsBulk(parsedRows);
      setRawAccounts(getRawAccounts());
      if (onShowToast) onShowToast(`📥 นำเข้าเมลเตรียมตัดสำเร็จ ${parsedRows.length} รายการ`, '🎉');
    } else {
      importDispatchedAccountsBulk(parsedRows);
      setDispatchedAccounts(getDispatchedAccounts());
      if (onShowToast) onShowToast(`📦 นำเข้าสต๊อกเมลตัดแล้วสำเร็จ ${parsedRows.length} รายการ`, '🎉');
    }

    setBulkText('');
    setShowImporter(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (text) setBulkText(text);
      };
      reader.readAsText(file);
    }
  };

  // Filtered lists
  const filteredRaw = rawAccounts.filter((item) => {
    const matchApp = filterApp === 'ทั้งหมด' || item.appType === filterApp;
    const matchQ =
      searchQuery === '' ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchApp && matchQ;
  });

  const filteredDispatched = dispatchedAccounts.filter((item) => {
    const matchApp = filterApp === 'ทั้งหมด' || item.appType === filterApp;
    const matchStatus =
      filterDispStatus === 'ทั้งหมด' ||
      (filterDispStatus === 'พร้อมส่ง' && item.status === 'พร้อมส่ง') ||
      (filterDispStatus === 'ขายแล้ว' && item.status === 'ขายแล้ว');
    const matchQ =
      searchQuery === '' ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tierLabel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.soldToOrderNo?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchApp && matchStatus && matchQ;
  });

  return (
    <div className="space-y-4">
      
      {/* Tab Switcher: 1. เตรียมตัด vs 2. ตัดแล้ว */}
      <div className="bg-white rounded-3xl p-3 border border-pink-100 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {/* Tab 1: เมลเตรียมตัด */}
          <button
            onClick={() => { setActiveAccountTab('raw'); setSelectedRawIds([]); }}
            className={`px-4 sm:px-5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeAccountTab === 'raw'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>1. คลังเมลเตรียมตัด (เมลเปล่ารอตัด)</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activeAccountTab === 'raw' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {rawAccounts.filter((r) => r.status === 'เตรียมตัด').length}
            </span>
          </button>

          {/* Tab 2: เมลตัดแล้ว */}
          <button
            onClick={() => { setActiveAccountTab('dispatched'); setSelectedDispIds([]); }}
            className={`px-4 sm:px-5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeAccountTab === 'dispatched'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>2. คลังเมลตัดแล้ว (สต๊อกพร้อมส่ง)</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              activeAccountTab === 'dispatched' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {dispatchedAccounts.filter((d) => d.status === 'พร้อมส่ง').length}
            </span>
          </button>
        </div>

        {/* Quick CSV/Sheets Importer Toggle */}
        <button
          onClick={() => setShowImporter(!showImporter)}
          className="px-3.5 py-2 rounded-2xl bg-pink-50 text-pink-700 hover:bg-pink-100 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-pink-200 shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4 text-pink-600" />
          <span>{showImporter ? 'ปิดกล่องนำเข้าไฟล์' : 'นำเข้าจาก Excel / Google Sheets'}</span>
        </button>
      </div>

      {/* CSV / Excel Sheet Importer Drawer */}
      {showImporter && (
        <div className="bg-white rounded-3xl p-5 border-2 border-dashed border-pink-300 shadow-md space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs sm:text-sm text-gray-800 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-rose-500" />
              <span>นำเข้าแบบคัดลอกวาง (Bulk Paste สู่ {activeAccountTab === 'raw' ? 'คลังเมลเตรียมตัด' : 'คลังเมลตัดแล้ว'})</span>
            </h4>
            <span className="text-[10px] text-gray-400">รองรับ Google Sheets &amp; Excel</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <label className="font-semibold text-gray-600 block mb-1">ระบุแอพ:</label>
              <select
                value={bulkAppType}
                onChange={(e) => setBulkAppType(e.target.value)}
                className="w-full p-2 rounded-xl border border-gray-200 text-xs"
              >
                {appOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {activeAccountTab === 'dispatched' && (
              <div>
                <label className="font-semibold text-gray-600 block mb-1">ระบุแพ็กเกจ:</label>
                <input
                  type="text"
                  value={bulkTier}
                  onChange={(e) => setBulkTier(e.target.value)}
                  placeholder="เช่น 30 วัน, 90 วัน"
                  className="w-full p-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>
            )}
          </div>

          <div>
            <textarea
              rows={3}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={`วางแถวตารางที่คัดลอกจาก Excel หรือ Google Sheets ที่นี่ เช่น:\nuser1@gmail.com\tPass123\nuser2@gmail.com\tPass456`}
              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-mono focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
            <label className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold cursor-pointer transition-colors">
              <span>📁 หรือเลือกไฟล์ .CSV จากเครื่อง</span>
              <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={handleBulkImport}
              className="w-full sm:w-auto px-5 py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>นำเข้าข้อมูลเข้าสู่ระบบทันที</span>
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 1. คลังเมลเตรียมตัด (RAW ACCOUNTS) */}
      {/* ===================================================================== */}
      {activeAccountTab === 'raw' && (
        <div className="space-y-4">
          
          {/* Definition Banner */}
          <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 text-amber-900 flex items-start gap-2.5 text-xs">
            <span className="text-base">💡</span>
            <div className="space-y-0.5">
              <span className="font-bold block">คลังเมลเตรียมตัด (Raw Accounts)</span>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                เมลล์เปล่าที่ยังไม่ตัดพรีเมี่ยม สามารถติ๊กเลือกหลายๆ บัญชีพร้อมกัน (เช่น 10 หรือ 100 แอค) แล้วกดปุ่ม 
                <strong>"✨ ตัดแล้วและย้ายเข้าคลังพร้อมส่ง"</strong> เพียงครั้งเดียว ระบบจะย้ายข้อมูลทั้งหมดไปสต๊อกพร้อมส่งให้ทันทีใน 1 วินาที!
              </p>
            </div>
          </div>

          {/* DYNAMIC MULTI-ROW ADDER BOX */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-pink-100 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-gray-800 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-amber-600" />
                  <span>เพิ่มเมลเปล่าเข้าคลัง (กดเพิ่มแถวได้ไม่จำกัด แล้วค่อยกดบันทึก)</span>
                </h4>
                <p className="text-[10px] text-gray-400">กรอกกี่รายการก็ได้ในตารางด้านล่าง แล้วกดปุ่มบันทึกทั้งหมดครั้งเดียว</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddRawRow}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs transition-all flex items-center gap-1 border border-amber-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ เพิ่มแถว</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveAllRawRows}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>💾 บันทึกทั้งหมด ({rawDraftRows.filter((r) => r.email).length})</span>
                </button>
              </div>
            </div>

            {/* Compact Rows Table */}
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {rawDraftRows.map((row, idx) => (
                <div
                  key={row.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 p-1.5 rounded-xl bg-amber-50/40 border border-amber-100 items-center text-xs"
                >
                  <span className="sm:col-span-1 font-mono text-[11px] text-amber-700 font-bold pl-1">
                    #{idx + 1}
                  </span>

                  <div className="sm:col-span-2">
                    <select
                      value={row.appType}
                      onChange={(e) => handleUpdateRawRow(row.id, 'appType', e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-gray-200 bg-white text-xs"
                    >
                      {appOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={row.email}
                      onChange={(e) => handleUpdateRawRow(row.id, 'email', e.target.value)}
                      placeholder="อีเมล (เมลเปล่า)"
                      className="w-full p-1.5 rounded-lg border border-gray-200 bg-white text-xs font-mono"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={row.password}
                      onChange={(e) => handleUpdateRawRow(row.id, 'password', e.target.value)}
                      placeholder="รหัสผ่าน"
                      className="w-full p-1.5 rounded-lg border border-gray-200 bg-white text-xs font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={row.recovery}
                      onChange={(e) => handleUpdateRawRow(row.id, 'recovery', e.target.value)}
                      placeholder="กู้คืน / เบอร์"
                      className="w-full p-1.5 rounded-lg border border-gray-200 bg-white text-xs"
                    />
                  </div>

                  <div className="sm:col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveRawRow(row.id)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded"
                      title="ลบแถวนี้"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ⚡ BATCH ACTION TOOLBAR (ปรากฏเมื่อมีการเลือก 1 แอคขึ้นไป - ย้าย 100 แอคใน 1 คลิก!) */}
          {selectedRawIds.length > 0 && (
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white rounded-2xl p-3 px-4 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-xs font-bold">
                <CheckSquare className="w-4 h-4" />
                <span>เลือกอยู่ {selectedRawIds.length} รายการ</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 bg-white/20 p-1 px-2.5 rounded-xl text-white">
                  <span>แพ็กเกจที่ตัดแล้ว:</span>
                  <input
                    type="text"
                    value={bulkConvertTier}
                    onChange={(e) => setBulkConvertTier(e.target.value)}
                    placeholder="เช่น 30 วัน, 90 วัน"
                    className="p-1 px-2 rounded-lg bg-white text-gray-800 text-xs font-bold w-28"
                  />
                </div>

                <button
                  onClick={handleBulkMoveRawToDispatched}
                  className="px-4 py-1.5 rounded-xl bg-white text-orange-700 hover:bg-orange-50 font-black shadow-sm transition-all flex items-center gap-1"
                >
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  <span>✨ ตัดแล้วและย้ายเข้าสต๊อกพร้อมส่ง ({selectedRawIds.length} แอค)</span>
                </button>

                <button
                  onClick={handleBulkCopyRaw}
                  className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold transition-all flex items-center gap-1"
                  title="คัดลอก email:pass ทั้งหมดที่เลือก"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>คัดลอก ({selectedRawIds.length})</span>
                </button>

                <button
                  onClick={handleBulkDeleteRaw}
                  className="px-3 py-1.5 rounded-xl bg-red-500/80 hover:bg-red-500 text-white font-bold transition-all flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ลบ</span>
                </button>

                <button
                  onClick={() => setSelectedRawIds([])}
                  className="text-white/80 hover:text-white text-xs underline pl-1"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          )}

          {/* Stored Raw Accounts Table */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-pink-100 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSelectAllRaw(filteredRaw)}
                  className="text-xs text-gray-600 hover:text-gray-900 font-bold flex items-center gap-1 px-2.5 py-1 rounded-xl border border-gray-200 hover:bg-gray-50"
                >
                  {selectedRawIds.length > 0 && selectedRawIds.length === filteredRaw.filter(r => r.status === 'เตรียมตัด').length ? (
                    <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-gray-400" />
                  )}
                  <span>เลือกทั้งหมดที่แสดง ({filteredRaw.filter(r => r.status === 'เตรียมตัด').length})</span>
                </button>

                <h4 className="font-bold text-xs sm:text-sm text-gray-800 pl-2">
                  คลังเมลเตรียมตัด ({filteredRaw.length})
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filterApp}
                  onChange={(e) => setFilterApp(e.target.value)}
                  className="p-1 rounded-xl border border-gray-200 text-xs"
                >
                  <option value="ทั้งหมด">ทุกแอพ</option>
                  {appOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 ค้นหาเมล..."
                  className="p-1 px-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-amber-50/50 text-amber-900 border-b border-amber-100">
                  <tr>
                    <th className="p-2.5 w-8">
                      <input
                        type="checkbox"
                        checked={selectedRawIds.length > 0 && selectedRawIds.length === filteredRaw.filter(r => r.status === 'เตรียมตัด').length}
                        onChange={() => handleSelectAllRaw(filteredRaw)}
                        className="rounded text-amber-600"
                      />
                    </th>
                    <th className="p-2.5">แอพ</th>
                    <th className="p-2.5">อีเมล</th>
                    <th className="p-2.5">รหัสผ่าน</th>
                    <th className="p-2.5">สถานะ</th>
                    <th className="p-2.5">กู้คืน / โน้ต</th>
                    <th className="p-2.5 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRaw.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-gray-400">
                        ยังไม่มีเมลเตรียมตัดในระบบ
                      </td>
                    </tr>
                  ) : (
                    filteredRaw.map((acc) => {
                      const isReady = acc.status === 'เตรียมตัด';
                      const isSelected = selectedRawIds.includes(acc.id);

                      return (
                        <tr key={acc.id} className={`hover:bg-gray-50/60 ${isSelected ? 'bg-amber-50/60' : ''}`}>
                          <td className="p-2.5">
                            {isReady ? (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectRaw(acc.id)}
                                className="rounded text-amber-600 cursor-pointer"
                              />
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                          <td className="p-2.5 font-bold text-pink-700">{acc.appType}</td>
                          <td className="p-2.5 font-mono text-gray-800">{acc.email}</td>
                          <td className="p-2.5 font-mono text-gray-600">{acc.password}</td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isReady ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {acc.status}
                            </span>
                          </td>
                          <td className="p-2.5 text-gray-500 max-w-xs truncate">{acc.recoveryInfo || acc.notes || '-'}</td>
                          <td className="p-2.5 text-right space-x-1.5">
                            {isReady && (
                              <button
                                onClick={() => {
                                  setSelectedRawIds([acc.id]);
                                  handleBulkMoveRawToDispatched();
                                }}
                                className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] shadow-2xs transition-all inline-flex items-center gap-1"
                                title="ย้ายรายการนี้ทันที"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>ตัดแล้ว → ย้าย</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteRaw(acc.id)}
                              className="text-red-400 hover:text-red-600 p-1 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. คลังเมลตัดแล้ว (DISPATCHED ACCOUNTS / READY STOCK) */}
      {/* ===================================================================== */}
      {activeAccountTab === 'dispatched' && (
        <div className="space-y-4">
          
          {/* Definition Banner */}
          <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200 text-emerald-900 flex items-start gap-2.5 text-xs">
            <span className="text-base">📦</span>
            <div className="space-y-0.5">
              <span className="font-bold block">คลังเมลตัดแล้ว (สต๊อกพร้อมส่ง)</span>
              <p className="text-emerald-800 text-[11px] leading-relaxed">
                สต๊อกที่ตัดพรีเมียมเรียบร้อยแล้วและพร้อมจัดส่งให้ลูกค้าทันที สามารถติ๊กเลือกเพื่อคัดลอก หรือลบรายการที่ขายแล้วทิ้งแบบเป็นชุดได้
              </p>
            </div>
          </div>

          {/* DYNAMIC MULTI-ROW ADDER BOX (Dispatched) */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-pink-100 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-gray-800 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>เพิ่มสต๊อกเมลตัดแล้ว (กดเพิ่มแถวได้ไม่จำกัด แล้วค่อยกดบันทึก)</span>
                </h4>
                <p className="text-[10px] text-gray-400">กรอกกี่รายการก็ได้ในตารางด้านล่าง แล้วกดปุ่มบันทึกทั้งหมดครั้งเดียว</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddDispRow}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-all flex items-center gap-1 border border-emerald-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ เพิ่มแถว</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveAllDispRows}
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>💾 บันทึกทั้งหมด ({dispDraftRows.filter((r) => r.email).length})</span>
                </button>
              </div>
            </div>

            {/* Compact Rows Table */}
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              {dispDraftRows.map((row, idx) => (
                <div
                  key={row.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 p-1.5 rounded-xl bg-emerald-50/40 border border-emerald-100 items-center text-xs"
                >
                  <span className="sm:col-span-1 font-mono text-[11px] text-emerald-700 font-bold pl-1">
                    #{idx + 1}
                  </span>

                  <div className="sm:col-span-2">
                    <select
                      value={row.appType}
                      onChange={(e) => handleUpdateDispRow(row.id, 'appType', e.target.value)}
                      className="w-full p-1.5 rounded-lg border border-gray-200 bg-white text-xs"
                    >
                      {appOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={row.tier}
                      onChange={(e) => handleUpdateDispRow(row.id, 'tier', e.target.value)}
                      placeholder="แพ็กเกจ (เช่น 30 วัน)"
                      className="w-full p-1.5 rounded-lg border border-gray-200 bg-white text-xs"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={row.email}
                      onChange={(e) => handleUpdateDispRow(row.id, 'email', e.target.value)}
                      placeholder="อีเมลพรีเมียม"
                      className="w-full p-1.5 rounded-lg border border-gray-200 bg-white text-xs font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={row.password}
                      onChange={(e) => handleUpdateDispRow(row.id, 'password', e.target.value)}
                      placeholder="รหัสผ่าน"
                      className="w-full p-1.5 rounded-lg border border-gray-200 bg-white text-xs font-mono"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <input
                      type="text"
                      value={row.pin}
                      onChange={(e) => handleUpdateDispRow(row.id, 'pin', e.target.value)}
                      placeholder="PIN"
                      className="w-full p-1.5 rounded-lg border border-gray-200 bg-white text-xs"
                    />
                  </div>

                  <div className="sm:col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveDispRow(row.id)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded"
                      title="ลบแถวนี้"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BATCH ACTION TOOLBAR FOR DISPATCHED */}
          {selectedDispIds.length > 0 && (
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-3 px-4 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold">
                <CheckSquare className="w-4 h-4" />
                <span>เลือกอยู่ {selectedDispIds.length} รายการ</span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={handleBulkCopyDisp}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-emerald-800 font-bold shadow-xs transition-all flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>คัดลอกที่เลือก ({selectedDispIds.length})</span>
                </button>

                <button
                  onClick={handleBulkDeleteDisp}
                  className="px-3.5 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ลบที่เลือก ({selectedDispIds.length})</span>
                </button>

                <button
                  onClick={() => setSelectedDispIds([])}
                  className="text-white/80 hover:text-white text-xs underline pl-1"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          )}

          {/* Stored Dispatched Table */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-pink-100 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleSelectAllDisp(filteredDispatched)}
                  className="text-xs text-gray-600 hover:text-gray-900 font-bold flex items-center gap-1 px-2.5 py-1 rounded-xl border border-gray-200 hover:bg-gray-50"
                >
                  {selectedDispIds.length > 0 && selectedDispIds.length === filteredDispatched.length ? (
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-gray-400" />
                  )}
                  <span>เลือกทั้งหมด ({filteredDispatched.length})</span>
                </button>

                {/* Status Filter Tabs */}
                <div className="flex gap-1 bg-gray-100 p-0.5 rounded-xl text-xs">
                  {['ทั้งหมด', 'พร้อมส่ง', 'ขายแล้ว'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setFilterDispStatus(st)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                        filterDispStatus === st ? 'bg-white text-emerald-700 shadow-xs' : 'text-gray-500'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filterApp}
                  onChange={(e) => setFilterApp(e.target.value)}
                  className="p-1 rounded-xl border border-gray-200 text-xs"
                >
                  <option value="ทั้งหมด">ทุกแอพ</option>
                  {appOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 ค้นหาเมล หรือออเดอร์..."
                  className="p-1 px-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-emerald-50/50 text-emerald-900 border-b border-emerald-100">
                  <tr>
                    <th className="p-2.5 w-8">
                      <input
                        type="checkbox"
                        checked={selectedDispIds.length > 0 && selectedDispIds.length === filteredDispatched.length}
                        onChange={() => handleSelectAllDisp(filteredDispatched)}
                        className="rounded text-emerald-600"
                      />
                    </th>
                    <th className="p-2.5">แอพ</th>
                    <th className="p-2.5">แพ็กเกจ</th>
                    <th className="p-2.5">อีเมล</th>
                    <th className="p-2.5">รหัสผ่าน</th>
                    <th className="p-2.5">PIN / โน้ต</th>
                    <th className="p-2.5">สถานะ</th>
                    <th className="p-2.5">ออเดอร์ที่จัดส่ง</th>
                    <th className="p-2.5 text-right">ลบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDispatched.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-gray-400">
                        ยังไม่มีเมลตัดแล้วในระบบ
                      </td>
                    </tr>
                  ) : (
                    filteredDispatched.map((acc) => {
                      const isAvailable = acc.status === 'พร้อมส่ง';
                      const isSelected = selectedDispIds.includes(acc.id);

                      return (
                        <tr key={acc.id} className={`hover:bg-gray-50/60 ${isSelected ? 'bg-emerald-50/60' : ''}`}>
                          <td className="p-2.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectDisp(acc.id)}
                              className="rounded text-emerald-600 cursor-pointer"
                            />
                          </td>
                          <td className="p-2.5 font-bold text-emerald-700">{acc.appType}</td>
                          <td className="p-2.5 text-gray-700">{acc.tierLabel}</td>
                          <td className="p-2.5 font-mono text-gray-800">{acc.email}</td>
                          <td className="p-2.5 font-mono text-gray-600">{acc.password}</td>
                          <td className="p-2.5 text-gray-500">{acc.pinCode || acc.notes || '-'}</td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {isAvailable ? 'พร้อมส่ง' : 'ขายแล้ว'}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono text-gray-500">
                            {acc.soldToOrderNo ? (
                              <span className="text-rose-600 font-bold">{acc.soldToOrderNo}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => handleDeleteDispatched(acc.id)}
                              className="text-red-400 hover:text-red-600 p-1 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
