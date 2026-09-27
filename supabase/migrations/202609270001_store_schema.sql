-- Ala Kayfak store schema. Run once from Supabase SQL Editor or with `supabase db push`.
create extension if not exists pgcrypto;

do $$ begin
  create type public.order_status as enum ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
exception when duplicate_object then null;
end $$;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default 'مدير المتجر',
  role text not null default 'admin' check (role in ('owner', 'admin')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  subtitle text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2) check (compare_at_price is null or compare_at_price >= price),
  image_url text,
  badge text,
  colors text[] not null default '{}',
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  sales_count integer not null default 0 check (sales_count >= 0),
  featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create sequence if not exists public.order_number_seq start 1001;
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('AK-' || to_char(now(), 'YYMMDD') || '-' || lpad(nextval('public.order_number_seq')::text, 4, '0')),
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  city text not null,
  district text not null,
  address text not null,
  notes text,
  subtotal numeric(10,2) not null check (subtotal >= 0),
  shipping numeric(10,2) not null default 0 check (shipping >= 0),
  total numeric(10,2) not null check (total >= 0),
  status public.order_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_image text,
  unit_price numeric(10,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0 and quantity <= 50),
  color text,
  created_at timestamptz not null default now()
);

create table if not exists public.store_settings (
  id smallint primary key default 1 check (id = 1),
  store_name text not null default 'على كيفك',
  phone text not null default '',
  whatsapp text not null default '',
  email text not null default '',
  instagram text not null default '',
  currency text not null default 'ر.س',
  shipping_fee numeric(10,2) not null default 20 check (shipping_fee >= 0),
  free_shipping_threshold numeric(10,2) not null default 350 check (free_shipping_threshold >= 0),
  banner_discount text not null default 'خصم 25%',
  banner_title text not null default 'على مختارات هذا الأسبوع',
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists categories_updated_at on public.categories;
create trigger categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at before update on public.orders for each row execute function public.set_updated_at();
drop trigger if exists settings_updated_at on public.store_settings;
create trigger settings_updated_at before update on public.store_settings for each row execute function public.set_updated_at();

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.admin_users where user_id = auth.uid() and active); $$;

-- The first authenticated admin@alakayfak.com account can safely claim ownership once.
create or replace function public.claim_first_admin(p_full_name text default 'مدير المتجر') returns boolean
language plpgsql security definer set search_path = public
as $$
declare v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
begin
  if auth.uid() is null or v_email <> 'admin@alakayfak.com' then return false; end if;
  if exists(select 1 from public.admin_users) then return exists(select 1 from public.admin_users where user_id = auth.uid()); end if;
  insert into public.admin_users(user_id, full_name, role) values (auth.uid(), coalesce(nullif(trim(p_full_name), ''), 'مدير المتجر'), 'owner');
  return true;
end;
$$;

alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.store_settings enable row level security;

drop policy if exists "admins can read own profile" on public.admin_users;
create policy "admins can read own profile" on public.admin_users for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists "owners manage admins" on public.admin_users;
create policy "owners manage admins" on public.admin_users for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "public reads active categories" on public.categories;
create policy "public reads active categories" on public.categories for select to anon, authenticated using (is_active or public.is_admin());
drop policy if exists "admins manage categories" on public.categories;
create policy "admins manage categories" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "public reads active products" on public.products;
create policy "public reads active products" on public.products for select to anon, authenticated using (is_active or public.is_admin());
drop policy if exists "admins manage products" on public.products;
create policy "admins manage products" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage orders" on public.orders;
create policy "admins manage orders" on public.orders for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins manage order items" on public.order_items;
create policy "admins manage order items" on public.order_items for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "public reads settings" on public.store_settings;
create policy "public reads settings" on public.store_settings for select to anon, authenticated using (true);
drop policy if exists "admins update settings" on public.store_settings;
create policy "admins update settings" on public.store_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.create_order(p_customer jsonb, p_items jsonb, p_notes text default null) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_item jsonb; v_product public.products%rowtype; v_quantity integer; v_subtotal numeric(10,2) := 0;
  v_shipping numeric(10,2); v_threshold numeric(10,2); v_order_id uuid; v_order_number text;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 30 then raise exception 'Invalid order items'; end if;
  if length(trim(coalesce(p_customer ->> 'full_name', ''))) < 2 or length(trim(coalesce(p_customer ->> 'phone', ''))) < 8 or position('@' in coalesce(p_customer ->> 'email', '')) < 2 then raise exception 'Invalid customer information'; end if;
  for v_item in select value from jsonb_array_elements(p_items) loop
    v_quantity := coalesce((v_item ->> 'quantity')::integer, 0);
    if v_quantity < 1 or v_quantity > 50 then raise exception 'Invalid quantity'; end if;
    select * into v_product from public.products where id = (v_item ->> 'product_id')::uuid and is_active for update;
    if not found or v_product.stock_quantity < v_quantity then raise exception 'Product is unavailable'; end if;
    v_subtotal := v_subtotal + (v_product.price * v_quantity);
  end loop;
  select shipping_fee, free_shipping_threshold into v_shipping, v_threshold from public.store_settings where id = 1;
  v_shipping := case when v_subtotal >= coalesce(v_threshold, 350) then 0 else coalesce(v_shipping, 20) end;
  insert into public.orders(customer_name, customer_phone, customer_email, city, district, address, notes, subtotal, shipping, total)
  values (trim(p_customer ->> 'full_name'), trim(p_customer ->> 'phone'), lower(trim(p_customer ->> 'email')), trim(p_customer ->> 'city'), trim(p_customer ->> 'district'), trim(p_customer ->> 'address'), nullif(trim(p_notes), ''), v_subtotal, v_shipping, v_subtotal + v_shipping)
  returning id, order_number into v_order_id, v_order_number;
  for v_item in select value from jsonb_array_elements(p_items) loop
    v_quantity := (v_item ->> 'quantity')::integer;
    select * into v_product from public.products where id = (v_item ->> 'product_id')::uuid;
    insert into public.order_items(order_id, product_id, product_name, product_image, unit_price, quantity, color) values (v_order_id, v_product.id, v_product.name, v_product.image_url, v_product.price, v_quantity, left(v_item ->> 'color', 30));
    update public.products set stock_quantity = stock_quantity - v_quantity, sales_count = sales_count + v_quantity where id = v_product.id;
  end loop;
  return jsonb_build_object('id', v_order_id, 'order_number', v_order_number, 'total', v_subtotal + v_shipping);
end;
$$;

revoke all on function public.claim_first_admin(text) from public;
grant execute on function public.claim_first_admin(text) to authenticated;
revoke all on function public.create_order(jsonb, jsonb, text) from public;
grant execute on function public.create_order(jsonb, jsonb, text) to anon, authenticated;
grant select on public.categories, public.products, public.store_settings to anon, authenticated;
grant select, insert, update, delete on public.categories, public.products, public.orders, public.order_items, public.store_settings, public.admin_users to authenticated;

insert into public.store_settings(id, store_name, phone, whatsapp, email, instagram) values (1, 'على كيفك', '+966 50 000 0000', '966500000000', 'hello@alakayfak.com', 'https://instagram.com') on conflict (id) do nothing;
insert into public.categories(id, slug, label, subtitle, image_url, sort_order) values
('10000000-0000-4000-8000-000000000001','handbags','حقائب يد','عملية وأنيقة','/products/bag-blush.png',1),
('10000000-0000-4000-8000-000000000002','shoulder','حقائب كتف','لإطلالة يومية','/products/bag-lavender.png',2),
('10000000-0000-4000-8000-000000000003','crossbody','حقائب كروس','خفيفة ومريحة','/products/bag-sage.png',3),
('10000000-0000-4000-8000-000000000004','evening','حقائب مناسبات','للحظات الخاصة','/products/bag-evening.png',4)
on conflict (slug) do update set label=excluded.label, subtitle=excluded.subtitle, image_url=excluded.image_url, sort_order=excluded.sort_order;

insert into public.products(id,category_id,name,slug,description,price,compare_at_price,image_url,badge,colors,stock_quantity,sales_count,featured) values
('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','حقيبة نُور العملية','noor-handbag','حقيبة يد أنيقة بمساحة عملية وحزام كتف قابل للإزالة، تناسب يومك من الصباح للمساء.',229,269,'/products/bag-blush.png','الأكثر مبيعاً',array['#deb0ad','#2d2b2d','#d8d1bd'],18,34,true),
('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','حقيبة لافندر الناعمة','lavender-shoulder','حقيبة كتف ناعمة بخطوط منحنية وقفل ذهبي هادئ، خفيفة وسهلة التنسيق.',189,null,'/products/bag-lavender.png','وصل حديثاً',array['#b5a2cd','#d5b8bd','#25262b'],15,20,true),
('20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000003','حقيبة رُبى كروس','ruba-crossbody','حقيبة كروس مدمجة بحزام قابل للتعديل، تمنحك حرية الحركة وتحفظ أساسياتك بأناقة.',169,null,'/products/bag-sage.png',null,array['#adb99d','#d0b9a6','#28323a'],22,18,false),
('20000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000004','حقيبة سَحابة للمناسبات','sahaba-evening','حقيبة مناسبات بتصميم هلالي وسلسلة ذهبية رقيقة، تكمل إطلالتك بلمسة ناعمة.',199,235,'/products/bag-evening.png','خصم 15%',array['#ece5d9','#d7acae','#b7b3a5'],9,29,true),
('20000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000001','حقيبة رَواء اليومية','rawaa-daily','حقيبة يومية رحبة بجيوب منظمة وإغلاق آمن، مصممة لترافقك في العمل والمشاوير.',245,null,'/products/bag-blush.png','اختيارنا لكِ',array['#d8a8a3','#6b463d','#e9dfd3'],11,14,false),
('20000000-0000-4000-8000-000000000006','10000000-0000-4000-8000-000000000002','حقيبة أُنس الصغيرة','ons-mini','تصميم صغير وخفيف مع حزام كتف مريح ومساحة كافية لكل أساسياتك اليومية.',149,179,'/products/bag-lavender.png',null,array['#aa95c1','#e6c6ca','#23262b'],24,11,false),
('20000000-0000-4000-8000-000000000007','10000000-0000-4000-8000-000000000003','حقيبة مَدى المرنة','mada-crossbody','حقيبة كروس مرنة للاستخدام اليومي بحزام طويل قابل للتعديل وتفاصيل عملية.',179,null,'/products/bag-sage.png','شحن مجاني',array['#9ba98e','#c9ad94','#1f3035'],16,17,false),
('20000000-0000-4000-8000-000000000008','10000000-0000-4000-8000-000000000004','حقيبة لُجين المسائية','lujain-evening','حقيبة مسائية رقيقة بلمعة هادئة وسلسلة أنيقة، مثالية للدعوات والمناسبات.',215,259,'/products/bag-evening.png','كمية محدودة',array['#e5ded1','#c89b9e','#aaa596'],6,9,false)
on conflict (slug) do nothing;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types) values ('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp','image/avif']) on conflict (id) do update set public=true;
drop policy if exists "public reads product images" on storage.objects;
create policy "public reads product images" on storage.objects for select using (bucket_id = 'product-images');
drop policy if exists "admins upload product images" on storage.objects;
create policy "admins upload product images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "admins update product images" on storage.objects;
create policy "admins update product images" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.is_admin()) with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "admins delete product images" on storage.objects;
create policy "admins delete product images" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());
