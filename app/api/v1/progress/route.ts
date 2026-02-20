import { NextRequest, NextResponse } from "next/server";

import { ANON_COOKIE_NAME } from "@/src/lib/constants";
import { db } from "@/src/lib/db";
import { getLearnerProgress } from "@/src/lib/services/attemptService";
import { sha256 } from "@/src/lib/hash";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(ANON_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({
        summary: {
          totalAttempts: 0,
          examAttempts: 0,
          totalAnswered: 0,
          accuracyPct: 0,
        },
        topics: [],
        recentAttempts: [],
      });
    }

    const learner = await db.learnerProfile.findUnique({
      where: { anonymousTokenHash: sha256(token) },
    });

    if (!learner) {
      return NextResponse.json({
        summary: {
          totalAttempts: 0,
          examAttempts: 0,
          totalAnswered: 0,
          accuracyPct: 0,
        },
        topics: [],
        recentAttempts: [],
      });
    }

    const progress = await getLearnerProgress(learner.id);
    return NextResponse.json(progress);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Nepavyko gauti progreso.",
      },
      { status: 400 },
    );
  }
}
