import Link from "next/link";

import { ModeSelector } from "@/src/components/game/ModeSelector";

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="rounded-3xl border border-slate-300 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">KET Scenario Trainer</p>
        <h1 className="mt-3 text-3xl font-extrabold text-slate-950 sm:text-4xl">
          Mokykites KET per realistines eismo situacijas
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">
          Klausimai grindziami pateiktais KET saltiniais. Kiekvienas atsakymas turi paaiskinima,
          taisykles nuoroda ir progreso sekima.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/practice" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Pradeti praktika
          </Link>
          <Link href="/topic" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800">
            Pasirinkti tema
          </Link>
          <Link href="/admin/questions" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
            Administravimas
          </Link>
        </div>
      </header>

      <section className="mt-8">
        <ModeSelector />
      </section>
    </main>
  );
}
