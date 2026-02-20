import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

import { completeAttempt } from "@/src/lib/services/attemptService";

const bodySchema = z.object({
  timerExpired: z.boolean().default(false),
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

    const result = await completeAttempt({
      attemptId: id,
      timerExpired: payload.timerExpired,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Nepavyko uzbaigti bandymo.",
      },
      { status: 400 },
    );
  }
}
