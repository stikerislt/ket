import Link from "next/link";

import { GameClient } from "@/src/components/game/GameClient";

export default function PracticePage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Praktikos rezimas</h1>
        <Link href="/" className="text-sm font-semibold text-amber-700">
          I pagrindini
        </Link>
      </div>
      <GameClient mode="PRACTICE" />
    </main>
  );
}
