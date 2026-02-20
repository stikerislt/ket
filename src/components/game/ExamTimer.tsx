"use client";

type ExamTimerProps = {
  secondsLeft: number;
  isEvidenceLockedWarning: boolean;
};

function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safe % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function ExamTimer({ secondsLeft, isEvidenceLockedWarning }: ExamTimerProps) {
  const isCritical = secondsLeft <= 60;

  return (
    <aside className="sticky top-16 z-20 rounded-xl border border-slate-300 bg-white/95 p-3 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Laikmatis</p>
        <p
          className={`text-lg font-extrabold ${isCritical ? "text-rose-700" : "text-slate-900"}`}
          aria-live="polite"
        >
          {formatTime(secondsLeft)}
        </p>
      </div>
      {isEvidenceLockedWarning ? (
        <p className="mt-2 rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-amber-800">
          Oficialus vertinimo slenkstis nepatvirtintas. Rodomas mokomasis laikas.
        </p>
      ) : null}
    </aside>
  );
}
