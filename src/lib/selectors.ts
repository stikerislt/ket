import type { Difficulty, EvidenceStatus, Prisma } from "@prisma/client";

import { db } from "@/src/lib/db";

export type QuestionSelectionFilter = {
  topic?: string;
  difficulty?: Difficulty;
  limit: number;
  includeDraft?: boolean;
  evidenceStatus?: EvidenceStatus;
};

function shuffle<T>(items: T[]): T[] {
  const copied = [...items];
  for (let index = copied.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [copied[index], copied[target]] = [copied[target], copied[index]];
  }
  return copied;
}

export async function selectQuestions(filter: QuestionSelectionFilter) {
  const where: Prisma.QuestionWhereInput = {
    topic: filter.topic,
    difficulty: filter.difficulty,
    ...(filter.includeDraft
      ? {}
      : {
          status: "PUBLISHED",
          evidenceStatus: filter.evidenceStatus ?? "SUFFICIENT",
        }),
  };

  const questions = await db.question.findMany({
    where,
    include: {
      options: true,
      references: {
        include: {
          ruleClause: {
            include: {
              sourceDocument: true,
            },
          },
        },
      },
    },
  });

  return shuffle(questions).slice(0, filter.limit);
}
