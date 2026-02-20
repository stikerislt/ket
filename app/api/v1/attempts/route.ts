import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

import { getOrCreateLearner } from "@/src/lib/anonymous";
import { createAttemptAndLoadQuestions } from "@/src/lib/services/attemptService";

const bodySchema = z.object({
  mode: z.enum(["PRACTICE", "EXAM", "TOPIC"]),
  topic: z.string().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export async function POST(request: NextRequest) {
  const response = NextResponse.json({});

  try {
    const payload = bodySchema.parse(await request.json());

    if (payload.mode === "TOPIC" && !payload.topic) {
      return NextResponse.json({ error: "Topic rezimui butinas topic laukas." }, { status: 400 });
    }

    const learner = await getOrCreateLearner(request, response);
    const result = await createAttemptAndLoadQuestions({
      learnerId: learner.id,
      mode: payload.mode,
      topic: payload.topic,
      difficulty: payload.difficulty,
      limit: payload.limit,
    });

    return NextResponse.json(result, {
      headers: response.headers,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Nepavyko pradeti bandymo.",
      },
      { status: 400 },
    );
  }
}
