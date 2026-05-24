import crypto from "node:crypto";
import { logToTerminal } from "@/lib/server/logger";
import { getOrCreateUserByEmail, getUserById } from "@/lib/server/store";
import type { AppUser } from "@/lib/types";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const GOOGLE_CALLBACK_PATH = "/api/auth/callback/google";

const SESSION_COOKIE = "florentin_session";
const OAUTH_STATE_COOKIE = "florentin_oauth_state";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
const STATE_MAX_AGE = 60 * 10;

type GoogleTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  id_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleUserInfo = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

export class AuthConfigError extends Error {}
export class AuthFlowError extends Error {}

function normalizeOrigin(origin: string) {
  return origin.replace(/\/$/, "");
}

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV !== "production") {
    return "florentin-local-auth-secret";
  }

  throw new AuthConfigError("Missing AUTH_SECRET.");
}

function getGoogleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new AuthConfigError("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET.");
  }

  return { clientId, clientSecret };
}

function hmac(value: string) {
  return crypto.createHmac("sha256", getAuthSecret()).update(value).digest("hex");
}

function timingSafeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function parseCookies(cookieHeader: string | null) {
  const cookies = new Map<string, string>();

  for (const part of (cookieHeader ?? "").split(";")) {
    const [name, ...valueParts] = part.trim().split("=");
    if (!name || valueParts.length === 0) {
      continue;
    }
    cookies.set(name, decodeURIComponent(valueParts.join("=")));
  }

  return cookies;
}

function serializeCookie(name: string, value: string, maxAge: number) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function createSessionCookie(userId: string) {
  const value = `${userId}.${hmac(userId)}`;
  return serializeCookie(SESSION_COOKIE, value, COOKIE_MAX_AGE);
}

export function clearSessionCookie() {
  return serializeCookie(SESSION_COOKIE, "", 0);
}

export function createOAuthStateCookie(state: string) {
  return serializeCookie(OAUTH_STATE_COOKIE, state, STATE_MAX_AGE);
}

export function clearOAuthStateCookie() {
  return serializeCookie(OAUTH_STATE_COOKIE, "", 0);
}

export function createOAuthState() {
  return crypto.randomBytes(32).toString("base64url");
}

export function validateOAuthState(request: Request, state: string | null) {
  const storedState = parseCookies(request.headers.get("cookie")).get(OAUTH_STATE_COOKIE);

  if (!state || !storedState) {
    return false;
  }

  return timingSafeEqual(storedState, state);
}

export function getGoogleAuthUrl(origin: string, state: string) {
  const { clientId } = getGoogleConfig();
  const appOrigin = normalizeOrigin(origin);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${appOrigin}${GOOGLE_CALLBACK_PATH}`,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export function getSessionUserFromRequest(request: Request): AppUser | null {
  const session = parseCookies(request.headers.get("cookie")).get(SESSION_COOKIE);

  if (!session) {
    return null;
  }

  const separatorIndex = session.lastIndexOf(".");
  if (separatorIndex < 1) {
    return null;
  }

  const userId = session.slice(0, separatorIndex);
  const signature = session.slice(separatorIndex + 1);

  if (!timingSafeEqual(hmac(userId), signature)) {
    return null;
  }

  return getUserById(userId);
}

export async function exchangeGoogleCodeForTokens(code: string, origin: string, callbackPath = GOOGLE_CALLBACK_PATH) {
  try {
    const { clientId, clientSecret } = getGoogleConfig();
    const appOrigin = normalizeOrigin(origin);
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${appOrigin}${callbackPath}`,
        grant_type: "authorization_code",
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as GoogleTokenResponse;

    if (!response.ok || !payload.access_token) {
      throw new AuthFlowError(payload.error_description || payload.error || "Google token exchange failed.");
    }

    return payload;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Google token error.";
    logToTerminal(`Google token exchange failed: ${message}`);
    throw error;
  }
}

export async function getGoogleUserInfo(accessToken: string) {
  try {
    const response = await fetch(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const payload = (await response.json().catch(() => ({}))) as GoogleUserInfo;

    if (!response.ok || !payload.email) {
      throw new AuthFlowError("Could not load Google user profile.");
    }

    if (payload.email_verified === false) {
      throw new AuthFlowError("Google account email is not verified.");
    }

    return payload;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Google profile error.";
    logToTerminal(`Google user profile request failed: ${message}`);
    throw error;
  }
}

export async function registerGoogleUser(profile: GoogleUserInfo) {
  try {
    if (!profile.email) {
      throw new AuthFlowError("Missing Google profile email.");
    }

    const user = getOrCreateUserByEmail(profile.email, profile.name);
    logToTerminal(`Google user registered or loaded: ${user.email}`);
    return user;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Google registration error.";
    logToTerminal(`Google user registration failed: ${message}`);
    throw error;
  }
}
