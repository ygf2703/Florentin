import type { Addon, StreetStyle, WallType } from "@/lib/types";

export const CREDIT_PACK_SIZE = 15;
export const CREDIT_PACK_PRICE = "$5";
export const IMAGE_CREDIT_COST = 1;
export const VIDEO_CREDIT_COST = 5;
export const FREE_CREDITS = 3;

export const colorPalette = [
  "#ff1744",
  "#ff5d00",
  "#ffea00",
  "#76ff03",
  "#00e676",
  "#00e5ff",
  "#2979ff",
  "#651fff",
  "#d500f9",
  "#f50057",
  "#ffffff",
  "#cfd8dc",
  "#90a4ae",
  "#263238",
  "#111111",
  "#ff8a80",
  "#ffd180",
  "#ffff8d",
  "#ccff90",
  "#a7ffeb",
  "#80d8ff",
  "#82b1ff",
  "#b388ff",
  "#f8bbd0",
  "#ff6d00",
  "#00bfa5",
  "#304ffe",
  "#aa00ff",
  "#c51162",
  "#64dd17",
  "#00b0ff",
  "#ffd600",
];

export const styles: Array<{
  id: StreetStyle;
  label: string;
  description: string;
  prompt: string;
}> = [
  {
    id: "wildstyle",
    label: "Wildstyle",
    description: "קווים זוויתיים, שכבות ואנרגיה צפופה",
    prompt: "complex angular wildstyle graffiti with interlocking shards",
  },
  {
    id: "stencil",
    label: "Stencil Art",
    description: "קונטרסט חד, חיתוכי שבלונה ומרקם ספריי",
    prompt: "high contrast stencil street art with crisp spray edges",
  },
  {
    id: "throw-up",
    label: "Throw-up",
    description: "אותיות בועה, קו מהיר ומילוי עבה",
    prompt: "fast throw-up bubble letter graffiti with thick outlines",
  },
  {
    id: "wheatpaste",
    label: "Wheatpaste",
    description: "פוסטרים קרועים, נייר, דבק ושחיקה",
    prompt: "weathered wheatpaste poster mural with torn paper edges",
  },
  {
    id: "photorealistic",
    label: "Photorealistic Mural",
    description: "ציור קיר סינמטי וריאליסטי בקנה מידה גדול",
    prompt: "large scale photorealistic cinematic mural",
  },
  {
    id: "geometric",
    label: "Abstract Geometric",
    description: "צורות חדות, עומק ואשליה תלת ממדית",
    prompt: "abstract geometric street mural with sharp 3D optical illusion",
  },
];

export const walls: Array<{
  id: WallType;
  label: string;
  prompt: string;
}> = [
  { id: "smooth", label: "בטון חלק", prompt: "clean smooth concrete wall" },
  { id: "brick", label: "קיר לבנים", prompt: "classic brick wall" },
  {
    id: "peeling",
    label: "טיח מתקלף",
    prompt: "peeling plaster wall with exposed layers",
  },
  {
    id: "dirty",
    label: "קיר מלוכלך",
    prompt: "aged dirty wall with soot, stains and time marks",
  },
];

export const addons: Array<{
  id: Addon;
  label: string;
  prompt: string;
}> = [
  { id: "drainpipe", label: "צינור מרזב", prompt: "a metal drainpipe" },
  { id: "moss", label: "טחב ואזוב", prompt: "moss growing in cracks" },
  { id: "cat", label: "חתול רחוב", prompt: "a street cat sitting at the side" },
  {
    id: "dust",
    label: "אבק וחול",
    prompt: "dust and sand collected at the bottom of the wall",
  },
];

export function getStyle(id: StreetStyle) {
  return styles.find((style) => style.id === id) ?? styles[0];
}

export function getWall(id: WallType) {
  return walls.find((wall) => wall.id === id) ?? walls[0];
}

export function getAddon(id: Addon) {
  return addons.find((addon) => addon.id === id) ?? addons[0];
}
