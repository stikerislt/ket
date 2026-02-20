"use client";

import Link from "next/link";

const modes = [
  {
    href: "/practice",
    title: "Praktika",
    description: "Neribotas mokymasis su momentiniu paaiskinimu.",
    badge: "Mokymosi rezimas",
  },
  {
    href: "/exam",
    title: "Egzamino simuliacija",
    description: "Laiko rezimas su Regitra stiliaus struktura ir oficialumo ispejimu.",
    badge: "Simuliacija",
  },
  {
    href: "/topic",
    title: "Teminis mokymas",
    description: "Rinkitės tema: sankryzos, pirmumas, greitis ir kt.",
    badge: "Temos",
  },
] as const;

export function ModeSelector() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {modes.map((mode) => (
        <Link
          key={mode.href}
          href={mode.href}
          className="group rounded-2xl border border-slate-300 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-500 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <p className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tracking-wide text-slate-700">
            {mode.badge}
          </p>
          <h2 className="mt-3 text-xl font-bold text-slate-900">{mode.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{mode.description}</p>
          <p className="mt-4 text-sm font-semibold text-amber-700 group-hover:text-amber-800">
            Atidaryti
          </p>
        </Link>
      ))}
    </section>
  );
}
