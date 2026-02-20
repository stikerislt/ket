"use client";

import type { QuestionDTO } from "@/src/lib/types/dto";

type OptionListProps = {
  question: QuestionDTO;
  selectedKeys: string[];
  disabled: boolean;
  onChange: (key: string) => void;
};

export function OptionList({ question, selectedKeys, disabled, onChange }: OptionListProps) {
  const isMulti = question.type === "multi";
  const isOrdering = question.type === "ordering";
  const controlType = isMulti ? "checkbox" : "radio";

  return (
    <fieldset className="mt-4 space-y-3" disabled={disabled}>
      <legend className="sr-only">Atsakymu pasirinkimas</legend>
      {question.options.map((option) => {
        const selectedIndex = selectedKeys.indexOf(option.key);
        const isSelected = selectedIndex !== -1;

        if (isOrdering) {
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => onChange(option.key)}
              disabled={disabled}
              aria-pressed={isSelected}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-300 bg-white hover:border-slate-400"
              } disabled:cursor-not-allowed disabled:opacity-70`}
            >
              <span
                className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isSelected ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
                }`}
                aria-hidden="true"
              >
                {isSelected ? selectedIndex + 1 : "-"}
              </span>
              <span className="font-medium text-slate-900">
                {option.key}. {option.textLt}
              </span>
            </button>
          );
        }

        return (
          <label
            key={option.key}
            className={`block cursor-pointer rounded-xl border p-3 text-sm transition ${
              isSelected
                ? "border-emerald-500 bg-emerald-50"
                : "border-slate-300 bg-white hover:border-slate-400"
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type={controlType}
                name={`question-${question.id}`}
                checked={isSelected}
                onChange={() => onChange(option.key)}
                className="h-4 w-4"
              />
              <span className="font-medium text-slate-900">
                {option.key}. {option.textLt}
              </span>
            </div>
          </label>
        );
      })}
    </fieldset>
  );
}
