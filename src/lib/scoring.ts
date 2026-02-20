import type { QuestionOption, QuestionType } from "@prisma/client";

export type ScoreResult = {
  isCorrect: boolean;
  correctOptionKeys: string[];
};

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function sameOrder(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

export function evaluateAnswer(
  type: QuestionType,
  options: QuestionOption[],
  selectedOptionKeys: string[],
): ScoreResult {
  if (type === "ordering") {
    const correctOptionKeys = options
      .filter((option) => option.orderRank !== null)
      .sort((a, b) => (a.orderRank ?? 0) - (b.orderRank ?? 0))
      .map((option) => option.key);

    return {
      isCorrect: sameOrder(selectedOptionKeys, correctOptionKeys),
      correctOptionKeys,
    };
  }

  const correctOptionKeys = uniqueSorted(
    options.filter((option) => option.isCorrect).map((option) => option.key),
  );
  const normalizedSelected = uniqueSorted(selectedOptionKeys);

  return {
    isCorrect: sameOrder(normalizedSelected, correctOptionKeys),
    correctOptionKeys,
  };
}
