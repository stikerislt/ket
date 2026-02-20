import type { QuestionWithDetails } from "@/src/lib/types/db";
import type { QuestionDTO } from "@/src/lib/types/dto";

export function toQuestionDTO(question: QuestionWithDetails): QuestionDTO {
  return {
    id: question.id,
    externalId: question.externalId,
    slug: question.slug,
    type: question.type,
    topic: question.topic,
    difficulty: question.difficulty,
    situationLt: question.situationLt,
    promptLt: question.promptLt,
    mediaUrl: question.mediaUrl,
    evidenceStatus: question.evidenceStatus,
    options: question.options
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((option) => ({
        key: option.key,
        textLt: option.textLt,
        orderRank: option.orderRank,
      })),
    citations: question.references.map((reference) => ({
      sectionCode: reference.ruleClause.sectionCode,
      sourceCode: reference.ruleClause.sourceDocument.code,
      sourceTitle: reference.ruleClause.sourceDocument.title,
      excerptLt: reference.ruleClause.excerptLt,
      pageRef: reference.ruleClause.pageRef,
      isPrimary: reference.isPrimary,
    })),
  };
}
