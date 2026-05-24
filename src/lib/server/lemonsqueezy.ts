import crypto from "node:crypto";
import { CREDIT_PACK_SIZE } from "@/lib/catalog";
import { logToTerminal } from "@/lib/server/logger";

const LEMON_SQUEEZY_CHECKOUT_URL = "https://api.lemonsqueezy.com/v1/checkouts";

type LemonSqueezyCheckoutResponse = {
  data?: {
    attributes?: {
      url?: string;
    };
  };
  errors?: Array<{ detail?: string; title?: string }>;
};

type CheckoutSessionInput = {
  origin: string;
  userEmail: string;
  userName?: string;
  userId?: string;
};

type LemonSqueezyConfig = {
  apiKey: string;
  storeId: string;
  variantId: string;
};

export class LemonSqueezyConfigError extends Error {}
export class LemonSqueezyApiError extends Error {}

function getLemonSqueezyConfig(): LemonSqueezyConfig {
  const apiKey = process.env.LS_API_KEY;
  const storeId = process.env.LS_STORE_ID;
  const variantId = process.env.LS_VARIANT_ID;

  if (!apiKey || !storeId || !variantId) {
    throw new LemonSqueezyConfigError("Missing LS_API_KEY, LS_STORE_ID or LS_VARIANT_ID.");
  }

  return { apiKey, storeId, variantId };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function verifyLemonSqueezyWebhookSignature(rawBody: string, signature: string, secret: string) {
  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const digestBuffer = Buffer.from(digest, "utf8");
  const signatureBuffer = Buffer.from(signature, "utf8");

  if (digestBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(digestBuffer, signatureBuffer);
}

export async function createLemonSqueezyCheckoutSession({
  origin,
  userEmail,
  userName,
  userId,
}: CheckoutSessionInput) {
  try {
    const config = getLemonSqueezyConfig();
    const email = normalizeEmail(userEmail);

    if (!email) {
      throw new LemonSqueezyApiError("Missing user email for checkout session.");
    }

    const response = await fetch(LEMON_SQUEEZY_CHECKOUT_URL, {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            product_options: {
              redirect_url: `${origin}/?checkout=success`,
              receipt_button_text: "Back to studio",
              receipt_link_url: `${origin}/?checkout=success`,
              enabled_variants: [Number(config.variantId)],
            },
            checkout_options: {
              button_color: "#00e5ff",
            },
            checkout_data: {
              email,
              name: userName,
              custom: {
                user_id: userId,
                user_email: email,
                credits: CREDIT_PACK_SIZE,
                product: "florentin_15_credit_pack",
              },
            },
          },
          relationships: {
            store: {
              data: {
                type: "stores",
                id: config.storeId,
              },
            },
            variant: {
              data: {
                type: "variants",
                id: config.variantId,
              },
            },
          },
        },
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as LemonSqueezyCheckoutResponse;
    const checkoutUrl = payload.data?.attributes?.url;

    if (!response.ok || !checkoutUrl) {
      const detail = payload.errors?.[0]?.detail || payload.errors?.[0]?.title;
      throw new LemonSqueezyApiError(detail || "Could not create Lemon Squeezy checkout.");
    }

    logToTerminal(`Created Lemon Squeezy checkout session for ${email}`);
    return checkoutUrl;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Lemon Squeezy checkout error.";
    logToTerminal(`Failed to create Lemon Squeezy checkout session: ${message}`);
    throw error;
  }
}
