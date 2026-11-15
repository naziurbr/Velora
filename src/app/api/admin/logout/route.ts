import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isAdminRequest, isSameOrigin } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return Response.json({ error: "Request rejected." }, { status: 403 });
  if (!isAdminRequest(req)) return Response.json({ error: "Sign in required." }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
