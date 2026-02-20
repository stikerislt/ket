import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const sources = JSON.parse(
  readFileSync("content/sources/ket-knygute-2024-2025.json", "utf-8"),
) as {
  sourceDocuments: Array<{
    code: string;
    clauses: Array<{ sectionCode: string }>;
  }>;
};

const questions = JSON.parse(
  readFileSync("content/questions/initial-15.lt.json", "utf-8"),
) as {
  questions: Array<{
    slug: string;
    references: Array<{ sourceCode: string; sectionCode: string }>;
    options: Array<{ explanationLt: string; isCorrect: boolean }>;
  }>;
};

describe("content dataset", () => {
  it("has 15 seeded scenarios", () => {
    expect(questions.questions).toHaveLength(15);
  });

  it("uses only known rule references", () => {
    const validRefs = new Set<string>();
    sources.sourceDocuments.forEach((source) => {
      source.clauses.forEach((clause) => {
        validRefs.add(`${source.code}:${clause.sectionCode}`);
      });
    });

    for (const question of questions.questions) {
      for (const reference of question.references) {
        expect(validRefs.has(`${reference.sourceCode}:${reference.sectionCode}`)).toBe(true);
      }
    }
  });

  it("contains structured explanations for correct and wrong options", () => {
    for (const question of questions.questions) {
      const wrongOptions = question.options.filter((option) => !option.isCorrect);
      const correctOptions = question.options.filter((option) => option.isCorrect);

      expect(wrongOptions.length).toBeGreaterThan(0);
      wrongOptions.forEach((option) => {
        expect(option.explanationLt).toContain("Neteisinga, nes");
      });

      correctOptions.forEach((option) => {
        expect(option.explanationLt).toContain("Teisinga, nes");
      });
    }
  });

  it("does not reference revoked clauses", () => {
    for (const question of questions.questions) {
      for (const reference of question.references) {
        expect(reference.sectionCode.toLowerCase()).not.toContain("neteko");
      }
    }
  });
});
