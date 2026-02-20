import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/src/lib/adminAuth";
import { publishQuestionAdmin } from "@/src/lib/services/questionAdminService";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, { params }: Params) {
  const denied = requireAdmin(request);
  if (denied) {
    return denied;
  }

  try {
    const { id } = await params;
    const result = await publishQuestionAdmin(id);

    const status = result.ok ? 200 : 409;
    return NextResponse.json(result, { status });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Nepavyko publikuoti klausimo.",
      },
      { status: 400 },
    );
  }
}
