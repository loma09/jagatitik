import Link from "next/link";

interface Props {
  title: string;
  description: string;
}

// Halaman sementara untuk rute di sitemap yang belum dikerjakan.
export default function PlaceholderPage({ title, description }: Props) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-brand">{title}</h1>
      <p className="mt-3 text-slate-600">{description}</p>
      <p className="mt-6 inline-block rounded bg-amber-100 px-3 py-1 text-sm text-amber-800">
        Halaman ini sedang dalam pengerjaan.
      </p>
      <div className="mt-8">
        <Link href="/" className="text-brand underline">
          Kembali ke beranda
        </Link>
      </div>
    </section>
  );
}
