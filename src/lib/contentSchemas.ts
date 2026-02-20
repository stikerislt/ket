import { z } from "zod";

export const sourceClauseSchema = z.object({
  sectionCode: z.string().min(1),
  excerptLt: z.string().min(1),
  pageRef: z.string().nullable().optional(),
  evidenceLevel: z.enum(["PRIMARY", "SUPPLEMENTAL"]).default("PRIMARY"),
});

export const sourceDocumentSchema = z.object({
  code: z.string().min(1),
  title: z.string().min(1),
  filePath: z.string().min(1),
  revisionDate: z.string().optional(),
  checksum: z.string().nullable().optional(),
  clauses: z.array(sourceClauseSchema),
});

export const sourcesFileSchema = z.object({
  sourceDocuments: z.array(sourceDocumentSchema),
});

export const questionReferenceSchema = z.object({
  sectionCode: z.string().min(1),
  sourceCode: z.string().min(1),
  isPrimary: z.boolean().default(true),
});

export const questionOptionSchema = z.object({
  key: z.string().min(1),
  textLt: z.string().min(1),
  isCorrect: z.boolean(),
  orderRank: z.number().int().nullable().optional(),
  explanationLt: z.string().min(1),
});

export const questionSchema = z.object({
  externalId: z.string().min(1),
  slug: z.string().min(1),
  type: z.enum(["single", "multi", "image", "ordering"]),
  topic: z.string().min(1),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  situationLt: z.string().min(1),
  promptLt: z.string().min(1),
  mediaUrl: z.string().nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  evidenceStatus: z
    .enum(["SUFFICIENT", "INSUFFICIENT_RULE_BASIS"])
    .default("INSUFFICIENT_RULE_BASIS"),
  options: z.array(questionOptionSchema).min(2),
  references: z.array(questionReferenceSchema),
});

export const questionsFileSchema = z.object({
  questions: z.array(questionSchema),
});

export type SourceDocumentInput = z.infer<typeof sourceDocumentSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
