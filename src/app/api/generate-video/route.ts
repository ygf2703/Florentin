import { buildGeminiVideoPrompt } from "@/lib/prompts";
import { logToTerminal } from "@/lib/server/logger";
import { addVideoJob, getOrCreateUser, spendCredit } from "@/lib/server/store";
import type { GenerationOptions } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const user = getOrCreateUser(body.userId, body.email, body.name);
    const options = body.options as GenerationOptions | undefined;

    if (!options) {
      return Response.json(
        { error: "Missing video generation options.", code: "BAD_REQUEST" },
        { status: 400 },
      );
    }

    const credit = spendCredit(user.id, "video");
    if (!credit.ok) {
      return Response.json(
        { error: credit.message, code: credit.code, user: credit.user },
        { status: credit.status },
      );
    }

    const provider = process.env.GEMINI_API_KEY ? "gemini-omni" : "local-preview";
    const job = addVideoJob(user.id, {
      id: crypto.randomUUID(),
      prompt: buildGeminiVideoPrompt(options),
      provider,
      createdAt: new Date().toISOString(),
    });

    return Response.json({ user: credit.user, videoJob: job });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown video generation error.";
    logToTerminal(`Video generation endpoint failed: ${message}`);
    return Response.json({ error: "Video generation failed." }, { status: 500 });
  }
}
