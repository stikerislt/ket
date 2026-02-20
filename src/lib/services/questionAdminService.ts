import type { Prisma } from "@prisma/client";

import { questionSchema } from "@/src/lib/contentSchemas";
import { db } from "@/src/lib/db";
import { evaluateEvidence } from "@/src/lib/evidence";
import { persistQuestion } from "@/src/lib/importer";

function toBlockedResponse(referenceCount: number, primaryReferenceCount: number, sectionCodes: string[]) {
  return evaluateEvidence({
    referenceCount,
    primaryReferenceCount,
    referencedSectionCodes: sectionCodes,
  });
}

export async function listQuestionsAdmin() {
  return db.question.findMany({
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
    orderBy: [{ createdAt: "desc" }],
  });
}

export async function createQuestionAdmin(input: unknown) {
  const parsed = questionSchema.parse(input);
  return persistQuestion(parsed);
}

export async function patchQuestionAdmin(questionId: string, patch: Prisma.QuestionUpdateInput & {
  options?: Array<{
    key: string;
    textLt: string;
    isCorrect: boolean;
    orderRank?: number | null;
    explanationLt: string;
  }>;
  references?: Array<{
    sourceCode: string;
    sectionCode: string;
    isPrimary?: boolean;
  }>;
}) {
  const existing = await db.question.findUnique({
    where: { id: questionId },
    include: {
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

  if (!existing) {
    throw new Error("Klausimas nerastas.");
  }

  let referenceWrites:
    | Prisma.QuestionReferenceUncheckedCreateWithoutQuestionInput[]
    | undefined;
  let evidenceStatus = existing.evidenceStatus;

  if (patch.references) {
    referenceWrites = [];
    for (const reference of patch.references) {
      const clause = await db.ruleClause.findFirst({
        where: {
          sectionCode: reference.sectionCode,
          sourceDocument: {
            code: reference.sourceCode,
          },
        },
      });

      if (!clause) {
        continue;
      }

      referenceWrites.push({
        ruleClauseId: clause.id,
        isPrimary: reference.isPrimary ?? true,
      });
    }

    const evidence = toBlockedResponse(
      referenceWrites.length,
      referenceWrites.filter((reference) => reference.isPrimary).length,
      patch.references.map((reference) => reference.sectionCode),
    );
    evidenceStatus = evidence.evidenceStatus;
  }

  const updated = await db.question.update({
    where: { id: questionId },
    data: {
      ...patch,
      evidenceStatus,
      status:
        evidenceStatus === "SUFFICIENT"
          ? patch.status ?? existing.status
          : "DRAFT",
      options: patch.options
        ? {
            deleteMany: {},
            create: patch.options.map((option) => ({
              key: option.key,
              textLt: option.textLt,
              isCorrect: option.isCorrect,
              orderRank: option.orderRank ?? null,
              explanationLt: option.explanationLt,
            })),
          }
        : undefined,
      references: referenceWrites
        ? {
            deleteMany: {},
            create: referenceWrites,
          }
        : undefined,
    },
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

  return updated;
}

export async function publishQuestionAdmin(questionId: string) {
  const question = await db.question.findUnique({
    where: { id: questionId },
    include: {
      references: {
        include: {
          ruleClause: true,
        },
      },
    },
  });

  if (!question) {
    throw new Error("Klausimas nerastas.");
  }

  const evidence = toBlockedResponse(
    question.references.length,
    question.references.filter((reference) => reference.isPrimary).length,
    question.references.map((reference) => reference.ruleClause.sectionCode),
  );

  if (evidence.evidenceStatus !== "SUFFICIENT") {
    await db.question.update({
      where: { id: questionId },
      data: {
        evidenceStatus: "INSUFFICIENT_RULE_BASIS",
        status: "DRAFT",
      },
    });

    return {
      ok: false,
      blockedReasons: evidence.blockedReasons,
      evidenceStatus: "INSUFFICIENT_RULE_BASIS" as const,
    };
  }

  await db.question.update({
    where: { id: questionId },
    data: {
      status: "PUBLISHED",
      evidenceStatus: "SUFFICIENT",
    },
  });

  return {
    ok: true,
    blockedReasons: [],
    evidenceStatus: "SUFFICIENT" as const,
  };
}
