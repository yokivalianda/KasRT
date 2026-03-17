-- ============================================================
-- KasRT v2 — Production Schema
-- Jalankan di Supabase SQL Editor
-- ============================================================
create extension if not exists "uuid-ossp";

-- ENUMS
create type txn_type    as enum ('masuk', 'keluar');
create type bill_status as enum ('buka', 'tutup');
create type pay_status  as enum ('belum', 'lunas');
create type pay_method  as enum ('tunai', 'transfer', 'qris');
create type arisan_freq as enum ('mingguan', 'bulanan');
create type arisan_stat as enum ('aktif', 'selesai');
create type member_stat as enum ('aktif', 'pindah');

-- NEIGHBORHOODS
create table neighborhoods (
  id           uuid primary key default uuid_generate_v4(),
  owner_id     uuid not null references auth.users(id) on delete cascade,
  nama         text not null,
  rw           text,
  kelurahan    text,
  kecamatan    text,
  kota         text,
  provinsi     text,
  kode_undang  text unique not null default upper(substring(md5(random()::text),1,6)),
  created_at   timestamptz not null default now()
);

-- MEMBERS
create table members (
  id              uuid primary key default uuid_generate_v4(),
  neighborhood_id uuid not null references neighborhoods(id) on delete cascade,
  nama            text not null,
  no_rumah        text,
  jumlah_jiwa     int  not null default 1,
  no_hp           text,
  alamat          text,
  status          member_stat not null default 'aktif',
  created_at      timestamptz not null default now()
);

-- CASHBOOK
create table cashbook (
  id              uuid primary key default uuid_generate_v4(),
  neighborhood_id uuid not null references neighborhoods(id) on delete cascade,
  tipe            txn_type not null,
  jumlah          bigint not null check (jumlah > 0),
  keterangan      text not null,
  kategori        text not null default 'lain-lain',
  tanggal         date not null default current_date,
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now()
);

-- BILLS
create table bills (
  id              uuid primary key default uuid_generate_v4(),
  neighborhood_id uuid not null references neighborhoods(id) on delete cascade,
  judul           text not null,
  nominal         bigint not null check (nominal > 0),
  jatuh_tempo     date not null,
  periode         text,
  status          bill_status not null default 'buka',
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now()
);

create table bill_payments (
  id          uuid primary key default uuid_generate_v4(),
  bill_id     uuid not null references bills(id) on delete cascade,
  member_id   uuid not null references members(id) on delete cascade,
  status      pay_status  not null default 'belum',
  metode      pay_method,
  dibayar_at  timestamptz,
  catatan     text,
  created_at  timestamptz not null default now(),
  unique (bill_id, member_id)
);

-- ARISAN
create table arisan_groups (
  id              uuid primary key default uuid_generate_v4(),
  neighborhood_id uuid not null references neighborhoods(id) on delete cascade,
  nama            text not null,
  nominal         bigint not null check (nominal > 0),
  frekuensi       arisan_freq not null default 'bulanan',
  putaran_ini     int not null default 1,
  total_putaran   int not null,
  tgl_kocok       date,
  status          arisan_stat not null default 'aktif',
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now()
);

create table arisan_members (
  id           uuid primary key default uuid_generate_v4(),
  group_id     uuid not null references arisan_groups(id) on delete cascade,
  member_id    uuid not null references members(id) on delete cascade,
  urutan       int,
  sudah_menang boolean not null default false,
  menang_putaran int,
  joined_at    timestamptz not null default now(),
  unique (group_id, member_id)
);

create table arisan_payments (
  id          uuid primary key default uuid_generate_v4(),
  group_id    uuid not null references arisan_groups(id) on delete cascade,
  member_id   uuid not null references members(id) on delete cascade,
  putaran     int not null,
  status      pay_status not null default 'belum',
  metode      pay_method,
  dibayar_at  timestamptz,
  created_at  timestamptz not null default now(),
  unique (group_id, member_id, putaran)
);

-- PENGUMUMAN
create table pengumuman (
  id              uuid primary key default uuid_generate_v4(),
  neighborhood_id uuid not null references neighborhoods(id) on delete cascade,
  judul           text not null,
  isi             text,
  disematkan      boolean not null default false,
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now()
);

-- INDEXES
create index idx_members_nb        on members(neighborhood_id);
create index idx_cashbook_nb       on cashbook(neighborhood_id);
create index idx_cashbook_tgl      on cashbook(tanggal desc);
create index idx_bills_nb          on bills(neighborhood_id);
create index idx_bill_pay_bill     on bill_payments(bill_id);
create index idx_arisan_nb         on arisan_groups(neighborhood_id);
create index idx_arisan_mem_group  on arisan_members(group_id);
create index idx_arisan_pay_group  on arisan_payments(group_id);
create index idx_pengumuman_nb     on pengumuman(neighborhood_id);

-- RLS
alter table neighborhoods   enable row level security;
alter table members         enable row level security;
alter table cashbook        enable row level security;
alter table bills           enable row level security;
alter table bill_payments   enable row level security;
alter table arisan_groups   enable row level security;
alter table arisan_members  enable row level security;
alter table arisan_payments enable row level security;
alter table pengumuman      enable row level security;

-- Helper function
create or replace function is_owner(nb_id uuid)
returns boolean language sql security definer as $$
  select exists (select 1 from neighborhoods where id = nb_id and owner_id = auth.uid())
$$;

-- RLS Policies
create policy "nb_all"          on neighborhoods   for all using (owner_id = auth.uid());
create policy "members_all"     on members         for all using (is_owner(neighborhood_id));
create policy "cashbook_all"    on cashbook        for all using (is_owner(neighborhood_id));
create policy "bills_all"       on bills           for all using (is_owner(neighborhood_id));
create policy "bill_pay_all"    on bill_payments   for all using (bill_id in (select id from bills where is_owner(neighborhood_id)));
create policy "arisan_all"      on arisan_groups   for all using (is_owner(neighborhood_id));
create policy "arisan_mem_all"  on arisan_members  for all using (group_id in (select id from arisan_groups where is_owner(neighborhood_id)));
create policy "arisan_pay_all"  on arisan_payments for all using (group_id in (select id from arisan_groups where is_owner(neighborhood_id)));
create policy "pengumuman_all"  on pengumuman      for all using (is_owner(neighborhood_id));

-- Auto-buat bill_payments saat tagihan dibuat
create or replace function auto_bill_payments()
returns trigger language plpgsql security definer as $$
begin
  insert into bill_payments (bill_id, member_id)
  select new.id, m.id from members m
  where m.neighborhood_id = new.neighborhood_id and m.status = 'aktif';
  return new;
end;
$$;
create trigger trg_auto_bill_payments
  after insert on bills for each row execute function auto_bill_payments();

-- View saldo
create or replace view v_saldo as
select
  neighborhood_id,
  coalesce(sum(case when tipe='masuk'  then jumlah else 0 end),0) as total_masuk,
  coalesce(sum(case when tipe='keluar' then jumlah else 0 end),0) as total_keluar,
  coalesce(sum(case when tipe='masuk'  then jumlah else -jumlah end),0) as saldo
from cashbook group by neighborhood_id;

-- View ringkasan tagihan
create or replace view v_bill_summary as
select b.id, b.neighborhood_id, b.judul, b.nominal, b.jatuh_tempo, b.periode, b.status,
  count(bp.id) as total_warga,
  count(case when bp.status='lunas' then 1 end) as sudah_lunas,
  count(case when bp.status='belum' then 1 end) as belum_lunas,
  coalesce(sum(case when bp.status='lunas' then b.nominal else 0 end),0) as terkumpul
from bills b left join bill_payments bp on bp.bill_id = b.id
group by b.id;
