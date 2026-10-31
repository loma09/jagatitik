"use client";

import { useState } from "react";
import { getSupabase, isSupabaseConfigured } from "@/services/supabase/client";

export default function LoginPanel() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  async function signIn() {
    setPending(true);
    setError(null);
    try {
      const { error } = await getSupabase().auth.signInWithOAuth({
        provider: "google", options: { redirectTo: `${window.location.origin}/lapor` },
      });
      if (error) throw error;
    } catch {
      setError("Belum berhasil masuk. Coba lagi atau periksa koneksi internet.");
      setPending(false);
    }
  }

  return (
    <div className="report-login">
      <h2>Masuk untuk menjadi pelapor</h2>
      <p>Pengguna dapat melihat heatmap tanpa akun. Masuk untuk memilih titik kejadian dan mengirim laporan. Identitas akun tidak ditampilkan kepada publik.</p>
      <button type="button" className="action-primary" disabled={pending || !configured} onClick={signIn}>{pending ? "Membuka Google…" : "Masuk dengan Google"}</button>
      {!configured && <p role="status">Login belum tersedia pada konfigurasi ini.</p>}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
