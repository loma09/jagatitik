import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const generalSans = localFont({
  src: [
    { path: "../../public/fonts/general-sans-regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/general-sans-medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/general-sans-semibold.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-general-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jaga Titik — transparansi tindak lanjut titik rawan",
  description: "Laporkan titik rawan secara anonim dan pantau apakah laporan itu ditindaklanjuti. Karya WIA MIA 2026.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${generalSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main id="konten" className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
