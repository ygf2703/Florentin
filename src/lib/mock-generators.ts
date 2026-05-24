import { buildImagePrompt } from "@/lib/prompts";
import type { GenerationOptions } from "@/lib/types";

function escapeAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function hashText(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seeded(seed: number) {
  let value = seed || 1;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function textureDots(seed: number, colors: string[]) {
  const random = seeded(seed);
  return Array.from({ length: 130 }, (_, index) => {
    const x = Math.round(random() * 1280);
    const y = Math.round(random() * 1160);
    const r = (random() * 2.2 + 0.4).toFixed(1);
    const opacity = (random() * 0.22 + 0.06).toFixed(2);
    const color = index % 5 === 0 ? colors[index % colors.length] : "#f7f7f7";
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${opacity}" />`;
  }).join("");
}

function wallLayer(wall: GenerationOptions["wall"]) {
  if (wall === "brick") {
    return `<rect width="1280" height="860" fill="url(#brickPattern)" opacity="0.72" />`;
  }

  if (wall === "peeling") {
    return `
      <path d="M42 118 C168 74 225 138 342 96 C462 54 558 115 682 77 C834 31 964 105 1218 56 L1218 218 C1024 178 903 237 736 188 C577 142 496 219 339 176 C198 137 116 206 42 173 Z" fill="#2f2f32" opacity="0.64" />
      <path d="M128 612 C248 564 359 644 486 586 C626 522 738 631 861 565 C994 494 1094 612 1210 548 L1210 724 C1028 774 918 680 776 735 C612 814 528 690 376 740 C244 783 171 736 128 768 Z" fill="#e5e0d2" opacity="0.18" />
      <path d="M86 252 C218 294 278 218 405 263 C532 309 590 242 698 287 C812 334 926 253 1118 295" fill="none" stroke="#ece7dc" stroke-width="10" opacity="0.18" stroke-linecap="round" />
    `;
  }

  if (wall === "dirty") {
    return `
      <path d="M0 621 C156 574 268 655 423 611 C589 565 682 658 834 604 C976 553 1109 626 1280 578 L1280 860 L0 860 Z" fill="#090909" opacity="0.38" />
      <path d="M88 0 C61 145 138 234 108 372 C79 507 132 621 86 860" fill="none" stroke="#000" stroke-width="26" opacity="0.16" />
      <path d="M1088 0 C1049 126 1118 230 1083 344 C1032 508 1113 657 1078 860" fill="none" stroke="#000" stroke-width="34" opacity="0.14" />
    `;
  }

  return `<rect x="0" y="0" width="1280" height="860" fill="url(#concreteWash)" opacity="0.7" />`;
}

function addonLayer(options: GenerationOptions) {
  const addons = new Set(options.addons);
  const pieces: string[] = [];

  if (addons.has("drainpipe")) {
    pieces.push(`
      <g opacity="0.86">
        <rect x="1077" y="0" width="34" height="860" rx="12" fill="#232428" />
        <rect x="1084" y="0" width="9" height="860" fill="#6d7377" opacity="0.34" />
        <path d="M1094 448 C1049 462 1028 490 1029 534" fill="none" stroke="#232428" stroke-width="24" stroke-linecap="round" />
        <circle cx="1094" cy="214" r="30" fill="none" stroke="#121316" stroke-width="6" opacity="0.5" />
      </g>
    `);
  }

  if (addons.has("moss")) {
    pieces.push(`
      <g fill="#496a3b" opacity="0.72">
        <path d="M83 512 C130 486 168 534 215 501 C252 476 277 492 318 468 C276 536 192 556 83 512 Z" />
        <path d="M748 208 C801 184 853 234 911 199 C945 179 982 183 1015 168 C972 230 850 262 748 208 Z" />
        <path d="M1102 690 C1152 670 1191 718 1240 690 L1244 744 C1192 774 1136 742 1102 690 Z" />
      </g>
    `);
  }

  if (addons.has("cat")) {
    pieces.push(`
      <g transform="translate(112,674)" opacity="0.9">
        <ellipse cx="62" cy="73" rx="48" ry="34" fill="#161719" />
        <circle cx="92" cy="38" r="26" fill="#18191c" />
        <path d="M76 22 L85 0 L96 25 Z" fill="#18191c" />
        <path d="M101 24 L119 5 L113 32 Z" fill="#18191c" />
        <path d="M21 69 C-7 52 -2 17 26 26" fill="none" stroke="#18191c" stroke-width="13" stroke-linecap="round" />
        <circle cx="84" cy="35" r="3" fill="#b7ff3c" />
        <circle cx="100" cy="35" r="3" fill="#b7ff3c" />
      </g>
    `);
  }

  if (addons.has("dust")) {
    pieces.push(`
      <g opacity="0.7">
        <path d="M0 783 C150 760 262 794 421 775 C612 752 738 796 919 771 C1048 753 1163 774 1280 754 L1280 860 L0 860 Z" fill="#b7aa8c" opacity="0.24" />
        <circle cx="317" cy="797" r="8" fill="#c8bfa2" opacity="0.28" />
        <circle cx="879" cy="820" r="5" fill="#c8bfa2" opacity="0.22" />
        <circle cx="1022" cy="791" r="11" fill="#c8bfa2" opacity="0.18" />
      </g>
    `);
  }

  return pieces.join("");
}

function florentinStreetLayer(seed: number, colors: string[], wallText?: string) {
  const random = seeded(seed + 914);
  const cleanText = escapeAttribute((wallText ?? "").replace(/[^\x20-\x7E]/g, "").trim().slice(0, 48));
  const markerTags = Array.from({ length: 12 }, (_, index) => {
    const x = Math.round(60 + random() * 1100);
    const y = Math.round(82 + random() * 690);
    const color = index % 3 === 0 ? colors[index % colors.length] : "#050506";
    const width = Math.round(5 + random() * 10);
    return `<path d="M${x} ${y} C${x + 28} ${y - 38} ${x + 64} ${y + 34} ${x + 108} ${y - 12} C${x + 68} ${y + 54} ${x + 140} ${y + 52} ${x + 176} ${y + 16}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" opacity="0.42" />`;
  }).join("");
  const textLayer = cleanText
    ? `
      <g transform="rotate(-3 640 804)" opacity="0.82">
        <text x="640" y="804" text-anchor="middle" fill="${colors[1] ?? colors[0]}" stroke="#050506" stroke-width="18" paint-order="stroke" font-size="86" font-family="Arial Black, Impact, sans-serif">${cleanText}</text>
        <text x="640" y="804" text-anchor="middle" fill="none" stroke="#f7f7f7" stroke-width="5" opacity="0.8" font-size="86" font-family="Arial Black, Impact, sans-serif">${cleanText}</text>
      </g>
    `
    : "";

  const posters = Array.from({ length: 7 }, (_, index) => {
    const x = Math.round(28 + random() * 1120);
    const y = Math.round(88 + random() * 560);
    const w = Math.round(44 + random() * 72);
    const h = Math.round(54 + random() * 96);
    const rotate = Math.round(random() * 10 - 5);
    return `
      <g transform="rotate(${rotate} ${x} ${y})" opacity="${index % 2 === 0 ? "0.5" : "0.34"}">
        <path d="M${x} ${y} L${x + w} ${y + 8} L${x + w - 12} ${y + h} L${x + 7} ${y + h - 9} Z" fill="#f2ead9" />
        <path d="M${x + 6} ${y + 18} H${x + w - 10}" stroke="#101010" stroke-width="6" opacity="0.58" />
        <path d="M${x + 8} ${y + 34} H${x + w - 18}" stroke="${colors[index % colors.length]}" stroke-width="8" opacity="0.78" />
      </g>
    `;
  }).join("");

  const drips = Array.from({ length: 20 }, (_, index) => {
    const x = Math.round(180 + random() * 900);
    const y = Math.round(210 + random() * 420);
    const length = Math.round(26 + random() * 112);
    const color = colors[index % colors.length];
    return `<path d="M${x} ${y} C${x + 3} ${y + length * 0.35} ${x - 4} ${y + length * 0.7} ${x} ${y + length}" fill="none" stroke="${color}" stroke-width="${index % 4 === 0 ? 9 : 5}" stroke-linecap="round" opacity="0.62" />`;
  }).join("");

  return `
    <g opacity="0.9">
      <path d="M0 74 C176 54 275 88 433 68 C623 43 772 84 955 61 C1075 46 1183 63 1280 48" fill="none" stroke="#050506" stroke-width="15" opacity="0.72" />
      <path d="M0 96 C166 78 310 106 468 84 C650 60 788 105 978 76 C1104 57 1190 82 1280 66" fill="none" stroke="#1d1f22" stroke-width="9" opacity="0.78" />
      ${posters}
      ${markerTags}
      ${textLayer}
      ${drips}
    </g>
  `;
}

function styleLayer(options: GenerationOptions, seed: number) {
  const [primary, secondary, tertiary] = options.colors;
  const random = seeded(seed);
  const strokes = Array.from({ length: 18 }, (_, index) => {
    const x = 274 + random() * 600;
    const y = 182 + random() * 360;
    const endX = x + random() * 240 - 80;
    const endY = y + random() * 150 - 40;
    const width = 10 + random() * 38;
    const color = [primary, secondary, tertiary][index % 3];
    return `<path d="M${x.toFixed(0)} ${y.toFixed(0)} C${(x + 80).toFixed(0)} ${(y - 90).toFixed(0)} ${(endX - 70).toFixed(0)} ${(endY + 92).toFixed(0)} ${endX.toFixed(0)} ${endY.toFixed(0)}" fill="none" stroke="${color}" stroke-width="${width.toFixed(0)}" stroke-linecap="round" opacity="${index % 4 === 0 ? "0.38" : "0.78"}" />`;
  }).join("");

  if (options.style === "stencil") {
    return `
      <rect x="263" y="162" width="714" height="465" rx="8" fill="#060606" opacity="0.44" />
      <path d="M320 555 L891 184" stroke="${primary}" stroke-width="34" opacity="0.88" />
      <path d="M348 214 L905 558" stroke="${secondary}" stroke-width="20" opacity="0.82" />
    `;
  }

  if (options.style === "throw-up") {
    return `
      <path d="M316 510 C356 340 496 308 570 426 C622 300 781 310 826 470 C906 372 1006 426 983 562 C941 700 800 673 750 570 C690 705 531 676 505 545 C420 664 288 626 316 510 Z" fill="${primary}" stroke="#0b0b0c" stroke-width="28" opacity="0.72" />
      <path d="M365 510 C420 402 494 408 548 492 C622 390 740 398 779 512 C844 438 921 464 920 552" fill="none" stroke="${secondary}" stroke-width="16" stroke-linecap="round" opacity="0.86" />
      <path d="M332 593 C470 640 573 594 678 620 C790 648 880 604 967 583" fill="none" stroke="#f7f7f7" stroke-width="8" stroke-linecap="round" opacity="0.45" />
    `;
  }

  if (options.style === "wheatpaste") {
    return `
      <g transform="rotate(-2 640 398)">
        <rect x="273" y="146" width="703" height="497" fill="#e8e0ce" opacity="0.22" />
        <path d="M273 146 L976 146 L947 642 L298 620 Z" fill="#f2ead9" opacity="0.18" />
        <path d="M312 178 C420 202 494 155 590 181 C720 217 809 158 930 196 L902 602 C771 572 690 633 572 596 C451 558 389 622 320 590 Z" fill="${primary}" opacity="0.22" />
      </g>
    `;
  }

  if (options.style === "photorealistic") {
    return `
      <ellipse cx="638" cy="392" rx="372" ry="224" fill="${primary}" opacity="0.22" />
      <ellipse cx="604" cy="340" rx="294" ry="172" fill="${secondary}" opacity="0.17" />
      <path d="M276 614 C412 454 473 274 632 178 C780 254 889 415 1010 617" fill="none" stroke="${tertiary}" stroke-width="18" opacity="0.72" />
    `;
  }

  if (options.style === "geometric") {
    return `
      <polygon points="290,591 500,165 742,587" fill="${primary}" opacity="0.62" />
      <polygon points="506,176 961,238 746,591" fill="${secondary}" opacity="0.55" />
      <polygon points="415,620 742,277 954,627" fill="${tertiary}" opacity="0.42" />
      <path d="M290 591 L500 165 L961 238 L954 627 L415 620 Z" fill="none" stroke="#ffffff" stroke-width="8" opacity="0.18" />
    `;
  }

  return strokes;
}

export function buildMockGraffitiImage(options: GenerationOptions) {
  const safeColors = options.colors.length > 0 ? options.colors.slice(0, 3) : [];
  for (const color of ["#2979ff", "#ffd600", "#00e5ff"]) {
    if (safeColors.length >= 3) {
      break;
    }
    if (!safeColors.includes(color)) {
      safeColors.push(color);
    }
  }
  const prompt = buildImagePrompt({ ...options, colors: safeColors });
  const seed = hashText(prompt + (options.sourceFileName ?? ""));
  const uploadedImage = options.sourceImage ? escapeAttribute(options.sourceImage) : "";
  const [primary, secondary, tertiary] = safeColors;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="1280" viewBox="0 0 1280 1280">
      <defs>
        <linearGradient id="baseWall" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#242428" />
          <stop offset="0.52" stop-color="#141417" />
          <stop offset="1" stop-color="#08080a" />
        </linearGradient>
        <radialGradient id="concreteWash" cx="46%" cy="38%" r="68%">
          <stop offset="0" stop-color="#4c4c50" />
          <stop offset="0.58" stop-color="#202025" />
          <stop offset="1" stop-color="#0b0b0d" />
        </radialGradient>
        <pattern id="brickPattern" width="128" height="66" patternUnits="userSpaceOnUse">
          <rect width="128" height="66" fill="#312b29" />
          <path d="M0 0 H128 M0 33 H128 M0 66 H128 M0 0 V33 M64 33 V66 M128 0 V33" stroke="#0a0909" stroke-width="5" opacity="0.48" />
          <path d="M7 7 H121 V27 H7 Z M7 40 H57 V60 H7 Z M71 40 H121 V60 H71 Z" fill="#5a3d37" opacity="0.28" />
        </pattern>
        <filter id="grit">
          <feTurbulence baseFrequency="0.85" numOctaves="2" seed="${seed % 97}" type="fractalNoise" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.28" />
          </feComponentTransfer>
          <feBlend mode="multiply" in2="SourceGraphic" />
        </filter>
        <filter id="paintedPortrait">
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="discrete" tableValues="0.08 0.2 0.44 0.9" />
            <feFuncG type="discrete" tableValues="0.08 0.2 0.44 0.9" />
            <feFuncB type="discrete" tableValues="0.08 0.2 0.44 0.9" />
          </feComponentTransfer>
          <feTurbulence baseFrequency="0.018" numOctaves="2" seed="${(seed + 17) % 97}" result="paintNoise" />
          <feDisplacementMap in="SourceGraphic" in2="paintNoise" scale="9" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <clipPath id="muralClip">
          <path d="M259 150 C420 101 526 138 642 118 C782 94 911 141 997 198 L965 645 C819 681 711 639 589 676 C448 718 347 671 262 621 Z" />
        </clipPath>
      </defs>
      <rect width="1280" height="1280" fill="#060607" />
      <rect width="1280" height="1180" fill="url(#baseWall)" />
      ${wallLayer(options.wall)}
      ${textureDots(seed, safeColors)}
      ${florentinStreetLayer(seed, safeColors, options.wallText)}
      <g clip-path="url(#muralClip)">
        <rect x="244" y="118" width="780" height="572" fill="#050506" opacity="0.2" />
        ${uploadedImage ? `<image href="${uploadedImage}" x="251" y="124" width="772" height="568" preserveAspectRatio="xMidYMid slice" opacity="0.52" filter="url(#paintedPortrait)" style="mix-blend-mode:multiply" />` : ""}
        <rect x="244" y="118" width="780" height="572" fill="${primary}" opacity="0.2" style="mix-blend-mode:multiply" />
        <rect x="244" y="118" width="780" height="572" fill="${tertiary}" opacity="0.12" style="mix-blend-mode:screen" />
        ${styleLayer({ ...options, colors: safeColors }, seed)}
        <path d="M256 618 C382 672 512 649 633 675 C763 703 890 657 1003 639" fill="none" stroke="${secondary}" stroke-width="18" opacity="0.65" stroke-linecap="round" />
        <path d="M274 183 C438 129 542 174 642 149 C799 111 900 169 978 215" fill="none" stroke="${tertiary}" stroke-width="11" opacity="0.52" stroke-linecap="round" />
      </g>
      <g filter="url(#grit)" opacity="0.85">
        <path d="M229 166 C391 89 538 121 651 102 C799 78 936 126 1020 189" fill="none" stroke="#09090a" stroke-width="22" opacity="0.58" />
        <path d="M244 640 C393 704 516 676 638 707 C786 744 891 692 1014 668" fill="none" stroke="#070708" stroke-width="17" opacity="0.45" />
      </g>
      ${addonLayer(options)}
      <path d="M0 1118 C182 1087 344 1136 502 1105 C696 1068 828 1137 1013 1098 C1125 1074 1201 1095 1280 1083 L1280 1280 L0 1280 Z" fill="#111113" />
      <text x="46" y="1244" fill="#f4f4f5" opacity="0.34" font-size="18" font-family="Arial, sans-serif">FLORENTIN WALL / LOCAL AI PREVIEW</text>
    </svg>
  `;

  return {
    id: crypto.randomUUID(),
    imageUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    prompt,
  };
}
