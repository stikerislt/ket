"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { EXAM_FALLBACK_TIME_LIMIT_SEC } from "@/src/lib/constants";
import type { AttemptResultDTO, ExamProfileDTO, FeedbackDTO, QuestionDTO } from "@/src/lib/types/dto";
import { ExamTimer } from "@/src/components/game/ExamTimer";
import { FeedbackPanel } from "@/src/components/game/FeedbackPanel";
import { OptionList } from "@/src/components/game/OptionList";
import { ProgressTracker } from "@/src/components/game/ProgressTracker";
import { RuleCitationPanel } from "@/src/components/game/RuleCitationPanel";
import { ScenarioCard } from "@/src/components/game/ScenarioCard";

type GameMode = "PRACTICE" | "EXAM" | "TOPIC";

type GameClientProps = {
  mode: GameMode;
  topic?: string;
};

type AttemptStartResponse = {
  attemptId: string;
  questions: QuestionDTO[];
  examProfile: ExamProfileDTO | null;
};

export function GameClient({ mode, topic }: GameClientProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [examProfile, setExamProfile] = useState<ExamProfileDTO | null>(null);
  const [questions, setQuestions] = useState<QuestionDTO[]>([]);
  const [index, setIndex] = useState(0);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<FeedbackDTO | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [result, setResult] = useState<AttemptResultDTO | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  const questionStartRef = useRef<number>(Date.now());

  const currentQuestion = questions[index];
  const isExamMode = mode === "EXAM";

  async function loadAttempt() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/attempts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode,
          topic,
          limit: mode === "EXAM" ? 15 : 10,
        }),
      });

      const data = (await response.json()) as AttemptStartResponse & { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Nepavyko pradeti bandymo.");
      }

      setAttemptId(data.attemptId);
      setExamProfile(data.examProfile);
      setQuestions(data.questions);
      setIndex(0);
      setSelectedKeys([]);
      setFeedback(null);
      setCorrectCount(0);
      setWrongCount(0);
      setResult(null);
      questionStartRef.current = Date.now();

      if (mode === "EXAM") {
        setSecondsLeft(data.examProfile?.timeLimitSec ?? EXAM_FALLBACK_TIME_LIMIT_SEC);
      } else {
        setSecondsLeft(null);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Nepavyko ikelti bandymo.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAttempt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, topic]);

  useEffect(() => {
    if (!isExamMode || secondsLeft === null || secondsLeft <= 0 || Boolean(result) || !attemptId) {
      return;
    }

    const handle = setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous === null) {
          return previous;
        }

        if (previous <= 1) {
          clearInterval(handle);
          void finishAttempt(true);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, result, attemptId, isExamMode]);

  const canSubmit = useMemo(() => {
    if (!currentQuestion || feedback) {
      return false;
    }

    return selectedKeys.length > 0;
  }, [currentQuestion, feedback, selectedKeys.length]);

  function toggleSelection(key: string) {
    if (!currentQuestion || feedback) {
      return;
    }

    if (currentQuestion.type === "single" || currentQuestion.type === "image") {
      setSelectedKeys([key]);
      return;
    }

    if (currentQuestion.type === "multi") {
      setSelectedKeys((previous) =>
        previous.includes(key)
          ? previous.filter((item) => item !== key)
          : [...previous, key],
      );
      return;
    }

    setSelectedKeys((previous) =>
      previous.includes(key)
        ? previous.filter((item) => item !== key)
        : [...previous, key],
    );
  }

  async function submitCurrentAnswer() {
    if (!attemptId || !currentQuestion || !canSubmit) {
      return;
    }

    const timeSpentSec = Math.max(0, Math.floor((Date.now() - questionStartRef.current) / 1000));

    const response = await fetch(`/api/v1/attempts/${attemptId}/answers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: currentQuestion.id,
        selectedOptionKeys: selectedKeys,
        timeSpentSec,
        feedbackViewed: true,
      }),
    });

    const data = (await response.json()) as {
      feedback: FeedbackDTO;
      correctCount: number;
      wrongCount: number;
      error?: string;
    };

    if (!response.ok) {
      setError(data.error ?? "Nepavyko pateikti atsakymo.");
      return;
    }

    setFeedback(data.feedback);
    setCorrectCount(data.correctCount);
    setWrongCount(data.wrongCount);
  }

  async function finishAttempt(timerExpired: boolean) {
    if (!attemptId || result) {
      return;
    }

    const response = await fetch(`/api/v1/attempts/${attemptId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timerExpired }),
    });

    const data = (await response.json()) as AttemptResultDTO & { error?: string };

    if (!response.ok) {
      setError(data.error ?? "Nepavyko uzbaigti bandymo.");
      return;
    }

    setResult(data);
  }

  async function goNext() {
    if (!currentQuestion) {
      return;
    }

    if (index >= questions.length - 1) {
      await finishAttempt(false);
      return;
    }

    setIndex((previous) => previous + 1);
    setSelectedKeys([]);
    setFeedback(null);
    setError(null);
    questionStartRef.current = Date.now();
  }

  if (loading) {
    return <p className="rounded-xl border border-slate-300 bg-white p-6 text-sm text-slate-700">Kraunama...</p>;
  }

  if (error && !currentQuestion) {
    return (
      <div className="rounded-xl border border-rose-300 bg-rose-50 p-6 text-sm text-rose-800">
        <p>{error}</p>
        <button
          type="button"
          onClick={() => void loadAttempt()}
          className="mt-3 rounded-lg bg-rose-600 px-3 py-2 font-semibold text-white"
        >
          Bandyti dar karta
        </button>
      </div>
    );
  }

  if (result) {
    return (
      <section className="space-y-4 rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Bandymas baigtas</h2>
        <p className="text-sm text-slate-700">Rezultatas: {result.result}</p>
        <p className="text-sm text-slate-700">Teisingu atsakymu procentas: {result.scorePct}%</p>
        <p className="text-sm text-slate-700">Teisingi: {result.correctCount}, klaidos: {result.wrongCount}</p>
        <p className="text-sm text-slate-700">
          Priezastis: {result.resultReason ?? "Vertinimo statusas patvirtintas."}
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void loadAttempt()}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Naujas bandymas
          </button>
          <Link href="/" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800">
            I pagrindini
          </Link>
        </div>
      </section>
    );
  }

  if (!currentQuestion) {
    return <p className="text-sm text-slate-700">Klausimu nerasta.</p>;
  }

  return (
    <section className="space-y-4">
      <ProgressTracker
        index={index}
        total={questions.length}
        correctCount={correctCount}
        wrongCount={wrongCount}
      />

      {isExamMode && secondsLeft !== null ? (
        <ExamTimer
          secondsLeft={secondsLeft}
          isEvidenceLockedWarning={examProfile?.evidenceStatus === "INSUFFICIENT_RULE_BASIS"}
        />
      ) : null}

      <ScenarioCard question={currentQuestion} />

      <OptionList
        question={currentQuestion}
        selectedKeys={selectedKeys}
        disabled={Boolean(feedback)}
        onChange={toggleSelection}
      />

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void submitCurrentAnswer()}
          disabled={!canSubmit}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          Pateikti atsakyma
        </button>

        {feedback ? (
          <button
            type="button"
            onClick={() => void goNext()}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
          >
            {index >= questions.length - 1 ? "Baigti" : "Kitas klausimas"}
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>
      ) : null}

      {feedback ? <FeedbackPanel feedback={feedback} /> : null}
      <RuleCitationPanel question={currentQuestion} />
    </section>
  );
}
