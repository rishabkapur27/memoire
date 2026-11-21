-- Mémoire pre-order schema. Safe to run more than once.

create table if not exists products (
  id            serial primary key,
  slug          text not null unique,
  name          text not null,
  french_name   text,
  description   text not null default '',
  price_inr     integer not null check (price_inr > 0),
  weight_grams  integer,
  daily_capacity integer not null default 20 check (daily_capacity >= 0),
  is_active     boolean not null default true,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);

create table if not exists orders (
  id                 bigserial primary key,
  code               text not null unique,
  client_request_id  uuid not null unique,
  bake_date          date not null,
  fulfilment         text not null check (fulfilment in ('pickup', 'delivery')),
  slot               text not null,
  customer_name      text not null,
  customer_phone     text not null,
  customer_email     text,
  address            text,
  pincode            text,
  notes              text,
  subtotal_inr       integer not null check (subtotal_inr >= 0),
  delivery_fee_inr   integer not null default 0 check (delivery_fee_inr >= 0),
  total_inr          integer not null check (total_inr >= 0),
  status             text not null default 'placed'
                     check (status in ('placed', 'confirmed', 'ready', 'completed', 'cancelled')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists orders_bake_date_idx on orders (bake_date);
create index if not exists orders_status_idx on orders (status);

create table if not exists order_items (
  id              bigserial primary key,
  order_id        bigint not null references orders(id) on delete cascade,
  product_id      integer not null references products(id),
  product_name    text not null,
  unit_price_inr  integer not null check (unit_price_inr > 0),
  quantity        integer not null check (quantity > 0 and quantity <= 20)
);

create index if not exists order_items_order_idx on order_items (order_id);
create index if not exists order_items_product_idx on order_items (product_id);
