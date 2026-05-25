/* eslint-disable @next/next/no-img-element */
"use client";

import {
  ArrowDown,
  BadgeDollarSign,
  BrickWall,
  Check,
  CircleHelp,
  CreditCard,
  Download,
  Film,
  ImagePlus,
  KeyRound,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Palette,
  Play,
  Rocket,
  ShieldCheck,
  Sparkles,
  SprayCan,
  UserRound,
  Video,
  Wand2,
  X,
} from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  addons,
  colorPalette,
  CREDIT_PACK_PRICE,
  CREDIT_PACK_SIZE,
  IMAGE_CREDIT_COST,
  getStyle,
  styles,
  walls,
} from "@/lib/catalog";
import type {
  Addon,
  ApiError,
  AppUser,
  Artwork,
  GenerationOptions,
  StreetStyle,
  VideoJob,
  WallType,
} from "@/lib/types";

const BRAND_NAME = "Florentin";
const LOGO_SRC = "/florentin-logo-clean.png";
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
const GOOGLE_AUTH_START_HREF = APP_URL ? `${APP_URL}/api/auth/google/start` : "/api/auth/google/start";
const referenceImages = [
  {
    src: "/references/florentin-wall-01.jpg",
    title: "פורטרט קיר ריאליסטי",
    caption: "דמות מזוהה היטב, מצוירת ישירות על בטון מחוספס עם מרקם קיר חי.",
  },
  {
    src: "/references/florentin-wall-02.jpg",
    title: "גרפיטי דמות ואותיות",
    caption: "דוגמה צבעונית לאנרגיית רחוב, טקסט ספריי ודמות מרכזית על קיר שחור.",
  },
  {
    src: "/references/florentin-wall-03.jpg",
    title: "קיר מסר רחב",
    caption: "קומפוזיציית קיר מלאה עם צבע, ספריי, נזילות ואובייקט מרכזי גדול.",
  },
  {
    src: "/references/florentin-wall-04.jpg",
    title: "פורטרט אייקוני",
    caption: "פנים גדולות, קונטרסט חזק, שכבות שבלונה וטקסט גרפיטי משני.",
  },
  {
    src: "/references/florentin-wall-05.jpg",
    title: "מחווה ספורטיבית",
    caption: "דמות פעולה מצוירת על קיר, מוקפת צבע, כתיבה וטיפות ספריי.",
  },
  {
    src: "/references/florentin-wall-06.jpg",
    title: "פורטרט מחווה מכבד",
    caption: "ייצוג מכובד ומזוהה מאוד, עם הרבה צבע ועדיין תחושת קיר אמיתי.",
  },
  {
    src: "/references/florentin-wall-07.jpg",
    title: "פורטרט וינטג׳",
    caption: "שחור-לבן עם התזות כחול, צהוב וסגול סביב דמות מרכזית.",
  },
  {
    src: "/references/florentin-wall-08.jpg",
    title: "לוגו קיר צבעוני",
    caption: "דוגמה לגבולות הסגנון: צבעוניות חזקה, אבל עדיין על בטון אמיתי.",
  },
  {
    src: "/references/florentin-wall-09.jpg",
    title: "אובייקט מרכזי דרמטי",
    caption: "קיר אייקוני עם פוקוס אחד גדול, טקסט משני ורקע גרפיטי עמוס.",
  },
  {
    src: "/references/florentin-wall-10.jpg",
    title: "פורטרט מותג אורבני",
    caption: "ראש וכתפיים, צבעים דומיננטיים וטקסטים משניים בספריי.",
  },
  {
    src: "/references/florentin-wall-11.jpg",
    title: "אובייקט פוטוריאליסטי על קיר",
    caption: "דוגמה לשילוב אובייקט מצולם כציור קיר, עם ספיגת צבע וטקסטורת בטון.",
  },
] as const;
const STORAGE_USER_ID = "florentin:user-id";
const STORAGE_USER_EMAIL = "florentin:user-email";
const STORAGE_GALLERY_PREFIX = "florentin:gallery:";

const navItems = [
  { href: "#studio", label: "סטודיו" },
  { href: "#examples", label: "השראה" },
  { href: "#what", label: "מה האפליקציה עושה" },
  { href: "#flow", label: "איך זה עובד" },
  { href: "#pricing", label: "תמחור" },
  { href: "#faq", label: "FAQ" },
];

const featureItems = [
  {
    icon: ImagePlus,
    title: "תמונה אישית לקיר רחוב",
    text: "מעלים תמונה, בוחרים סגנון, והמערכת הופכת אותה לקיר גרפיטי חי וצבעוני.",
  },
  {
    icon: Palette,
    title: "פלטת צבעים סגורה",
    text: "32 צבעי ספריי מוכנים לבחירה, עד שלושה צבעים מרכזיים לכל יצירה.",
  },
  {
    icon: BrickWall,
    title: "קירות ותפאורה",
    text: "בטון, לבנים, טיח מתקלף, מרזבים, טחב, אבק ואלמנטים של רחוב.",
  },
  {
    icon: Film,
    title: "וידאו פרימיום",
    text: "אחרי פתיחת פרימיום אפשר ליצור סרטון קצר של האמן מצייר את הקיר.",
  },
];

const flowItems = [
  "מתחברים ומקבלים 3 קרדיטים ראשונים",
  "מעלים תמונה ובוחרים סגנון, צבעים וקיר",
  "מייצרים קיר גרפיטי ושומרים בגלריה",
  "פותחים פרימיום ומפיקים וידאו להורדה",
];

const faqItems = [
  {
    question: "מה Florentin עושה?",
    answer:
      "Florentin הופכת תמונות אישיות לאמנות רחוב על קירות וירטואליים, ואז מוסיפה שכבת וידאו שמדמה את תהליך הציור.",
  },
  {
    question: "כמה קרדיטים מקבלים בחינם?",
    answer: "כל משתמש חדש מקבל 3 קרדיטים ליצירת תמונות. וידאו נפתח אחרי רכישת חבילת קרדיטים.",
  },
  {
    question: "איך עובד התשלום?",
    answer:
      "החבילה עולה $5 ומוסיפה 15 קרדיטים. תמונה צורכת קרדיט אחד, וידאו צורך 5 קרדיטים. התשלום נסגר דרך Lemon Squeezy בלבד.",
  },
  {
    question: "האם Gemini מחובר כבר?",
    answer:
      "יצירת תמונות מחוברת ל-Gemini Image כאשר GEMINI_API_KEY מוגדר. הווידאו עדיין preview מקומי עד חיבור מודל וידאו.",
  },
];

type ApiFailure = Error & {
  status?: number;
  payload?: ApiError & { user?: AppUser };
};

type VideoAsset = {
  id: string;
  url: string;
  mimeType: string;
  prompt: string;
  provider: VideoJob["provider"];
  createdAt: string;
};

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

async function apiPost<T>(url: string, payload: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || "Request failed") as ApiFailure;
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data as T;
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image could not be loaded"));
    image.src = source;
  });
}

async function readAndResizeImage(file: File) {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("File could not be read"));
    reader.readAsDataURL(file);
  });
  const image = await loadImage(dataUrl);
  const maxSize = 960;
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");

  if (!context) {
    return dataUrl;
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.86);
}

function drawWallTexture(context: CanvasRenderingContext2D, options: GenerationOptions) {
  const gradient = context.createLinearGradient(0, 0, 1280, 720);
  gradient.addColorStop(0, "#252529");
  gradient.addColorStop(0.55, "#141417");
  gradient.addColorStop(1, "#070708");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1280, 720);

  context.globalAlpha = 0.22;
  context.strokeStyle = "#f3f4f6";
  for (let i = 0; i < 90; i += 1) {
    const x = (i * 97) % 1280;
    const y = (i * 53) % 720;
    context.beginPath();
    context.arc(x, y, 0.8 + (i % 5) * 0.6, 0, Math.PI * 2);
    context.stroke();
  }
  context.globalAlpha = 1;

  if (options.wall === "brick") {
    context.strokeStyle = "rgba(0,0,0,0.45)";
    context.lineWidth = 4;
    for (let y = 0; y < 720; y += 58) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(1280, y);
      context.stroke();
      const offset = y % 116 === 0 ? 0 : 72;
      for (let x = -offset; x < 1280; x += 144) {
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x, y + 58);
        context.stroke();
      }
    }
  }

  if (options.wall === "peeling") {
    context.fillStyle = "rgba(238,232,215,0.18)";
    context.beginPath();
    context.ellipse(230, 170, 190, 70, -0.2, 0, Math.PI * 2);
    context.ellipse(980, 600, 220, 76, 0.12, 0, Math.PI * 2);
    context.fill();
  }

  if (options.wall === "dirty") {
    const soot = context.createLinearGradient(0, 420, 0, 720);
    soot.addColorStop(0, "rgba(0,0,0,0)");
    soot.addColorStop(1, "rgba(0,0,0,0.52)");
    context.fillStyle = soot;
    context.fillRect(0, 0, 1280, 720);
  }
}

function drawAddons(context: CanvasRenderingContext2D, options: GenerationOptions) {
  const addonSet = new Set(options.addons);

  if (addonSet.has("drainpipe")) {
    context.fillStyle = "#232428";
    context.fillRect(1110, 0, 34, 720);
    context.fillStyle = "rgba(255,255,255,0.18)";
    context.fillRect(1117, 0, 7, 720);
  }

  if (addonSet.has("moss")) {
    context.fillStyle = "rgba(93,135,63,0.74)";
    context.beginPath();
    context.ellipse(214, 525, 110, 26, 0.1, 0, Math.PI * 2);
    context.ellipse(810, 144, 112, 28, -0.2, 0, Math.PI * 2);
    context.fill();
  }

  if (addonSet.has("cat")) {
    context.fillStyle = "#141518";
    context.beginPath();
    context.ellipse(146, 645, 54, 32, 0, 0, Math.PI * 2);
    context.arc(184, 611, 25, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#9dfc45";
    context.beginPath();
    context.arc(177, 609, 3, 0, Math.PI * 2);
    context.arc(191, 609, 3, 0, Math.PI * 2);
    context.fill();
  }

  if (addonSet.has("dust")) {
    const dust = context.createLinearGradient(0, 640, 0, 720);
    dust.addColorStop(0, "rgba(201,189,154,0)");
    dust.addColorStop(1, "rgba(201,189,154,0.32)");
    context.fillStyle = dust;
    context.fillRect(0, 560, 1280, 160);
  }
}

function drawArtist(context: CanvasRenderingContext2D, progress: number, colors: string[]) {
  const armWave = Math.sin(progress * Math.PI * 9) * 18;
  const x = 905;
  const y = 462;

  context.save();
  context.translate(x, y);
  context.fillStyle = "#0c0d10";
  context.beginPath();
  context.ellipse(80, 66, 82, 123, -0.12, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#1d2028";
  context.beginPath();
  context.ellipse(72, -17, 68, 55, 0.05, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = "#15171d";
  context.lineWidth = 32;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(36, 42);
  context.quadraticCurveTo(-20, -8 + armWave, -92, -10 + armWave);
  context.stroke();
  context.fillStyle = "#111317";
  context.fillRect(-120, -22 + armWave, 34, 58);
  context.fillStyle = colors[Math.floor(progress * colors.length * 3) % colors.length] ?? "#00e5ff";
  context.fillRect(-128, -10 + armWave, 12, 34);

  context.globalAlpha = 0.6;
  for (let i = 0; i < 30; i += 1) {
    const drift = (i * 19 + progress * 460) % 160;
    context.fillStyle = colors[i % colors.length] ?? "#00e5ff";
    context.beginPath();
    context.arc(-150 - drift, -5 + armWave + Math.sin(i) * 44, 1.8 + (i % 4), 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

async function recordGraffitiVideo(artworkUrl: string, options: GenerationOptions) {
  if (!("MediaRecorder" in window)) {
    throw new Error("Video recording is not supported in this browser.");
  }

  const artwork = await loadImage(artworkUrl);
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 720;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas context is unavailable.");
  }

  const drawingContext = context;
  const stream = canvas.captureStream(30);
  const mimeType =
    ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find((type) =>
      MediaRecorder.isTypeSupported(type),
    ) ?? "video/webm";
  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(stream, { mimeType });
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  const stopped = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
  });

  const duration = 4600;
  const mural = { x: 190, y: 74, width: 780, height: 548 };

  function draw(progress: number) {
    drawWallTexture(drawingContext, options);
    drawAddons(drawingContext, options);
    const reveal = Math.min(1, progress * 1.25);
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.rect(mural.x, mural.y, mural.width * reveal, mural.height);
    drawingContext.clip();
    drawingContext.shadowColor = "rgba(0,0,0,0.48)";
    drawingContext.shadowBlur = 34;
    drawingContext.drawImage(artwork, mural.x, mural.y, mural.width, mural.height);
    drawingContext.restore();

    drawingContext.save();
    drawingContext.globalAlpha = 0.22 + reveal * 0.38;
    drawingContext.strokeStyle = options.colors[1] ?? "#00e5ff";
    drawingContext.lineWidth = 10;
    drawingContext.beginPath();
    drawingContext.moveTo(mural.x + 22, mural.y + mural.height - 40);
    drawingContext.quadraticCurveTo(504, 662, mural.x + mural.width - 8, mural.y + mural.height - 58);
    drawingContext.stroke();
    drawingContext.restore();

    drawArtist(drawingContext, progress, options.colors);

    const vignette = drawingContext.createRadialGradient(650, 340, 120, 650, 340, 760);
    vignette.addColorStop(0, "rgba(255,255,255,0.04)");
    vignette.addColorStop(1, "rgba(0,0,0,0.58)");
    drawingContext.fillStyle = vignette;
    drawingContext.fillRect(0, 0, 1280, 720);
  }

  recorder.start();
  await new Promise<void>((resolve) => {
    const startedAt = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      draw(progress);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        window.setTimeout(() => {
          recorder.stop();
          resolve();
        }, 180);
      }
    };
    requestAnimationFrame(tick);
  });

  const blob = await stopped;
  return {
    url: URL.createObjectURL(blob),
    mimeType,
  };
}

export function GraffitiStudio() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [email, setEmail] = useState(() =>
    typeof window === "undefined" ? "" : window.localStorage.getItem(STORAGE_USER_EMAIL) ?? "",
  );
  const [sourceImage, setSourceImage] = useState<string>("");
  const [sourceFileName, setSourceFileName] = useState<string>("");
  const [selectedColors, setSelectedColors] = useState<string[]>(["#2979ff", "#ffd600", "#00e5ff"]);
  const [selectedStyle, setSelectedStyle] = useState<StreetStyle>("wildstyle");
  const [selectedWall, setSelectedWall] = useState<WallType>("brick");
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>(["dust"]);
  const [wallText, setWallText] = useState<string>("");
  const [latestArtwork, setLatestArtwork] = useState<Artwork | null>(null);
  const [gallery, setGallery] = useState<Artwork[]>([]);
  const [videoAsset, setVideoAsset] = useState<VideoAsset | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const options = useMemo<GenerationOptions>(
    () => ({
      sourceImage,
      sourceFileName,
      colors: selectedColors,
      style: selectedStyle,
      wall: selectedWall,
      addons: selectedAddons,
      wallText: wallText.trim() || undefined,
    }),
    [selectedAddons, selectedColors, selectedStyle, selectedWall, sourceFileName, sourceImage, wallText],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const userId = window.localStorage.getItem(STORAGE_USER_ID);
        const savedEmail = window.localStorage.getItem(STORAGE_USER_EMAIL);
        const sessionResponse = await fetch("/api/session");
        const { user: cookieUser } = (await sessionResponse.json()) as { user: AppUser | null };
        const sessionUser = cookieUser || (userId ? (await apiPost<{ user: AppUser }>("/api/session", { userId, email: savedEmail })).user : null);

        if (!sessionUser || cancelled) {
          return;
        }

        window.localStorage.setItem(STORAGE_USER_ID, sessionUser.id);
        window.localStorage.setItem(STORAGE_USER_EMAIL, sessionUser.email);
        setEmail(sessionUser.email);
        setUser(sessionUser);
        const savedGallery = window.localStorage.getItem(`${STORAGE_GALLERY_PREFIX}${sessionUser.id}`);
        if (savedGallery) {
          const parsed = JSON.parse(savedGallery) as Artwork[];
          setGallery(parsed);
          setLatestArtwork(parsed[0] ?? null);
        }
      } catch {
        window.localStorage.removeItem(STORAGE_USER_ID);
      }
    }

    void loadSession();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user || gallery.length === 0) {
      return;
    }

    window.localStorage.setItem(`${STORAGE_GALLERY_PREFIX}${user.id}`, JSON.stringify(gallery.slice(0, 8)));
  }, [gallery, user]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(""), 3600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get("auth");

    if (!authStatus) {
      return;
    }

    window.setTimeout(() => {
      if (authStatus === "success") {
        setToast("נרשמת והתחברת עם Google. ברוך הבא ל-Florentin.");
      } else if (authStatus === "google-not-configured") {
        setToast("צריך להגדיר Google OAuth לפני שאפשר להתחבר עם Google.");
      } else {
        setToast("התחברות Google נכשלה. נסה שוב.");
      }
    }, 0);

    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  async function handleLogin(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const cleanEmail = email.trim() || "creator@example.com";
    setIsLoggingIn(true);

    try {
      const existingId = window.localStorage.getItem(STORAGE_USER_ID) ?? crypto.randomUUID();
      const response = await apiPost<{ user: AppUser }>("/api/session", {
        userId: existingId,
        email: cleanEmail,
        name: cleanEmail.split("@")[0],
      });
      window.localStorage.setItem(STORAGE_USER_ID, response.user.id);
      window.localStorage.setItem(STORAGE_USER_EMAIL, response.user.email);
      setUser(response.user);
      setToast("נכנסת ל-Florentin. קיבלת 3 קרדיטים ראשונים.");
    } finally {
      setIsLoggingIn(false);
    }
  }

  function handleLogout() {
    setUser(null);
    setLatestArtwork(null);
    setVideoAsset(null);
    setGallery([]);
    window.localStorage.removeItem(STORAGE_USER_ID);
    window.localStorage.removeItem(STORAGE_USER_EMAIL);
    void fetch("/api/auth/logout", { method: "POST" });
  }

  async function handleFileChange(file?: File) {
    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setToast("אפשר להעלות JPG או PNG בלבד.");
      return;
    }

    setIsUploading(true);
    try {
      const resized = await readAndResizeImage(file);
      setSourceImage(resized);
      setSourceFileName(file.name);
      setToast("התמונה מוכנה לעיבוד.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "העלאת התמונה נכשלה.");
    } finally {
      setIsUploading(false);
    }
  }

  function toggleColor(color: string) {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter((item) => item !== color));
      return;
    }

    if (selectedColors.length >= 3) {
      setToast("אפשר לבחור עד 3 צבעים מרכזיים.");
      return;
    }

    setSelectedColors([...selectedColors, color]);
  }

  function handleWallTextChange(value: string) {
    setWallText(
      value
        .replace(/[^\x20-\x7E]/g, "")
        .replace(/\s+/g, " ")
        .slice(0, 48),
    );
  }

  function toggleAddon(addon: Addon) {
    setSelectedAddons((current) =>
      current.includes(addon) ? current.filter((item) => item !== addon) : [...current, addon],
    );
  }

  async function handleGenerateImage() {
    if (!user) {
      setToast("צריך להתחבר לפני יצירה.");
      return;
    }

    if (!sourceImage) {
      setToast("העלה תמונה אישית לפני יצירה.");
      return;
    }

    if (selectedColors.length === 0) {
      setToast("בחר לפחות צבע אחד.");
      return;
    }

    if (user.credits < IMAGE_CREDIT_COST) {
      setPaywallOpen(true);
      setToast("נגמרו הקרדיטים ליצירת תמונות.");
      return;
    }

    setIsGeneratingImage(true);
    setVideoAsset(null);
    try {
      const response = await apiPost<{ user: AppUser; artwork: Artwork }>("/api/generate-image", {
        userId: user.id,
        email: user.email,
        name: user.name,
        options,
      });
      setUser(response.user);
      setLatestArtwork(response.artwork);
      setGallery((current) => [response.artwork, ...current].slice(0, 8));
      setToast("הקיר נוצר ונשמר בגלריה.");
    } catch (error) {
      const failure = error as ApiFailure;
      if (failure.status === 402) {
        setUser(failure.payload?.user ?? user);
        setPaywallOpen(true);
      } else {
        setToast(failure.message);
      }
    } finally {
      setIsGeneratingImage(false);
    }
  }

  async function handleGenerateVideo() {
    if (!user || !latestArtwork) {
      setToast("צריך קודם ליצור תמונת קיר.");
      return;
    }

    if (!user.premium) {
      setPaywallOpen(true);
      setToast("וידאו פתוח אחרי רכישת חבילת קרדיטים.");
      return;
    }

    if (user.credits <= 0) {
      setPaywallOpen(true);
      return;
    }

    setIsGeneratingVideo(true);
    try {
      const response = await apiPost<{ user: AppUser; videoJob: VideoJob }>("/api/generate-video", {
        userId: user.id,
        email: user.email,
        name: user.name,
        options: latestArtwork.options,
        imageUrl: latestArtwork.imageUrl,
      });
      setUser(response.user);
      const recorded = await recordGraffitiVideo(latestArtwork.imageUrl, latestArtwork.options);
      setVideoAsset({
        id: response.videoJob.id,
        url: recorded.url,
        mimeType: recorded.mimeType,
        prompt: response.videoJob.prompt,
        provider: response.videoJob.provider,
        createdAt: response.videoJob.createdAt,
      });
      setToast("הווידאו מוכן להורדה.");
    } catch (error) {
      const failure = error as ApiFailure;
      if (failure.status === 402 || failure.status === 403) {
        setUser(failure.payload?.user ?? user);
        setPaywallOpen(true);
      } else {
        setToast(failure.message);
      }
    } finally {
      setIsGeneratingVideo(false);
    }
  }

  async function handleCheckout() {
    if (!user) {
      return;
    }

    setIsCheckingOut(true);
    try {
      const response = await apiPost<{
        checkoutUrl?: string;
      }>("/api/checkout", {
        userId: user.id,
        email: user.email,
        name: user.name,
      });

      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
        return;
      }

      setToast("לא התקבל קישור תשלום מ-Lemon Squeezy.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "התשלום נכשל.");
    } finally {
      setIsCheckingOut(false);
    }
  }

  function downloadAsset(url: string, filename: string) {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  }

  if (!user) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-[#070707] text-zinc-50">
        <SiteHeader user={user} onLogout={handleLogout} onOpenPaywall={() => setPaywallOpen(true)} />
        <HeroLogin
          email={email}
          isLoggingIn={isLoggingIn}
          onEmailChange={setEmail}
          onLogin={handleLogin}
        />
        <MarketingSections />
        {toast ? <Toast message={toast} /> : null}
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070707] text-zinc-50">
      <SiteHeader user={user} onLogout={handleLogout} onOpenPaywall={() => setPaywallOpen(true)} />

      <section id="studio" className="relative overflow-hidden border-b border-white/10 pt-32 md:pt-24">
        <div className="florentin-studio-bg absolute inset-0" />
        <img
          src={referenceImages[0].src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-18 mix-blend-luminosity"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,7,7,.62),rgba(7,7,7,.92)_48%,#070707)]" />
        <img
          src={LOGO_SRC}
          alt=""
          className="pointer-events-none absolute left-1/2 top-12 h-[min(62vw,680px)] w-[min(62vw,680px)] -translate-x-1/2 object-contain opacity-50 mix-blend-screen"
          aria-hidden="true"
        />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6">
          <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-4">
              <img
                src={LOGO_SRC}
                alt="Florentin logo"
                className="h-20 w-20 object-contain drop-shadow-[0_0_24px_rgba(255,243,59,.26)]"
              />
              <div>
                <p className="text-xs font-bold uppercase text-cyan-200">Florentin Studio</p>
                <h1 className="mt-1 text-3xl font-black text-white sm:text-5xl">
                  הופכים תמונה לקיר גרפיטי חי
                </h1>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <MetricBadge label="קרדיטים" value={String(user.credits)} icon={CreditCard} />
              <MetricBadge label="סטטוס" value={user.premium ? "Premium" : "Free"} icon={ShieldCheck} />
            </div>
          </div>

          <div className="grid w-full gap-5 xl:grid-cols-[410px_1fr]">
            <aside className="space-y-4">
              <section className="street-panel rotate-[-0.4deg] border border-white/12 bg-black/58 p-4 shadow-xl shadow-black/30 backdrop-blur">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImagePlus className="h-5 w-5 text-cyan-300" />
                    <h2 className="font-semibold text-white">תמונת בסיס</h2>
                  </div>
                  <span className="text-xs text-zinc-400">JPG / PNG</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={(event) => handleFileChange(event.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="florentin-upload-zone relative flex min-h-48 w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-[#fff33b]/50 bg-white/[0.04] p-4 text-center transition hover:border-cyan-300"
                  style={
                    sourceImage
                      ? undefined
                      : {
                          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.24), rgba(0,0,0,.78)), url(${referenceImages[3].src})`,
                        }
                  }
                >
                  {sourceImage ? (
                    <img src={sourceImage} alt="תמונת בסיס" className="max-h-44 rounded object-contain" />
                  ) : (
                    <span className="relative z-10 flex flex-col items-center gap-3 text-sm text-white">
                      {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-7 w-7" />}
                      <span className="text-2xl font-black">לחץ והעלה תמונה</span>
                      <span className="max-w-64 text-sm font-semibold leading-6 text-zinc-100">
                        נכניס אותה לתוך קיר גרפיטי בסגנון התמונות המצורפות.
                      </span>
                    </span>
                  )}
                </button>
                {sourceFileName ? <p className="mt-3 truncate text-xs text-zinc-400">{sourceFileName}</p> : null}
              </section>

              <section className="street-panel border border-white/10 bg-black/55 p-4 shadow-xl shadow-black/20 backdrop-blur">
                <div className="mb-4 flex items-center gap-2">
                  <SprayCan className="h-5 w-5 text-[#fff33b]" />
                  <h2 className="font-semibold text-white">טקסט על הקיר</h2>
                  <span className="text-xs text-zinc-400">אופציונלי / English</span>
                </div>
                <input
                  dir="ltr"
                  type="text"
                  value={wallText}
                  onChange={(event) => handleWallTextChange(event.target.value)}
                  maxLength={48}
                  placeholder="FOREVER YOUNG"
                  className="h-12 w-full rounded-md border border-white/10 bg-white/[0.08] px-4 text-left text-sm font-semibold text-white outline-none transition placeholder:text-zinc-500 focus:border-[#fff33b]"
                />
                <p className="mt-2 text-xs leading-5 text-zinc-400">
                  אם השדה ריק, הפרומפט לא יוסיף טקסט קריא בכלל, כדי לשמור את הפוקוס על הפורטרט.
                </p>
              </section>

              <section className="street-panel border border-white/10 bg-black/55 p-4 shadow-xl shadow-black/20 backdrop-blur">
                <div className="mb-4 flex items-center gap-2">
                  <Palette className="h-5 w-5 text-fuchsia-300" />
                  <h2 className="font-semibold text-white">צבעים</h2>
                  <span className="text-xs text-zinc-400">עד 3</span>
                </div>
                <div className="grid grid-cols-8 gap-2">
                  {colorPalette.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => toggleColor(color)}
                      className={classNames(
                        "relative aspect-square rounded-md border transition hover:scale-105",
                        selectedColors.includes(color)
                          ? "border-white shadow-[0_0_0_2px_rgba(255,255,255,.18)]"
                          : "border-white/10",
                      )}
                      style={{ backgroundColor: color }}
                      aria-label={`בחר צבע ${color}`}
                      title={color}
                    >
                      {selectedColors.includes(color) ? (
                        <span className="absolute inset-0 flex items-center justify-center rounded-md bg-black/20 text-white">
                          <Check className="h-4 w-4" />
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </section>

              <section className="street-panel border border-white/10 bg-black/55 p-4 shadow-xl shadow-black/20 backdrop-blur">
                <div className="mb-4 flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-amber-200" />
                  <h2 className="font-semibold text-white">סגנון</h2>
                </div>
                <div className="grid gap-2">
                  {styles.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setSelectedStyle(style.id)}
                      className={classNames(
                        "rounded-md border px-3 py-3 text-right transition",
                        selectedStyle === style.id
                          ? "border-cyan-300 bg-cyan-300/15 text-white"
                          : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-white/30",
                      )}
                    >
                      <span className="block text-sm font-semibold">{style.label}</span>
                      <span className="mt-1 block text-xs text-zinc-400">{style.description}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="street-panel border border-white/10 bg-black/55 p-4 shadow-xl shadow-black/20 backdrop-blur">
                <div className="mb-4 flex items-center gap-2">
                  <BrickWall className="h-5 w-5 text-lime-200" />
                  <h2 className="font-semibold text-white">קיר ותוספות</h2>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {walls.map((wall) => (
                    <button
                      key={wall.id}
                      type="button"
                      onClick={() => setSelectedWall(wall.id)}
                      className={classNames(
                        "h-11 rounded-md border text-sm transition",
                        selectedWall === wall.id
                          ? "border-lime-300 bg-lime-300/15 text-white"
                          : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-white/30",
                      )}
                    >
                      {wall.label}
                    </button>
                  ))}
                </div>
                <div className="mt-4 grid gap-2">
                  {addons.map((addon) => (
                    <label
                      key={addon.id}
                      className="flex cursor-pointer items-center justify-between rounded-md border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-zinc-300 transition hover:border-white/25"
                    >
                      <span>{addon.label}</span>
                      <input
                        type="checkbox"
                        checked={selectedAddons.includes(addon.id)}
                        onChange={() => toggleAddon(addon.id)}
                        className="h-4 w-4 accent-cyan-300"
                      />
                    </label>
                  ))}
                </div>
              </section>

              <button
                type="button"
                onClick={handleGenerateImage}
                disabled={isGeneratingImage}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#fff33b] px-4 text-sm font-black text-black transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGeneratingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate
              </button>
            </aside>

            <section className="space-y-4">
              <div className="street-panel border border-white/10 bg-black/58 p-3 shadow-2xl shadow-black/30 backdrop-blur">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
                  <div>
                    <p className="text-xs font-bold uppercase text-cyan-200">{getStyle(selectedStyle).label}</p>
                    <h2 className="text-xl font-semibold text-white">קיר תוצאה</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {latestArtwork ? (
                      <button
                        type="button"
                        onClick={() => downloadAsset(latestArtwork.imageUrl, "florentin-wall.svg")}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/[0.08] px-3 text-sm text-zinc-100 transition hover:border-cyan-300"
                      >
                        <Download className="h-4 w-4" />
                        תמונה
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={handleGenerateVideo}
                      disabled={isGeneratingVideo || !latestArtwork}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/[0.08] px-3 text-sm text-zinc-100 transition hover:border-fuchsia-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isGeneratingVideo ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : user.premium ? (
                        <Video className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                      Generate Video
                    </button>
                  </div>
                </div>

                <div className="florentin-result-stage relative min-h-[420px] overflow-hidden rounded-md border border-white/10 bg-[#171717]">
                  {latestArtwork ? (
                    <img
                      src={latestArtwork.imageUrl}
                      alt="קיר גרפיטי שנוצר"
                      className="h-full min-h-[420px] w-full object-cover"
                    />
                  ) : (
                    <div className="relative flex min-h-[420px] items-center justify-center">
                      <img
                        src={referenceImages[0].src}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover opacity-58"
                        aria-hidden="true"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.82),rgba(0,0,0,.42)),linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.78))]" />
                      <div className="relative z-10 mx-auto w-full max-w-md px-6 text-center">
                        {sourceImage ? (
                          <img
                            src={sourceImage}
                            alt="תמונה ממתינה"
                            className="mx-auto mb-5 max-h-52 rounded-md object-contain opacity-80"
                          />
                        ) : (
                          <div className="mx-auto mb-5 flex h-24 w-24 rotate-[-3deg] items-center justify-center rounded-md border border-[#fff33b]/45 bg-black/45 shadow-[8px_8px_0_rgba(0,229,255,.3)]">
                            <SprayCan className="h-9 w-9 text-[#fff33b]" />
                          </div>
                        )}
                        <p className="text-3xl font-black leading-tight text-white">
                          הקיר שלך עוד רגע מקבל חיים.
                        </p>
                        <p className="mt-3 text-sm font-semibold leading-6 text-zinc-200">
                          העלה תמונה, בחר צבעים, ותראה אותה הופכת לקיר רחוב בסגנון התמונות שלמעלה.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            if (sourceImage) {
                              void handleGenerateImage();
                              return;
                            }
                            fileInputRef.current?.click();
                          }}
                          disabled={isGeneratingImage}
                          className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#fff33b] px-5 text-sm font-black text-black transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {sourceImage ? <Sparkles className="h-4 w-4" /> : <ImagePlus className="h-4 w-4" />}
                          {sourceImage ? "ליצור מהתמונה הזו" : "להעלות תמונה"}
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,transparent,rgba(0,0,0,.48))]" />
                </div>
              </div>

              {videoAsset ? (
                <div className="rounded-lg border border-white/10 bg-black/50 p-3 shadow-2xl shadow-black/30 backdrop-blur">
                  <div className="mb-3 flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <Play className="h-5 w-5 text-lime-300" />
                      <h2 className="font-semibold text-white">וידאו</h2>
                      <span className="text-xs text-zinc-400">{videoAsset.provider}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadAsset(videoAsset.url, "florentin-process.webm")}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/[0.08] px-3 text-sm text-zinc-100 transition hover:border-lime-300"
                    >
                      <Download className="h-4 w-4" />
                      וידאו
                    </button>
                  </div>
                  <video src={videoAsset.url} controls className="aspect-video w-full rounded-md border border-white/10 bg-black" />
                </div>
              ) : null}

              {gallery.length > 0 ? (
                <div className="rounded-lg border border-white/10 bg-black/50 p-3 shadow-2xl shadow-black/30 backdrop-blur">
                  <div className="mb-3 flex items-center gap-2 px-1">
                    <ImagePlus className="h-5 w-5 text-cyan-300" />
                    <h2 className="font-semibold text-white">גלריה</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {gallery.map((artwork) => (
                      <button
                        key={artwork.id}
                        type="button"
                        onClick={() => setLatestArtwork(artwork)}
                        className={classNames(
                          "overflow-hidden rounded-md border bg-black/30 transition",
                          latestArtwork?.id === artwork.id ? "border-cyan-300" : "border-white/10 hover:border-white/30",
                        )}
                      >
                        <img src={artwork.imageUrl} alt="עבודת גרפיטי" className="aspect-[4/3] w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </section>

      <MarketingSections />

      {paywallOpen ? (
        <PaywallModal
          isCheckingOut={isCheckingOut}
          onClose={() => setPaywallOpen(false)}
          onCheckout={handleCheckout}
        />
      ) : null}
      {toast ? <Toast message={toast} /> : null}
    </main>
  );
}

function SiteHeader({
  user,
  onLogout,
  onOpenPaywall,
}: {
  user: AppUser | null;
  onLogout: () => void;
  onOpenPaywall: () => void;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-black/58 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <a href="#studio" className="flex min-w-0 items-center gap-3">
          <img
            src={LOGO_SRC}
            alt="Florentin logo"
            className="h-14 w-14 shrink-0 object-contain drop-shadow-[0_0_18px_rgba(255,243,59,.30)]"
          />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase text-cyan-200">AI Graffiti</p>
            <span className="block truncate text-xl font-black text-white">{BRAND_NAME}</span>
          </div>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="hidden items-center gap-2 rounded-md border border-white/10 bg-white/[0.08] px-3 py-2 text-sm text-zinc-100 sm:flex">
                <CreditCard className="h-4 w-4 text-[#fff33b]" />
                <span>{user.credits} קרדיטים</span>
              </div>
              <button
                type="button"
                onClick={onOpenPaywall}
                className="hidden h-10 items-center justify-center gap-2 rounded-md bg-[#fff33b] px-3 text-sm font-black text-black transition hover:bg-cyan-200 sm:inline-flex"
              >
                <BadgeDollarSign className="h-4 w-4" />
                קרדיטים
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.08] text-zinc-200 transition hover:text-white"
                aria-label="התנתקות"
                title="התנתקות"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <a
                href="#login"
                className="hidden h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.08] px-3 text-sm text-white transition hover:border-cyan-300 sm:inline-flex"
              >
                <KeyRound className="h-4 w-4" />
                כניסה
              </a>
              <a
                href={GOOGLE_AUTH_START_HREF}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#fff33b] px-3 text-sm font-black text-black transition hover:bg-cyan-200"
              >
                <Rocket className="h-4 w-4" />
                הרשמה עם Google
              </a>
            </>
          )}
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-white/10 px-4 py-2 md:hidden">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-md bg-white/[0.08] px-3 py-2 text-xs font-semibold text-zinc-100"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

function HeroLogin({
  email,
  isLoggingIn,
  onEmailChange,
  onLogin,
}: {
  email: string;
  isLoggingIn: boolean;
  onEmailChange: (value: string) => void;
  onLogin: (event?: FormEvent<HTMLFormElement>) => Promise<void>;
}) {
  const heroTiles = [referenceImages[3], referenceImages[5], referenceImages[9]];

  return (
    <section id="studio" className="florentin-hero florentin-photo-hero relative isolate min-h-[92svh] overflow-hidden pt-28">
      <img
        src={referenceImages[0].src}
        alt=""
        className="absolute inset-0 z-0 h-full w-full object-cover opacity-78"
        aria-hidden="true"
      />
      <div className="absolute inset-0 z-0 bg-[linear-gradient(90deg,rgba(0,0,0,.88),rgba(0,0,0,.46)_48%,rgba(0,0,0,.24)),linear-gradient(180deg,rgba(0,0,0,.18),rgba(0,0,0,.84))]" />
      <div className="spray-scratches absolute inset-0 z-0" />
      <img
        src={LOGO_SRC}
        alt="Florentin logo"
        className="pointer-events-none absolute left-[18%] top-[42%] z-0 w-[min(58vw,620px)] -translate-x-1/2 -translate-y-1/2 opacity-50 mix-blend-screen"
      />
      <div className="relative z-10 mx-auto grid min-h-[calc(92svh-7rem)] w-full max-w-7xl items-center gap-10 px-4 pb-20 sm:px-6 lg:grid-cols-[1fr_0.76fr]">
        <div className="max-w-4xl">
          <p className="inline-flex rotate-[-1deg] rounded-md border border-[#fff33b]/45 bg-black/45 px-3 py-2 text-xs font-black uppercase text-[#fff33b] shadow-[6px_6px_0_rgba(0,229,255,.34)] backdrop-blur">
            AI Graffiti Video Studio
          </p>
          <h1 className="florentin-tag mt-6 text-6xl font-black leading-none text-white sm:text-8xl lg:text-[10rem]">
            Florentin
          </h1>
          <p className="mt-5 max-w-2xl bg-black/38 p-4 text-lg font-semibold leading-8 text-zinc-50 backdrop-blur-sm sm:text-2xl">
            מעלים תמונה, בוחרים צבעים, והסטודיו הופך אותה לקיר גרפיטי פלורנטיני שמרגיש כמו סמטה אמיתית: בטון, ספריי, נזילות, פוסטרים ואנרגיה צבעונית.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#login"
              className="street-cta inline-flex h-14 items-center justify-center gap-2 rounded-md bg-[#fff33b] px-6 text-sm font-black text-black transition hover:bg-cyan-200"
            >
              <ImagePlus className="h-5 w-5" />
              להעלות תמונה ראשונה
            </a>
            <a
              href="#examples"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-md border border-white/25 bg-black/42 px-5 text-sm font-bold text-white backdrop-blur transition hover:border-fuchsia-300"
            >
              <Sparkles className="h-4 w-4 text-fuchsia-200" />
              לראות קירות לדוגמה
            </a>
          </div>

          <form
            id="login"
            onSubmit={onLogin}
            className="mt-10 flex w-full max-w-3xl rotate-[-0.5deg] flex-col gap-3 border border-white/18 bg-black/62 p-3 shadow-2xl shadow-black/50 backdrop-blur md:flex-row md:items-end"
          >
            <div className="flex-1">
              <label className="mb-2 block text-sm font-black text-white" htmlFor="email">
                הרשמה והתחברות לסטודיו
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-200" />
                <input
                  id="email"
                  dir="ltr"
                  type="email"
                  value={email}
                  onChange={(event) => onEmailChange(event.target.value)}
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-md border border-white/15 bg-white/[0.1] px-4 pr-10 text-left text-sm text-white outline-none transition placeholder:text-zinc-400 focus:border-[#fff33b]"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="inline-flex h-12 min-w-36 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-black text-black transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              אימייל
            </button>
            <a
              href={GOOGLE_AUTH_START_HREF}
              className="inline-flex h-12 min-w-48 items-center justify-center gap-2 rounded-md border border-[#fff33b]/45 bg-[#fff33b] px-4 text-sm font-black text-black transition hover:bg-cyan-200"
            >
              <UserRound className="h-4 w-4" />
              התחברות עם Google
            </a>
          </form>
        </div>

        <div className="hidden min-h-[560px] lg:block">
          <div className="relative h-full">
            {heroTiles.map((item, index) => (
              <figure
                key={item.src}
                className={classNames(
                  "reference-rip absolute overflow-hidden border border-white/20 bg-black shadow-2xl shadow-black/50",
                  index === 0 && "left-0 top-8 h-72 w-72 rotate-3",
                  index === 1 && "right-4 top-32 h-80 w-64 -rotate-6",
                  index === 2 && "bottom-10 left-16 h-72 w-80 rotate-2",
                )}
              >
                <img src={item.src} alt={item.title} className="h-full w-full object-cover" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-black/68 px-3 py-2 text-xs font-black text-white backdrop-blur">
                  {item.title}
                </figcaption>
              </figure>
            ))}
            <div className="absolute bottom-0 right-10 w-64 rotate-[-2deg] border border-[#fff33b]/40 bg-[#fff33b] p-4 text-black shadow-[10px_10px_0_rgba(0,229,255,.45)]">
              <p className="text-xs font-black uppercase">Upload to wall</p>
              <p className="mt-2 text-2xl font-black leading-tight">התמונה שלך יכולה להפוך לקיר שאנשים מצלמים.</p>
            </div>
          </div>
        </div>
      </div>
      <a
        href="#examples"
        className="absolute bottom-4 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-2 rounded-md border border-white/20 bg-black/45 px-3 py-2 text-xs font-bold text-white backdrop-blur transition hover:border-cyan-300"
      >
        <ArrowDown className="h-4 w-4" />
        לרדת לקירות ההשראה
      </a>
    </section>
  );
}

function MarketingSections() {
  const featuredExamples = [referenceImages[0], referenceImages[3], referenceImages[5]];
  const galleryExamples = referenceImages.slice(0, 11);

  return (
    <>
      <section id="examples" className="reference-wall-section border-b border-white/10 bg-[#090909] py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <p className="inline-flex rotate-[-1deg] rounded-md bg-[#fff33b] px-3 py-2 text-xs font-black uppercase text-black">
                Visual direction
              </p>
              <h2 className="mt-4 text-4xl font-black leading-tight text-white sm:text-6xl">
                ככה Florentin צריך להרגיש: קיר אמיתי, לא טופס אפור.
              </h2>
              <p className="mt-4 max-w-xl text-lg leading-8 text-zinc-200">
                התמונות המצורפות הפכו לשפת העיצוב: בטון מחוספס, עברית של רחוב, כחול-צהוב-טורקיז, פוסטרים קרועים, צינורות, לכלוך ונזילות צבע. זה גם הכיוון שאליו התוצר הסופי צריך להגיע.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-sm font-black">
                {["פורטרט", "קיר מתקלף", "סמל", "טיפוגרפיה", "וידאו תהליך"].map((tag) => (
                  <span key={tag} className="rounded-md border border-white/15 bg-black/45 px-3 py-2 text-white">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {featuredExamples.map((item, index) => (
                <figure
                  key={item.src}
                  className={classNames(
                    "reference-rip relative min-h-72 overflow-hidden border border-white/15 bg-black shadow-2xl shadow-black/40",
                    index === 0 && "rotate-[-1.5deg]",
                    index === 1 && "translate-y-8 rotate-[1deg]",
                    index === 2 && "rotate-[-2deg]",
                  )}
                >
                  <img src={item.src} alt={item.title} className="h-full min-h-72 w-full object-cover" />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-black/72 px-3 py-3 backdrop-blur">
                    <p className="text-sm font-black text-white">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-zinc-200">{item.caption}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {galleryExamples.map((item, index) => (
              <figure
                key={item.src}
                className={classNames(
                  "group relative aspect-[4/3] overflow-hidden border border-white/10 bg-black shadow-xl shadow-black/25",
                  index % 2 === 0 ? "rotate-[0.7deg]" : "rotate-[-0.7deg]",
                )}
              >
                <img
                  src={item.src}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,.72))]" />
                <figcaption className="absolute inset-x-0 bottom-0 px-3 py-3 text-sm font-black text-white">
                  {item.title}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="what" className="border-b border-white/10 bg-[#101010] py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="mb-8 max-w-3xl">
            <p className="text-xs font-bold uppercase text-fuchsia-300">What it does</p>
            <h2 className="mt-2 text-3xl font-black text-white sm:text-5xl">מה האפליקציה עושה?</h2>
            <p className="mt-4 text-lg leading-8 text-zinc-300">
              Florentin מחברת בין תמונות אישיות, צבעי ספריי, קירות רחוב וסרטון תהליך קצר. היא בנויה כדי להרגיש כמו סטודיו גרפיטי חי, לא כמו טופס אפור.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featureItems.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
                  <Icon className="h-7 w-7 text-[#fff33b]" />
                  <h3 className="mt-4 text-lg font-black text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="flow" className="florentin-flow-bg border-b border-white/10 py-16">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase text-cyan-200">Flow</p>
            <h2 className="mt-2 text-3xl font-black text-white sm:text-5xl">מסלול יצירה קצר וברור</h2>
            <p className="mt-4 text-lg leading-8 text-zinc-200">
              מהכניסה הראשונה ועד וידאו להורדה, כל שלב בנוי סביב קרדיטים, נעילת פרימיום וחיבור Lemon Squeezy.
            </p>
          </div>
          <div className="grid gap-3">
            {flowItems.map((item, index) => (
              <div
                key={item}
                className="flex items-center gap-4 rounded-lg border border-white/10 bg-black/35 p-4 backdrop-blur"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#fff33b] text-lg font-black text-black">
                  {index + 1}
                </span>
                <p className="text-base font-semibold text-white">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-b border-white/10 bg-[#0a0a0b] py-16">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="text-xs font-bold uppercase text-lime-200">Credits</p>
            <h2 className="mt-2 text-3xl font-black text-white sm:text-5xl">מודל קרדיטים פשוט</h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-300">
              3 יצירות תמונה בחינם, ואז חבילה של 15 קרדיטים ב-$5. תמונה צורכת קרדיט אחד, וידאו צורך 5 קרדיטים, כך שאפשר ליצור 15 תמונות או 10 תמונות וסרטון.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-end justify-between">
              <span className="text-5xl font-black text-white">{CREDIT_PACK_PRICE}</span>
              <span className="text-sm font-semibold text-zinc-300">{CREDIT_PACK_SIZE} קרדיטים</span>
            </div>
            <div className="mt-5 grid gap-3 text-sm text-zinc-200">
              <p className="flex items-center gap-2">
                <Check className="h-4 w-4 text-lime-300" />
                תמונות גרפיטי נוספות
              </p>
              <p className="flex items-center gap-2">
                <Check className="h-4 w-4 text-lime-300" />
                וידאו פרימיום
              </p>
              <p className="flex items-center gap-2">
                <Check className="h-4 w-4 text-lime-300" />
                הורדה למכשיר
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-[#101010] py-16">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase text-[#fff33b]">FAQ</p>
            <h2 className="mt-2 text-3xl font-black text-white sm:text-5xl">שאלות נפוצות</h2>
          </div>
          <div className="grid gap-3">
            {faqItems.map((item) => (
              <details key={item.question} className="group rounded-lg border border-white/10 bg-white/[0.04] p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-black text-white">
                  {item.question}
                  <CircleHelp className="h-5 w-5 shrink-0 text-cyan-200 transition group-open:rotate-45" />
                </summary>
                <p className="mt-3 text-sm leading-7 text-zinc-300">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function MetricBadge({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof CreditCard;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/35 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-zinc-400">
        <Icon className="h-4 w-4 text-[#fff33b]" />
        {label}
      </div>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}

function PaywallModal({
  isCheckingOut,
  onClose,
  onCheckout,
}: {
  isCheckingOut: boolean;
  onClose: () => void;
  onCheckout: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-[#121215] p-5 shadow-2xl shadow-black/50">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-fuchsia-300">Premium</p>
            <h2 className="mt-1 text-2xl font-black text-white">פתיחת יצירה מלאה</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:text-white"
            aria-label="סגירה"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="rounded-md border border-white/10 bg-black/25 p-4">
          <div className="flex items-end justify-between">
            <span className="text-4xl font-black text-white">{CREDIT_PACK_PRICE}</span>
            <span className="text-sm text-zinc-300">{CREDIT_PACK_SIZE} קרדיטים</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-300">
            החבילה מוסיפה 15 קרדיטים: 15 תמונות או 10 תמונות וסרטון. התשלום מתבצע דרך Lemon Squeezy בלבד.
          </p>
        </div>
        <button
          type="button"
          onClick={onCheckout}
          disabled={isCheckingOut}
          className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#fff33b] px-4 text-sm font-black text-black transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCheckingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
          תשלום עם Lemon Squeezy
        </button>
      </div>
    </div>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-md border border-white/10 bg-[#16161a] px-4 py-3 text-sm text-zinc-100 shadow-xl shadow-black/40">
      {message}
    </div>
  );
}
