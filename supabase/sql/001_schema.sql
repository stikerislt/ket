-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."QuestionType" AS ENUM ('single', 'multi', 'image', 'ordering');

-- CreateEnum
CREATE TYPE "public"."QuestionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."EvidenceStatus" AS ENUM ('SUFFICIENT', 'INSUFFICIENT_RULE_BASIS');

-- CreateEnum
CREATE TYPE "public"."EvidenceLevel" AS ENUM ('PRIMARY', 'SUPPLEMENTAL');

-- CreateEnum
CREATE TYPE "public"."Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "public"."AttemptMode" AS ENUM ('PRACTICE', 'EXAM', 'TOPIC');

-- CreateEnum
CREATE TYPE "public"."AttemptResult" AS ENUM ('PASS', 'FAIL', 'UNSCORED');

-- CreateTable
CREATE TABLE "public"."SourceDocument" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "revisionDate" TIMESTAMP(3),
    "checksum" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SourceDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RuleClause" (
    "id" TEXT NOT NULL,
    "sourceDocumentId" TEXT NOT NULL,
    "sectionCode" TEXT NOT NULL,
    "excerptLt" TEXT NOT NULL,
    "pageRef" TEXT,
    "evidenceLevel" "public"."EvidenceLevel" NOT NULL DEFAULT 'PRIMARY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuleClause_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Question" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "slug" TEXT NOT NULL,
    "type" "public"."QuestionType" NOT NULL,
    "topic" TEXT NOT NULL,
    "difficulty" "public"."Difficulty" NOT NULL,
    "situationLt" TEXT NOT NULL,
    "promptLt" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "status" "public"."QuestionStatus" NOT NULL DEFAULT 'DRAFT',
    "evidenceStatus" "public"."EvidenceStatus" NOT NULL DEFAULT 'INSUFFICIENT_RULE_BASIS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuestionOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "textLt" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "orderRank" INTEGER,
    "explanationLt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuestionReference" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "ruleClauseId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExamProfile" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "timeLimitSec" INTEGER,
    "questionCount" INTEGER NOT NULL,
    "passThresholdPct" INTEGER,
    "evidenceStatus" "public"."EvidenceStatus" NOT NULL DEFAULT 'INSUFFICIENT_RULE_BASIS',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LearnerProfile" (
    "id" TEXT NOT NULL,
    "anonymousTokenHash" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearnerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Attempt" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "mode" "public"."AttemptMode" NOT NULL,
    "topicFilter" TEXT,
    "examProfileId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "wrongCount" INTEGER NOT NULL DEFAULT 0,
    "elapsedSec" INTEGER,
    "result" "public"."AttemptResult" NOT NULL DEFAULT 'UNSCORED',
    "resultReason" TEXT,
    "snapshotJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AttemptAnswer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOptionIds" JSONB NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeSpentSec" INTEGER NOT NULL,
    "feedbackViewed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttemptAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TopicProgress" (
    "id" TEXT NOT NULL,
    "learnerId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "answeredCount" INTEGER NOT NULL DEFAULT 0,
    "correctRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastPracticedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopicProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SourceDocument_code_key" ON "public"."SourceDocument"("code");

-- CreateIndex
CREATE UNIQUE INDEX "RuleClause_sourceDocumentId_sectionCode_key" ON "public"."RuleClause"("sourceDocumentId", "sectionCode");

-- CreateIndex
CREATE UNIQUE INDEX "Question_externalId_key" ON "public"."Question"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Question_slug_key" ON "public"."Question"("slug");

-- CreateIndex
CREATE INDEX "Question_topic_idx" ON "public"."Question"("topic");

-- CreateIndex
CREATE INDEX "Question_status_evidenceStatus_idx" ON "public"."Question"("status", "evidenceStatus");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionOption_questionId_key_key" ON "public"."QuestionOption"("questionId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionReference_questionId_ruleClauseId_key" ON "public"."QuestionReference"("questionId", "ruleClauseId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamProfile_code_key" ON "public"."ExamProfile"("code");

-- CreateIndex
CREATE UNIQUE INDEX "LearnerProfile_anonymousTokenHash_key" ON "public"."LearnerProfile"("anonymousTokenHash");

-- CreateIndex
CREATE INDEX "LearnerProfile_userId_idx" ON "public"."LearnerProfile"("userId");

-- CreateIndex
CREATE INDEX "Attempt_learnerId_mode_idx" ON "public"."Attempt"("learnerId", "mode");

-- CreateIndex
CREATE UNIQUE INDEX "AttemptAnswer_attemptId_questionId_key" ON "public"."AttemptAnswer"("attemptId", "questionId");

-- CreateIndex
CREATE INDEX "TopicProgress_topic_idx" ON "public"."TopicProgress"("topic");

-- CreateIndex
CREATE UNIQUE INDEX "TopicProgress_learnerId_topic_key" ON "public"."TopicProgress"("learnerId", "topic");

-- AddForeignKey
ALTER TABLE "public"."RuleClause" ADD CONSTRAINT "RuleClause_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "public"."SourceDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuestionReference" ADD CONSTRAINT "QuestionReference_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuestionReference" ADD CONSTRAINT "QuestionReference_ruleClauseId_fkey" FOREIGN KEY ("ruleClauseId") REFERENCES "public"."RuleClause"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attempt" ADD CONSTRAINT "Attempt_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "public"."LearnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attempt" ADD CONSTRAINT "Attempt_examProfileId_fkey" FOREIGN KEY ("examProfileId") REFERENCES "public"."ExamProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AttemptAnswer" ADD CONSTRAINT "AttemptAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "public"."Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AttemptAnswer" ADD CONSTRAINT "AttemptAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TopicProgress" ADD CONSTRAINT "TopicProgress_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "public"."LearnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Keep updatedAt in sync on direct SQL writes (Prisma handles this in app writes too).
CREATE OR REPLACE FUNCTION "public"."set_updated_at"()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "set_updated_at_SourceDocument" ON "public"."SourceDocument";
CREATE TRIGGER "set_updated_at_SourceDocument"
BEFORE UPDATE ON "public"."SourceDocument"
FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

DROP TRIGGER IF EXISTS "set_updated_at_RuleClause" ON "public"."RuleClause";
CREATE TRIGGER "set_updated_at_RuleClause"
BEFORE UPDATE ON "public"."RuleClause"
FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

DROP TRIGGER IF EXISTS "set_updated_at_Question" ON "public"."Question";
CREATE TRIGGER "set_updated_at_Question"
BEFORE UPDATE ON "public"."Question"
FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

DROP TRIGGER IF EXISTS "set_updated_at_QuestionOption" ON "public"."QuestionOption";
CREATE TRIGGER "set_updated_at_QuestionOption"
BEFORE UPDATE ON "public"."QuestionOption"
FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

DROP TRIGGER IF EXISTS "set_updated_at_ExamProfile" ON "public"."ExamProfile";
CREATE TRIGGER "set_updated_at_ExamProfile"
BEFORE UPDATE ON "public"."ExamProfile"
FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

DROP TRIGGER IF EXISTS "set_updated_at_LearnerProfile" ON "public"."LearnerProfile";
CREATE TRIGGER "set_updated_at_LearnerProfile"
BEFORE UPDATE ON "public"."LearnerProfile"
FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

DROP TRIGGER IF EXISTS "set_updated_at_Attempt" ON "public"."Attempt";
CREATE TRIGGER "set_updated_at_Attempt"
BEFORE UPDATE ON "public"."Attempt"
FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

DROP TRIGGER IF EXISTS "set_updated_at_AttemptAnswer" ON "public"."AttemptAnswer";
CREATE TRIGGER "set_updated_at_AttemptAnswer"
BEFORE UPDATE ON "public"."AttemptAnswer"
FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

DROP TRIGGER IF EXISTS "set_updated_at_TopicProgress" ON "public"."TopicProgress";
CREATE TRIGGER "set_updated_at_TopicProgress"
BEFORE UPDATE ON "public"."TopicProgress"
FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();

