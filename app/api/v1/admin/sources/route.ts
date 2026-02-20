import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/src/lib/adminAuth";
import { db } from "@/src/lib/db";

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) {
    return denied;
  }

  const sources = await db.sourceDocument.findMany({
    include: {
      _count: {
        select: {
          clauses: true,
        },
      },
    },
    orderBy: {
      code: "asc",
    },
  });

  return NextResponse.json({ sources });
}
