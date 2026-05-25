import {
  clearOAuthStateCookie,
  createSessionCookie,
  exchangeGoogleCodeForTokens,
  getGoogleUserInfo,
  registerGoogleUser,
  validateOAuthState,
} from "@/lib/server/auth";
import { logToTerminal } from "@/lib/server/logger";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = (process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin).replace(/\/$/, "");

  try {
    const code = requestUrl.searchParams.get("code");
    const state = requestUrl.searchParams.get("state");

    if (!code) {
      throw new Error("Missing Google OAuth code.");
    }

    if (!validateOAuthState(request, state)) {
      throw new Error("Invalid Google OAuth state.");
    }

    const tokens = await exchangeGoogleCodeForTokens(code, origin, requestUrl.pathname);
    const profile = await getGoogleUserInfo(tokens.access_token ?? "");
    const user = await registerGoogleUser(profile);

    const response = NextResponse.redirect(`${origin}/?auth=success`);
    response.headers.append("Set-Cookie", clearOAuthStateCookie());
    response.headers.append("Set-Cookie", createSessionCookie(user));
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Google callback error.";
    logToTerminal(`Google auth callback failed: ${message}`);

    const response = NextResponse.redirect(`${origin}/?auth=google-failed`);
    response.headers.append("Set-Cookie", clearOAuthStateCookie());
    return response;
  }
}
