import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

import { toQuestionDTO } from "@/src/lib/mappers";
import { selectQuestions } from "@/src/lib/selectors";

const querySchema = z.object({
  topic: z.string().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(15),
});

export async function GET(request: NextRequest) {
  try {
    const query = querySchema.parse(Object.fromEntries(request.nextUrl.searchParams.entries()));
    const questions = await selectQuestions({
      topic: query.topic,
      difficulty: query.difficulty,
      limit: query.limit,
    });

    return NextResponse.json({
      questions: questions.map(toQuestionDTO),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Nepavyko gauti klausimu.",
      },
      { status: 400 },
    );
  }
}
