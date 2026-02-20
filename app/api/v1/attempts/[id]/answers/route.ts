import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

import { submitAttemptAnswer } from "@/src/lib/services/attemptService";

const bodySchema = z.object({
  questionId: z.string().min(1),
  selectedOptionKeys: z.array(z.string()).default([]),
  timeSpentSec: z.number().int().min(0).default(0),
  feedbackViewed: z.boolean().optional(),
});

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const payload = bodySchema.parse(await request.json());
    const { id } = await params;

    const result = await submitAttemptAnswer({
      attemptId: id,
      questionId: payload.questionId,
      selectedOptionKeys: payload.selectedOptionKeys,
      timeSpentSec: payload.timeSpentSec,
      feedbackViewed: payload.feedbackViewed,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Nepavyko pateikti atsakymo.",
      },
      { status: 400 },
    );
  }
}
