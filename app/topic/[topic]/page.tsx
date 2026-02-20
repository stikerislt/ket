import Link from "next/link";

import { GameClient } from "@/src/components/game/GameClient";

type TopicScenarioPageProps = {
  params: Promise<{
    topic: string;
  }>;
};

export default async function TopicScenarioPage({ params }: TopicScenarioPageProps) {
  const { topic } = await params;
  const decodedTopic = decodeURIComponent(topic);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Tema: {decodedTopic}</h1>
        <Link href="/topic" className="text-sm font-semibold text-amber-700">
          Atgal i temas
        </Link>
      </div>
      <GameClient mode="TOPIC" topic={decodedTopic} />
    </main>
  );
}
