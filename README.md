# 🌸 BA STORE - Web Application (Digital Goods & Premium Reseller Platform)

เว็บแอปพลิเคชันสั่งซื้อสินค้าและบริการดิจิทัลอัตโนมัติ สไตล์ **Modern Pastel** ออกแบบตามสเปก `workforsell` และระบบสั่งซื้อ e-commerce แบบเดียวกับ `stickerlineanan.rdcw.xyz` ครบครันทั้งระบบกระเป๋าเงิน (Wallet), ตรวจสอบสลิปโอนเงิน (PromptPay QR & SlipOK), ส่งมอบรหัสในสต๊อกทันที, และระบบแอดมินหลังบ้าน (Admin CMS) พร้อมมาตรการความปลอดภัยไซเบอร์ระดับองค์กร

---

## ✨ ฟีเจอร์หลักของระบบ

### 1. หน้าร้านค้า (Storefront)
- **Cover Banner & Logo:** แสดงภาพแบนเนอร์และโลโก้ของแท้จากร้าน พร้อมแถบประกาศอัปเดตแบบเรียลไทม์
- **สถิติสด (Live Counters):** แสดงจำนวนผู้ใช้ทั้งหมด, สินค้าในระบบ, สต๊อกพร้อมส่ง, และจำนวนที่จำหน่ายแล้ว
- **โปรโมชั่นแพ็กเกจคู่ (Duo Bundle):** รวมคู่แอพยอดนิยมพร้อมคำนวณส่วนลดทันที (เช่น iQIYI 7 วัน + Viu 7 วัน เพียง ฿25, Netflix 4K + YouTube Premium เพียง ฿219)
- **สินค้าและราคาหลายระดับ (Multi-tier Pricing):**
  - **iQIYI มาตรฐาน (7 วัน, 30 วัน, 90 วัน):** เลือกได้ระหว่าง "เมลล์ลูกค้า" หรือ "เมลล์ร้าน"
  - **YouTube Premium สั้น:** เลือกระหว่าง "ปลดยืนยันสิทธิ์ (฿7)", "ตัดพรีเมี่ยม (฿10)", หรือ "คอมโบ (฿14)"
  - **OTP Services:** บริการรับรหัสยืนยันสำหรับ Gmail, Netflix, Facebook, TikTok, Shopee
  - **Streaming & Apps:** Netflix 4K, Viu Premium, Canva Pro 1 ปี

### 2. ระบบกระเป๋าเงิน & เติมเงิน (Wallet & Slip Verification)
- กระเป๋าเงินอิเล็กทรอนิกส์ แสดงยอดเงินคงเหลือแบบเรียลไทม์
- ระบบสร้าง PromptPay QR พร้อมเลขอ้างอิงอัตโนมัติ
- **ระบบ Hybrid Verification Engine:**
  - `Mock Mode`: โหมดจำลองเพื่อทดสอบระบบได้ฟรี ไม่เสียเครดิตสลิป
  - `SlipOK Auto Mode`: ตรวจสอบสลิปผ่าน AI อัตโนมัติ ป้องกันสลิปวนใช้ซ้ำ (Anti-Replay)
  - `Manual Mode`: ส่งสลิปเข้าคิวรอให้แอดมินกดอนุมัติที่หลังบ้าน

### 3. คลังรหัสของฉัน & ส่งมอบอัตโนมัติ (Instant Delivery & Vault)
- เมื่อกดสั่งซื้อ ระบบจะตัดสต๊อกและหักเงินในกระเป๋าเงินแบบ **Atomic Transaction**
- ส่งมอบข้อมูลอีเมลและรหัสผ่านเข้าหน้า "ประวัติคำสั่งซื้อ & คลังรหัสของฉัน" ทันที
- ปุ่มกด **"คัดลอกรหัส"** ใน 1 คลิก พร้อมระบุวันหมดอายุและการรับประกัน

### 4. ระบบจัดการหลังบ้าน (Admin CMS)
- เข้าสู่ระบบด้วยรหัส PIN (ค่าเริ่มต้น: `1234`)
- **จัดการสต๊อก (Stock Manager):** เพิ่มรหัสแอพ/โค้ดเข้าคลัง ดูสต๊อกคงเหลือ ลบรายการ
- **คิวตรวจสลิป (Manual Approval Queue):** ดูภาพสลิปที่ลูกค้าแนบมา กด "อนุมัติ" หรือ "ปฏิเสธ"
- **ตั้งค่าร้านค้า & SlipOK:** แก้ไขชื่อร้าน, ประกาศ, LINE URL, และใส่ SlipOK API Key / Branch ID
- **Security & Audit Logs:** บันทึกประวัติการทำรายการ, การเติมเงิน, และตรวจสอบความปลอดภัย

---

## 🚀 วิธีเปิดใช้งานระบบบนเครื่องของคุณ (Local Development)

1. เปิด Terminal / PowerShell ที่โฟลเดอร์นี้:
   ```bash
   cd "c:\Users\ACER\OneDrive\Desktop\store"
   ```

2. รัน Dev Server:
   ```bash
   npm run dev
   ```

3. เปิดเบราว์เซอร์ตามลิงก์ที่แสดง (เช่น `http://localhost:5173`)

---

## ☁️ การนำขึ้น Vercel (Vercel Production Deployment)

1. นำโค้ดเข้าสู่ **GitHub** เรียบร้อยแล้ว
2. เข้าสู่ระบบ [https://vercel.com](https://vercel.com) แล้วกด **"Add New Project"** -> เลือกคลัง `Ba_Store_shop`
3. ก่อนกด Deploy ให้ไปที่หัวข้อ **Environment Variables** แล้วเพิ่มค่าความลับดังนี้:
   - `SLIP2GO_API_KEY` = `EwX99Tg_lRWs0SVPGnKlM4NN3j21CY3o1b_XFLkoUBE=` (Secret Key ของ Slip2Go)
   - `ADMIN_PIN` = `1234`
   - `PROMPTPAY_NUMBER` = `0982824986`
4. กด **Deploy** ระบบ Vercel จะสร้างเว็บพร้อม Serverless Function สำหรับตรวจสลิปให้ทันทีโดยไม่มีการเปิดเผย API Key ออกสู่หน้าเว็บภายนอก 100%

---

## 🗄️ การติดตั้งฐานข้อมูล Supabase (Production Database Setup)

1. เข้าสู่ระบบ [https://supabase.com](https://supabase.com) และสร้างโปรเจกต์ใหม่
2. ไปที่เมนู **SQL Editor** ด้านซ้ายมือ
3. คัดลอกโค้ดทั้งหมดในไฟล์ `supabase-schema.sql` ไปวางแล้วกดปุ่ม **Run** สีเขียว
4. ระบบจะสร้างตารางทั้งหมด (`profiles`, `products`, `promotions`, `stock_items`, `orders`, `topup_transactions`, `store_settings`, `security_audit_logs`) พร้อมนำเข้าข้อมูลสินค้าเริ่มต้นให้ครบถ้วนทันที

---

## 🛡️ มาตรการความปลอดภัยไซเบอร์ (Cybersecurity)
- **Anti-Replay Protection:** ป้องกันการนำสลิปเก่ามาใช้ซ้ำด้วยการเช็ค Slip Hash / Bank `trans_ref`
- **ACID Row-Level Locking:** ป้องกัน Race Condition และเงินติดลบเมื่อสั่งซื้อพร้อมกัน
- **Anti-Tampering:** ระบบป้องกันการเปิด F12 Console ขโมย Source Code
- **Field-Level Encryption Ready:** รองรับการเข้ารหัส AES-256-GCM สำหรับข้อมูลรหัสผ่านในคลังสต๊อก
