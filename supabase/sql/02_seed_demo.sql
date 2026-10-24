-- =====================================================================
-- JAGA TITIK : 02_seed_demo.sql  (DATA SIMULASI JABODETABEK)
-- Jalankan SETELAH 01_schema.sql. Semua baris diberi is_demo = true.
-- PENTING: nama wilayah, skor, dan status di sini FIKTIF untuk demo dan
-- tidak menggambarkan kinerja instansi mana pun. Batas wilayah berupa
-- lingkaran PERKIRAAN di sekitar pusat kota, bukan batas administrasi resmi.
-- Hapus semua data demo kapan saja:
--     delete from public.spots   where is_demo;
--     delete from public.regions where name like '%(demo)%';
-- =====================================================================
do $$
declare
  -- nama, lintang pusat, bujur pusat, radius (m), kualitas respons simulasi (0-1)
  r record;
  v_region int;
  v_spot   bigint;
  v_g      geography;
  v_cat    public.report_category;
  v_n      int;
  v_st     public.spot_status;
  v_first  timestamptz;
  v_t1 timestamptz; v_t2 timestamptz; v_t3 timestamptz; v_last timestamptz;
  v_x double precision; v_ang double precision; v_dist double precision;
  v_scale double precision;
  i int; j int;
begin
  perform setseed(0.42);

  for r in
    select * from (values
      ('Jakarta Pusat (demo)',    -6.1865, 106.8341, 4000, 0.80),
      ('Jakarta Utara (demo)',    -6.1350, 106.8800, 5000, 0.35),
      ('Jakarta Barat (demo)',    -6.1680, 106.7590, 5500, 0.50),
      ('Jakarta Selatan (demo)',  -6.2615, 106.8106, 6000, 0.70),
      ('Jakarta Timur (demo)',    -6.2250, 106.9004, 6500, 0.45),
      ('Kota Depok (demo)',       -6.4025, 106.7942, 7000, 0.60),
      ('Kota Bogor (demo)',       -6.5950, 106.7970, 6000, 0.30),
      ('Kota Tangerang (demo)',   -6.1783, 106.6319, 6500, 0.55),
      ('Kota Bekasi (demo)',      -6.2383, 106.9756, 6500, 0.40)
    ) as t(name, lat, lng, radius_m, q)
  loop
    insert into public.regions (name, agency_name, boundary)
    values (r.name, 'Instansi terkait (simulasi)',
            st_buffer(st_setsrid(st_makepoint(r.lng, r.lat), 4326)::geography, r.radius_m)::geography(Polygon,4326))
    returning id into v_region;

    v_scale := 2 + (1 - r.q) * 14;    -- makin rendah kualitas, makin lambat respons (hari)

    for i in 1..10 loop
      -- posisi acak di dalam 80% radius wilayah
      v_ang  := random() * 2 * pi();
      v_dist := r.radius_m * 0.8 * sqrt(random());
      v_g := st_setsrid(st_makepoint(
               r.lng + (v_dist * sin(v_ang)) / (111320 * cos(radians(r.lat))),
               r.lat + (v_dist * cos(v_ang)) / 111320), 4326)::geography;

      v_x := random();
      v_cat := case when v_x < 0.40 then 'begal' when v_x < 0.85 then 'area_gelap' else 'copet' end;
      v_first := now() - random() * interval '60 days';

      if random() < 0.15 then
        v_n := 1; v_st := 'pending';
      else
        v_n := 2 + floor(random()*4)::int;
        if random() < (0.05 + 0.45 * (1 - r.q)) then
          v_st := 'pending';
        else
          v_x := random();
          v_st := case when v_x < r.q * 0.8 then 'resolved'
                       when v_x < r.q * 0.8 + 0.3 then 'in_progress'
                       else 'verified' end;
        end if;
      end if;

      insert into public.spots (geom, category, region_id, status, reporter_count, first_reported_at, is_demo)
      values (v_g, v_cat, v_region, v_st, v_n, v_first, true) returning id into v_spot;

      for j in 1..v_n loop
        insert into public.reports (spot_id, user_id, geom, category, description, occurred_at, trust_score, created_at, report_date, is_demo)
        values (v_spot, null, v_g, v_cat, 'Data simulasi',
                least(v_first + random()*interval '5 days', now() - interval '1 minute'),
                40 + floor(random()*51)::int,
                least(v_first + random()*interval '5 days', now() - interval '1 minute'),
                (now() at time zone 'UTC')::date, true);
      end loop;

      insert into public.spot_updates (spot_id, status, note, created_at)
      values (v_spot, 'pending', 'Titik dilaporkan (simulasi)', v_first);

      if v_st <> 'pending' then
        v_t1 := least(v_first + (0.5 + random() * v_scale) * interval '1 day', now() - interval '1 hour');
        insert into public.spot_updates (spot_id, status, note, created_at)
        values (v_spot, 'verified', 'Laporan diverifikasi (simulasi)', v_t1);
        v_last := v_t1;
        if v_st in ('in_progress','resolved') then
          v_t2 := least(v_t1 + (1 + random() * v_scale * 1.5) * interval '1 day', now() - interval '30 minutes');
          insert into public.spot_updates (spot_id, status, note, created_at)
          values (v_spot, 'in_progress', 'Tindak lanjut dijadwalkan (simulasi)', v_t2);
          v_last := v_t2;
          if v_st = 'resolved' then
            v_t3 := least(v_t2 + (1 + random() * v_scale * 2) * interval '1 day', now() - interval '10 minutes');
            insert into public.spot_updates (spot_id, status, note, created_at)
            values (v_spot, 'resolved', 'Tindakan selesai (simulasi)', v_t3);
            v_last := v_t3;
          end if;
        end if;
        update public.spots set last_update_at = v_last where id = v_spot;
      end if;
    end loop;
  end loop;
end $$;
