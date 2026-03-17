-- =============================================
-- KasRT v2 — Schema Migration
-- Jalankan di Supabase SQL Editor
-- =============================================

-- Aktifkan UUID
create extension if not exists "uuid-ossp";

-- =============================================
-- TABEL UTAMA
-- =============================================

-- RT (Neighborhood)
create table if not exists public.rt (
  id            uuid primary key default uuid_generate_v4(),
  owner_id      uuid not null references auth.users(id) on delete cascade,
  nama          text not null,
  rw            text,
  kelurahan     text,
  kecamatan     text,
  kota          text,
  provinsi      text default 'Sumatera Selatan',
  created_at    timestamptz not null default now()
);

-- Warga (KK)
create table if not exists public.warga (
  id            uuid primary key default uuid_generate_v4(),
  rt_id         uuid not null references public.rt(id) on delete cascade,
  nama          text not null,
  no_rumah      text,
  jumlah_jiwa   int not null default 1,
  no_hp         text,
  catatan       text,
  aktif         boolean not null default true,
  created_at    timestamptz not null default now()
);

-- Kas (buku kas RT)
create table if not exists public.kas (
  id            uuid primary key default uuid_generate_v4(),
  rt_id         uuid not null references public.rt(id) on delete cascade,
  tipe          text not null check (tipe in ('masuk','keluar')),
  jumlah        bigint not null check (jumlah > 0),
  keterangan    text not null,
  kategori      text not null default 'lain-lain',
  tanggal       date not null default current_date,
  created_by    uuid references auth.users(id),
  created_at    timestamptz not null default now()
);

-- Iuran (tagihan per periode)
create table if not exists public.iuran (
  id            uuid primary key default uuid_generate_v4(),
  rt_id         uuid not null references public.rt(id) on delete cascade,
  judul         text not null,
  nominal       bigint not null check (nominal > 0),
  periode       text not null,         -- format: "2026-03"
  jatuh_tempo   date not null,
  keterangan    text,
  status        text not null default 'aktif' check (status in ('aktif','selesai')),
  created_at    timestamptz not null default now()
);

-- Pembayaran iuran per warga
create table if not exists public.iuran_bayar (
  id            uuid primary key default uuid_generate_v4(),
  iuran_id      uuid not null references public.iuran(id) on delete cascade,
  warga_id      uuid not null references public.warga(id) on delete cascade,
  lunas         boolean not null default false,
  tgl_bayar     date,
  metode        text default 'tunai',
  created_at    timestamptz not null default now(),
  unique (iuran_id, warga_id)
);

-- Arisan (grup arisan)
create table if not exists public.arisan (
  id            uuid primary key default uuid_generate_v4(),
  rt_id         uuid not null references public.rt(id) on delete cascade,
  nama          text not null,
  nominal       bigint not null check (nominal > 0),
  frekuensi     text not null default 'bulanan' check (frekuensi in ('mingguan','bulanan')),
  putaran_ini   int not null default 1,
  total_putaran int not null,
  status        text not null default 'aktif' check (status in ('aktif','selesai')),
  created_at    timestamptz not null default now()
);

-- Anggota arisan
create table if not exists public.arisan_anggota (
  id            uuid primary key default uuid_generate_v4(),
  arisan_id     uuid not null references public.arisan(id) on delete cascade,
  warga_id      uuid not null references public.warga(id) on delete cascade,
  urutan        int not null,
  sudah_menang  boolean not null default false,
  created_at    timestamptz not null default now(),
  unique (arisan_id, warga_id),
  unique (arisan_id, urutan)
);

-- Pembayaran arisan per putaran
create table if not exists public.arisan_bayar (
  id            uuid primary key default uuid_generate_v4(),
  arisan_id     uuid not null references public.arisan(id) on delete cascade,
  warga_id      uuid not null references public.warga(id) on delete cascade,
  putaran       int not null,
  lunas         boolean not null default false,
  tgl_bayar     date,
  created_at    timestamptz not null default now(),
  unique (arisan_id, warga_id, putaran)
);

-- =============================================
-- INDEXES
-- =============================================
create index if not exists idx_rt_owner    on public.rt(owner_id);
create index if not exists idx_warga_rt    on public.warga(rt_id);
create index if not exists idx_kas_rt      on public.kas(rt_id);
create index if not exists idx_kas_tgl     on public.kas(tanggal desc);
create index if not exists idx_iuran_rt    on public.iuran(rt_id);
create index if not exists idx_iubayar     on public.iuran_bayar(iuran_id);
create index if not exists idx_arisan_rt   on public.arisan(rt_id);
create index if not exists idx_aribayar    on public.arisan_bayar(arisan_id, putaran);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
alter table public.rt             enable row level security;
alter table public.warga          enable row level security;
alter table public.kas            enable row level security;
alter table public.iuran          enable row level security;
alter table public.iuran_bayar    enable row level security;
alter table public.arisan         enable row level security;
alter table public.arisan_anggota enable row level security;
alter table public.arisan_bayar   enable row level security;

-- RT: owner bisa semua
create policy "rt_owner_all" on public.rt
  for all using (owner_id = auth.uid());

-- Warga: owner RT bisa semua
create policy "warga_owner_all" on public.warga
  for all using (
    rt_id in (select id from public.rt where owner_id = auth.uid())
  );

-- Kas: owner RT bisa semua
create policy "kas_owner_all" on public.kas
  for all using (
    rt_id in (select id from public.rt where owner_id = auth.uid())
  );

-- Iuran: owner RT bisa semua
create policy "iuran_owner_all" on public.iuran
  for all using (
    rt_id in (select id from public.rt where owner_id = auth.uid())
  );

create policy "iubayar_owner_all" on public.iuran_bayar
  for all using (
    iuran_id in (
      select i.id from public.iuran i
      join public.rt r on r.id = i.rt_id
      where r.owner_id = auth.uid()
    )
  );

-- Arisan: owner RT bisa semua
create policy "arisan_owner_all" on public.arisan
  for all using (
    rt_id in (select id from public.rt where owner_id = auth.uid())
  );

create policy "arianggota_owner_all" on public.arisan_anggota
  for all using (
    arisan_id in (
      select a.id from public.arisan a
      join public.rt r on r.id = a.rt_id
      where r.owner_id = auth.uid()
    )
  );

create policy "aribayar_owner_all" on public.arisan_bayar
  for all using (
    arisan_id in (
      select a.id from public.arisan a
      join public.rt r on r.id = a.rt_id
      where r.owner_id = auth.uid()
    )
  );

-- =============================================
-- TRIGGER: auto-buat iuran_bayar untuk semua warga
-- saat iuran baru dibuat
-- =============================================
create or replace function public.buat_iuran_bayar()
returns trigger language plpgsql as $$
begin
  insert into public.iuran_bayar (iuran_id, warga_id)
  select new.id, w.id
  from public.warga w
  where w.rt_id = new.rt_id and w.aktif = true;
  return new;
end;
$$;

drop trigger if exists trg_buat_iuran_bayar on public.iuran;
create trigger trg_buat_iuran_bayar
  after insert on public.iuran
  for each row execute function public.buat_iuran_bayar();

-- =============================================
-- TRIGGER: auto-buat arisan_bayar untuk putaran baru
-- =============================================
create or replace function public.buat_arisan_bayar()
returns trigger language plpgsql as $$
begin
  insert into public.arisan_bayar (arisan_id, warga_id, putaran)
  select new.id, aa.warga_id, 1
  from public.arisan_anggota aa
  where aa.arisan_id = new.id;
  return new;
end;
$$;

-- Fungsi untuk maju ke putaran berikutnya
create or replace function public.maju_putaran(p_arisan_id uuid)
returns void language plpgsql as $$
declare
  v_putaran_baru int;
  v_total int;
begin
  select putaran_ini + 1, total_putaran
  into v_putaran_baru, v_total
  from public.arisan where id = p_arisan_id;

  if v_putaran_baru > v_total then
    update public.arisan set status = 'selesai' where id = p_arisan_id;
    return;
  end if;

  update public.arisan set putaran_ini = v_putaran_baru where id = p_arisan_id;

  insert into public.arisan_bayar (arisan_id, warga_id, putaran)
  select p_arisan_id, aa.warga_id, v_putaran_baru
  from public.arisan_anggota aa
  where aa.arisan_id = p_arisan_id;
end;
$$;
