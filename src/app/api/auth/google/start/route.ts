import {
  AuthConfigError,
  createOAuthState,
  createOAuthStateCookie,
  getGoogleAuthUrl,
} from "@/lib/server/auth";
import { logToTerminal } from "@/lib/server/logger";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const state = createOAuthState();
    const redirectUrl = getGoogleAuthUrl(origin, state);
    const response = Response.redirect(redirectUrl);
    response.headers.append("Set-Cookie", createOAuthStateCookie(state));
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Google auth start error.";
    logToTerminal(`Google auth start failed: ${message}`);

    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const code = error instanceof AuthConfigError ? "google-not-configured" : "google-start-failed";
    return Response.redirect(`${origin}/?auth=${code}`);
  }
}
