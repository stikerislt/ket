import { readFile } from "node:fs/promises";
import path from "node:path";

import type { Prisma, QuestionStatus } from "@prisma/client";

import {
  questionSchema,
  questionsFileSchema,
  sourcesFileSchema,
  type QuestionInput,
} from "@/src/lib/contentSchemas";
import { db } from "@/src/lib/db";
import { evaluateEvidence } from "@/src/lib/evidence";

const DEFAULT_SOURCES_PATH = path.join(
  process.cwd(),
  "content",
  "sources",
  "ket-knygute-2024-2025.json",
);
const DEFAULT_QUESTIONS_PATH = path.join(
  process.cwd(),
  "content",
  "questions",
  "initial-15.lt.json",
);

type ClauseLookup = Map<string, string>;

function clauseKey(sourceCode: string, sectionCode: string): string {
  return `${sourceCode}::${sectionCode}`;
}

async function parseJsonFile<T>(filePath: string, schema: { parse: (v: unknown) => T }): Promise<T> {
  const content = await readFile(filePath, "utf-8");
  const parsed: unknown = JSON.parse(content);
  return schema.parse(parsed);
}

export async function importSourceDocuments(filePath = DEFAULT_SOURCES_PATH) {
  const parsed = await parseJsonFile(filePath, sourcesFileSchema);

  const sourceCodes: string[] = [];
  for (const sourceDocument of parsed.sourceDocuments) {
    const revisionDate = sourceDocument.revisionDate
      ? new Date(sourceDocument.revisionDate)
      : null;

    const upserted = await db.sourceDocument.upsert({
      where: { code: sourceDocument.code },
      update: {
        title: sourceDocument.title,
        filePath: sourceDocument.filePath,
        revisionDate,
        checksum: sourceDocument.checksum ?? null,
      },
      create: {
        code: sourceDocument.code,
        title: sourceDocument.title,
        filePath: sourceDocument.filePath,
        revisionDate,
        checksum: sourceDocument.checksum ?? null,
      },
    });

    sourceCodes.push(upserted.code);

    for (const clause of sourceDocument.clauses) {
      await db.ruleClause.upsert({
        where: {
          sourceDocumentId_sectionCode: {
            sourceDocumentId: upserted.id,
            sectionCode: clause.sectionCode,
          },
        },
        update: {
          excerptLt: clause.excerptLt,
          pageRef: clause.pageRef ?? null,
          evidenceLevel: clause.evidenceLevel,
        },
        create: {
          sourceDocumentId: upserted.id,
          sectionCode: clause.sectionCode,
          excerptLt: clause.excerptLt,
          pageRef: clause.pageRef ?? null,
          evidenceLevel: clause.evidenceLevel,
        },
      });
    }
  }

  return { importedSources: sourceCodes.length };
}

async function buildClauseLookup(): Promise<ClauseLookup> {
  const clauses = await db.ruleClause.findMany({
    include: {
      sourceDocument: true,
    },
  });

  const lookup: ClauseLookup = new Map();
  for (const clause of clauses) {
    lookup.set(clauseKey(clause.sourceDocument.code, clause.sectionCode), clause.id);
  }

  return lookup;
}

function normalizeQuestionStatus(status: QuestionStatus, evidenceStatus: "SUFFICIENT" | "INSUFFICIENT_RULE_BASIS"): QuestionStatus {
  if (evidenceStatus === "INSUFFICIENT_RULE_BASIS") {
    return "DRAFT";
  }

  return status;
}

export async function persistQuestion(input: QuestionInput, lookup?: ClauseLookup) {
  const question = questionSchema.parse(input);
  const clauseLookup = lookup ?? (await buildClauseLookup());

  const resolvedReferences = question.references.map((reference) => {
    const ruleClauseId =
      clauseLookup.get(clauseKey(reference.sourceCode, reference.sectionCode)) ?? null;
    return {
      ...reference,
      ruleClauseId,
    };
  });

  const unresolvedReferences: string[] = [];
  resolvedReferences.forEach((reference) => {
    if (!reference.ruleClauseId) {
      unresolvedReferences.push(`${reference.sourceCode}:${reference.sectionCode}`);
    }
  });

  const evidenceEvaluation = evaluateEvidence({
    referenceCount: resolvedReferences.filter((reference) => Boolean(reference.ruleClauseId)).length,
    primaryReferenceCount: question.references.filter((reference) => reference.isPrimary).length,
    referencedSectionCodes: question.references.map((reference) => reference.sectionCode),
  });

  const evidenceStatus =
    unresolvedReferences.length > 0
      ? "INSUFFICIENT_RULE_BASIS"
      : evidenceEvaluation.evidenceStatus;

  const blockedReasons = [...evidenceEvaluation.blockedReasons];
  if (unresolvedReferences.length > 0) {
    blockedReasons.push("UNKNOWN_REFERENCE");
  }

  const status = normalizeQuestionStatus(question.status, evidenceStatus);

  const persisted = await db.question.upsert({
    where: { slug: question.slug },
    update: {
      externalId: question.externalId,
      type: question.type,
      topic: question.topic,
      difficulty: question.difficulty,
      situationLt: question.situationLt,
      promptLt: question.promptLt,
      mediaUrl: question.mediaUrl ?? null,
      status,
      evidenceStatus,
      options: {
        deleteMany: {},
        create: question.options.map((option) => ({
          key: option.key,
          textLt: option.textLt,
          isCorrect: option.isCorrect,
          orderRank: option.orderRank ?? null,
          explanationLt: option.explanationLt,
        })),
      },
      references: {
        deleteMany: {},
        create: resolvedReferences
          .map((reference) => ({
            ruleClauseId: reference.ruleClauseId,
            isPrimary: reference.isPrimary,
          }))
          .filter((reference) =>
            Boolean(reference.ruleClauseId),
          ) as Prisma.QuestionReferenceUncheckedCreateWithoutQuestionInput[],
      },
    },
    create: {
      externalId: question.externalId,
      slug: question.slug,
      type: question.type,
      topic: question.topic,
      difficulty: question.difficulty,
      situationLt: question.situationLt,
      promptLt: question.promptLt,
      mediaUrl: question.mediaUrl ?? null,
      status,
      evidenceStatus,
      options: {
        create: question.options.map((option) => ({
          key: option.key,
          textLt: option.textLt,
          isCorrect: option.isCorrect,
          orderRank: option.orderRank ?? null,
          explanationLt: option.explanationLt,
        })),
      },
      references: {
        create: resolvedReferences
          .map((reference) => ({
            ruleClauseId: reference.ruleClauseId,
            isPrimary: reference.isPrimary,
          }))
          .filter((reference) =>
            Boolean(reference.ruleClauseId),
          ) as Prisma.QuestionReferenceUncheckedCreateWithoutQuestionInput[],
      },
    },
    include: {
      options: true,
      references: true,
    },
  });

  return {
    questionId: persisted.id,
    slug: persisted.slug,
    status,
    evidenceStatus,
    blockedReasons,
    unresolvedReferences,
  };
}

export async function importQuestions(filePath = DEFAULT_QUESTIONS_PATH) {
  const parsed = await parseJsonFile(filePath, questionsFileSchema);
  const clauseLookup = await buildClauseLookup();

  const result = [];
  for (const question of parsed.questions) {
    result.push(await persistQuestion(question, clauseLookup));
  }

  return {
    importedQuestions: result.length,
    questions: result,
  };
}

export async function importContent(options?: {
  sourcesPath?: string;
  questionsPath?: string;
}) {
  const sourceResult = await importSourceDocuments(options?.sourcesPath ?? DEFAULT_SOURCES_PATH);
  const questionResult = await importQuestions(options?.questionsPath ?? DEFAULT_QUESTIONS_PATH);

  return {
    ...sourceResult,
    ...questionResult,
  };
}
