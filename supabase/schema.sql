-- Wong Digital Shop - Fresh Installation Schema
-- ═══════════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════
-- 1. PRODUCTS
-- ═══════════════════════════════════════════════════════════════
create table products (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  price       numeric(10,2) not null default 0,
  category    text not null default '',
  description text,
  icon_url    text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create index idx_products_slug      on products (slug);
create index idx_products_is_active on products (is_active);
create index idx_products_category  on products (category);

-- ═══════════════════════════════════════════════════════════════
-- 2. CUSTOMERS
-- ═══════════════════════════════════════════════════════════════
create table customers (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid references auth.users(id) on delete set null,
  name           text not null,
  email          text not null unique,
  phone          text,
  wallet_balance numeric(10,2) not null default 0 check (wallet_balance >= 0),
  customer_tier  text not null default 'standard', -- 'standard' | 'gold' | 'reseller'
  referral_code  text unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  referred_by    uuid references customers(id) on delete set null,
  total_spent    numeric(12,2) not null default 0,
  created_at     timestamptz not null default now()
);

create index idx_customers_email         on customers (email);
create index idx_customers_user_id       on customers (user_id);
create index idx_customers_referral_code on customers (referral_code);

-- ═══════════════════════════════════════════════════════════════
-- 3. WALLET TRANSACTIONS
-- ═══════════════════════════════════════════════════════════════
create table wallet_transactions (
  id               uuid primary key default uuid_generate_v4(),
  customer_id      uuid not null references customers(id) on delete cascade,
  transaction_type text not null, -- 'deposit' | 'purchase' | 'refund' | 'affiliate_credit'
  amount           numeric(10,2) not null,
  currency         text not null default 'PHP',
  status           text not null default 'pending', -- 'pending' | 'completed' | 'failed' | 'cancelled'
  payment_method   text,
  reference_id     text,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_wallet_transactions_customer_id on wallet_transactions (customer_id);
create index idx_wallet_transactions_status      on wallet_transactions (status);

-- ═══════════════════════════════════════════════════════════════
-- 4. PROMO CODES
-- ═══════════════════════════════════════════════════════════════
create table promo_codes (
  id                  uuid primary key default uuid_generate_v4(),
  code                text not null unique,
  discount_type       text not null default 'percentage', -- 'percentage' | 'fixed'
  discount_value      numeric(10,2) not null default 0,
  min_order_amount    numeric(10,2) default 0,
  max_discount_amount numeric(10,2),
  max_uses            integer,
  current_uses        integer not null default 0,
  is_active           boolean not null default true,
  starts_at           timestamptz not null default now(),
  expires_at          timestamptz,
  created_at          timestamptz not null default now()
);

create index idx_promo_codes_code      on promo_codes (code);
create index idx_promo_codes_is_active on promo_codes (is_active);

-- ═══════════════════════════════════════════════════════════════
-- 5. ORDERS
-- ═══════════════════════════════════════════════════════════════
create table orders (
  id                uuid primary key default uuid_generate_v4(),
  order_code        text not null unique,
  customer_id       uuid references customers(id) on delete set null,
  customer_name     text not null,
  customer_email    text not null,
  customer_phone    text,
  tip_amount        numeric(10,2) not null default 0,
  total_price       numeric(10,2) not null default 0,
  promo_code_id     uuid references promo_codes(id) on delete set null,
  discount_amount   numeric(10,2) not null default 0,
  payment_method    text not null default 'gcash',
  payment_reference text,
  receipt_path      text,
  payssion_transaction_id text,
  notes             text,
  status            text not null default 'pending', -- pending | processing | delivered | completed | cancelled
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_orders_order_code    on orders (order_code);
create index idx_orders_customer_id   on orders (customer_id);
create index idx_orders_customer_email on orders (customer_email);
create index idx_orders_status        on orders (status);
create index idx_orders_created_at    on orders (created_at desc);
create index idx_orders_payssion_tid  on orders (payssion_transaction_id) where payssion_transaction_id is not null;

-- ═══════════════════════════════════════════════════════════════
-- 6. ORDER ITEMS
-- ═══════════════════════════════════════════════════════════════
create table order_items (
  id                       uuid primary key default uuid_generate_v4(),
  order_id                 uuid not null references orders(id) on delete cascade,
  product_id               uuid not null references products(id) on delete restrict,
  access_plan              text not null default 'one_year',    -- 'one_year' | 'lifetime'
  quantity                 integer not null default 1,
  service_option           text,
  target_url               text,
  unit_price               numeric(10,2) not null default 0,
  fulfillment_provider     text not null default 'manual',
  provider_service_id      text,
  provider_order_id        text,
  provider_status          text,
  provider_charge          text,
  provider_currency        text,
  provider_start_count     text,
  provider_remains         text,
  provider_error           text,
  provider_last_checked_at timestamptz,
  selection_mode           text not null default 'subscription'  -- subscription | service | package | addon
);

create index idx_order_items_order_id   on order_items (order_id);
create index idx_order_items_product_id on order_items (product_id);

-- ═══════════════════════════════════════════════════════════════
-- 7. BUNDLES
-- ═══════════════════════════════════════════════════════════════
create table bundles (
  id             uuid primary key default uuid_generate_v4(),
  name           text not null,
  slug           text not null unique,
  description    text,
  bundle_price   numeric(10,2) not null default 0,
  original_price numeric(10,2) not null default 0,
  icon_url       text,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

create index idx_bundles_slug      on bundles (slug);
create index idx_bundles_is_active on bundles (is_active);

-- ═══════════════════════════════════════════════════════════════
-- 8. BUNDLE ITEMS
-- ═══════════════════════════════════════════════════════════════
create table bundle_items (
  id          uuid primary key default uuid_generate_v4(),
  bundle_id   uuid not null references bundles(id) on delete cascade,
  product_id  uuid not null references products(id) on delete cascade,
  access_plan text not null default 'one_year'
);

create index idx_bundle_items_bundle_id on bundle_items (bundle_id);

-- ═══════════════════════════════════════════════════════════════
-- 9. REVIEWS
-- ═══════════════════════════════════════════════════════════════
create table reviews (
  id             uuid primary key default uuid_generate_v4(),
  order_id       uuid references orders(id) on delete set null,
  customer_name  text not null,
  customer_email text not null,
  rating         integer not null check (rating >= 1 and rating <= 5),
  content        text,
  is_approved    boolean not null default false,
  created_at     timestamptz not null default now()
);

create index idx_reviews_order_id    on reviews (order_id);
create index idx_reviews_is_approved on reviews (is_approved);

-- ═══════════════════════════════════════════════════════════════
-- 10. STORE SETTINGS (singleton)
-- ═══════════════════════════════════════════════════════════════
create table store_settings (
  id                   text primary key default 'primary',
  store_name           text not null default 'Wong Digital Shop',
  support_email        text not null default '',
  qrph_number          text not null default '',
  qrph_instructions    text not null default '',
  binance_pay_id       text not null default '',
  binance_instructions text not null default '',
  updated_at           timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════
-- 11. SUPPORT CHATS & MESSAGES
-- ═══════════════════════════════════════════════════════════════
create table support_chats (
  id                uuid primary key default uuid_generate_v4(),
  visitor_id        text not null,
  visitor_name      text not null,
  visitor_email     text,
  discord_thread_id text,
  status            text not null default 'open', -- 'open' | 'resolved'
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_support_chats_visitor_id on support_chats (visitor_id);
create index idx_support_chats_status     on support_chats (status);

create table support_messages (
  id         uuid primary key default uuid_generate_v4(),
  chat_id    uuid not null references support_chats(id) on delete cascade,
  sender     text not null default 'customer', -- 'customer' | 'admin'
  content    text not null,
  created_at timestamptz not null default now()
);

create index idx_support_messages_chat_id on support_messages (chat_id);

-- ═══════════════════════════════════════════════════════════════
-- 12. ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════
alter table products            enable row level security;
alter table customers           enable row level security;
alter table wallet_transactions enable row level security;
alter table promo_codes         enable row level security;
alter table orders              enable row level security;
alter table order_items         enable row level security;
alter table bundles             enable row level security;
alter table bundle_items        enable row level security;
alter table reviews             enable row level security;
alter table store_settings      enable row level security;
alter table support_chats       enable row level security;
alter table support_messages    enable row level security;

-- Public read
create policy "Products are publicly readable"
  on products for select using (true);

create policy "Bundles are publicly readable"
  on bundles for select using (true);

create policy "Bundle items are publicly readable"
  on bundle_items for select using (true);

create policy "Approved reviews are publicly readable"
  on reviews for select using (true);

create policy "Store settings are publicly readable"
  on store_settings for select using (true);

create policy "Promo codes are publicly readable"
  on promo_codes for select using (true);

-- Customers
create policy "Customers are viewable by everyone"
  on customers for select using (true);

create policy "Anyone can create customers"
  on customers for insert with check ((select auth.role()) in ('anon', 'authenticated'));

create policy "Customers can update their own details"
  on customers for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Orders
create policy "Orders are publicly readable"
  on orders for select using (true);

create policy "Anyone can create orders"
  on orders for insert with check ((select auth.role()) in ('anon', 'authenticated'));

-- Blocked for client callers — only the create_order_atomic RPC (security definer) can mutate orders
create policy "Allow order updates"
  on orders for update using (false);

-- Order Items
create policy "Order items are publicly readable"
  on order_items for select using (true);

create policy "Anyone can create order items"
  on order_items for insert with check ((select auth.role()) in ('anon', 'authenticated'));

-- Wallet (auth-gated)
create policy "Users can view their own wallet transactions"
  on wallet_transactions for select
  using (
    customer_id in (select id from customers where user_id = (select auth.uid()))
  );

create policy "Users can insert pending deposits"
  on wallet_transactions for insert
  with check (
    customer_id in (select id from customers where user_id = (select auth.uid()))
    and status = 'pending'
  );

-- Reviews
create policy "Anyone can submit reviews"
  on reviews for insert with check ((select auth.role()) in ('anon', 'authenticated'));

-- Promo codes — only the RPC can increment usage
create policy "Allow promo usage count updates"
  on promo_codes for update using (false);

-- Support
create policy "Anyone can create support chats"
  on support_chats for insert with check ((select auth.role()) in ('anon', 'authenticated'));

create policy "Anyone can read support chats"
  on support_chats for select using (true);

-- Blocked for clients — only server actions (service role) can update chat status
create policy "Anyone can update support chats"
  on support_chats for update using (false);

create policy "Anyone can create support messages"
  on support_messages for insert with check ((select auth.role()) in ('anon', 'authenticated'));

create policy "Anyone can read support messages"
  on support_messages for select using (true);

-- ═══════════════════════════════════════════════════════════════
-- 13. REALTIME
-- ═══════════════════════════════════════════════════════════════
alter publication supabase_realtime add table products;
alter publication supabase_realtime add table bundles;
alter publication supabase_realtime add table bundle_items;
alter publication supabase_realtime add table promo_codes;
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table order_items;
alter publication supabase_realtime add table customers;
alter publication supabase_realtime add table reviews;
alter publication supabase_realtime add table store_settings;
alter publication supabase_realtime add table support_chats;
alter publication supabase_realtime add table support_messages;
alter publication supabase_realtime add table wallet_transactions;

-- ═══════════════════════════════════════════════════════════════
-- 14. FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════════════

create schema if not exists private;

-- ── Auto-link auth.users → public.customers ───────────────────
create or replace function private.handle_new_user()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
  insert into public.customers (user_id, email, name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (email) do update set user_id = excluded.user_id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ── Auto-update updated_at timestamps ─────────────────────────
create or replace function public.update_updated_at_column()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_updated_at
  before update on orders
  for each row execute function update_updated_at_column();

create trigger support_chats_updated_at
  before update on support_chats
  for each row execute function update_updated_at_column();

create trigger store_settings_updated_at
  before update on store_settings
  for each row execute function update_updated_at_column();

create trigger wallet_transactions_updated_at
  before update on wallet_transactions
  for each row execute function update_updated_at_column();

-- ── Wallet: Atomic debit ───────────────────────────────────────
create or replace function public.process_wallet_purchase(
  p_customer_id uuid,
  p_amount      numeric,
  p_order_code  text
)
returns numeric
security definer
set search_path = public
language plpgsql
as $$
declare
  v_balance numeric;
begin
  select wallet_balance into v_balance
    from customers
    where id = p_customer_id
    for update;

  if v_balance is null then
    raise exception 'Customer not found.';
  end if;

  if v_balance < p_amount then
    raise exception 'Insufficient wallet balance. Available: %, Required: %', v_balance, p_amount;
  end if;

  update customers
    set wallet_balance = wallet_balance - p_amount
    where id = p_customer_id;

  insert into wallet_transactions (
    customer_id, transaction_type, amount, currency, status,
    payment_method, reference_id, notes
  ) values (
    p_customer_id, 'purchase', p_amount, 'PHP', 'completed',
    'system', p_order_code,
    'Wallet payment for order ' || p_order_code
  );

  return p_amount;
end;
$$;

-- ── Wallet: Approve pending deposit ───────────────────────────
create or replace function public.approve_wallet_deposit(
  p_transaction_id uuid
)
returns numeric
security definer
set search_path = public
language plpgsql
as $$
declare
  v_customer_id uuid;
  v_amount      numeric;
  v_status      text;
  v_new_balance numeric;
begin
  select customer_id, amount, status
    into v_customer_id, v_amount, v_status
    from wallet_transactions
    where id = p_transaction_id
    for update;

  if not found then
    raise exception 'Transaction not found';
  end if;

  if v_status != 'pending' then
    raise exception 'Transaction is not in pending state';
  end if;

  update wallet_transactions
    set status = 'completed', updated_at = now()
    where id = p_transaction_id;

  update customers
    set wallet_balance = wallet_balance + v_amount
    where id = v_customer_id
    returning wallet_balance into v_new_balance;

  return v_new_balance;
end;
$$;

-- ── Auto-tier upgrade & referral commissions on order complete ─
create or replace function private.handle_order_completed()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
declare
  v_customer_id     uuid;
  v_total_spent     numeric;
  v_new_tier        text;
  v_referrer_id     uuid;
  v_referrer_tier   text;
  v_commission_rate numeric;
  v_commission      numeric;
begin
  -- Only fire when status changes TO 'completed'
  if new.status <> 'completed' or old.status = 'completed' then
    return new;
  end if;

  v_customer_id := new.customer_id;
  if v_customer_id is null then return new; end if;

  -- 1. Accumulate total_spent
  update customers
    set total_spent = total_spent + new.total_price
    where id = v_customer_id
    returning total_spent into v_total_spent;

  -- 2. Auto-upgrade tier (standard → gold ≥ ₱50k | reseller ≥ ₱200k)
  if v_total_spent >= 200000 then
    v_new_tier := 'reseller';
  elsif v_total_spent >= 50000 then
    v_new_tier := 'gold';
  else
    v_new_tier := 'standard';
  end if;

  update customers
    set customer_tier = v_new_tier
    where id = v_customer_id
      and customer_tier <> v_new_tier;

  -- 3. Pay referral commission
  select referred_by into v_referrer_id
    from customers where id = v_customer_id;

  if v_referrer_id is not null then
    select customer_tier into v_referrer_tier
      from customers where id = v_referrer_id;

    v_commission_rate := case v_referrer_tier
      when 'reseller' then 0.10
      when 'gold'     then 0.08
      else                  0.05
    end;

    v_commission := round(new.total_price * v_commission_rate, 2);

    if v_commission > 0 then
      update customers
        set wallet_balance = wallet_balance + v_commission
        where id = v_referrer_id;

      insert into wallet_transactions (
        customer_id, transaction_type, amount, currency, status,
        payment_method, reference_id, notes
      ) values (
        v_referrer_id, 'affiliate_credit', v_commission, 'PHP', 'completed',
        'system', new.order_code,
        'Referral commission (' || (v_commission_rate * 100)::text || '%) on order ' || new.order_code
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists on_order_completed on orders;
create trigger on_order_completed
  after update on orders
  for each row execute function private.handle_order_completed();

-- ── Atomic Order Creation RPC ──────────────────────────────────
-- Runs as security definer (service role) — bypasses client RLS.
-- Inserts both the order and all order_items in one transaction,
-- then atomically increments the promo code usage counter.
create or replace function public.create_order_atomic(
  p_order_data jsonb,
  p_items_data jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id       uuid;
  v_inserted_order jsonb;
begin
  -- Insert the parent order row
  insert into orders (
    order_code, customer_id, customer_name, customer_email, customer_phone,
    tip_amount, total_price, promo_code_id, discount_amount, payment_method,
    payment_reference, receipt_path, notes, status, payssion_transaction_id
  )
  select
    p_order_data->>'order_code',
    (p_order_data->>'customer_id')::uuid,
    p_order_data->>'customer_name',
    p_order_data->>'customer_email',
    p_order_data->>'customer_phone',
    (p_order_data->>'tip_amount')::numeric,
    (p_order_data->>'total_price')::numeric,
    (p_order_data->>'promo_code_id')::uuid,
    (p_order_data->>'discount_amount')::numeric,
    p_order_data->>'payment_method',
    p_order_data->>'payment_reference',
    p_order_data->>'receipt_path',
    p_order_data->>'notes',
    p_order_data->>'status',
    p_order_data->>'payssion_transaction_id'
  returning id, row_to_json(orders.*) into v_order_id, v_inserted_order;

  -- Insert all line items linked to the new order
  insert into order_items (
    order_id, product_id, access_plan, quantity, service_option,
    target_url, unit_price, fulfillment_provider, provider_service_id,
    provider_order_id, provider_status, provider_charge, provider_currency,
    provider_start_count, provider_remains, provider_error, provider_last_checked_at
  )
  select
    v_order_id,
    (item->>'product_id')::uuid,
    item->>'access_plan',
    (item->>'quantity')::integer,
    item->>'service_option',
    item->>'target_url',
    (item->>'unit_price')::numeric,
    item->>'fulfillment_provider',
    item->>'provider_service_id',
    item->>'provider_order_id',
    item->>'provider_status',
    (item->>'provider_charge')::numeric,
    item->>'provider_currency',
    (item->>'provider_start_count')::integer,
    (item->>'provider_remains')::integer,
    item->>'provider_error',
    (item->>'provider_last_checked_at')::timestamptz
  from jsonb_array_elements(p_items_data) as item;

  -- Atomically increment promo usage (if a promo was applied)
  if p_order_data->>'promo_code_id' is not null then
    update promo_codes
       set current_uses = current_uses + 1
     where id = (p_order_data->>'promo_code_id')::uuid;
  end if;

  return v_inserted_order;
end;
$$;
