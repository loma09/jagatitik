"use client";

import { useEffect, useState } from "react";
import MapView from "@/components/map/MapView";
import LoginPanel from "@/components/auth/LoginPanel";
import { getSupabase, isSupabaseConfigured } from "@/services/supabase/client";
import { CATEGORY_LABEL } from "@/utils/status";
import { canReport } from "@/utils/access";

type Access = "loading" | "guest" | "allowed" | "blocked" | "error";

export default function ReportForm() {
  const configured = isSupabaseConfigured();
  const [access, setAccess] = useState<Access>(configured ? "loading" : "guest");
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!configured) return;
    const supabase = getSupabase();
    let cancelled = false;
    let version = 0;
    let timer: ReturnType<typeof setTimeout>;
    async function checkAccess() {
      const current = ++version;
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (cancelled || current !== version) return;
        if (!data.session) { setAccess("guest"); return; }
        const profile = await supabase.from("profiles").select("role").eq("id", data.session.user.id).single();
        if (cancelled || current !== version) return;
        if (profile.error) throw profile.error;
        setAccess(canReport(profile.data.role) ? "allowed" : "blocked");
      } catch { if (!cancelled && current === version) setAccess("error"); }
    }
    void checkAccess();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") { ++version; setAccess("guest"); setLocation(null); setSuccess(false); setError(null); }
      // Query the profile outside Supabase's auth callback to avoid locking its session.
      clearTimeout(timer);
      timer = setTimeout(() => { void checkAccess(); }, 0);
    });
    return () => { cancelled = true; clearTimeout(timer); subscription.unsubscribe(); };
  }, [configured]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!location || access !== "allowed" || pending) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    setPending(true);
    setError(null);
    setSuccess(false);
    try {
      const { error } = await getSupabase().rpc("submit_report", {
        p_lat: location[0], p_lng: location[1],
        p_category: fields.get("category"),
        p_description: fields.get("description"),
        p_occurred_at: new Date(String(fields.get("occurred_at"))).toISOString(),
      });
      if (error) throw new Error(error.message);
      setSuccess(true);
      form.reset();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Laporan belum terkirim. Coba lagi.");
    } finally { setPending(false); }
  }

  if (access === "loading") return <p role="status">Memeriksa akses pelapor…</p>;
  if (access === "guest") return <LoginPanel />;
  if (access === "blocked") return <p role="status">Akun ini belum memiliki akses pelapor. Kamu tetap dapat menjelajahi heatmap publik.</p>;
  if (access === "error") return <p role="alert">Akses pelapor belum berhasil dimuat. Coba muat ulang halaman.</p>;

  return (
    <form className="report-form" onSubmit={submit}>
      <div className="report-location">
        <h2>Pilih lokasi kejadian</h2>
        <p>Klik peta untuk meletakkan pin, lalu geser untuk menyesuaikan. Dengan keyboard, geser peta memakai tombol panah lalu tekan Enter.</p>
        <MapView onLocationChange={setLocation} />
        <p role="status">{location ? `Lokasi dipilih: ${location[0].toFixed(5)}, ${location[1].toFixed(5)}` : "Belum ada lokasi dipilih."}</p>
      </div>
      <div className="report-fields">
        <h2>Ceritakan yang terjadi</h2>
        <label>Kategori<select name="category" required defaultValue=""><option value="" disabled>Pilih kategori</option>{Object.entries(CATEGORY_LABEL).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Waktu kejadian<input name="occurred_at" type="datetime-local" required /></label>
        <label>Deskripsi singkat<textarea name="description" maxLength={500} rows={5} required aria-describedby="description-help" /></label>
        <p id="description-help">Maksimal 500 karakter. Jangan cantumkan nama orang, nomor telepon, NIK, atau plat nomor.</p>
        <label className="report-consent"><input type="checkbox" required />Saya melaporkan kejadian dengan jujur dan tidak menyertakan identitas pribadi.</label>
        <button type="submit" className="action-primary" disabled={!location || pending}>{pending ? "Mengirim laporan…" : "Kirim laporan"}</button>
        {error && <p role="alert">{error}</p>}
        {success && <p role="status">Laporan berhasil dikirim. Laporan akan berkontribusi ke heatmap setelah memenuhi aturan tayang.</p>}
      </div>
    </form>
  );
}
