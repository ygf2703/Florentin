import {
  createLemonSqueezyCheckoutSession,
  LemonSqueezyApiError,
  LemonSqueezyConfigError,
} from "@/lib/server/lemonsqueezy";
import { logToTerminal } from "@/lib/server/logger";
import { getOrCreateUser } from "@/lib/server/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const user = getOrCreateUser(body.userId, body.email, body.name);
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const checkoutUrl = await createLemonSqueezyCheckoutSession({
      origin,
      userEmail: user.email,
      userName: user.name,
      userId: user.id,
    });

    return Response.json({ checkoutUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown checkout error.";
    logToTerminal(`Checkout endpoint failed: ${message}`);

    if (error instanceof LemonSqueezyConfigError) {
      return Response.json({ error: "Lemon Squeezy is not configured." }, { status: 500 });
    }

    if (error instanceof LemonSqueezyApiError) {
      return Response.json({ error: message }, { status: 502 });
    }

    return Response.json({ error: "Could not create checkout session." }, { status: 500 });
  }
}
