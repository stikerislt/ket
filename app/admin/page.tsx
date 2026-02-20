import Link from "next/link";

export default function AdminLandingPage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Administravimas</h1>
      <p className="mt-2 text-sm text-slate-700">Naudokite API slaptažodi su x-admin-password antraste.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href="/admin/questions" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          Klausimai
        </Link>
        <Link href="/admin/sources" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800">
          Saltiniai
        </Link>
      </div>
    </main>
  );
}
