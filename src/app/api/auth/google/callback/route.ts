import {
  clearOAuthStateCookie,
  createSessionCookie,
  exchangeGoogleCodeForTokens,
  getGoogleUserInfo,
  registerGoogleUser,
  validateOAuthState,
} from "@/lib/server/auth";
import { logToTerminal } from "@/lib/server/logger";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code) {
      throw new Error("Missing Google OAuth code.");
    }

    if (!validateOAuthState(request, state)) {
      throw new Error("Invalid Google OAuth state.");
    }

    const tokens = await exchangeGoogleCodeForTokens(code, origin);
    const profile = await getGoogleUserInfo(tokens.access_token ?? "");
    const user = await registerGoogleUser(profile);

    const response = Response.redirect(`${origin}/?auth=success`);
    response.headers.append("Set-Cookie", clearOAuthStateCookie());
    response.headers.append("Set-Cookie", createSessionCookie(user.id));
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Google callback error.";
    logToTerminal(`Google auth callback failed: ${message}`);

    const response = Response.redirect(`${origin}/?auth=google-failed`);
    response.headers.append("Set-Cookie", clearOAuthStateCookie());
    return response;
  }
}
