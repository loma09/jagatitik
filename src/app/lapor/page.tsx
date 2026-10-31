import ReportForm from "@/components/reports/ReportForm";
export const metadata = { title: "Lapor titik rawan — Jaga Titik" };
export default function Page() {
  return <section className="report-page page-gutter"><h1>Laporkan kejadian di sekitarmu</h1><p className="report-intro">Tentukan lokasi kejadian dan ceritakan seperlunya. Identitas pelapor tidak ditampilkan di peta publik.</p><ReportForm /></section>;
}
