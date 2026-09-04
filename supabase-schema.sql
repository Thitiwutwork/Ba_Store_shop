-- ==============================================================================
-- 🌸 BA STORE - Complete Production Database Schema & Seed Data
-- ==============================================================================
-- รองรับระบบ:
-- 1. Profiles & Wallet (กระเป๋าเงินผู้ใช้)
-- 2. Products & Multi-tier Pricing (ดึงจาก workforsell ครบถ้วน)
-- 3. Stock Items (คลังสต๊อกรหัสแอพ จัดส่งอัตโนมัติ)
-- 4. Orders & History (ประวัติคำสั่งซื้อและข้อมูลบัญชีที่ได้รับ)
-- 5. Topup & SlipOK Verification (ระบบเติมเงิน ป้องกันสลิปซ้ำ Anti-Replay)
-- 6. Store Settings (ตั้งค่าร้านค้า ข้อมูลติดต่อ และ SlipOK API)
-- 7. Atomic Purchase Function (ป้องกัน Race Condition / Double Spending 100%)
-- ==============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. ตาราง profiles (ข้อมูลผู้ใช้งาน และกระเป๋าเงิน Wallet)
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  wallet_balance numeric(10, 2) default 0.00 check (wallet_balance >= 0),
  role text default 'user' check (role in ('user', 'admin', 'moderator')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ------------------------------------------------------------------------------
-- 2. ตาราง categories (หมวดหมู่สินค้า)
-- ------------------------------------------------------------------------------
create table if not exists public.categories (
  id text primary key,
  name text not null,
  icon text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------------------------
-- 3. ตาราง products (สินค้าและระดับราคา Multi-tier ดึงจาก workforsell)
-- ------------------------------------------------------------------------------
create table if not exists public.products (
  id text primary key,
  name text not null,
  category text default 'ทั้งหมด',
  tag text,
  tag_color text default 'pink',
  devices text,
  resolution text,
  package_details text,
  sub_detail text,
  icon text,
  in_stock boolean default true,
  prices jsonb not null default '[]'::jsonb,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ------------------------------------------------------------------------------
-- 4. ตาราง promotions (โปรโมชั่นแพ็กเกจคู่ Duo Bundle ดึงจาก workforsell)
-- ------------------------------------------------------------------------------
create table if not exists public.promotions (
  id text primary key,
  name text not null,
  tag text,
  tag_color text default 'rose',
  app1_name text,
  app1_icon text,
  app1_devices text,
  app1_resolution text,
  app2_name text,
  app2_icon text,
  app2_devices text,
  app2_resolution text,
  original_price numeric(10, 2) not null,
  promo_price numeric(10, 2) not null,
  price_period text,
  package_details text,
  in_stock boolean default true,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ------------------------------------------------------------------------------
-- 5. ตาราง stock_items (คลังสต๊อกรหัสแอพ / บัญชีพรีเมียมสำหรับส่งมอบออโต้)
-- ------------------------------------------------------------------------------
create table if not exists public.stock_items (
  id uuid primary key default gen_random_uuid(),
  product_id text references public.products(id) on delete cascade,
  tier_label text,                  -- เช่น "เมลล์ร้าน", "ตัดพรีเมี่ยม"
  credential_data text not null,     -- อีเมล, รหัสผ่าน หรือโค้ด
  status text default 'AVAILABLE' check (status in ('AVAILABLE', 'RESERVED', 'SOLD')),
  sold_to_user_id uuid references public.profiles(id),
  sold_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_stock_lookup on public.stock_items(product_id, status);

-- ------------------------------------------------------------------------------
-- 5.1 ตาราง raw_accounts (คลังเมลเตรียมตัด - เมลเปล่ารอตัดพรีเมียมเมื่อลูกค้าสั่ง)
-- ------------------------------------------------------------------------------
create table if not exists public.raw_accounts (
  id uuid primary key default gen_random_uuid(),
  app_type text not null,           -- เช่น iQIYI, YouTube, Netflix, Viu, etc.
  email text not null,
  password text not null,
  recovery_info text,               -- เมลกู้คืน หรือเบอร์
  status text default 'เตรียมตัด' check (status in ('เตรียมตัด', 'กำลังตัด', 'ตัดแล้ว/ย้ายแล้ว')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_raw_app_status on public.raw_accounts(app_type, status);

-- ------------------------------------------------------------------------------
-- 5.2 ตาราง dispatched_accounts (คลังเมลตัดแล้ว - ตัดพรีเมียมแล้ว พร้อมส่งลูกค้า)
-- ------------------------------------------------------------------------------
create table if not exists public.dispatched_accounts (
  id uuid primary key default gen_random_uuid(),
  app_type text not null,           -- เช่น iQIYI, YouTube, Netflix, Viu, etc.
  tier_label text,                  -- เช่น "30 วัน", "90 วัน", "จอส่วนตัว 4K"
  email text not null,
  password text not null,
  pin_code text,                    -- รหัส PIN โปรไฟล์ (ถ้ามี เช่น Netflix)
  expire_date date,                 -- วันหมดอายุการใช้งาน
  status text default 'พร้อมส่ง' check (status in ('พร้อมส่ง', 'ขายแล้ว', 'ติดปัญหา')),
  sold_to_user_id uuid references public.profiles(id),
  sold_to_order_no text,
  sold_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_dispatched_app_status on public.dispatched_accounts(app_type, status);

-- ------------------------------------------------------------------------------
-- 6. ตาราง orders (ประวัติการสั่งซื้อและข้อมูลที่ลูกค้าได้รับ)
-- ------------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no text unique not null,     -- เช่น #BA-2026-XXXXX
  user_id uuid references public.profiles(id) on delete cascade,
  product_name text not null,
  tier_label text not null,
  price_paid numeric(10, 2) not null,
  delivered_credential text,         -- ข้อมูลบัญชีที่ส่งมอบให้ลูกค้า
  customer_note text,                -- กรณีเป็น "เมลล์ลูกค้า" จะเก็บอีเมลที่ลูกค้าส่งมาให้ตัด
  status text default 'COMPLETED' check (status in ('PENDING', 'PROCESSING', 'COMPLETED', 'REFUNDED')),
  created_at timestamptz default now()
);

create index if not exists idx_orders_user on public.orders(user_id, created_at desc);

-- ------------------------------------------------------------------------------
-- 7. ตาราง topup_transactions (ระบบเติมเงิน ป้องกันสลิปซ้ำ Anti-Replay)
-- ------------------------------------------------------------------------------
create table if not exists public.topup_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  amount numeric(10, 2) not null check (amount > 0),
  slip_image_url text,
  trans_ref text unique,            -- เลขอ้างอิงของธนาคารจาก SlipOK (ห้ามซ้ำกันเด็ดขาด!)
  sender_name text,
  receiver_account text,
  status text default 'PENDING' check (status in ('PENDING', 'SUCCESS', 'REJECTED', 'PENDING_REVIEW')),
  verify_mode text default 'AUTO' check (verify_mode in ('AUTO', 'MANUAL', 'MOCK')),
  reviewed_by uuid references public.profiles(id),
  reject_reason text,
  created_at timestamptz default now()
);

create unique index if not exists idx_unique_trans_ref 
on public.topup_transactions(trans_ref) 
where trans_ref is not null;

-- ------------------------------------------------------------------------------
-- 8. ตาราง store_settings (การตั้งค่าร้านค้า & ข้อมูลระบบ SlipOK)
-- ------------------------------------------------------------------------------
create table if not exists public.store_settings (
  id text primary key default 'main',
  store_name text default 'BA STORE',
  badge_text text default 'รับตัดแอพราคาส่ง',
  description text default 'ขายส่งแอพพรีเมี่ยมราคาถูกม๊ากก 💖',
  sub_description text default 'โยนหรือใช้เองก็ได้ไม่บวกเพิ่ม ได้วันใช้งานครบแน่นอน',
  opening_hours text default 'เปิด 09:00 - 23:00 น.',
  announcement text default '⚡ จัดส่งรวดเร็วทันใจภายใน 5 - 15 นาที • รับประกันดูแลตลอดการใช้งาน',
  banner_url text default '/images/banner.jpg',
  logo_url text default '/images/logo.jpg',
  line_id text default '@bastore',
  line_url text default 'https://line.me/ti/p/~@bastore',
  
  -- ตั้งค่าการตรวจสอบสลิป (SlipOK & Bank Info)
  slip_mode text default 'mock' check (slip_mode in ('auto', 'manual', 'mock')),
  slipok_api_key text,
  slipok_branch_id text,
  promptpay_number text default '0812345678',
  store_bank_name text default 'ธนาคารกสิกรไทย (KBANK)',
  store_account_name text default 'บจก. บีเอ สโตร์ ดิจิทัล (BA Store)',
  store_bank_account text default '123-4-56789-0',

  admin_pin text default '1234',
  is_maintenance boolean default false,
  updated_at timestamptz default now()
);

-- ------------------------------------------------------------------------------
-- 9. ตาราง security_audit_logs (บันทึกความปลอดภัย ตรวจสอบ IP และแฮกเกอร์)
-- ------------------------------------------------------------------------------
create table if not exists public.security_audit_logs (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,          -- 'LOGIN', 'TOPUP', 'PURCHASE', 'STOCK_DISPATCH', 'FRAUD_ALERT'
  user_id uuid references public.profiles(id) on delete set null,
  ip_address text,
  user_agent text,
  details jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- ==============================================================================
-- 🔒 DATABASE FUNCTIONS: ATOMIC TRANSACTION ป้องกัน RACE CONDITION 100%
-- ==============================================================================

create or replace function public.purchase_product_atomic(
  p_user_id uuid,
  p_product_id text,
  p_tier_label text,
  p_price numeric,
  p_customer_note text default ''
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_balance numeric;
  v_stock_id uuid;
  v_credential text;
  v_order_no text;
  v_product_name text;
begin
  -- 1. ล็อกแถวผู้ใช้และตรวจยอดเงิน (Row-Level Lock ป้องกัน Double Spending)
  select wallet_balance into v_balance
  from public.profiles
  where id = p_user_id
  for update;

  if v_balance is null then
    return jsonb_build_object('success', false, 'error', 'ไม่พบบัญชีผู้ใช้งาน');
  end if;

  if v_balance < p_price then
    return jsonb_build_object('success', false, 'error', 'ยอดเงินในกระเป๋าไม่เพียงพอ กรุณาเติมเงินก่อนทำรายการ');
  end if;

  -- 2. ดึงชื่อสินค้า
  select name into v_product_name from public.products where id = p_product_id;

  -- 3. ตรวจสอบและล็อกสต๊อก (ถ้าเป็นประเภทเมลล์ร้านหรือโค้ดพร้อมส่ง)
  select id, credential_data into v_stock_id, v_credential
  from public.stock_items
  where product_id = p_product_id 
    and (tier_label = p_tier_label or tier_label is null)
    and status = 'AVAILABLE'
  order by created_at asc
  limit 1
  for update skip locked;

  if v_stock_id is null and p_customer_note = '' then
    v_credential := 'รอแอดมินดำเนินการจัดส่งตามคิว (ภายใน 5-15 นาที)';
  elsif v_stock_id is not null then
    update public.stock_items
    set status = 'SOLD',
        sold_to_user_id = p_user_id,
        sold_at = now()
    where id = v_stock_id;
  else
    v_credential := 'ข้อมูลเมลลูกค้า: ' || p_customer_note;
  end if;

  -- 4. หักเงินในกระเป๋า
  update public.profiles
  set wallet_balance = wallet_balance - p_price,
      updated_at = now()
  where id = p_user_id;

  -- 5. สร้างเลขออเดอร์ และบันทึกลงตาราง orders
  v_order_no := 'BA-' || to_char(now(), 'YYYYMMDD') || '-' || substr(md5(random()::text), 1, 6);
  
  insert into public.orders (
    order_no, user_id, product_name, tier_label, price_paid, delivered_credential, customer_note, status
  ) values (
    v_order_no, p_user_id, coalesce(v_product_name, p_product_id), p_tier_label, p_price, v_credential, p_customer_note, 'COMPLETED'
  );

  return jsonb_build_object(
    'success', true,
    'order_no', v_order_no,
    'product_name', v_product_name,
    'delivered_credential', v_credential,
    'remaining_balance', v_balance - p_price
  );
end;
$$;

-- ==============================================================================
-- 🌸 SEED DATA: ข้อมูลสินค้าจริง ราคาจริง และไอคอนจริงจาก workforsell
-- ==============================================================================

insert into public.store_settings (
  id, store_name, badge_text, description, sub_description, opening_hours, announcement,
  banner_url, logo_url, line_id, line_url, promptpay_number, store_bank_name, store_account_name, store_bank_account
) values (
  'main', 'BA STORE', 'รับตัดแอพราคาส่ง', 'ขายส่งแอพพรีเมี่ยมราคาถูกม๊ากก 💖',
  'โยนหรือใช้เองก็ได้ไม่บวกเพิ่ม ได้วันใช้งานครบแน่นอน', 'เปิด 09:00 - 23:00 น.',
  '⚡ จัดส่งรวดเร็วทันใจภายใน 5 - 15 นาที • รับประกันดูแลตลอดการใช้งาน',
  '/images/banner.jpg', '/images/logo.jpg', '@bastore', 'https://line.me/ti/p/~@bastore',
  '0812345678', 'ธนาคารกสิกรไทย (KBANK)', 'บจก. บีเอ สโตร์ ดิจิทัล (BA Store)', '123-4-56789-0'
) on conflict (id) do nothing;

insert into public.categories (id, name, icon, sort_order) values
  ('all', 'ทั้งหมด', '🌟', 1),
  ('series', 'ซีรีส์ & หนัง', '🎬', 2),
  ('otp', 'บริการ OTP & เมลล์', '🔑', 3),
  ('work', 'กราฟิก & ทำงาน', '💻', 4)
on conflict (id) do nothing;

-- 1. iQIYI มาตรฐาน ( 90 วัน )
insert into public.products (
  id, name, category, tag, tag_color, devices, resolution, package_details, sub_detail,
  prices, icon, in_stock, sort_order
) values (
  'prod-pgvqxnw',
  'iQIYI มาตรฐาน ( 90 วัน )',
  'ทั้งหมด',
  '🔥 ยอดนิยม',
  'pink',
  'ดูพร้อมกันได้ 2 อุปกรณ์',
  'ความคมชัด 1080P (Full HD)',
  '- ไม่มีโฆษณาคั่น\n- รับชมหนังสุดฮอตก่อนใคร\n- ระบบเสียง Dolby',
  'ใช้ได้หลายอุปกรณ์',
  '[
    {"id": "price-1", "label": "เมลล์ลูกค้า", "price": "206", "period": "90 วัน"},
    {"id": "price-2", "label": "เมลล์ร้าน", "price": "209", "period": "90 วัน"}
  ]'::jsonb,
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="%2324C653"/><rect x="20" y="24" width="60" height="52" rx="14" fill="none" stroke="white" stroke-width="8"/><text x="50" y="58" fill="white" font-size="22" font-family="Arial,sans-serif" font-weight="900" text-anchor="middle" letter-spacing="1">iQIYI</text></svg>',
  true,
  1
) on conflict (id) do update set prices = excluded.prices, name = excluded.name;

-- 2. iQIYI มาตรฐาน ( 30 วัน )
insert into public.products (
  id, name, category, tag, tag_color, devices, resolution, package_details, sub_detail,
  prices, icon, in_stock, sort_order
) values (
  'prod-nd2ciam',
  'iQIYI มาตรฐาน ( 30 วัน )',
  'ทั้งหมด',
  '⭐ ขายดีอันดับ 1',
  'pink',
  'ดูพร้อมกันได้ 2 อุปกรณ์',
  'ความคมชัด 1080P (Full HD)',
  '- ไม่มีโฆษณาคั่น\n- รับชมหนังสุดฮอตก่อนใคร\n- ระบบเสียง Dolby',
  'ใช้ได้หลายอุปกรณ์',
  '[
    {"id": "price-1", "label": "เมลล์ลูกค้า", "price": "56", "period": "30 วัน"},
    {"id": "price-2", "label": "เมลล์ร้าน", "price": "59", "period": "30 วัน"}
  ]'::jsonb,
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="%2324C653"/><rect x="20" y="24" width="60" height="52" rx="14" fill="none" stroke="white" stroke-width="8"/><text x="50" y="58" fill="white" font-size="22" font-family="Arial,sans-serif" font-weight="900" text-anchor="middle" letter-spacing="1">iQIYI</text></svg>',
  true,
  2
) on conflict (id) do update set prices = excluded.prices, name = excluded.name;

-- 3. iQIYI มาตรฐาน ( 7 วัน )
insert into public.products (
  id, name, category, tag, tag_color, devices, resolution, package_details, sub_detail,
  prices, icon, in_stock, sort_order
) values (
  'prod-h8cv3jj',
  'iQIYI มาตรฐาน ( 7 วัน )',
  'ทั้งหมด',
  'ทดลองใช้',
  'pink',
  'ดูพร้อมกันได้ 2 อุปกรณ์',
  'ความคมชัด 1080P (Full HD)',
  '- ไม่มีโฆษณาคั่น\n- รับชมหนังสุดฮอตก่อนใคร\n- ระบบเสียง Dolby',
  'ใช้ได้หลายอุปกรณ์',
  '[
    {"id": "price-1", "label": "เมลล์ลูกค้า", "price": "15", "period": "7 วัน"},
    {"id": "price-2", "label": "เมลล์ร้าน", "price": "15", "period": "7 วัน"}
  ]'::jsonb,
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="%2324C653"/><rect x="20" y="24" width="60" height="52" rx="14" fill="none" stroke="white" stroke-width="8"/><text x="50" y="58" fill="white" font-size="22" font-family="Arial,sans-serif" font-weight="900" text-anchor="middle" letter-spacing="1">iQIYI</text></svg>',
  true,
  3
) on conflict (id) do update set prices = excluded.prices, name = excluded.name;

-- 4. YouTube Premium สั้น & ปลดยืนยัน
insert into public.products (
  id, name, category, tag, tag_color, devices, resolution, package_details, sub_detail,
  prices, icon, in_stock, sort_order
) values (
  'prod-3wu3py8',
  'Youtube สั้น',
  'ทั้งหมด',
  '🔥 ฮิตมาก',
  'pink',
  'ใช้อีเมลตัวเอง ดูได้ทุกอุปกรณ์',
  'ไม่มีโฆษณาคั่น ฟังเพลงจอดับได้',
  'บริการตัดพรีเมี่ยม และปลดยืนยันสิทธิ์สำหรับเมลที่สิทธิ์เต็ม',
  'ทำรายการไว 5 นาที',
  '[
    {"id": "price-1", "label": "ปลดยืนยันสิทธิ์", "price": "7", "period": "ครั้ง"},
    {"id": "price-2", "label": "ตัดพรีเมี่ยมเมลล์ลูกค้า", "price": "10", "period": "เดือน"},
    {"id": "price-3", "label": "ปลดยืนยันสิทธิ์ + ตัดพรีเมี่ยม", "price": "14", "period": "เดือน"}
  ]'::jsonb,
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="%23FF0000"/><path d="M72 36c-.8-3-3.2-5.4-6.2-6.2C60.3 28 50 28 50 28s-10.3 0-15.8 1.8c-3 .8-5.4 3.2-6.2 6.2C26 41.5 26 50 26 50s0 8.5 1.8 14c.8 3 3.2 5.4 6.2 6.2 5.5 1.8 15.8 1.8 15.8 1.8s10.3 0 15.8-1.8c3-.8 5.4-3.2 6.2-6.2 1.8-5.5 1.8-14 1.8-14s0-8.5-1.8-14z" fill="white"/><polygon points="45,42 45,58 59,50" fill="%23FF0000"/></svg>',
  true,
  4
) on conflict (id) do update set prices = excluded.prices, name = excluded.name;

-- 5. OTP (รหัสยืนยันเบอร์โทรศัพท์สารพัดแอพ)
insert into public.products (
  id, name, category, tag, tag_color, devices, resolution, package_details, sub_detail,
  prices, icon, in_stock, sort_order
) values (
  'prod-sifqjvy',
  'OTP',
  'ทั้งหมด',
  '⚡ ออโต้โค้ด',
  'pink',
  'ระบบรับโค้ดรวดเร็ว',
  'จัดส่ง OTP ภายใน 3-5 นาที',
  'บริการรับรหัสยืนยัน OTP สำหรับสมัครและเข้าสู่ระบบแอพต่างๆ',
  'มีทั้งแบบเก็บเบอร์และไม่เก็บเบอร์',
  '[
    {"id": "price-1", "label": "Gmail (ไม่เก็บเบอร์)", "price": "10", "period": "ครั้ง"},
    {"id": "price-2", "label": "Gmail (เก็บเบอร์)", "price": "35", "period": "7 วัน"},
    {"id": "price-3", "label": "Netflix", "price": "10", "period": "ครั้ง"},
    {"id": "price-4", "label": "Facebook", "price": "10", "period": "ครั้ง"},
    {"id": "price-5", "label": "Tiktok", "price": "20", "period": "ครั้ง"},
    {"id": "price-6", "label": "Shopee", "price": "20", "period": "ครั้ง"}
  ]'::jsonb,
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="%23F3F4F6"/><rect x="28" y="15" width="44" height="70" rx="8" fill="none" stroke="%23374151" stroke-width="4"/><circle cx="50" cy="76" r="3" fill="%23374151"/><circle cx="50" cy="42" r="16" fill="none" stroke="%23E11D48" stroke-width="3"/><text x="50" y="46" fill="%23E11D48" font-size="10" font-family="Arial,sans-serif" font-weight="900" text-anchor="middle">OTP</text></svg>',
  true,
  5
) on conflict (id) do update set prices = excluded.prices, name = excluded.name;

-- ------------------------------------------------------------------------------
-- โปรโมชั่นคู่สุดคุ้ม (Duo Bundle) ดึงจาก workforsell
-- ------------------------------------------------------------------------------
insert into public.promotions (
  id, name, tag, tag_color,
  app1_name, app1_icon, app1_devices, app1_resolution,
  app2_name, app2_icon, app2_devices, app2_resolution,
  original_price, promo_price, price_period, package_details, in_stock, sort_order
) values
(
  'promo-1',
  'แพ็กคู่สุดคุ้ม: iQIYI (7 วัน) + Viu Premium (7 วัน)',
  '🔥 โปรคู่สุดฮิต',
  'rose',
  'iQIYI',
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="%2324C653"/><rect x="20" y="24" width="60" height="52" rx="14" fill="none" stroke="white" stroke-width="8"/><text x="50" y="58" fill="white" font-size="22" font-family="Arial,sans-serif" font-weight="900" text-anchor="middle" letter-spacing="1">iQIYI</text></svg>',
  'ดูพร้อมกันได้ 2 อุปกรณ์',
  'Full HD 1080p คมชัดระดับสูง',
  'Viu',
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="%23F6BE00"/><text x="50" y="60" fill="%23111111" font-size="30" font-family="Arial,sans-serif" font-weight="900" text-anchor="middle">Viu</text></svg>',
  'ดูได้ 3 อุปกรณ์ ( ทรส 2 / เว็บ 1 )',
  'Full HD 1080p ไม่มีโฆษณาคั่น',
  30.00,
  25.00,
  '/ 7 วัน',
  '• ได้รับ 2 แอพพร้อมกัน: iQIYI 7 วัน + Viu 7 วัน\n• iQIYI: ดูพร้อมกันได้ 2 อุปกรณ์\n• Viu: ดูได้ 3 อุปกรณ์ (ทรส 2 / เว็บ 1)\n• ประหยัดทันที ฿5 จากราคาปกติ ฿30 เหลือเพียง ฿25\n• บัญชีแท้ 100% จัดส่งไว ดูแลตลอดการใช้งาน',
  true,
  1
),
(
  'promo-2',
  'แพ็กคู่บันเทิงคูณสอง: Netflix 4K + YouTube Premium (30 วัน)',
  '⭐ เซฟคุ้มสุด',
  'amber',
  'Netflix',
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="%23141414"/><path d="M32 20h11.5v60H32zm24.5 0H68v60H56.5z" fill="%23E50914"/><path d="M32 20h12l24 60H56z" fill="%23B81D24"/></svg>',
  '1 จอ (ล็อกอินได้มือถือ / แท็บเล็ต / ทีวี)',
  'Ultra HD 4K + ระบบเสียง Spatial Audio',
  'YouTube',
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="%23FF0000"/><path d="M72 36c-.8-3-3.2-5.4-6.2-6.2C60.3 28 50 28 50 28s-10.3 0-15.8 1.8c-3 .8-5.4 3.2-6.2 6.2C26 41.5 26 50 26 50s0 8.5 1.8 14c.8 3 3.2 5.4 6.2 6.2 5.5 1.8 15.8 1.8 15.8 1.8s10.3 0 15.8-1.8c3-.8 5.4-3.2 6.2-6.2 1.8-5.5 1.8-14 1.8-14s0-8.5-1.8-14z" fill="white"/><polygon points="45,42 45,58 59,50" fill="%23FF0000"/></svg>',
  'ใช้อีเมลตัวเอง ดูได้ทุกอุปกรณ์',
  'ไม่มีโฆษณาคั่น ฟังเพลงจอดับได้',
  250.00,
  219.00,
  '/ 30 วัน',
  '• แพ็กเกจสุดฮิตตลอดกาล Netflix 4K + YouTube Premium\n• Netflix: รับชมได้ 1 จอ ความคมชัด Ultra HD 4K\n• YouTube: ใช้อีเมลตัวเอง ฟังเพลงจอดับได้ ไม่มีโฆษณาคั่น\n• ประหยัดทันที ฿31 คุ้มกว่าซื้อแยกเดี่ยว\n• บัญชีแท้ ไม่เด้ง ดูแลตลอด 30 วันเต็ม',
  true,
  2
)
on conflict (id) do nothing;
