import {
  AuthConfigError,
  createOAuthState,
  createOAuthStateCookie,
  getGoogleAuthUrl,
} from "@/lib/server/auth";
import { logToTerminal } from "@/lib/server/logger";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const origin = (process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin).replace(/\/$/, "");
    const state = createOAuthState();
    const redirectUrl = getGoogleAuthUrl(origin, state);
    const response = NextResponse.redirect(redirectUrl);
    response.headers.append("Set-Cookie", createOAuthStateCookie(state));
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Google auth start error.";
    logToTerminal(`Google auth start failed: ${message}`);

    const origin = (process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin).replace(/\/$/, "");
    const code = error instanceof AuthConfigError ? "google-not-configured" : "google-start-failed";
    return NextResponse.redirect(`${origin}/?auth=${code}`);
  }
}
