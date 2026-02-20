import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/src/lib/adminAuth";
import {
  createQuestionAdmin,
  listQuestionsAdmin,
} from "@/src/lib/services/questionAdminService";

const bodySchema = z.any();

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) {
    return denied;
  }

  const questions = await listQuestionsAdmin();
  return NextResponse.json({ questions });
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) {
    return denied;
  }

  try {
    const payload = bodySchema.parse(await request.json());
    const result = await createQuestionAdmin(payload);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Nepavyko sukurti klausimo.",
      },
      { status: 400 },
    );
  }
}
