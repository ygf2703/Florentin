import { CREDIT_PACK_SIZE } from "@/lib/catalog";
import { updateUserCredits } from "@/lib/server/credits";
import { verifyLemonSqueezyWebhookSignature } from "@/lib/server/lemonsqueezy";
import { logToTerminal } from "@/lib/server/logger";

export const runtime = "nodejs";

type LemonWebhookPayload = {
  meta?: {
    event_name?: string;
    custom_data?: {
      user_email?: string;
      email?: string;
      credits?: number | string;
    };
  };
  data?: {
    attributes?: {
      user_email?: string;
      customer_email?: string;
      email?: string;
    };
  };
};

function getWebhookEmail(payload: LemonWebhookPayload) {
  return (
    payload.meta?.custom_data?.user_email ||
    payload.meta?.custom_data?.email ||
    payload.data?.attributes?.user_email ||
    payload.data?.attributes?.customer_email ||
    payload.data?.attributes?.email ||
    ""
  )
    .trim()
    .toLowerCase();
}

function getWebhookCredits(payload: LemonWebhookPayload) {
  const credits = Number(payload.meta?.custom_data?.credits ?? CREDIT_PACK_SIZE);
  return Number.isFinite(credits) && credits > 0 ? Math.trunc(credits) : CREDIT_PACK_SIZE;
}

export async function POST(request: Request) {
  try {
    const secret = process.env.LS_WEBHOOK_SECRET;
    const signature = request.headers.get("x-signature");
    const rawBody = await request.text();

    if (!secret || !signature) {
      logToTerminal("Rejected Lemon Squeezy webhook: missing secret or x-signature.");
      return Response.json({ error: "Webhook signature is not configured." }, { status: 401 });
    }

    const isValidSignature = verifyLemonSqueezyWebhookSignature(rawBody, signature, secret);
    if (!isValidSignature) {
      logToTerminal("Rejected Lemon Squeezy webhook: invalid x-signature.");
      return Response.json({ error: "Invalid webhook signature." }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as LemonWebhookPayload;
    const eventName = payload.meta?.event_name;

    if (eventName !== "order_created") {
      logToTerminal(`Ignored Lemon Squeezy webhook event: ${eventName || "unknown"}.`);
      return Response.json({ ok: true, ignored: true });
    }

    const email = getWebhookEmail(payload);
    if (!email) {
      logToTerminal("Ignored order_created webhook: missing customer email.");
      return Response.json({ ok: false, error: "Missing customer email." }, { status: 400 });
    }

    const credits = getWebhookCredits(payload);
    await updateUserCredits(email, credits);
    logToTerminal(`Processed Lemon Squeezy order_created webhook for ${email}.`);

    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown webhook error.";
    logToTerminal(`Lemon Squeezy webhook failed: ${message}`);
    return Response.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
