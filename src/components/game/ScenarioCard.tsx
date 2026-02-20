import type { QuestionDTO } from "@/src/lib/types/dto";

type ScenarioCardProps = {
  question: QuestionDTO;
};

export function ScenarioCard({ question }: ScenarioCardProps) {
  return (
    <article className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {question.topic} | {question.difficulty}
      </p>
      <h1 className="mt-2 text-xl font-bold text-slate-900">{question.promptLt}</h1>
      <p className="mt-3 text-sm leading-6 text-slate-700">{question.situationLt}</p>

      {question.mediaUrl ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={question.mediaUrl}
            alt="Situacijos iliustracija"
            className="h-auto w-full"
            loading="lazy"
          />
        </div>
      ) : null}
    </article>
  );
}
