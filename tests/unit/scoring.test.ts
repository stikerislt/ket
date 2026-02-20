import { describe, expect, it } from "vitest";

import { evaluateAnswer } from "@/src/lib/scoring";

describe("evaluateAnswer", () => {
  it("scores single choice", () => {
    const result = evaluateAnswer(
      "single",
      [
        { key: "A", isCorrect: false },
        { key: "B", isCorrect: true },
      ] as never,
      ["B"],
    );

    expect(result.isCorrect).toBe(true);
    expect(result.correctOptionKeys).toEqual(["B"]);
  });

  it("scores multi choice exact match", () => {
    const result = evaluateAnswer(
      "multi",
      [
        { key: "A", isCorrect: true },
        { key: "B", isCorrect: false },
        { key: "C", isCorrect: true },
      ] as never,
      ["A", "C"],
    );

    expect(result.isCorrect).toBe(true);
    expect(result.correctOptionKeys).toEqual(["A", "C"]);
  });

  it("scores ordering based on rank sequence", () => {
    const result = evaluateAnswer(
      "ordering",
      [
        { key: "A", orderRank: 2 },
        { key: "B", orderRank: 1 },
        { key: "C", orderRank: 3 },
      ] as never,
      ["B", "A", "C"],
    );

    expect(result.isCorrect).toBe(true);
    expect(result.correctOptionKeys).toEqual(["B", "A", "C"]);
  });

  it("treats image as single-choice scoring", () => {
    const result = evaluateAnswer(
      "image",
      [
        { key: "A", isCorrect: true },
        { key: "B", isCorrect: false },
      ] as never,
      ["B"],
    );

    expect(result.isCorrect).toBe(false);
    expect(result.correctOptionKeys).toEqual(["A"]);
  });
});
