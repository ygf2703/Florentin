import { colorPalette, getAddon, getStyle, getWall } from "@/lib/catalog";
import type { GenerationOptions } from "@/lib/types";

function cleanWallText(value?: string) {
  return (value ?? "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 48);
}

function getDominantColors(colors: string[]) {
  const defaults = ["#2979ff", "#ffd600", "#00e5ff"];
  const selected = colors.filter((color) => colorPalette.includes(color)).slice(0, 3);

  for (const color of defaults) {
    if (selected.length >= 3) {
      break;
    }
    if (!selected.includes(color)) {
      selected.push(color);
    }
  }

  return selected.slice(0, 3);
}

export function buildImagePrompt(options: GenerationOptions) {
  const style = getStyle(options.style);
  const wall = getWall(options.wall);
  const addonText =
    options.addons.length > 0
      ? options.addons.map((addon) => getAddon(addon).prompt).join(", ")
      : "no extra environmental props";
  const dominantColors = getDominantColors(options.colors);
  const palette = colorPalette.join(", ");
  const wallText = cleanWallText(options.wallText);
  const textInstruction = wallText
    ? `Integrate the exact English text "${wallText}" naturally into the wall as secondary graffiti lettering only: authentic spray-paint style, bold outline letters, paint drips, partially absorbed into the concrete. The text must be secondary to the portrait and must not look like clean typography, a poster headline, or a digital title.`
    : "Do not add any readable text, names, numbers, slogans, logos, captions, or typography. Use only abstract graffiti marks, tags, shapes, arrows, splashes, and layered street-art texture around the portrait.";

  return [
    "Create a square 1:1 image of the person from the uploaded reference photo transformed into a large professional graffiti portrait mural painted directly on a rough concrete wall in Tel Aviv / Florentin style.",
    "MAIN GOAL: create a large, professional spray-paint graffiti portrait of the person from the uploaded image, painted directly on an actual rough urban concrete wall. It must look like a real graffiti mural on concrete, not a digital poster, not a logo, not a pasted photo, not a sticker, and not an illustration on a white background.",
    "IDENTITY PRESERVATION - CRITICAL: preserve the identity of the person from the reference image with very high accuracy. Keep the facial structure accurate. Maintain recognizable eyes, nose, mouth, jawline, hairstyle, and expression. Do not distort facial proportions. Do not change age, gender presentation, facial expression, or key facial features. The graffiti portrait must clearly resemble the original person.",
    `STYLE: ${style.prompt}; large spray-paint portrait mural, professional street artist graffiti portrait, layered stencil and freehand spray-paint techniques, bold graffiti outlines, visible aerosol texture, overspray, stencil layers, paint drips, rough wall absorption, rough brush and aerosol marks, expressive urban mural style, colorful street-art background, authentic wall texture visible through the paint. The face should be fully stylized as graffiti, not photographic, but still highly recognizable.`,
    `SCENE: ${wall.prompt}; large rough urban concrete wall, Tel Aviv / Florentin street-art environment, cracks, stains, old paint layers, worn textures, layered old graffiti underneath, abstract shapes, spray paint splashes, drips, realistic wall lighting, gritty urban texture, and selected environment details: ${addonText}. The portrait must appear physically painted onto the wall surface, following cracks, roughness, stains, and concrete texture.`,
    "COMPOSITION: square 1:1 image ratio, large central head-and-shoulders graffiti portrait filling most of the wall, dynamic graffiti elements around the person, spray bursts, abstract shapes, paint drips, and urban tags. The mural should feel iconic, bold, colorful, gritty, professional, and respectful.",
    `COLOR RULES: use only this provided 32-color palette: ${palette}. Choose these 3 dominant colors for the main portrait and background balance: ${dominantColors.join(", ")}. Additional palette colors may be used only as tiny accents, splashes, drips, or secondary graffiti details. Do not introduce colors outside the provided palette. Avoid muddy color mixing. Maintain strong contrast between the face, outlines, and wall.`,
    `TEXT RULES: ${textInstruction}`,
    "RESPECTFUL REPRESENTATION: if the person is commemorated, deceased, or represented in a memorial context, keep the tone dignified and respectful. Avoid caricature, comic exaggeration, aggressive distortion, mocking styling, or disrespectful treatment.",
    "NEGATIVE INSTRUCTIONS: avoid a photo pasted on a wall, avoid a clean digital poster, avoid a clean vector logo, avoid a white background, avoid a studio background, avoid a floating portrait, avoid sticker effect, avoid cartoon caricature, avoid distorted face, avoid melted facial features, avoid wrong facial proportions, avoid a random new person, avoid fantasy character, avoid generic graffiti without a recognizable portrait, avoid excessive text, avoid unreadable face, avoid plastic 3D render, avoid glossy digital illustration, avoid clean gallery artwork.",
  ].join(" ");
}

export function buildGeminiVideoPrompt(options: GenerationOptions) {
  const wall = getWall(options.wall);
  const addonText =
    options.addons.length > 0
      ? options.addons.map((addon) => getAddon(addon).prompt).join(", ")
      : "no additional environment elements";
  const colors = getDominantColors(options.colors).join(", ");
  const wallText = cleanWallText(options.wallText);
  const textInstruction = wallText
    ? `If visible, include the English wall text "${wallText}" only as secondary spray-painted graffiti lettering.`
    : "Do not add readable text, logos, captions, or poster titles.";

  return `Create a short cinematic video showing the creation of this exact professional graffiti portrait mural on a ${wall.prompt}. The artwork must look physically spray-painted onto a gritty Florentin Tel Aviv concrete wall, not pasted, not digital, and not a poster. Preserve the portrait identity from the final artwork. Show a street artist from behind wearing a loose hoodie and baggy clothes, actively spraying layered stencil and freehand details. The scene should include cracked plaster, stains, old paint layers, abstract tags, peeling posters, concrete texture, selected environment elements: ${addonText}, aerosol mist, overspray, paint drips, wet paint runs, realistic arm motion, colorful street lighting, and shadows on the wall. Use only the selected dominant colors ${colors} plus tiny accents from the original allowed palette. ${textInstruction}`;
}
