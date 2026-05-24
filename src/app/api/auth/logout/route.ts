import { clearSessionCookie } from "@/lib/server/auth";
import { logToTerminal } from "@/lib/server/logger";

export const runtime = "nodejs";

export async function POST() {
  try {
    const response = Response.json({ ok: true });
    response.headers.append("Set-Cookie", clearSessionCookie());
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown logout error.";
    logToTerminal(`Logout failed: ${message}`);
    return Response.json({ error: "Could not log out." }, { status: 500 });
  }
}
