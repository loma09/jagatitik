-- =====================================================================
-- JAGA TITIK : 02_seed_demo.sql  (DATA SIMULASI, bukan data nyata)
-- Jalankan SETELAH 01_schema.sql. Semua baris diberi is_demo = true.
-- Ganti pusat area demo di bawah (c_lat, c_lng) sesuai area pilihanmu.
-- Hapus semua data demo kapan saja:  delete from public.spots where is_demo;
--                                    delete from public.regions where name like '%(demo)%';
-- =====================================================================
do $$
declare
  c_lat constant double precision := -7.2575;     -- GANTI: lintang pusat area demo
  c_lng constant double precision := 112.7521;    -- GANTI: bujur pusat area demo
  v_region int;
  v_spot   bigint;
  v_g      geography;
  v_cat    public.report_category;
  v_n      int;
  v_st     public.spot_status;
  v_first  timestamptz;
  v_t1 timestamptz; v_t2 timestamptz; v_t3 timestamptz; v_last timestamptz;
  v_x double precision;
  i int; j int;
begin
  perform setseed(0.42);

  insert into public.regions (name, agency_name, boundary)
  values ('Area Demo (demo)', 'Instansi Demo (simulasi)',
          st_buffer(st_setsrid(st_makepoint(c_lng, c_lat), 4326)::geography, 3500)::geography(Polygon,4326))
  returning id into v_region;

  for i in 1..45 loop
    v_g := st_setsrid(st_makepoint(c_lng + (random()-0.5)*0.04, c_lat + (random()-0.5)*0.04), 4326)::geography;
    v_x := random();
    v_cat := case when v_x < 0.40 then 'begal' when v_x < 0.85 then 'area_gelap' else 'copet' end;
    v_first := now() - random() * interval '60 days';

    if random() < 0.2 then
      v_n := 1; v_st := 'pending';
    else
      v_n := 2 + floor(random()*4)::int;
      v_x := random();
      v_st := case when v_x < 0.20 then 'pending' when v_x < 0.50 then 'verified'
                   when v_x < 0.75 then 'in_progress' else 'resolved' end;
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
    v_last := null;

    if v_st <> 'pending' then
      v_t1 := least(v_first + (1 + random()*9) * interval '1 day', now() - interval '1 hour');
      insert into public.spot_updates (spot_id, status, note, created_at)
      values (v_spot, 'verified', 'Laporan diverifikasi (simulasi)', v_t1);
      v_last := v_t1;
      if v_st in ('in_progress','resolved') then
        v_t2 := least(v_t1 + (1 + random()*10) * interval '1 day', now() - interval '30 minutes');
        insert into public.spot_updates (spot_id, status, note, created_at)
        values (v_spot, 'in_progress', 'Tindak lanjut dijadwalkan (simulasi)', v_t2);
        v_last := v_t2;
        if v_st = 'resolved' then
          v_t3 := least(v_t2 + (1 + random()*15) * interval '1 day', now() - interval '10 minutes');
          insert into public.spot_updates (spot_id, status, note, created_at)
          values (v_spot, 'resolved', 'Tindakan selesai (simulasi)', v_t3);
          v_last := v_t3;
        end if;
      end if;
      update public.spots set last_update_at = v_last where id = v_spot;
    end if;
  end loop;
end $$;
