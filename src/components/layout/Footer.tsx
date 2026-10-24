import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer page-gutter">
      <div className="footer-main">
        <div className="footer-about">
          <Link href="/" className="brand-link" aria-label="Jaga Titik, beranda"><svg className="brand-symbol" viewBox="0 0 32 38" fill="none" aria-hidden="true"><path d="M16 37C12 31 1 22 1 15a15 15 0 0 1 30 0c0 7-11 16-15 22Z" fill="currentColor"/><circle cx="16" cy="15" r="5" fill="var(--accent)"/></svg><span>jaga titik<span className="brand-period">.</span></span></Link>
          <p>Kepedulian warga, tindak lanjut yang terbuka. Mulai menjaga dari satu titik di sekitarmu.</p><span className="footer-demo">Prototipe dengan data simulasi</span>
        </div>
        <nav className="footer-links" aria-label="Jelajahi Jaga Titik"><h2>Jelajahi</h2><Link href="/peta">Peta titik</Link><Link href="/lapor">Buat laporan</Link><Link href="/transparansi">Transparansi</Link><Link href="/laporan-saya">Laporan saya</Link></nav>
        <nav className="footer-links" aria-label="Informasi Jaga Titik"><h2>Tentang platform</h2><Link href="/metodologi">Metodologi</Link><Link href="/privasi">Kebijakan privasi</Link><Link href="/darurat">Layanan darurat</Link><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">Atribusi peta</a></nav>
        <div className="footer-emergency"><h2>Butuh bantuan segera?</h2><a href="tel:112" className="footer-phone">112<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m8 3 3 5-3 3c1.4 2.6 2.4 3.6 5 5l3-3 5 3-1 5C10 22 2 14 3 4l5-1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg></a><p>Hubungi layanan darurat resmi. Utamakan keselamatanmu.</p></div>
      </div>
      <div className="footer-bottom"><p>© 2026 Jaga Titik</p><p>Karya Web In Action, MIA 2026</p><a href="#konten">Kembali ke atas <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 15V5m-4 4 4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></a></div>
    </footer>
  );
}
