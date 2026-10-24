-- =====================================================================
-- JAGA TITIK : 01_schema.sql
-- Jalankan sekali di Supabase > SQL Editor (atau sebagai migration).
-- Berisi: tabel, keamanan (RLS), view publik, dan fungsi (RPC).
-- Catatan: seluruh data tulis (lapor, konfirmasi, update status) HANYA
-- lewat fungsi di bawah. Pengguna tidak punya hak INSERT/UPDATE langsung.
-- =====================================================================

create extension if not exists postgis with schema extensions;

-- ---------- ENUM ----------
do $$ begin
  create type public.spot_status as enum ('pending','verified','in_progress','resolved','rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.report_category as enum ('begal','copet','pelecehan','area_gelap');
exception when duplicate_object then null; end $$;

-- ---------- TABEL ----------
create table if not exists public.regions (
  id           serial primary key,
  name         text not null,
  agency_name  text,
  boundary     geography(Polygon,4326)            -- batas wilayah (opsional, untuk menentukan wilayah titik)
);

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null default 'warga' check (role in ('warga','admin')),
  reputation  int  not null default 0,            -- naik jika laporan terverifikasi, turun jika ditolak
  created_at  timestamptz not null default now()
);

create table if not exists public.spots (
  id                bigserial primary key,
  geom              geography(Point,4326) not null,
  category          public.report_category not null,
  region_id         int references public.regions(id),
  status            public.spot_status not null default 'pending',
  reporter_count    int not null default 0,
  first_reported_at timestamptz not null default now(),
  last_update_at    timestamptz,
  is_demo           boolean not null default false
);

create table if not exists public.reports (
  id           bigserial primary key,
  spot_id      bigint not null references public.spots(id) on delete cascade,
  user_id      uuid references public.profiles(id) on delete set null,   -- NULL hanya untuk data demo
  geom         geography(Point,4326) not null,
  device_geom  geography(Point,4326),                                    -- lokasi perangkat saat melapor (untuk skor)
  category     public.report_category not null,
  description  text check (description is null or char_length(description) <= 500),
  occurred_at  timestamptz not null,
  trust_score  int not null default 30 check (trust_score between 0 and 100),
  report_date  date not null default ((now() at time zone 'UTC')::date),
  created_at   timestamptz not null default now(),
  is_demo      boolean not null default false,
  check (user_id is not null or is_demo),
  unique (user_id, spot_id, report_date)         -- cegah laporan ganda akun sama di titik sama dalam sehari
);

create table if not exists public.confirmations (
  spot_id     bigint not null references public.spots(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (spot_id, user_id)
);

create table if not exists public.spot_updates (
  id          bigserial primary key,
  spot_id     bigint not null references public.spots(id) on delete cascade,
  admin_id    uuid references public.profiles(id) on delete set null,    -- NULL = catatan sistem/demo
  status      public.spot_status not null,
  note        text,
  created_at  timestamptz not null default now()
);

create table if not exists public.cctv_points (
  id    serial primary key,
  name  text not null,
  geom  geography(Point,4326) not null,
  url   text
);

create index if not exists spots_geom_idx        on public.spots using gist (geom);
create index if not exists reports_geom_idx      on public.reports using gist (geom);
create index if not exists reports_spot_idx      on public.reports (spot_id);
create index if not exists reports_user_day_idx  on public.reports (user_id, report_date);
create index if not exists updates_spot_idx      on public.spot_updates (spot_id, created_at);
create index if not exists spots_region_idx      on public.spots (region_id);

-- ---------- FUNGSI BANTU ----------
create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public, extensions
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Bobot titik untuk heatmap: skor kepercayaan laporan yang meluruh 50% tiap 30 hari + konfirmasi.
create or replace function public.spot_weight(p_spot_id bigint)
returns numeric
language sql stable security definer
set search_path = public, extensions
as $$
  select round(
    coalesce((
      select sum( (r.trust_score / 100.0) * power(0.5, extract(epoch from (now() - r.created_at)) / 86400.0 / 30.0) )
      from public.reports r where r.spot_id = p_spot_id
    ), 0)
    + 0.2 * (select count(*) from public.confirmations c where c.spot_id = p_spot_id)
  , 3);
$$;

-- Profil otomatis saat akun baru dibuat (Google login).
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public, extensions
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- VIEW PUBLIK (tanpa user_id, tanpa isi deskripsi) ----------
-- Titik tampil publik jika: tidak ditolak DAN (>=2 pelapor berbeda ATAU sudah diverifikasi admin).
create or replace view public.public_spots as
select
  s.id,
  st_y(s.geom::geometry) as lat,
  st_x(s.geom::geometry) as lng,
  s.category,
  s.status,
  s.region_id,
  s.reporter_count,
  (select count(*) from public.confirmations c where c.spot_id = s.id) as confirm_count,
  public.spot_weight(s.id) as weight,
  s.first_reported_at,
  s.last_update_at
from public.spots s
where s.status <> 'rejected'
  and (s.reporter_count >= 2 or s.status in ('verified','in_progress','resolved'));

create or replace view public.public_spot_updates as
select su.spot_id, su.status, su.note, su.created_at
from public.spot_updates su
join public.public_spots ps on ps.id = su.spot_id;

-- Titik Terabaikan: banyak pelapor (>=3) tapi tanpa update > 14 hari dan belum selesai.
create or replace view public.neglected_spots as
select ps.*,
       floor(extract(epoch from (now() - coalesce(ps.last_update_at, ps.first_reported_at))) / 86400)::int as hari_tanpa_update
from public.public_spots ps
where ps.reporter_count >= 3
  and ps.status in ('pending','verified','in_progress')
  and coalesce(ps.last_update_at, ps.first_reported_at) < now() - interval '14 days';

-- Skor Respons wilayah (0-100):
-- 40% titik direspons <=7 hari + 40% titik selesai <=30 hari + 20% (1 - rasio terabaikan).
-- Titik yang belum cukup umur (belum 7/30 hari) tidak dihitung di komponen yang bersangkutan.
create or replace view public.region_scores as
with base as (
  select ps.region_id, ps.id, ps.first_reported_at,
    exists (select 1 from public.spot_updates su
            where su.spot_id = ps.id and su.status <> 'pending'
              and su.created_at <= ps.first_reported_at + interval '7 days')  as responded_7d,
    exists (select 1 from public.spot_updates su
            where su.spot_id = ps.id and su.status = 'resolved'
              and su.created_at <= ps.first_reported_at + interval '30 days') as resolved_30d,
    exists (select 1 from public.neglected_spots n where n.id = ps.id)        as is_neglected
  from public.public_spots ps
  where ps.region_id is not null
)
select
  r.id as region_id,
  r.name,
  r.agency_name,
  count(b.id)                                   as total_titik,
  count(b.id) filter (where b.is_neglected)     as titik_terabaikan,
  case when count(b.id) = 0 then null else round(100 * (
      0.4 * coalesce(
              (count(b.id) filter (where b.first_reported_at <= now() - interval '7 days' and b.responded_7d))::numeric
              / nullif(count(b.id) filter (where b.first_reported_at <= now() - interval '7 days'), 0), 1)
    + 0.4 * coalesce(
              (count(b.id) filter (where b.first_reported_at <= now() - interval '30 days' and b.resolved_30d))::numeric
              / nullif(count(b.id) filter (where b.first_reported_at <= now() - interval '30 days'), 0), 1)
    + 0.2 * (1 - (count(b.id) filter (where b.is_neglected))::numeric / count(b.id))
  ), 1) end                                     as skor_respons
from public.regions r
left join base b on b.region_id = r.id
group by r.id, r.name, r.agency_name;

-- Laporan milik pengguna sendiri + status titiknya ("Laporan Saya").
create or replace view public.my_reports as
select r.id, r.spot_id, r.category, r.created_at, r.trust_score,
       s.status as spot_status,
       (s.status <> 'rejected' and (s.reporter_count >= 2 or s.status in ('verified','in_progress','resolved'))) as is_public
from public.reports r
join public.spots s on s.id = r.spot_id
where r.user_id = auth.uid();

-- ---------- FUNGSI UTAMA (RPC) ----------

-- Kirim laporan. Mengembalikan {spot_id, trust_score, is_public}.
create or replace function public.submit_report(
  p_lat double precision,
  p_lng double precision,
  p_category public.report_category,
  p_description text default null,
  p_occurred_at timestamptz default now(),
  p_device_lat double precision default null,
  p_device_lng double precision default null
) returns jsonb
language plpgsql security definer
set search_path = public, extensions
as $$
declare
  v_uid     uuid := auth.uid();
  v_g       geography;
  v_dev     geography;
  v_spot    bigint;
  v_region  int;
  v_prof    public.profiles%rowtype;
  v_clean   text;
  v_others  int;
  v_confirm int;
  v_score   int;
  v_public  boolean;
begin
  if v_uid is null then raise exception 'Harus login untuk melapor'; end if;

  select * into v_prof from public.profiles where id = v_uid;
  if not found then raise exception 'Profil tidak ditemukan'; end if;

  if p_lat is null or p_lng is null or p_lat not between -90 and 90 or p_lng not between -180 and 180 then
    raise exception 'Koordinat tidak valid';
  end if;
  if p_occurred_at > now() + interval '5 minutes' or p_occurred_at < now() - interval '90 days' then
    raise exception 'Waktu kejadian tidak valid';
  end if;

  -- Blokir data pribadi di deskripsi (plat nomor, no. HP, NIK).
  if p_description is not null then
    if char_length(p_description) > 500 then raise exception 'Deskripsi maksimal 500 karakter'; end if;
    v_clean := regexp_replace(p_description, '[\s\-\.]', '', 'g');
    if v_clean ~ '(\+?62|0)8[0-9]{8,11}'
       or v_clean ~ '[0-9]{16}'
       or p_description ~ '\m[A-Z]{1,2}\s?[0-9]{1,4}\s?[A-Z]{1,3}\M' then
      raise exception 'Deskripsi tidak boleh memuat plat nomor, nomor telepon, atau NIK';
    end if;
  end if;

  -- Batas harian.
  if (select count(*) from public.reports where user_id = v_uid and report_date = (now() at time zone 'UTC')::date) >= 5 then
    raise exception 'Batas laporan harian tercapai (maks. 5)';
  end if;

  v_g := st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography;
  if p_device_lat is not null and p_device_lng is not null then
    v_dev := st_setsrid(st_makepoint(p_device_lng, p_device_lat), 4326)::geography;
  end if;

  -- Gabung ke titik terdekat (<=50 m, kategori sama, belum ditolak) atau buat titik baru.
  select s.id into v_spot
  from public.spots s
  where s.category = p_category and s.status <> 'rejected' and st_dwithin(s.geom, v_g, 50)
  order by st_distance(s.geom, v_g) limit 1;

  if v_spot is null then
    select r.id into v_region from public.regions r
    where r.boundary is not null and st_intersects(r.boundary, v_g)
    order by st_distance(st_centroid(r.boundary::geometry)::geography, v_g) limit 1;

    insert into public.spots (geom, category, region_id)
    values (v_g, p_category, v_region) returning id into v_spot;

    insert into public.spot_updates (spot_id, status, note) values (v_spot, 'pending', 'Titik dilaporkan');
  end if;

  if exists (select 1 from public.reports where user_id = v_uid and spot_id = v_spot and report_date = (now() at time zone 'UTC')::date) then
    raise exception 'Anda sudah melaporkan titik ini hari ini';
  end if;

  -- Skor kepercayaan (0-100), berbasis aturan.
  select count(distinct coalesce(r.user_id::text, r.id::text)) into v_others
  from public.reports r
  where r.spot_id = v_spot and r.user_id is distinct from v_uid and r.created_at > now() - interval '30 days';

  select count(*) into v_confirm from public.confirmations where spot_id = v_spot;

  v_score := 30
    + case when v_dev is not null and st_dwithin(v_dev, v_g, 200) then 20 else 0 end
    + case when v_prof.created_at < now() - interval '7 days' then 10 else 0 end
    + least(v_others * 10, 30)
    + least(v_confirm * 5, 10)
    + least(greatest(v_prof.reputation, -20), 10);
  v_score := least(greatest(v_score, 0), 100);

  insert into public.reports (spot_id, user_id, geom, device_geom, category, description, occurred_at, trust_score)
  values (v_spot, v_uid, v_g, v_dev, p_category, nullif(trim(p_description), ''), p_occurred_at, v_score);

  update public.spots s
  set reporter_count = (select count(distinct coalesce(r.user_id::text, r.id::text)) from public.reports r where r.spot_id = s.id)
  where s.id = v_spot;

  select (status <> 'rejected' and (reporter_count >= 2 or status in ('verified','in_progress','resolved')))
  into v_public from public.spots where id = v_spot;

  return jsonb_build_object('spot_id', v_spot, 'trust_score', v_score, 'is_public', v_public);
end;
$$;

-- Konfirmasi "saya juga melihat ini".
create or replace function public.confirm_spot(p_spot_id bigint)
returns int
language plpgsql security definer
set search_path = public, extensions
as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'Harus login'; end if;
  if not exists (select 1 from public.public_spots where id = p_spot_id) then
    raise exception 'Titik tidak ditemukan atau belum tampil publik';
  end if;
  if exists (select 1 from public.reports where spot_id = p_spot_id and user_id = v_uid) then
    raise exception 'Pelapor tidak bisa mengonfirmasi titiknya sendiri';
  end if;
  if exists (select 1 from public.confirmations where spot_id = p_spot_id and user_id = v_uid) then
    raise exception 'Anda sudah mengonfirmasi titik ini';
  end if;
  insert into public.confirmations (spot_id, user_id) values (p_spot_id, v_uid);
  return (select count(*)::int from public.confirmations where spot_id = p_spot_id);
end;
$$;

-- Admin: ubah status titik + catatan (masuk timeline publik).
-- Reputasi: pelapor titik +2 saat pending -> verified; -2 saat titik ditolak.
create or replace function public.admin_set_spot_status(
  p_spot_id bigint,
  p_status public.spot_status,
  p_note text default null
) returns void
language plpgsql security definer
set search_path = public, extensions
as $$
declare v_old public.spot_status;
begin
  if not public.is_admin() then raise exception 'Hanya admin'; end if;
  if p_status = 'rejected' and (p_note is null or trim(p_note) = '') then
    raise exception 'Alasan wajib diisi saat menolak';
  end if;

  select status into v_old from public.spots where id = p_spot_id for update;
  if not found then raise exception 'Titik tidak ditemukan'; end if;
  if v_old = p_status then raise exception 'Status sudah % ', p_status; end if;

  update public.spots set status = p_status, last_update_at = now() where id = p_spot_id;
  insert into public.spot_updates (spot_id, admin_id, status, note)
  values (p_spot_id, auth.uid(), p_status, nullif(trim(p_note), ''));

  if v_old = 'pending' and p_status = 'verified' then
    update public.profiles set reputation = reputation + 2
    where id in (select distinct user_id from public.reports where spot_id = p_spot_id and user_id is not null);
  elsif p_status = 'rejected' then
    update public.profiles set reputation = reputation - 2
    where id in (select distinct user_id from public.reports where spot_id = p_spot_id and user_id is not null);
  end if;
end;
$$;

-- (Tahap lanjutan) Risiko rute: input GeoJSON LineString, hasil titik publik dalam 100 m dari rute.
create or replace function public.route_risk(p_route_geojson text)
returns jsonb
language plpgsql stable security definer
set search_path = public, extensions
as $$
declare v_line geography;
begin
  v_line := st_setsrid(st_geomfromgeojson(p_route_geojson), 4326)::geography;
  return (
    select jsonb_build_object(
      'jumlah_titik', count(*),
      'total_bobot', coalesce(sum(ps.weight), 0),
      'titik', coalesce(jsonb_agg(jsonb_build_object('id', ps.id, 'category', ps.category, 'status', ps.status, 'weight', ps.weight)), '[]'::jsonb)
    )
    from public.public_spots ps
    join public.spots s on s.id = ps.id
    where st_dwithin(s.geom, v_line, 100)
  );
end;
$$;

-- ---------- KEAMANAN (RLS + HAK AKSES) ----------
alter table public.regions       enable row level security;
alter table public.profiles      enable row level security;
alter table public.spots         enable row level security;
alter table public.reports       enable row level security;
alter table public.confirmations enable row level security;
alter table public.spot_updates  enable row level security;
alter table public.cctv_points   enable row level security;

-- Cabut semua hak default, lalu beri hanya yang perlu.
revoke all on all tables    in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke execute on all functions in schema public from public, anon, authenticated;

-- Data wilayah & CCTV boleh dibaca publik; hanya admin yang boleh mengubah.
grant select on public.regions, public.cctv_points to anon, authenticated;
grant insert, update, delete on public.regions, public.cctv_points to authenticated;
grant usage, select on sequence public.regions_id_seq, public.cctv_points_id_seq to authenticated;

drop policy if exists regions_read on public.regions;
create policy regions_read on public.regions     for select using (true);
drop policy if exists regions_admin on public.regions;
create policy regions_admin on public.regions     for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists cctv_read on public.cctv_points;
create policy cctv_read on public.cctv_points for select using (true);
drop policy if exists cctv_admin on public.cctv_points;
create policy cctv_admin on public.cctv_points for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Tabel inti: hanya admin yang boleh membaca langsung (publik lewat view). Tidak ada hak tulis langsung.
grant select on public.profiles, public.spots, public.reports, public.confirmations, public.spot_updates to authenticated;

drop policy if exists profiles_read_own on public.profiles;
create policy profiles_read_own on public.profiles      for select to authenticated using (id = auth.uid() or public.is_admin());
drop policy if exists spots_admin_read on public.spots;
create policy spots_admin_read on public.spots         for select to authenticated using (public.is_admin());
drop policy if exists reports_read on public.reports;
create policy reports_read on public.reports       for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists confirm_read on public.confirmations;
create policy confirm_read on public.confirmations for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists updates_admin on public.spot_updates;
create policy updates_admin on public.spot_updates  for select to authenticated using (public.is_admin());

-- View publik.
grant select on public.public_spots, public.public_spot_updates, public.neglected_spots, public.region_scores to anon, authenticated;
grant select on public.my_reports to authenticated;

-- Fungsi yang boleh dipanggil dari klien.
grant execute on function public.is_admin()                                   to anon, authenticated;
grant execute on function public.route_risk(text)                             to anon, authenticated;
grant execute on function public.submit_report(double precision, double precision, public.report_category, text, timestamptz, double precision, double precision) to authenticated;
grant execute on function public.confirm_spot(bigint)                         to authenticated;
grant execute on function public.admin_set_spot_status(bigint, public.spot_status, text) to authenticated;
-- spot_weight dipakai view (dijalankan sebagai pemilik view); tidak perlu dibuka ke klien.

-- =====================================================================
-- LANGKAH SETELAH MENJALANKAN FILE INI
-- 1) Login sekali lewat Google di aplikasi, supaya profil terbuat.
-- 2) Jadikan akunmu admin (ganti UUID dengan id akunmu dari Authentication > Users):
--      update public.profiles set role = 'admin' where id = 'UUID-AKUNMU';
-- 3) (Opsional) jalankan 02_seed_demo.sql untuk data simulasi.
-- =====================================================================
