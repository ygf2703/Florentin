export type StreetStyle =
  | "wildstyle"
  | "stencil"
  | "throw-up"
  | "wheatpaste"
  | "photorealistic"
  | "geometric";

export type WallType = "smooth" | "brick" | "peeling" | "dirty";

export type Addon = "drainpipe" | "moss" | "cat" | "dust";

export type FeatureKind = "image" | "video";

export type GenerationOptions = {
  sourceImage?: string;
  sourceFileName?: string;
  colors: string[];
  style: StreetStyle;
  wall: WallType;
  addons: Addon[];
  wallText?: string;
};

export type AppUser = {
  id: string;
  email: string;
  name: string;
  credits: number;
  premium: boolean;
  createdAt: string;
};

export type Artwork = {
  id: string;
  imageUrl: string;
  prompt: string;
  options: GenerationOptions;
  createdAt: string;
};

export type VideoJob = {
  id: string;
  prompt: string;
  provider: "gemini-omni" | "local-preview";
  createdAt: string;
};

export type ApiError = {
  error: string;
  code?: "PAYWALL_REQUIRED" | "PREMIUM_REQUIRED" | "BAD_REQUEST";
};
