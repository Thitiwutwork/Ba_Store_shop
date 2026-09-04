import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeaderBanner from './components/HeaderBanner';
import LiveCounterBar from './components/LiveCounterBar';
import PromotionSection from './components/PromotionSection';
import CategoryFilter from './components/CategoryFilter';
import ProductCard from './components/ProductCard';
import OrderModal from './components/OrderModal';
import TopupPage from './components/TopupPage';
import OrderHistoryPage from './components/OrderHistoryPage';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';

import {
  getStoreSettings,
  saveStoreSettings,
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  resetProductsToDefault,
  getPromotions,
  getCategories,
  getWalletBalance,
  getStockItems,
  addStockItem,
  deleteStockItem,
  getOrders,
  purchaseProduct,
  getTransactions,
  processSlipTopup,
  approveManualTransaction,
  rejectManualTransaction,
  getAuditLogs,
  getCurrentUser,
  logoutUser
} from './services/storageService';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState('store'); // 'store' | 'topup' | 'orders' | 'admin'

  // User & Auth State
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Application Data States
  const [storeSettings, setStoreSettings] = useState(getStoreSettings());
  const [products, setProducts] = useState(getProducts());
  const [promotions, setPromotions] = useState(getPromotions());
  const [categories] = useState(getCategories());
  const [walletBalance, setWalletBalanceState] = useState(getWalletBalance());
  const [stockItems, setStockItems] = useState(getStockItems());
  const [orders, setOrders] = useState(getOrders());
  const [transactions, setTransactions] = useState(getTransactions());
  const [auditLogs, setAuditLogs] = useState(getAuditLogs());

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [selectedProductForModal, setSelectedProductForModal] = useState(null);

  // Toast Notification State
  const [toast, setToast] = useState({ isVisible: false, message: '', icon: '✨' });

  const showToast = (message, icon = '✨') => {
    setToast({ isVisible: true, message, icon });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, isVisible: false }));
    }, 3500);
  };

  // Sync wallet on user change
  useEffect(() => {
    setWalletBalanceState(getWalletBalance());
  }, [currentUser]);

  // Switch tab helper with smooth scroll
  const handleSelectTab = (tab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth Handlers
  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setWalletBalanceState(getWalletBalance());
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    showToast('👋 ออกจากระบบเรียบร้อยแล้ว', 'ℹ️');
  };

  // Purchase Execution
  const handleConfirmPurchase = ({ productId, productName, tierLabel, price, customerNote }) => {
    const res = purchaseProduct({ productId, productName, tierLabel, price, customerNote });
    if (res.success) {
      setWalletBalanceState(res.remainingBalance);
      setOrders(getOrders());
      setStockItems(getStockItems());
      setAuditLogs(getAuditLogs());
      showToast(`🎉 สั่งซื้อสำเร็จ! ระบบจัดส่งข้อมูลเข้าคลังของคุณแล้ว`, '✅');
      handleSelectTab('orders');
    } else {
      showToast(res.error || 'เกิดข้อผิดพลาดในการสั่งซื้อ', '⚠️');
    }
  };

  // Topup Execution
  const handleProcessTopup = async ({ amount, slipImage, mockMode }) => {
    const res = await processSlipTopup({ amount, slipImage, mockMode });
    if (res.success) {
      setWalletBalanceState(getWalletBalance());
      setTransactions(getTransactions());
      setAuditLogs(getAuditLogs());
      showToast(res.message, res.mode === 'MANUAL' ? '⏳' : '💳');
      if (res.mode !== 'MANUAL') {
        handleSelectTab('store');
      }
    } else {
      showToast(res.error || 'การตรวจสอบสลิปล้มเหลว', '❌');
    }
  };

  // Admin Product Handlers
  const handleAddProduct = (productData) => {
    addProduct(productData);
    setProducts(getProducts());
    setAuditLogs(getAuditLogs());
  };

  const handleUpdateProduct = (id, productData) => {
    updateProduct(id, productData);
    setProducts(getProducts());
    setAuditLogs(getAuditLogs());
  };

  const handleDeleteProduct = (id) => {
    deleteProduct(id);
    setProducts(getProducts());
    setAuditLogs(getAuditLogs());
  };

  const handleResetProductDefaults = () => {
    if (window.confirm('ต้องการคืนค่าสินค้าทั้งหมดกลับเป็นค่าเริ่มต้นจาก workforsell หรือไม่?')) {
      resetProductsToDefault();
      setProducts(getProducts());
      setAuditLogs(getAuditLogs());
      showToast('🔄 คืนค่าสินค้าตั้งต้นสำเร็จ', '✅');
    }
  };

  // Admin Stock Handlers
  const handleAddStock = (productId, tierLabel, credentialData) => {
    addStockItem(productId, tierLabel, credentialData);
    setStockItems(getStockItems());
    setAuditLogs(getAuditLogs());
  };

  const handleDeleteStock = (id) => {
    const updated = deleteStockItem(id);
    setStockItems(updated);
    showToast('🗑️ ลบรายการสต๊อกเรียบร้อยแล้ว', 'ℹ️');
  };

  // Admin Slip Approval Handlers
  const handleApproveTransaction = (txId) => {
    const success = approveManualTransaction(txId);
    if (success) {
      setWalletBalanceState(getWalletBalance());
      setTransactions(getTransactions());
      setAuditLogs(getAuditLogs());
      showToast('✅ อนุมัติสลิปและเติมเงินเรียบร้อยแล้ว', '🎉');
    }
  };

  const handleRejectTransaction = (txId) => {
    const success = rejectManualTransaction(txId);
    if (success) {
      setTransactions(getTransactions());
      setAuditLogs(getAuditLogs());
      showToast('❌ ปฏิเสธรายการสลิปนี้แล้ว', 'ℹ️');
    }
  };

  // Admin Settings Handler
  const handleSaveSettings = (newSettings) => {
    const updated = saveStoreSettings(newSettings);
    setStoreSettings(updated);
    setAuditLogs(getAuditLogs());
  };

  // Role-Based Elevation for Admin
  const handleElevateToAdmin = () => {
    const adminSession = {
      id: 'usr-admin',
      email: 'admin@bastore.com',
      displayName: 'ผู้ดูแลระบบ (Admin)',
      role: 'admin',
      walletBalance: 9999.00
    };
    setCurrentUser(adminSession);
    setWalletBalanceState(9999.00);
  };

  const handleAdminLogout = () => {
    const guestUser = {
      id: 'usr-customer-1',
      email: 'customer@gmail.com',
      displayName: 'คุณลูกค้า VIP',
      role: 'user',
      walletBalance: 250.00
    };
    setCurrentUser(guestUser);
    setWalletBalanceState(250.00);
    handleSelectTab('store');
    showToast('🔒 ออกจากระบบจัดการหลังบ้านเรียบร้อยแล้ว', 'ℹ️');
  };

  // Filtered Products Calculation
  const filteredProducts = products.filter((prod) => {
    const matchCat =
      selectedCategory === 'ทั้งหมด' ||
      (selectedCategory === 'ซีรีส์ & หนัง' && (prod.category?.includes('ซีรีส์') || prod.category === 'ทั้งหมด')) ||
      (selectedCategory === 'บริการ OTP & เมลล์' && prod.category?.includes('OTP')) ||
      (selectedCategory === 'กราฟิก & ทำงาน' && prod.category?.includes('กราฟิก'));

    const matchQuery =
      searchQuery.trim() === '' ||
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.packageDetails?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCat && matchQuery;
  });

  const availableStockCount = stockItems.filter((s) => s.status === 'AVAILABLE').length;

  return (
    <div className="min-h-screen bg-[#FDF5F8] text-[#374151] flex flex-col justify-between selection:bg-pink-200 selection:text-pink-900 font-['Prompt']">
      
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        walletBalance={walletBalance}
        orderCount={orders.length}
        storeSettings={storeSettings}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main App Body */}
      <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-6 w-full flex-1">
        
        {/* TAB 1: STOREFRONT */}
        {currentTab === 'store' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Cover & Brand Hero matching screenshot pixel-for-pixel */}
            <HeaderBanner storeSettings={storeSettings} />

            {/* Live Counters */}
            <LiveCounterBar
              totalProducts={products.length}
              availableStock={availableStockCount}
              soldCount={orders.length}
              storeSettings={storeSettings}
            />

            {/* Duo Bundle Promotions */}
            <PromotionSection
              promotions={promotions}
              onSelectPromo={(promo) => setSelectedProductForModal(promo)}
            />

            {/* Filter & Search Bar */}
            <div className="pt-2">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>

            {/* Products Grid (2 columns on mobile, 3-4 on larger screens) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-lg font-bold text-gray-800">
                  📱 สินค้าและบริการทั้งหมด ({filteredProducts.length} รายการ)
                </h2>
                <span className="text-[11px] sm:text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  ● สต๊อกตัดอัตโนมัติ 24 ชม.
                </span>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-pink-100 shadow-sm text-gray-400">
                  <p className="text-sm font-semibold">ไม่พบสินค้าที่ตรงกับคำค้นหา "{searchQuery}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelectProduct={(p) => setSelectedProductForModal(p)}
                      stockCount={availableStockCount}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: TOPUP PAGE */}
        {currentTab === 'topup' && (
          <TopupPage
            storeSettings={storeSettings}
            walletBalance={walletBalance}
            onProcessTopup={handleProcessTopup}
            onSwitchTab={handleSelectTab}
          />
        )}

        {/* TAB 3: ORDER HISTORIES & CREDENTIAL VAULT */}
        {currentTab === 'orders' && (
          <OrderHistoryPage
            orders={orders}
            onSwitchTab={handleSelectTab}
            onShowToast={showToast}
          />
        )}

        {/* TAB 4: ADMIN DASHBOARD */}
        {currentTab === 'admin' && (
          <AdminDashboard
            storeSettings={storeSettings}
            onSaveSettings={handleSaveSettings}
            currentUser={currentUser}
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onResetProductDefaults={handleResetProductDefaults}
            stockItems={stockItems}
            onAddStock={handleAddStock}
            onDeleteStock={handleDeleteStock}
            transactions={transactions}
            onApproveTransaction={handleApproveTransaction}
            onRejectTransaction={handleRejectTransaction}
            auditLogs={auditLogs}
            onShowToast={showToast}
            onElevateToAdmin={handleElevateToAdmin}
            onAdminLogout={handleAdminLogout}
          />
        )}

      </main>

      {/* Product Spec & Tier Selector Modal */}
      <OrderModal
        isOpen={Boolean(selectedProductForModal)}
        onClose={() => setSelectedProductForModal(null)}
        product={selectedProductForModal}
        walletBalance={walletBalance}
        onConfirmPurchase={handleConfirmPurchase}
        onGoToTopup={() => {
          setSelectedProductForModal(null);
          handleSelectTab('topup');
        }}
      />

      {/* Login & Register Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        onShowToast={showToast}
      />

      {/* Floating Toast Notification */}
      <Toast
        message={toast.message}
        icon={toast.icon}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />

      {/* Store Footer */}
      <footer className="mt-12 border-t border-pink-100 bg-white/80 backdrop-blur-md py-6 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-bold text-gray-700">© 2026 {storeSettings?.storeName || 'BA STORE'}</span>
            <span className="mx-2">•</span>
            <span>ร้านจำหน่ายแอพพรีเมียมราคาส่ง ได้วันครบ 100%</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>TLS 1.3 &amp; Anti-Replay Secured</span>
            </span>
            <span>ระบบความปลอดภัย 256-bit</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
