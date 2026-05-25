import { buildImagePrompt } from "@/lib/prompts";
import { logToTerminal } from "@/lib/server/logger";
import type { GenerationOptions } from "@/lib/types";

const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_GEMINI_IMAGE_MODEL = "gemini-2.0-flash-preview-image-generation";

type GeminiImagePart = {
  text?: string;
  inlineData?: {
    mimeType?: string;
    data?: string;
  };
  inline_data?: {
    mime_type?: string;
    data?: string;
  };
};

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiImagePart[];
    };
  }>;
  error?: {
    message?: string;
  };
};

export class GeminiImageConfigError extends Error {}
export class GeminiImageApiError extends Error {}

function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new GeminiImageConfigError("Missing GEMINI_API_KEY.");
  }

  return apiKey;
}

function getGeminiImageModel() {
  return process.env.GEMINI_IMAGE_MODEL || DEFAULT_GEMINI_IMAGE_MODEL;
}

function normalizeAspectRatio(value?: string) {
  const normalized = (value || "1:1").trim().toUpperCase();
  const aspectRatios: Record<string, string> = {
    "1:1": "ASPECT_RATIO_ONE_BY_ONE",
    "2:3": "ASPECT_RATIO_TWO_BY_THREE",
    "3:2": "ASPECT_RATIO_THREE_BY_TWO",
    "3:4": "ASPECT_RATIO_THREE_BY_FOUR",
    "4:3": "ASPECT_RATIO_FOUR_BY_THREE",
    "4:5": "ASPECT_RATIO_FOUR_BY_FIVE",
    "5:4": "ASPECT_RATIO_FIVE_BY_FOUR",
    "9:16": "ASPECT_RATIO_NINE_BY_SIXTEEN",
    "16:9": "ASPECT_RATIO_SIXTEEN_BY_NINE",
    "21:9": "ASPECT_RATIO_TWENTY_ONE_BY_NINE",
    ASPECT_RATIO_ONE_BY_ONE: "ASPECT_RATIO_ONE_BY_ONE",
  };

  return aspectRatios[normalized] ?? "ASPECT_RATIO_ONE_BY_ONE";
}

function normalizeImageSize(value?: string) {
  const normalized = (value || "1K").trim().toUpperCase().replace(/\s+/g, "");
  const imageSizes: Record<string, string> = {
    "512": "IMAGE_SIZE_FIVE_TWELVE",
    "512PX": "IMAGE_SIZE_FIVE_TWELVE",
    "1K": "IMAGE_SIZE_ONE_K",
    "2K": "IMAGE_SIZE_TWO_K",
    "4K": "IMAGE_SIZE_FOUR_K",
    IMAGE_SIZE_FIVE_TWELVE: "IMAGE_SIZE_FIVE_TWELVE",
    IMAGE_SIZE_ONE_K: "IMAGE_SIZE_ONE_K",
    IMAGE_SIZE_TWO_K: "IMAGE_SIZE_TWO_K",
    IMAGE_SIZE_FOUR_K: "IMAGE_SIZE_FOUR_K",
  };

  return imageSizes[normalized] ?? "IMAGE_SIZE_ONE_K";
}

function getGeminiGenerationConfig(model: string) {
  if (model.includes("2.0-flash-preview-image-generation") || model.includes("2.5-flash-image")) {
    return {
      responseModalities: ["TEXT", "IMAGE"],
    };
  }

  const image: { aspectRatio: string; imageSize?: string } = {
    aspectRatio: normalizeAspectRatio(process.env.GEMINI_IMAGE_ASPECT_RATIO),
  };

  image.imageSize = normalizeImageSize(process.env.GEMINI_IMAGE_SIZE);

  return {
    responseModalities: ["TEXT", "IMAGE"],
    responseFormat: { image },
  };
}

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,([A-Za-z0-9+/=]+)$/);

  if (!match) {
    throw new GeminiImageApiError("Uploaded image is not a valid base64 image.");
  }

  const mimeType = match[1] === "image/jpg" ? "image/jpeg" : match[1];
  return {
    mimeType,
    base64Data: match[2],
  };
}

function getGeneratedImagePart(payload: GeminiGenerateContentResponse) {
  const parts = payload.candidates?.flatMap((candidate) => candidate.content?.parts ?? []) ?? [];

  for (const part of parts) {
    const inlineData = part.inlineData ?? (part.inline_data ? {
      mimeType: part.inline_data.mime_type,
      data: part.inline_data.data,
    } : undefined);

    if (inlineData?.data && inlineData.mimeType?.startsWith("image/")) {
      return inlineData;
    }
  }

  return null;
}

export async function generateGeminiGraffitiImage(options: GenerationOptions) {
  try {
    const apiKey = getGeminiApiKey();
    const model = getGeminiImageModel();
    const prompt = buildImagePrompt(options);
    const image = parseDataUrl(options.sourceImage ?? "");

    const response = await fetch(`${GEMINI_API_BASE_URL}/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: image.mimeType,
                  data: image.base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: getGeminiGenerationConfig(model),
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as GeminiGenerateContentResponse;
    const generatedImage = getGeneratedImagePart(payload);

    if (!response.ok || !generatedImage) {
      throw new GeminiImageApiError(payload.error?.message || "Gemini did not return an image.");
    }

    logToTerminal(`Generated graffiti image with Gemini model ${model}`);
    return {
      id: crypto.randomUUID(),
      imageUrl: `data:${generatedImage.mimeType};base64,${generatedImage.data}`,
      prompt,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Gemini image error.";
    logToTerminal(`Gemini image generation failed: ${message}`);
    throw error;
  }
}
