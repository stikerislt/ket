import type { EvidenceStatus } from "@prisma/client";

type EvidenceCheckInput = {
  referenceCount: number;
  primaryReferenceCount: number;
  referencedSectionCodes: string[];
};

export function evaluateEvidence(input: EvidenceCheckInput): {
  evidenceStatus: EvidenceStatus;
  blockedReasons: string[];
} {
  const blockedReasons: string[] = [];

  if (input.referenceCount === 0) {
    blockedReasons.push("MISSING_REFERENCE");
  }

  if (input.primaryReferenceCount === 0) {
    blockedReasons.push("MISSING_PRIMARY_REFERENCE");
  }

  if (
    input.referencedSectionCodes.some((sectionCode) =>
      sectionCode.toLowerCase().includes("neteko"),
    )
  ) {
    blockedReasons.push("INVALID_REFERENCE_REVOKED");
  }

  if (blockedReasons.length > 0) {
    blockedReasons.unshift("INSUFFICIENT_RULE_BASIS");
  }

  return {
    evidenceStatus:
      blockedReasons.length === 0 ? "SUFFICIENT" : "INSUFFICIENT_RULE_BASIS",
    blockedReasons,
  };
}
