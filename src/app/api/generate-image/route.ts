import { buildMockGraffitiImage } from "@/lib/mock-generators";
import { colorPalette } from "@/lib/catalog";
import { logToTerminal } from "@/lib/server/logger";
import { addArtwork, getOrCreateUser, spendCredit } from "@/lib/server/store";
import type { GenerationOptions } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const user = getOrCreateUser(body.userId, body.email, body.name);
    const options = body.options as GenerationOptions | undefined;

    if (!options || !options.sourceImage || !options.colors?.length) {
      return Response.json(
        { error: "Missing image, colors or generation options.", code: "BAD_REQUEST" },
        { status: 400 },
      );
    }

    const colors = [...new Set(options.colors)]
      .filter((color) => colorPalette.includes(color))
      .slice(0, 3);
    for (const color of ["#2979ff", "#ffd600", "#00e5ff"]) {
      if (colors.length >= 3) {
        break;
      }
      if (!colors.includes(color)) {
        colors.push(color);
      }
    }
    const wallText = (options.wallText ?? "")
      .replace(/[^\x20-\x7E]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 48);

    if (colors.length === 0) {
      return Response.json(
        { error: "Choose at least one color from the approved palette.", code: "BAD_REQUEST" },
        { status: 400 },
      );
    }

    const sanitizedOptions: GenerationOptions = {
      ...options,
      colors,
      wallText: wallText || undefined,
    };

    const credit = spendCredit(user.id, "image");
    if (!credit.ok) {
      return Response.json(
        { error: credit.message, code: credit.code, user: credit.user },
        { status: credit.status },
      );
    }

    const generated = buildMockGraffitiImage(sanitizedOptions);
    const artwork = addArtwork(user.id, {
      ...generated,
      options: sanitizedOptions,
      createdAt: new Date().toISOString(),
    });

    return Response.json({ user: credit.user, artwork });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown image generation error.";
    logToTerminal(`Image generation endpoint failed: ${message}`);
    return Response.json({ error: "Image generation failed." }, { status: 500 });
  }
}
