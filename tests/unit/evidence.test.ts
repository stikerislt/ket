import { describe, expect, it } from "vitest";

import { evaluateEvidence } from "@/src/lib/evidence";

describe("evaluateEvidence", () => {
  it("returns sufficient when primary references exist", () => {
    const result = evaluateEvidence({
      referenceCount: 2,
      primaryReferenceCount: 1,
      referencedSectionCodes: ["154", "157"],
    });

    expect(result.evidenceStatus).toBe("SUFFICIENT");
    expect(result.blockedReasons).toHaveLength(0);
  });

  it("blocks publish when references are missing", () => {
    const result = evaluateEvidence({
      referenceCount: 0,
      primaryReferenceCount: 0,
      referencedSectionCodes: [],
    });

    expect(result.evidenceStatus).toBe("INSUFFICIENT_RULE_BASIS");
    expect(result.blockedReasons).toContain("MISSING_REFERENCE");
    expect(result.blockedReasons).toContain("MISSING_PRIMARY_REFERENCE");
  });
});
