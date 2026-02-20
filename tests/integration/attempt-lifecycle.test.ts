import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST as startAttempt } from "@/app/api/v1/attempts/route";
import { POST as submitAnswer } from "@/app/api/v1/attempts/[id]/answers/route";
import { POST as completeAttempt } from "@/app/api/v1/attempts/[id]/complete/route";

vi.mock("@/src/lib/anonymous", () => ({
  getOrCreateLearner: vi.fn(async () => ({ id: "learner-1" })),
}));

vi.mock("@/src/lib/services/attemptService", () => ({
  createAttemptAndLoadQuestions: vi.fn(async () => ({
    attemptId: "attempt-1",
    questions: [
      {
        id: "q1",
        externalId: "SC-001",
        slug: "sc-001-mobile-usage",
        type: "single",
        topic: "Mobile usage",
        difficulty: "EASY",
        situationLt: "situation",
        promptLt: "prompt",
        mediaUrl: null,
        evidenceStatus: "SUFFICIENT",
        options: [
          { key: "A", textLt: "x", orderRank: null },
          { key: "B", textLt: "y", orderRank: null },
        ],
        citations: [],
      },
    ],
    examProfile: null,
  })),
  submitAttemptAnswer: vi.fn(async () => ({
    isCorrect: true,
    feedback: {
      isCorrect: true,
      correctOptionKeys: ["B"],
      perOptionExplanationLt: [],
      ruleRefs: [],
    },
    correctCount: 1,
    wrongCount: 0,
  })),
  completeAttempt: vi.fn(async () => ({
    attemptId: "attempt-1",
    scorePct: 100,
    result: "UNSCORED",
    resultReason: "INSUFFICIENT_RULE_BASIS",
    timerExpired: false,
    correctCount: 1,
    wrongCount: 0,
    elapsedSec: 42,
  })),
}));

describe("attempt lifecycle API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts attempt, submits answer, and completes attempt", async () => {
    const startResponse = await startAttempt(
      new Request("http://localhost/api/v1/attempts", {
        method: "POST",
        body: JSON.stringify({ mode: "PRACTICE" }),
      }) as never,
    );

    expect(startResponse.status).toBe(200);

    const answerResponse = await submitAnswer(
      new Request("http://localhost/api/v1/attempts/attempt-1/answers", {
        method: "POST",
        body: JSON.stringify({
          questionId: "q1",
          selectedOptionKeys: ["B"],
          timeSpentSec: 7,
        }),
      }) as never,
      { params: Promise.resolve({ id: "attempt-1" }) },
    );

    expect(answerResponse.status).toBe(200);

    const finishResponse = await completeAttempt(
      new Request("http://localhost/api/v1/attempts/attempt-1/complete", {
        method: "POST",
        body: JSON.stringify({ timerExpired: false }),
      }) as never,
      { params: Promise.resolve({ id: "attempt-1" }) },
    );

    expect(finishResponse.status).toBe(200);
  });
});
