-- ==============================================================================
-- 🌸 BA STORE - Dedicated Production Database Schema (Prefix: ba_*)
-- 🛡️ ป้องกันตารางและข้อมูลไปทับกับเว็บอื่น 100% (ตารางแยกอิสระ)
-- ==============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. ตาราง ba_users (ข้อมูลสมาชิก รหัสผ่าน และยอดเงินกระเป๋า Wallet)
-- ------------------------------------------------------------------------------
create table if not exists public.ba_users (
  id text primary key,
  email text unique not null,
  password text not null,
  display_name text,
  wallet_balance numeric(10, 2) default 0.00 check (wallet_balance >= 0),
  role text default 'user' check (role in ('user', 'admin', 'moderator')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ------------------------------------------------------------------------------
-- 2. ตาราง ba_products (สินค้าและระดับราคา Multi-tier)
-- ------------------------------------------------------------------------------
create table if not exists public.ba_products (
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
-- 3. ตาราง ba_promotions (โปรโมชั่นแพ็กเกจคู่ Duo Bundle)
-- ------------------------------------------------------------------------------
create table if not exists public.ba_promotions (
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
-- 4. ตาราง ba_orders (ประวัติคำสั่งซื้อและบัญชีที่ลูกค้าได้รับ)
-- ------------------------------------------------------------------------------
create table if not exists public.ba_orders (
  id text primary key,
  order_no text unique not null,
  user_email text,
  user_id text,
  product_name text not null,
  tier_label text not null,
  price_paid numeric(10, 2) not null,
  delivered_credential text,
  customer_note text,
  status text default 'COMPLETED',
  created_at timestamptz default now()
);

-- ------------------------------------------------------------------------------
-- 5. ตาราง ba_raw_accounts (คลังเมลเตรียมตัด - เมลเปล่ารอตัดพรีเมียม)
-- ------------------------------------------------------------------------------
create table if not exists public.ba_raw_accounts (
  id text primary key,
  app_type text not null,
  email text not null,
  password text not null,
  recovery_info text,
  status text default 'เตรียมตัด',
  notes text,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------------------------
-- 6. ตาราง ba_dispatched_accounts (คลังเมลตัดแล้ว - พร้อมส่งลูกค้า)
-- ------------------------------------------------------------------------------
create table if not exists public.ba_dispatched_accounts (
  id text primary key,
  app_type text not null,
  tier_label text,
  email text not null,
  password text not null,
  pin_code text,
  expire_date date,
  status text default 'พร้อมส่ง',
  sold_to_order_no text,
  sold_at timestamptz,
  notes text,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------------------------
-- 7. ตาราง ba_stock_items (คลังสต๊อกรหัสแอพทั่วไป)
-- ------------------------------------------------------------------------------
create table if not exists public.ba_stock_items (
  id text primary key,
  product_id text,
  tier_label text,
  credential_data text not null,
  status text default 'AVAILABLE',
  sold_at timestamptz,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------------------------
-- 8. ตาราง ba_transactions (ประวัติการเติมเงิน & สลิปพร้อมเพย์)
-- ------------------------------------------------------------------------------
create table if not exists public.ba_transactions (
  id text primary key,
  amount numeric(10, 2) not null,
  trans_ref text,
  sender_name text,
  status text default 'SUCCESS',
  verify_mode text default 'AUTO',
  created_at timestamptz default now()
);

-- ------------------------------------------------------------------------------
-- 9. ตาราง ba_store_settings (ตั้งค่าร้านค้า ข้อมูลติดต่อ เบอร์พร้อมเพย์)
-- ------------------------------------------------------------------------------
create table if not exists public.ba_store_settings (
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
  promptpay_number text default '0982824986',
  admin_pin text default '1234',
  updated_at timestamptz default now()
);

-- ------------------------------------------------------------------------------
-- 10. ตาราง ba_store_data (คลังข้อมูล JSON ไฮบริดสำหรับ Realtime Sync)
-- ------------------------------------------------------------------------------
create table if not exists public.ba_store_data (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- ------------------------------------------------------------------------------
-- 🔓 ปลดล็อคความปลอดภัย (RLS) สำหรับตาราง ba_* ทั้งหมด 100%
-- ------------------------------------------------------------------------------
alter table public.ba_users disable row level security;
alter table public.ba_products disable row level security;
alter table public.ba_promotions disable row level security;
alter table public.ba_orders disable row level security;
alter table public.ba_raw_accounts disable row level security;
alter table public.ba_dispatched_accounts disable row level security;
alter table public.ba_stock_items disable row level security;
alter table public.ba_transactions disable row level security;
alter table public.ba_store_settings disable row level security;
alter table public.ba_store_data disable row level security;

-- ------------------------------------------------------------------------------
-- ⚡ เปิดใช้งาน Supabase Realtime สำหรับตารางของ BA STORE
-- ------------------------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.ba_store_data;
  alter publication supabase_realtime add table public.ba_users;
  alter publication supabase_realtime add table public.ba_orders;
  alter publication supabase_realtime add table public.ba_products;
exception
  when others then null;
end $$;

-- ------------------------------------------------------------------------------
-- 🌸 SEED DATA: บัญชีแอดมิน, บัญชีที่คุณสมัครไว้ และการตั้งค่าร้านค้า
-- ------------------------------------------------------------------------------
insert into public.ba_users (id, email, password, display_name, role, wallet_balance)
values 
  ('usr-admin', 'admin@bastore.com', 'admin', 'ผู้ดูแลระบบ (Admin)', 'admin', 0.00),
  ('usr-customer', 'Thitiwutpukpinyo@gmail.com', 'Thitiwut123#.', 'f', 'user', 0.00)
on conflict (email) do update set password = excluded.password, display_name = excluded.display_name;

insert into public.ba_store_settings (id, store_name, badge_text, promptpay_number, admin_pin)
values ('main', 'BA STORE', 'รับตัดแอพราคาส่ง', '0982824986', '1234')
on conflict (id) do nothing;
