"use client";

type ProgressTrackerProps = {
  index: number;
  total: number;
  correctCount: number;
  wrongCount: number;
};

export function ProgressTracker({ index, total, correctCount, wrongCount }: ProgressTrackerProps) {
  const current = Math.min(index + 1, total);
  const progressPercent = total === 0 ? 0 : Math.round((current / total) * 100);

  return (
    <div className="sticky top-0 z-20 rounded-xl border border-slate-300 bg-white/95 p-3 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
        <span>
          Klausimas {current} / {total}
        </span>
        <span>
          Teisingi: {correctCount} | Klaidos: {wrongCount}
        </span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-slate-200" aria-hidden="true">
        <div
          className="h-full rounded-full bg-emerald-500 transition-[width] duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
