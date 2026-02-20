import type { QuestionDTO } from "@/src/lib/types/dto";

type RuleCitationPanelProps = {
  question: QuestionDTO;
};

export function RuleCitationPanel({ question }: RuleCitationPanelProps) {
  return (
    <details className="mt-4 rounded-xl border border-slate-300 bg-white p-3">
      <summary className="cursor-pointer text-sm font-semibold text-slate-800">Taisykliu nuorodos</summary>
      <ul className="mt-3 space-y-2 text-sm">
        {question.citations.map((citation) => (
          <li key={`${citation.sourceCode}-${citation.sectionCode}`} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <p className="font-semibold text-slate-900">
              {citation.sourceCode} {citation.sectionCode}
              {citation.isPrimary ? " (pirminis)" : " (papildomas)"}
            </p>
            <p className="mt-1 text-slate-700">{citation.excerptLt}</p>
            {citation.pageRef ? <p className="mt-1 text-xs text-slate-500">Puslapis: {citation.pageRef}</p> : null}
          </li>
        ))}
      </ul>
    </details>
  );
}
