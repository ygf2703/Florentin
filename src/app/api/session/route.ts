import { logToTerminal } from "@/lib/server/logger";
import { createSessionCookie, getSessionUserFromRequest } from "@/lib/server/auth";
import { getOrCreateUser } from "@/lib/server/store";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const user = getOrCreateUser(body.userId, body.email, body.name);

    const response = NextResponse.json({ user });
    response.headers.append("Set-Cookie", createSessionCookie(user));
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown session error.";
    logToTerminal(`Session POST failed: ${message}`);
    return Response.json({ error: "Could not create session." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const sessionUser = getSessionUserFromRequest(request);
    if (sessionUser) {
      return Response.json({ user: sessionUser });
    }

    const userId = request.headers.get("x-user-id") ?? undefined;
    if (!userId) {
      return Response.json({ user: null });
    }

    const user = getOrCreateUser(userId);

    return Response.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown session error.";
    logToTerminal(`Session GET failed: ${message}`);
    return Response.json({ error: "Could not load session." }, { status: 500 });
  }
}
