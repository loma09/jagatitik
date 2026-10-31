"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const links = [{ href: "/", label: "Beranda" }, { href: "/peta", label: "Peta" }, { href: "/transparansi", label: "Transparansi" }, { href: "/metodologi", label: "Metodologi" }];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <header className="site-header" data-scrolled={scrolled} onKeyDown={(event) => { if (event.key === "Escape") { setOpen(false); menuButton.current?.focus(); } }}>
      <a className="skip-link" href="#konten">Lewati ke konten</a>
      <nav className="site-navigation page-gutter" aria-label="Navigasi utama">
        <Link href="/" className="brand-link" onClick={() => setOpen(false)} aria-label="Jaga Titik, beranda"><svg className="brand-symbol" viewBox="0 0 32 38" fill="none" aria-hidden="true"><path d="M16 37C12 31 1 22 1 15a15 15 0 0 1 30 0c0 7-11 16-15 22Z" fill="currentColor"/><circle cx="16" cy="15" r="5" fill="var(--accent)"/></svg><span>jaga titik<span className="brand-period">.</span></span></Link>
        <ul className="desktop-links">{links.map((link) => <li key={link.href}><Link href={link.href} prefetch={link.href === "/peta" ? false : undefined} aria-current={pathname === link.href ? "page" : undefined}>{link.label}</Link></li>)}</ul>
        <div className="nav-actions">
          <Link href="/darurat" className="emergency-link"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m8 3 3 5-3 3c1.4 2.6 2.4 3.6 5 5l3-3 5 3-1 5C10 22 2 14 3 4l5-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg><span>Darurat 112</span></Link>
          <Link href="/lapor" prefetch={false} className="nav-primary">Buat laporan <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 10h10m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></Link>
          <button ref={menuButton} className="menu-button" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Tutup menu" : "Buka menu"} onClick={() => setOpen(!open)}><span className="menu-lines" aria-hidden="true"><span /><span /></span></button>
        </div>
      </nav>
      <nav id="mobile-navigation" className="mobile-navigation page-gutter" aria-label="Navigasi ponsel" hidden={!open}>{links.map((link) => <Link href={link.href} key={link.href} prefetch={link.href === "/peta" ? false : undefined} aria-current={pathname === link.href ? "page" : undefined} onClick={() => setOpen(false)}>{link.label}</Link>)}<Link href="/lapor" prefetch={false} className="mobile-report" onClick={() => setOpen(false)}>Buat laporan</Link></nav>
      <div className="reading-progress" aria-hidden="true" />
    </header>
  );
}
