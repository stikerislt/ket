import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/src/lib/adminAuth";
import { importContent } from "@/src/lib/importer";

const bodySchema = z
  .object({
    sourcesPath: z.string().optional(),
    questionsPath: z.string().optional(),
  })
  .optional();

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) {
    return denied;
  }

  try {
    const payload = bodySchema.parse(await request.json().catch(() => ({})));
    const result = await importContent({
      sourcesPath: payload?.sourcesPath,
      questionsPath: payload?.questionsPath,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Nepavyko importuoti klausimu.",
      },
      { status: 400 },
    );
  }
}
