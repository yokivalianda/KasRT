-- ============================================================
-- KasRT Schema — clean, minimal, siap deploy
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- Ekstensi UUID
create extension if not exists "uuid-ossp";

-- ─── Tabel RT ─────────────────────────────────────────────────
create table if not exists rt (
  id          uuid primary key default uuid_generate_v4(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  nama        text not null,
  rw          text,
  kelurahan   text,
  kecamatan   text,
  kota        text,
  provinsi    text,
  created_at  timestamptz default now(),
  unique(owner_id)                   -- 1 user = 1 RT
);

-- ─── Tabel Warga ──────────────────────────────────────────────
create table if not exists warga (
  id           uuid primary key default uuid_generate_v4(),
  rt_id        uuid not null references rt(id) on delete cascade,
  nama         text not null,        -- nama kepala keluarga
  no_rumah     text,
  jumlah_jiwa  int not null default 1,
  no_hp        text,
  catatan      text,
  aktif        boolean not null default true,
  created_at   timestamptz default now()
);
create index if not exists idx_warga_rt on warga(rt_id);

-- ─── Tabel Kas ────────────────────────────────────────────────
create table if not exists kas (
  id           uuid primary key default uuid_generate_v4(),
  rt_id        uuid not null references rt(id) on delete cascade,
  tipe         text not null check (tipe in ('masuk','keluar')),
  jumlah       bigint not null check (jumlah > 0),
  keterangan   text not null,
  kategori     text not null default 'lain-lain',
  tanggal      date not null default current_date,
  created_by   uuid references auth.users(id),
  created_at   timestamptz default now()
);
create index if not exists idx_kas_rt on kas(rt_id);

-- ─── Tabel Iuran ──────────────────────────────────────────────
create table if not exists iuran (
  id           uuid primary key default uuid_generate_v4(),
  rt_id        uuid not null references rt(id) on delete cascade,
  judul        text not null,
  nominal      bigint not null check (nominal > 0),
  periode      text not null,        -- cth: "Maret 2026"
  jatuh_tempo  date not null,
  keterangan   text,
  status       text not null default 'buka' check (status in ('buka','tutup')),
  created_at   timestamptz default now()
);
create index if not exists idx_iuran_rt on iuran(rt_id);

-- ─── Tabel Iuran Bayar ────────────────────────────────────────
create table if not exists iuran_bayar (
  id           uuid primary key default uuid_generate_v4(),
  iuran_id     uuid not null references iuran(id) on delete cascade,
  warga_id     uuid not null references warga(id) on delete cascade,
  lunas        boolean not null default false,
  tgl_bayar    date,
  metode       text,
  created_at   timestamptz default now(),
  unique(iuran_id, warga_id)
);
create index if not exists idx_iuran_bayar_iuran on iuran_bayar(iuran_id);

-- ─── Tabel Arisan Grup ────────────────────────────────────────
create table if not exists arisan_grup (
  id              uuid primary key default uuid_generate_v4(),
  rt_id           uuid not null references rt(id) on delete cascade,
  nama            text not null,
  nominal         bigint not null check (nominal > 0),
  frekuensi       text not null default 'bulanan' check (frekuensi in ('mingguan','bulanan')),
  putaran_ini     int not null default 1,
  total_putaran   int not null,
  status          text not null default 'aktif' check (status in ('aktif','selesai')),
  created_at      timestamptz default now()
);
create index if not exists idx_arisan_rt on arisan_grup(rt_id);

-- ─── Tabel Arisan Anggota ─────────────────────────────────────
create table if not exists arisan_anggota (
  id              uuid primary key default uuid_generate_v4(),
  arisan_id       uuid not null references arisan_grup(id) on delete cascade,
  warga_id        uuid not null references warga(id) on delete cascade,
  urutan          int not null,      -- giliran kocok
  sudah_menang    boolean not null default false,
  menang_putaran  int,               -- putaran ke berapa menang
  created_at      timestamptz default now(),
  unique(arisan_id, warga_id),
  unique(arisan_id, urutan)
);
create index if not exists idx_arisan_anggota_arisan on arisan_anggota(arisan_id);

-- ─── Tabel Arisan Bayar ───────────────────────────────────────
create table if not exists arisan_bayar (
  id           uuid primary key default uuid_generate_v4(),
  arisan_id    uuid not null references arisan_grup(id) on delete cascade,
  warga_id     uuid not null references warga(id) on delete cascade,
  putaran      int not null,
  lunas        boolean not null default false,
  tgl_bayar    date,
  created_at   timestamptz default now(),
  unique(arisan_id, warga_id, putaran)
);
create index if not exists idx_arisan_bayar_arisan on arisan_bayar(arisan_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table rt           enable row level security;
alter table warga        enable row level security;
alter table kas          enable row level security;
alter table iuran        enable row level security;
alter table iuran_bayar  enable row level security;
alter table arisan_grup  enable row level security;
alter table arisan_anggota enable row level security;
alter table arisan_bayar enable row level security;

-- RT: hanya owner
create policy "rt_owner" on rt for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- Warga: hanya owner RT
create policy "warga_owner" on warga for all
  using (rt_id in (select id from rt where owner_id = auth.uid()))
  with check (rt_id in (select id from rt where owner_id = auth.uid()));

-- Kas: hanya owner RT
create policy "kas_owner" on kas for all
  using (rt_id in (select id from rt where owner_id = auth.uid()))
  with check (rt_id in (select id from rt where owner_id = auth.uid()));

-- Iuran: hanya owner RT
create policy "iuran_owner" on iuran for all
  using (rt_id in (select id from rt where owner_id = auth.uid()))
  with check (rt_id in (select id from rt where owner_id = auth.uid()));

-- Iuran bayar: hanya owner RT
create policy "iuran_bayar_owner" on iuran_bayar for all
  using (iuran_id in (
    select i.id from iuran i join rt r on r.id = i.rt_id where r.owner_id = auth.uid()
  ));

-- Arisan grup: hanya owner RT
create policy "arisan_grup_owner" on arisan_grup for all
  using (rt_id in (select id from rt where owner_id = auth.uid()))
  with check (rt_id in (select id from rt where owner_id = auth.uid()));

-- Arisan anggota: hanya owner RT
create policy "arisan_anggota_owner" on arisan_anggota for all
  using (arisan_id in (
    select ag.id from arisan_grup ag join rt r on r.id = ag.rt_id where r.owner_id = auth.uid()
  ));

-- Arisan bayar: hanya owner RT
create policy "arisan_bayar_owner" on arisan_bayar for all
  using (arisan_id in (
    select ag.id from arisan_grup ag join rt r on r.id = ag.rt_id where r.owner_id = auth.uid()
  ));

-- ============================================================
-- TRIGGER: Auto-buat iuran_bayar untuk semua warga saat iuran dibuat
-- ============================================================
create or replace function fn_buat_iuran_bayar()
returns trigger language plpgsql as $$
begin
  insert into iuran_bayar (iuran_id, warga_id)
  select new.id, w.id
  from warga w
  where w.rt_id = new.rt_id and w.aktif = true;
  return new;
end;
$$;

drop trigger if exists trg_buat_iuran_bayar on iuran;
create trigger trg_buat_iuran_bayar
  after insert on iuran
  for each row execute function fn_buat_iuran_bayar();
