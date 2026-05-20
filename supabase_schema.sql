-- ============ ENUMS ============
create type public.app_role as enum ('admin','user');
create type public.order_status as enum ('pending','paid','processing','shipped','delivered','cancelled','refunded');
create type public.coupon_type as enum ('percent','fixed');

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- ============ USER ROLES ============
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique(user_id, role)
);
alter table public.user_roles enable row level security;

-- ============ SECURITY DEFINER HELPERS & TRIGGERS ============
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.user_roles where user_id=_user_id and role=_role) $$;

create or replace function public.is_admin(_user_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select public.has_role(_user_id,'admin') $$;

-- profile trigger to auto-create on auth signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- generic updated_at function
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at := now(); return new; end; $$;

create trigger trg_profiles_updated before update on public.profiles for each row execute function public.set_updated_at();

-- Revoke direct EXECUTE on security-definer helpers for safety
revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
revoke execute on function public.is_admin(uuid) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- ============ PROFILE & ROLE POLICIES ============
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid()=id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid()=id);

create policy "Users view own roles" on public.user_roles for select using (auth.uid()=user_id or public.is_admin(auth.uid()));
create policy "Admins manage roles" on public.user_roles for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ============ CATEGORIES ============
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  created_at timestamptz not null default now()
);
alter table public.categories enable row level security;
create policy "Categories public read" on public.categories for select using (true);
create policy "Admins manage categories" on public.categories for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ============ PRODUCTS ============
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2),
  images text[] not null default '{}',
  category_id uuid references public.categories(id) on delete set null,
  stock int not null default 0,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.products enable row level security;
create policy "Products public read" on public.products for select using (is_active = true or public.is_admin(auth.uid()));
create policy "Admins manage products" on public.products for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create trigger trg_products_updated before update on public.products for each row execute function public.set_updated_at();
create index idx_products_category on public.products(category_id);
create index idx_products_featured on public.products(is_featured);

-- ============ PRODUCT VARIANTS ============
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text,
  color text,
  sku text,
  stock int not null default 0,
  price_delta numeric(10,2) not null default 0
);
alter table public.product_variants enable row level security;
create policy "Variants public read" on public.product_variants for select using (true);
create policy "Admins manage variants" on public.product_variants for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ============ CART ============
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique(user_id, product_id, variant_id)
);
alter table public.cart_items enable row level security;
create policy "Users manage own cart" on public.cart_items for all using (auth.uid()=user_id) with check (auth.uid()=user_id);

-- ============ WISHLIST ============
create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);
alter table public.wishlist_items enable row level security;
create policy "Users manage own wishlist" on public.wishlist_items for all using (auth.uid()=user_id) with check (auth.uid()=user_id);

-- ============ ORDERS ============
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status order_status not null default 'pending',
  subtotal numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  shipping numeric(10,2) not null default 0,
  tax numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  coupon_code text,
  shipping_address jsonb,
  tracking_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.orders enable row level security;
create policy "Users view own orders" on public.orders for select using (auth.uid()=user_id or public.is_admin(auth.uid()));
create policy "Users create own orders" on public.orders for insert with check (auth.uid()=user_id);
create policy "Admins update orders" on public.orders for update using (public.is_admin(auth.uid()));
create trigger trg_orders_updated before update on public.orders for each row execute function public.set_updated_at();

-- ============ ORDER ITEMS ============
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  variant_id uuid references public.product_variants(id),
  product_name text not null,
  product_image text,
  unit_price numeric(10,2) not null,
  quantity int not null,
  created_at timestamptz not null default now()
);
alter table public.order_items enable row level security;
create policy "Order items follow order" on public.order_items for select using (
  exists(select 1 from public.orders o where o.id=order_id and (o.user_id=auth.uid() or public.is_admin(auth.uid())))
);
create policy "Users insert own order items" on public.order_items for insert with check (
  exists(select 1 from public.orders o where o.id=order_id and o.user_id=auth.uid())
);

-- ============ REVIEWS ============
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  title text,
  comment text,
  created_at timestamptz not null default now(),
  unique(product_id, user_id)
);
alter table public.reviews enable row level security;
create policy "Reviews public read" on public.reviews for select using (true);
create policy "Users manage own reviews" on public.reviews for all using (auth.uid()=user_id) with check (auth.uid()=user_id);

-- ============ COUPONS ============
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type coupon_type not null default 'percent',
  value numeric(10,2) not null,
  min_subtotal numeric(10,2) not null default 0,
  expires_at timestamptz,
  max_uses int,
  uses int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.coupons enable row level security;
create policy "Active coupons readable" on public.coupons for select using (is_active = true or public.is_admin(auth.uid()));
create policy "Admins manage coupons" on public.coupons for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ============ STORAGE BUCKETS ============
insert into storage.buckets (id, name, public) values ('product-images','product-images', true) on conflict do nothing;
create policy "Product images public read" on storage.objects for select using (bucket_id='product-images');
create policy "Admins upload product images" on storage.objects for insert with check (bucket_id='product-images' and public.is_admin(auth.uid()));
create policy "Admins update product images" on storage.objects for update using (bucket_id='product-images' and public.is_admin(auth.uid()));
create policy "Admins delete product images" on storage.objects for delete using (bucket_id='product-images' and public.is_admin(auth.uid()));

-- ============ SEED DATA ============
insert into public.categories (name, slug, description, image_url) values
  ('Apparel','apparel','Premium clothing & essentials', null),
  ('Footwear','footwear','Sneakers, boots, and more', null),
  ('Accessories','accessories','Bags, watches, jewelry', null),
  ('Tech','tech','Gadgets and modern devices', null),
  ('Home','home','Refined home goods', null);

with c as (select id, slug from public.categories)
insert into public.products (name, slug, description, price, compare_at_price, images, category_id, stock, is_featured, rating, review_count, tags) values
  ('Aether Knit Sneaker','aether-knit-sneaker','Featherlight knit upper with responsive sole. Built for everyday movement.', 189.00, 240.00, array['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80'], (select id from c where slug='footwear'), 42, true, 4.8, 128, array['new','bestseller']),
  ('Halo Wool Overcoat','halo-wool-overcoat','Tailored from Italian wool. A modern silhouette that lasts decades.', 549.00, null, array['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=80'], (select id from c where slug='apparel'), 18, true, 4.9, 64, array['new']),
  ('Lumen Wireless Earbuds','lumen-wireless-earbuds','Studio-grade audio with active noise cancellation and 36h battery.', 229.00, 279.00, array['https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=1200&q=80'], (select id from c where slug='tech'), 87, true, 4.7, 412, array['sale','bestseller']),
  ('Atlas Leather Backpack','atlas-leather-backpack','Hand-finished full-grain leather. Travel-ready, lifetime construction.', 389.00, null, array['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&q=80'], (select id from c where slug='accessories'), 24, true, 4.9, 91, array['new']),
  ('Nimbus Cashmere Sweater','nimbus-cashmere-sweater','100% Mongolian cashmere. Cloud-soft, ribbed cuffs, relaxed fit.', 295.00, 360.00, array['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1200&q=80'], (select id from c where slug='apparel'), 33, true, 4.8, 78, array['sale']),
  ('Vista Smart Watch','vista-smart-watch','AMOLED always-on display, multi-day battery, premium sapphire crystal.', 449.00, null, array['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80'], (select id from c where slug='tech'), 56, true, 4.6, 203, array['new']),
  ('Solace Linen Shirt','solace-linen-shirt','Belgian linen, garment-washed. Breathable for any climate.', 145.00, null, array['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=1200&q=80'], (select id from c where slug='apparel'), 71, false, 4.5, 44, array[]::text[]),
  ('Orbit Sunglasses','orbit-sunglasses','Acetate frame, polarized lenses, hand-polished in Italy.', 215.00, null, array['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1200&q=80'], (select id from c where slug='accessories'), 39, false, 4.7, 56, array[]::text[]),
  ('Echo Ceramic Lamp','echo-ceramic-lamp','Sculptural ceramic base, warm dimmable LED, fabric shade.', 179.00, null, array['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1200&q=80'], (select id from c where slug='home'), 22, false, 4.6, 31, array[]::text[]),
  ('Drift Runner','drift-runner','Carbon-plated performance runner. PRs incoming.', 249.00, null, array['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1200&q=80'], (select id from c where slug='footwear'), 64, false, 4.7, 187, array['new']),
  ('Verve Crossbody','verve-crossbody','Minimal pebbled leather crossbody with brushed-brass hardware.', 269.00, 320.00, array['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=80'], (select id from c where slug='accessories'), 28, false, 4.8, 49, array['sale']),
  ('Pulse Mechanical Keyboard','pulse-mechanical-keyboard','Hot-swap mechanical keyboard with PBT keycaps and aluminum chassis.', 219.00, null, array['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&q=80'], (select id from c where slug='tech'), 47, false, 4.7, 159, array[]::text[]);

insert into public.coupons (code, type, value, min_subtotal) values
  ('WELCOME10','percent',10,0),
  ('VIP50','fixed',50,300);
