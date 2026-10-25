import Link from "next/link";
import ReportStory from "@/components/home/ReportStory";
import LandingMotion from "@/components/home/LandingMotion";

const timeline = [
  { date: "18 Okt", title: "Laporan masuk", note: "Dua warga melaporkan lampu yang tidak menyala." },
  { date: "19 Okt", title: "Lokasi ditinjau", note: "Pemeriksaan dan rencana perbaikan dicatat." },
  { date: "21 Okt", title: "Perbaikan selesai", note: "Lampu kembali menyala. Riwayat tetap terbuka." },
];

const questions = [
  ["Siapa yang bisa melihat laporan?", "Siapa pun bisa membuka peta dan melihat titik yang memenuhi aturan tayang. Masuk ke akun diperlukan untuk mengirim laporan."],
  ["Apakah identitas saya ditampilkan?", "Nama dan identitas pelapor tidak ditampilkan di peta publik. Hindari menulis nama orang, nomor telepon, NIK, atau plat nomor dalam laporan."],
  ["Kapan sebuah titik muncul?", "Titik dapat tayang setelah dilaporkan minimal dua akun berbeda atau diverifikasi admin. Tayang tidak selalu berarti sudah diverifikasi admin."],
  ["Apakah ini menjamin suatu lokasi aman?", "Tidak. Peta menunjukkan laporan yang tersedia, bukan jaminan keamanan atau gambaran lengkap kondisi suatu wilayah."],
  ["Apakah semua fitur sudah tersedia?", "Jaga Titik masih dalam pengembangan. Peta sudah dapat dijelajahi; contoh timeline dan transparansi di halaman ini memperlihatkan alur yang direncanakan."],
  ["Bagaimana jika saya dalam bahaya?", "Utamakan keselamatan dan hubungi layanan darurat resmi. Jaga Titik bukan pengganti laporan polisi atau penanganan keadaan darurat."],
];

export default function Home() {
  return (
    <div className="landing">
      <LandingMotion />
      <ReportStory />

      <section className="record-section page-gutter" aria-labelledby="record-title">
        <div className="record-introduction">
          <h2 id="record-title" className="reveal">Cerita di<br />balik titik</h2>
          <p className="reveal">Sebuah penanda di peta seharusnya punya kelanjutan. Catatan waktu dan tindakan membuat prosesnya bisa diikuti, bukan sekadar ditunggu.</p>
          <Link href="/transparansi" className="text-link reveal">Kenali transparansi tindak lanjut</Link>
        </div>
        <div className="timeline-preview reveal" data-ui="timeline-preview">
          <div className="preview-heading"><span>Riwayat tindak lanjut</span><span className="demo-tag">Contoh simulasi</span></div>
          <p className="preview-subject">Lampu jalan belum menyala</p>
          <ol className="timeline-list">
            {timeline.map((item, index) => (
              <li key={item.date} className="reveal">
                <time dateTime={`2026-10-${[18, 19, 21][index]}`}>{item.date}</time>
                <span className={`timeline-dot ${index === 2 ? "is-complete" : ""}`} aria-hidden="true" />
                <div><p className="timeline-title">{item.title}</p><p>{item.note}</p></div>
              </li>
            ))}
          </ol>
          <p className="preview-footnote">Identitas pelapor tidak ditampilkan kepada publik.</p>
        </div>
      </section>

      <section className="trust-section page-gutter" aria-labelledby="trust-title">
        <div className="trust-heading">
          <h2 id="trust-title" className="reveal">Kepercayaan<br />ada dasarnya</h2>
          <p className="reveal">Laporan dinilai dari beberapa sinyal. Skor membantu peninjauan, tanpa mengklaim bahwa setiap laporan pasti benar.</p>
        </div>
        <div className="trust-body">
          <div className="trust-preview reveal" data-ui="trust-preview">
            <div className="preview-heading"><span>Skor kepercayaan</span><span className="demo-tag">Contoh simulasi</span></div>
            <p className="trust-value">60<span> / 100</span></p>
            <div className="trust-meter" role="meter" aria-label="Skor kepercayaan contoh" aria-valuemin={0} aria-valuemax={100} aria-valuenow={60}><span /></div>
            <dl className="trust-factors">
              <div><dt>Nilai dasar laporan</dt><dd>30</dd></div>
              <div><dt>Lokasi perangkat dekat</dt><dd>+20</dd></div>
              <div><dt>Satu pelapor lain</dt><dd>+10</dd></div>
            </dl>
            <p className="preview-footnote">Sinyal pendukung, bukan bukti kebenaran mutlak.</p>
          </div>
          <div className="trust-copy">
            <div className="trust-principle reveal"><h3>Terbuka caranya</h3><p>Aturan tayang, faktor kepercayaan, dan peluruhan bobot dijelaskan agar siapa pun bisa memahami penilaian laporan.</p></div>
            <div className="trust-principle reveal"><h3>Terjaga identitasnya</h3><p>Publik melihat lokasi dan tindak lanjut. Nama korban dan identitas pribadi pelapor tidak ditampilkan.</p></div>
            <Link href="/metodologi" className="text-link reveal">Pelajari metodologi</Link>
          </div>
        </div>
      </section>

      <section className="neglected-section page-gutter" aria-labelledby="neglected-title">
        <div className="neglected-copy">
          <h2 id="neglected-title" className="reveal">Yang tertunda<br />tetap terlihat</h2>
          <p className="reveal">Laporan yang lama tanpa kabar tidak seharusnya hilang di antara titik lainnya. Titik Terabaikan memberi ruang untuk terus menanyakan tindak lanjut.</p>
          <p className="neglected-rule reveal">Dalam rancangan saat ini: minimal tiga pelapor, belum selesai, dan tanpa pembaruan lebih dari 14 hari.</p>
        </div>
        <div className="neglected-preview reveal" data-ui="neglected-preview">
          <div className="preview-heading"><span>Titik Terabaikan</span><span className="demo-tag">Contoh simulasi</span></div>
          <p className="neglected-duration">18 <span>hari tanpa pembaruan</span></p>
          <p className="preview-subject">Penerangan jalur pejalan kaki</p>
          <p className="neglected-location">Wilayah contoh (simulasi)</p>
          <div className="neglected-details"><span>4 pelapor</span><span>Menunggu tindak lanjut</span></div>
          <p className="preview-footnote">Contoh fiktif, bukan penilaian kinerja instansi tertentu.</p>
        </div>
      </section>

      <section className="faq-section page-gutter" aria-labelledby="faq-title">
        <div className="faq-intro">
          <h2 id="faq-title" className="reveal">FAQ</h2>
          <p className="reveal">Hal yang perlu kamu ketahui sebelum ikut menjaga. Pilih pertanyaan untuk melihat jawabannya.</p>
        </div>
        <div className="faq-answers">
          {questions.map(([question, answer]) => (
            <details key={question} name="jaga-titik-faq" className="faq-item reveal">
              <summary><span>{question}</span><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h12M10 4v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></summary>
              <div className="faq-answer"><p>{answer}</p></div>
            </details>
          ))}
        </div>
      </section>

      <section className="closing-section page-gutter" aria-labelledby="closing-title">
        <div><h2 id="closing-title" className="reveal">Mulai dari sekitarmu</h2><p className="reveal">Kenali titik yang dilaporkan. Ikuti apa yang terjadi setelahnya.</p></div>
        <Link href="/peta" prefetch={false} className="action-primary reveal">Jelajahi peta <span aria-hidden="true">↗</span></Link>
      </section>
    </div>
  );
}
