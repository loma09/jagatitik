import Link from "next/link";

const features = [
  {
    title: "Lapor secara anonim",
    text: "Tandai titik rawan tanpa menampilkan identitas. Laporan dinilai skor kepercayaannya agar laporan palsu sulit lolos.",
  },
  {
    title: "Lihat tindak lanjutnya",
    text: "Setiap titik punya timeline status dari dilaporkan sampai selesai, jadi publik tahu apa yang sudah dilakukan.",
  },
  {
    title: "Pantau kinerja respons",
    text: "Skor Respons wilayah dan daftar Titik Terabaikan membuat tindak lanjut instansi dapat diukur secara terbuka.",
  },
];

export default function Home() {
  return (
    <>
      <section className="bg-brand text-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
            Transparansi tindak lanjut titik rawan
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
            Bukan hanya di mana rawan, tapi apa yang dilakukan setelah dilaporkan.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-200">
            Jaga Titik menghubungkan laporan warga dengan tindak lanjut instansi, sehingga titik rawan terlihat,
            terverifikasi, dan dapat dipantau publik.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/peta" className="rounded bg-accent px-5 py-3 font-semibold text-brand hover:bg-amber-400">
              Lihat peta
            </Link>
            <Link href="/transparansi" className="rounded border border-white/60 px-5 py-3 font-semibold hover:bg-white/10">
              Lihat kinerja respons
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-bold text-brand">Cara kerja</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {features.map((f) => (
            <article key={f.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-brand">{f.title}</h3>
              <p className="mt-2 text-slate-600">{f.text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
