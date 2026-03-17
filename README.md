# KasRT v2 — Aplikasi Kelola RT Digital

## Tech Stack
- **Next.js 14** (App Router) + TypeScript
- **Supabase** (Auth + PostgreSQL + RLS)
- **@supabase/auth-helpers-nextjs** — cookie auth yang sudah teruji
- **Vercel** untuk deploy

## Setup Lokal

### 1. Install dependencies
```bash
npm install
```

### 2. Setup Supabase
1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **SQL Editor** → paste seluruh isi `supabase/migrations/001_schema.sql` → **Run**
3. Buka **Authentication → Providers → Email** → matikan **"Confirm email"** → **Save**
4. Buka **Settings → API** → copy **Project URL** dan **anon key**

### 3. Konfigurasi environment
```bash
cp .env.local.example .env.local
```
Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Jalankan
```bash
npm run dev
```
Buka `localhost:3000` → daftar akun → isi data RT → mulai kelola!

## Deploy ke Vercel
```bash
npx vercel --prod
```
Set environment variables yang sama di Vercel dashboard.

## Fitur
- ✅ Auth email + password (Supabase)
- ✅ Onboarding setup RT pertama
- ✅ Dashboard dengan saldo & statistik real
- ✅ Kas digital — catat pemasukan & pengeluaran
- ✅ Tagihan iuran — buat & tandai lunas per warga
- ✅ Arisan digital — kocok urutan, lacak bayar
- ✅ Data warga (KK)
- ✅ Pengumuman RT
- ✅ Settings & kode undang warga
- ✅ Row Level Security — data RT terisolasi per akun
