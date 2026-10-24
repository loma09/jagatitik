# Jaga Titik

Platform pelaporan titik rawan dengan **transparansi tindak lanjut**: warga melapor secara anonim, sistem menilai skor kepercayaan laporan, dan publik bisa memantau apakah titik itu sudah ditindaklanjuti instansi terkait.

Karya lomba **Web In Action (WIA) — Multimedia In Action 2026**. Tema: *Designing Digital Futures, Powering Public Transparency*.

> Fokus wilayah: **Jabodetabek**. Data pada versi demo adalah **data simulasi**, bukan data kejadian nyata. Nama wilayah, skor, dan status pada data demo fiktif dan tidak menggambarkan kinerja instansi mana pun.

## Subtema yang dicakup
Civic Reporting & Accountability · Public Service Tracking · Data-Driven Decision Support · Open Government Data (sebagian)

## Fitur utama (rencana)
- Lapor titik rawan anonim + skor kepercayaan berbasis aturan
- Peta dan heatmap titik terverifikasi
- Timeline tindak lanjut per titik
- Titik Terabaikan dan Skor Respons wilayah
- Dashboard admin (verifikasi, update status, ekspor)
- Tombol darurat 112
- Tahap lanjutan: cek rute aman, layer CCTV publik, OTP WhatsApp, klasifikasi teks (AI)

## Tech stack
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
- **Peta:** Leaflet + OpenStreetMap
- **Backend/DB:** Supabase (Auth, PostgreSQL + PostGIS, Row Level Security)
- **Deploy:** Vercel

## Cara menjalankan

Prasyarat: Node.js 20+ dan akun Supabase.

```bash
# 1. Clone dan install
git clone <url-repo-ini>
cd jaga-titik
npm install

# 2. Siapkan environment
cp .env.example .env.local
# isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Siapkan database (Supabase > SQL Editor), jalankan berurutan:
#    supabase/sql/01_schema.sql
#    supabase/sql/02_seed_demo.sql   (data simulasi Jabodetabek, opsional)

# 4. Jalankan
npm run dev
```

Buka http://localhost:3000.

Jadikan akun admin (setelah login Google sekali): jalankan di SQL Editor
`update public.profiles set role = 'admin' where id = 'UUID-AKUN';`

## Struktur folder

```
jaga-titik/
  src/
    app/              halaman (rute sesuai sitemap)
    components/       layout/, map/, ui/  (bagian UI yang dipakai ulang)
    services/         akses Supabase dan data (supabase/client.ts, spots.ts)
    utils/            konstanta dan helper
    types/            tipe TypeScript
  public/images/      aset gambar
  supabase/sql/       skema database dan data demo
  docs/diagram/       sitemap dan flowchart (.drawio)
  docs/catatan/       catatan proyek
  .env.example        contoh environment (tanpa nilai rahasia)
```

## Progres saat ini
- [x] Rancangan: sitemap, flowchart per peran, skema database
- [x] Skema database + keamanan (RLS) + fungsi lapor/konfirmasi/verifikasi, diuji lokal
- [x] Kerangka proyek dan rute sesuai sitemap
- [x] Landing page
- [x] Halaman peta (membaca titik publik dari Supabase)
- [ ] Form lapor + skor kepercayaan
- [ ] Detail titik + timeline
- [ ] Dashboard admin
- [ ] Transparansi (Skor Respons, Titik Terabaikan), heatmap
- [ ] Cek rute, CCTV (jika waktu cukup)

## Alur kerja Git
Satu fitur satu branch (`feat/nama-fitur`), commit kecil dengan pesan jelas, lalu merge ke `main`.

## Lisensi dan atribusi
Peta: © kontributor OpenStreetMap.
