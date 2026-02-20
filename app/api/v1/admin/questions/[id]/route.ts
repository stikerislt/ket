import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/src/lib/adminAuth";
import { patchQuestionAdmin } from "@/src/lib/services/questionAdminService";

const bodySchema = z.object({
  topic: z.string().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  situationLt: z.string().optional(),
  promptLt: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  options: z
    .array(
      z.object({
        key: z.string(),
        textLt: z.string(),
        isCorrect: z.boolean(),
        orderRank: z.number().nullable().optional(),
        explanationLt: z.string(),
      }),
    )
    .optional(),
  references: z
    .array(
      z.object({
        sourceCode: z.string(),
        sectionCode: z.string(),
        isPrimary: z.boolean().optional(),
      }),
    )
    .optional(),
});

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: Params) {
  const denied = requireAdmin(request);
  if (denied) {
    return denied;
  }

  try {
    const payload = bodySchema.parse(await request.json());
    const { id } = await params;

    const result = await patchQuestionAdmin(id, payload);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Nepavyko atnaujinti klausimo.",
      },
      { status: 400 },
    );
  }
}
