import { randomUUID } from "node:crypto";

import type { LearnerProfile } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { ANON_COOKIE_NAME } from "@/src/lib/constants";
import { db } from "@/src/lib/db";
import { sha256 } from "@/src/lib/hash";

export async function getOrCreateLearner(
  request: NextRequest,
  response: NextResponse,
): Promise<LearnerProfile> {
  let token = request.cookies.get(ANON_COOKIE_NAME)?.value;

  if (!token) {
    token = randomUUID();
    response.cookies.set({
      name: ANON_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  const anonymousTokenHash = sha256(token);

  return db.learnerProfile.upsert({
    where: { anonymousTokenHash },
    update: {},
    create: { anonymousTokenHash },
  });
}
