import type { AttemptMode, Difficulty } from "@prisma/client";

import { db } from "@/src/lib/db";
import { EXAM_FALLBACK_TIME_LIMIT_SEC } from "@/src/lib/constants";
import { toQuestionDTO } from "@/src/lib/mappers";
import { evaluateAnswer } from "@/src/lib/scoring";
import { selectQuestions } from "@/src/lib/selectors";
import type { AttemptResultDTO, ExamProfileDTO, FeedbackDTO } from "@/src/lib/types/dto";

export type CreateAttemptInput = {
  learnerId: string;
  mode: AttemptMode;
  topic?: string;
  difficulty?: Difficulty;
  limit?: number;
};

function toExamProfileDTO(profile: {
  code: string;
  label: string;
  timeLimitSec: number | null;
  questionCount: number;
  passThresholdPct: number | null;
  evidenceStatus: "SUFFICIENT" | "INSUFFICIENT_RULE_BASIS";
  note: string | null;
}): ExamProfileDTO {
  return {
    code: profile.code,
    label: profile.label,
    timeLimitSec: profile.timeLimitSec,
    questionCount: profile.questionCount,
    passThresholdPct: profile.passThresholdPct,
    evidenceStatus: profile.evidenceStatus,
    note: profile.note,
  };
}

export async function createAttemptAndLoadQuestions(input: CreateAttemptInput) {
  const examProfile =
    input.mode === "EXAM"
      ? await db.examProfile.findUnique({ where: { code: "REGITRA_SIM_V1" } })
      : null;

  const selectedLimit = input.limit ?? examProfile?.questionCount ?? 10;
  const selectedQuestions = await selectQuestions({
    topic: input.topic,
    difficulty: input.difficulty,
    limit: selectedLimit,
  });

  if (selectedQuestions.length === 0) {
    throw new Error("Nera publikuotu klausimu pagal pateiktus filtrus.");
  }

  const attempt = await db.attempt.create({
    data: {
      learnerId: input.learnerId,
      mode: input.mode,
      topicFilter: input.topic ?? null,
      examProfileId: examProfile?.id ?? null,
      startedAt: new Date(),
      snapshotJson: {
        questionIds: selectedQuestions.map((question) => question.id),
      },
    },
  });

  return {
    attemptId: attempt.id,
    questions: selectedQuestions.map(toQuestionDTO),
    examProfile: examProfile
      ? toExamProfileDTO(examProfile)
      : input.mode === "EXAM"
        ? {
            code: "REGITRA_SIM_V1",
            label: "Regitra simuliacija",
            timeLimitSec: EXAM_FALLBACK_TIME_LIMIT_SEC,
            questionCount: selectedLimit,
            passThresholdPct: null,
            evidenceStatus: "INSUFFICIENT_RULE_BASIS" as const,
            note: "Laiko ir vertinimo kriterijai nera pilnai patvirtinti pateiktoje medziagoje.",
          }
        : null,
  };
}

type SubmitAttemptAnswerInput = {
  attemptId: string;
  questionId: string;
  selectedOptionKeys: string[];
  timeSpentSec: number;
  feedbackViewed?: boolean;
};

async function updateTopicProgress(learnerId: string, topic: string, isCorrect: boolean) {
  const existing = await db.topicProgress.findUnique({
    where: {
      learnerId_topic: {
        learnerId,
        topic,
      },
    },
  });

  if (!existing) {
    await db.topicProgress.create({
      data: {
        learnerId,
        topic,
        answeredCount: 1,
        correctRate: isCorrect ? 1 : 0,
        lastPracticedAt: new Date(),
      },
    });
    return;
  }

  const previousCorrectCount = existing.correctRate * existing.answeredCount;
  const nextAnsweredCount = existing.answeredCount + 1;
  const nextCorrectCount = previousCorrectCount + (isCorrect ? 1 : 0);

  await db.topicProgress.update({
    where: {
      learnerId_topic: {
        learnerId,
        topic,
      },
    },
    data: {
      answeredCount: nextAnsweredCount,
      correctRate: Number((nextCorrectCount / nextAnsweredCount).toFixed(4)),
      lastPracticedAt: new Date(),
    },
  });
}

export async function submitAttemptAnswer(input: SubmitAttemptAnswerInput): Promise<{
  isCorrect: boolean;
  feedback: FeedbackDTO;
  correctCount: number;
  wrongCount: number;
}> {
  const attempt = await db.attempt.findUnique({
    where: { id: input.attemptId },
  });

  if (!attempt) {
    throw new Error("Bandymas nerastas.");
  }

  if (attempt.completedAt) {
    throw new Error("Bandymas jau uzbaigtas.");
  }

  const snapshot = (attempt.snapshotJson ?? {}) as { questionIds?: string[] };
  const allowedQuestionIds = snapshot.questionIds ?? [];

  if (!allowedQuestionIds.includes(input.questionId)) {
    throw new Error("Klausimas nepriklauso siam bandymui.");
  }

  const question = await db.question.findUnique({
    where: { id: input.questionId },
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

  if (!question) {
    throw new Error("Klausimas nerastas.");
  }

  const score = evaluateAnswer(question.type, question.options, input.selectedOptionKeys);

  const existing = await db.attemptAnswer.findUnique({
    where: {
      attemptId_questionId: {
        attemptId: input.attemptId,
        questionId: input.questionId,
      },
    },
  });

  await db.attemptAnswer.upsert({
    where: {
      attemptId_questionId: {
        attemptId: input.attemptId,
        questionId: input.questionId,
      },
    },
    update: {
      selectedOptionIds: input.selectedOptionKeys,
      isCorrect: score.isCorrect,
      timeSpentSec: input.timeSpentSec,
      feedbackViewed: Boolean(input.feedbackViewed),
    },
    create: {
      attemptId: input.attemptId,
      questionId: input.questionId,
      selectedOptionIds: input.selectedOptionKeys,
      isCorrect: score.isCorrect,
      timeSpentSec: input.timeSpentSec,
      feedbackViewed: Boolean(input.feedbackViewed),
    },
  });

  if (!existing) {
    await updateTopicProgress(attempt.learnerId, question.topic, score.isCorrect);
  }

  const [correctCount, wrongCount] = await Promise.all([
    db.attemptAnswer.count({
      where: {
        attemptId: input.attemptId,
        isCorrect: true,
      },
    }),
    db.attemptAnswer.count({
      where: {
        attemptId: input.attemptId,
        isCorrect: false,
      },
    }),
  ]);

  await db.attempt.update({
    where: { id: input.attemptId },
    data: {
      correctCount,
      wrongCount,
    },
  });

  const feedback: FeedbackDTO = {
    isCorrect: score.isCorrect,
    correctOptionKeys: score.correctOptionKeys,
    perOptionExplanationLt: question.options
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((option) => ({
        key: option.key,
        isCorrectOption: option.isCorrect,
        explanationLt: option.explanationLt,
      })),
    ruleRefs: question.references.map((reference) => ({
      sectionCode: reference.ruleClause.sectionCode,
      sourceCode: reference.ruleClause.sourceDocument.code,
      sourceTitle: reference.ruleClause.sourceDocument.title,
    })),
  };

  return {
    isCorrect: score.isCorrect,
    feedback,
    correctCount,
    wrongCount,
  };
}

export async function completeAttempt(input: {
  attemptId: string;
  timerExpired: boolean;
}): Promise<AttemptResultDTO> {
  const attempt = await db.attempt.findUnique({
    where: { id: input.attemptId },
    include: { examProfile: true },
  });

  if (!attempt) {
    throw new Error("Bandymas nerastas.");
  }

  const answeredCount = attempt.correctCount + attempt.wrongCount;
  const scorePct = answeredCount === 0 ? 0 : Math.round((attempt.correctCount / answeredCount) * 100);

  let result: "PASS" | "FAIL" | "UNSCORED" = "UNSCORED";
  let resultReason: string | null = "PRACTICE_OR_TOPIC_MODE";

  if (attempt.mode === "EXAM") {
    if (
      !attempt.examProfile ||
      attempt.examProfile.passThresholdPct === null ||
      attempt.examProfile.evidenceStatus !== "SUFFICIENT"
    ) {
      result = "UNSCORED";
      resultReason = "INSUFFICIENT_RULE_BASIS";
    } else {
      result = scorePct >= attempt.examProfile.passThresholdPct ? "PASS" : "FAIL";
      resultReason = null;
    }
  }

  const now = new Date();
  const elapsedSec = Math.max(
    0,
    Math.floor((now.getTime() - new Date(attempt.startedAt).getTime()) / 1000),
  );

  const updated = await db.attempt.update({
    where: { id: attempt.id },
    data: {
      completedAt: now,
      elapsedSec,
      result,
      resultReason,
    },
  });

  return {
    attemptId: updated.id,
    scorePct,
    result: updated.result,
    resultReason: updated.resultReason,
    timerExpired: input.timerExpired,
    correctCount: updated.correctCount,
    wrongCount: updated.wrongCount,
    elapsedSec: updated.elapsedSec,
  };
}

export async function getLearnerProgress(learnerId: string) {
  const [topicProgress, attempts] = await Promise.all([
    db.topicProgress.findMany({
      where: { learnerId },
      orderBy: { topic: "asc" },
    }),
    db.attempt.findMany({
      where: { learnerId },
      orderBy: { startedAt: "desc" },
      take: 50,
    }),
  ]);

  const totals = attempts.reduce(
    (accumulator, attempt) => {
      accumulator.correct += attempt.correctCount;
      accumulator.wrong += attempt.wrongCount;
      if (attempt.mode === "EXAM") {
        accumulator.examCount += 1;
      }
      return accumulator;
    },
    { correct: 0, wrong: 0, examCount: 0 },
  );

  const totalAnswered = totals.correct + totals.wrong;
  const accuracyPct = totalAnswered === 0 ? 0 : Math.round((totals.correct / totalAnswered) * 100);

  return {
    summary: {
      totalAttempts: attempts.length,
      examAttempts: totals.examCount,
      totalAnswered,
      accuracyPct,
    },
    topics: topicProgress,
    recentAttempts: attempts.slice(0, 10),
  };
}
