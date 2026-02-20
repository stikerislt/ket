import { NextRequest, NextResponse } from "next/server";

export function requireAdmin(request: NextRequest): NextResponse | null {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json(
      {
        error:
          "ADMIN_PASSWORD nenustatytas. Administravimo API laikinai neaktyvus.",
      },
      { status: 503 },
    );
  }

  const supplied = request.headers.get("x-admin-password");
  if (supplied !== adminPassword) {
    return NextResponse.json({ error: "Neteisingas administratoriaus slaptažodis." }, { status: 401 });
  }

  return null;
}
