import Link from "next/link";

import { TopicPicker } from "@/src/components/game/TopicPicker";

export default function TopicPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-6 sm:px-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Teminis mokymas</h1>
        <Link href="/" className="text-sm font-semibold text-amber-700">
          I pagrindini
        </Link>
      </div>
      <TopicPicker />
    </main>
  );
}
