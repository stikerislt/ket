import type { FeedbackDTO } from "@/src/lib/types/dto";

type FeedbackPanelProps = {
  feedback: FeedbackDTO;
};

export function FeedbackPanel({ feedback }: FeedbackPanelProps) {
  return (
    <section
      className={`mt-4 rounded-xl border p-4 ${
        feedback.isCorrect ? "border-emerald-400 bg-emerald-50" : "border-rose-300 bg-rose-50"
      }`}
      aria-live="polite"
    >
      <h2 className="text-base font-bold text-slate-900">
        {feedback.isCorrect ? "Teisinga" : "Neteisinga"}
      </h2>
      <p className="mt-1 text-sm text-slate-800">
        Teisingi variantai: {feedback.correctOptionKeys.join(", ") || "Nera"}.
      </p>

      <ul className="mt-3 space-y-2 text-sm">
        {feedback.perOptionExplanationLt.map((item) => (
          <li key={item.key} className="rounded-lg border border-white/80 bg-white/70 p-2 text-slate-800">
            <p className="font-semibold">
              {item.key} {item.isCorrectOption ? "(teisingas)" : "(neteisingas)"}
            </p>
            <p className="mt-1">{item.explanationLt}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
