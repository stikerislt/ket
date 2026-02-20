export type QuestionDTO = {
  id: string;
  externalId: string | null;
  slug: string;
  type: "single" | "multi" | "image" | "ordering";
  topic: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  situationLt: string;
  promptLt: string;
  mediaUrl: string | null;
  evidenceStatus: "SUFFICIENT" | "INSUFFICIENT_RULE_BASIS";
  options: Array<{
    key: string;
    textLt: string;
    orderRank: number | null;
  }>;
  citations: Array<{
    sectionCode: string;
    sourceCode: string;
    sourceTitle: string;
    excerptLt: string;
    pageRef: string | null;
    isPrimary: boolean;
  }>;
};

export type FeedbackDTO = {
  isCorrect: boolean;
  correctOptionKeys: string[];
  perOptionExplanationLt: Array<{
    key: string;
    isCorrectOption: boolean;
    explanationLt: string;
  }>;
  ruleRefs: Array<{
    sectionCode: string;
    sourceCode: string;
    sourceTitle: string;
  }>;
};

export type AttemptResultDTO = {
  attemptId: string;
  scorePct: number;
  result: "PASS" | "FAIL" | "UNSCORED";
  resultReason: string | null;
  timerExpired: boolean;
  correctCount: number;
  wrongCount: number;
  elapsedSec: number | null;
};

export type ExamProfileDTO = {
  code: string;
  label: string;
  timeLimitSec: number | null;
  questionCount: number;
  passThresholdPct: number | null;
  evidenceStatus: "SUFFICIENT" | "INSUFFICIENT_RULE_BASIS";
  note: string | null;
};

export type AdminPublishResponse = {
  ok: boolean;
  blockedReasons: string[];
  evidenceStatus: "SUFFICIENT" | "INSUFFICIENT_RULE_BASIS";
};
