"use client";

import Link from "next/link";

import { TOPICS } from "@/src/lib/constants";

export function TopicPicker() {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {TOPICS.map((topic) => (
        <Link
          key={topic}
          href={`/topic/${encodeURIComponent(topic)}`}
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-amber-500 hover:text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          {topic}
        </Link>
      ))}
    </section>
  );
}
