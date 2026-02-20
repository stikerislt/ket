"use client";

import Link from "next/link";
import { useState } from "react";

type AdminSource = {
  id: string;
  code: string;
  title: string;
  filePath: string;
  _count: {
    clauses: number;
  };
};

export default function AdminSourcesPage() {
  const [password, setPassword] = useState("");
  const [sources, setSources] = useState<AdminSource[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  async function loadSources() {
    const response = await fetch("/api/v1/admin/sources", {
      headers: {
        "x-admin-password": password,
      },
    });

    const data = (await response.json()) as { sources?: AdminSource[]; error?: string };
    if (!response.ok) {
      setMessage(data.error ?? "Nepavyko gauti saltiniu.");
      return;
    }

    setSources(data.sources ?? []);
    setMessage(null);
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-6 sm:px-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Admin: saltiniai</h1>
        <Link href="/admin" className="text-sm font-semibold text-amber-700">
          Atgal
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
        <label className="text-sm font-semibold text-slate-800" htmlFor="admin-source-password">
          Admin slaptažodis
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="admin-source-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-80"
          />
          <button
            type="button"
            onClick={() => void loadSources()}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Ikelti
          </button>
        </div>
        {message ? <p className="mt-2 text-sm text-rose-700">{message}</p> : null}
      </section>

      <section className="mt-4 grid gap-3">
        {sources.map((source) => (
          <article key={source.id} className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">{source.code}</h2>
            <p className="text-sm text-slate-700">{source.title}</p>
            <p className="mt-1 text-xs text-slate-500">{source.filePath}</p>
            <p className="mt-2 text-xs font-semibold text-slate-700">Nuostatu skaicius: {source._count.clauses}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
