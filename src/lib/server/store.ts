import { FREE_CREDITS, IMAGE_CREDIT_COST, VIDEO_CREDIT_COST } from "@/lib/catalog";
import type { AppUser, Artwork, FeatureKind, VideoJob } from "@/lib/types";

type CreditIncrementUpdate = {
  $inc: {
    credits: number;
  };
  $set?: Partial<Pick<AppUser, "premium">>;
};

type Store = {
  users: Map<string, AppUser>;
  artworks: Map<string, Artwork[]>;
  videoJobs: Map<string, VideoJob[]>;
};

declare global {
  var graffitiOmniStore: Store | undefined;
}

function store() {
  globalThis.graffitiOmniStore ??= {
    users: new Map<string, AppUser>(),
    artworks: new Map<string, Artwork[]>(),
    videoJobs: new Map<string, VideoJob[]>(),
  };

  return globalThis.graffitiOmniStore;
}

export function getOrCreateUser(userId?: string, email?: string, name?: string) {
  const appStore = store();
  const id = userId || crypto.randomUUID();
  const existing = appStore.users.get(id);

  if (existing) {
    const updated = {
      ...existing,
      email: email || existing.email,
      name: name || existing.name,
    };
    appStore.users.set(id, updated);
    return updated;
  }

  const user: AppUser = {
    id,
    email: email || "creator@example.com",
    name: name || (email ? email.split("@")[0] : "Creator"),
    credits: FREE_CREDITS,
    premium: false,
    createdAt: new Date().toISOString(),
  };

  appStore.users.set(id, user);
  appStore.artworks.set(id, []);
  appStore.videoJobs.set(id, []);
  return user;
}

export function getUserById(userId: string) {
  return store().users.get(userId) ?? null;
}

export function getOrCreateUserByEmail(email: string, name?: string) {
  const appStore = store();
  const normalizedEmail = email.trim().toLowerCase();
  const existing = Array.from(appStore.users.values()).find(
    (user) => user.email.toLowerCase() === normalizedEmail,
  );

  if (existing) {
    const updated = {
      ...existing,
      name: name || existing.name,
      email: normalizedEmail,
    };
    appStore.users.set(existing.id, updated);
    return updated;
  }

  return getOrCreateUser(undefined, normalizedEmail, name || normalizedEmail.split("@")[0]);
}

export function grantCredits(userId: string, credits: number) {
  const appStore = store();
  const user = getOrCreateUser(userId);
  const updated = {
    ...user,
    credits: user.credits + credits,
    premium: true,
  };
  appStore.users.set(user.id, updated);
  return updated;
}

export function updateUserByEmailWithInc(email: string, update: CreditIncrementUpdate) {
  const appStore = store();
  const normalizedEmail = email.trim().toLowerCase();
  const existing =
    Array.from(appStore.users.values()).find((user) => user.email.toLowerCase() === normalizedEmail) ??
    getOrCreateUser(undefined, normalizedEmail, normalizedEmail.split("@")[0]);

  const updated = {
    ...existing,
    ...update.$set,
    credits: existing.credits + update.$inc.credits,
  };
  appStore.users.set(updated.id, updated);
  appStore.artworks.set(updated.id, appStore.artworks.get(updated.id) ?? []);
  appStore.videoJobs.set(updated.id, appStore.videoJobs.get(updated.id) ?? []);
  return updated;
}

export function spendCredit(userId: string, feature: FeatureKind) {
  const appStore = store();
  const user = getOrCreateUser(userId);
  const cost = feature === "video" ? VIDEO_CREDIT_COST : IMAGE_CREDIT_COST;

  if (feature === "video" && !user.premium) {
    return {
      ok: false as const,
      status: 403,
      code: "PREMIUM_REQUIRED" as const,
      message: "Video generation is available after purchasing credits.",
      user,
    };
  }

  if (user.credits < cost) {
    return {
      ok: false as const,
      status: 402,
      code: "PAYWALL_REQUIRED" as const,
      message: feature === "video" ? `Video generation requires ${VIDEO_CREDIT_COST} credits.` : "No credits left.",
      user,
    };
  }

  const updated = { ...user, credits: user.credits - cost };
  appStore.users.set(user.id, updated);
  return { ok: true as const, user: updated };
}

export function addArtwork(userId: string, artwork: Artwork) {
  const appStore = store();
  const list = appStore.artworks.get(userId) ?? [];
  const updated = [artwork, ...list].slice(0, 12);
  appStore.artworks.set(userId, updated);
  return artwork;
}

export function addVideoJob(userId: string, job: VideoJob) {
  const appStore = store();
  const list = appStore.videoJobs.get(userId) ?? [];
  appStore.videoJobs.set(userId, [job, ...list].slice(0, 12));
  return job;
}
