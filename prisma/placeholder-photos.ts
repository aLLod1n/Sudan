// Generates simple illustrated placeholder photos (SVG -> WebP) for seed
// listings, so development works offline and needs no stock images.

import type { PropertyType } from "../generated/prisma/enums";

const palettes = [
  { sky: ["#f9d29d", "#ffd8cb"], ground: "#d9b38c", wall: "#f4efe6", accent: "#c8553d", glass: "#7fb7be" },
  { sky: ["#a1c4fd", "#c2e9fb"], ground: "#cdb38b", wall: "#fffaf0", accent: "#2f6690", glass: "#3a7ca5" },
  { sky: ["#fbc2eb", "#a6c1ee"], ground: "#c9a27e", wall: "#fdf6ec", accent: "#7b4b94", glass: "#9ad1d4" },
  { sky: ["#fddb92", "#d1fdff"], ground: "#e0c097", wall: "#f7f3e9", accent: "#5c8001", glass: "#87bba2" },
  { sky: ["#89f7fe", "#66a6ff"], ground: "#d4b483", wall: "#ffffff", accent: "#c1666b", glass: "#48a9a6" },
  { sky: ["#f6d365", "#fda085"], ground: "#c79a6b", wall: "#fff5e6", accent: "#8d5a97", glass: "#a3cef1" },
];

function windows(x: number, y: number, cols: number, rows: number, w: number, h: number, gap: number, fill: string) {
  let out = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      out += `<rect x="${x + c * (w + gap)}" y="${y + r * (h + gap)}" width="${w}" height="${h}" rx="6" fill="${fill}"/>`;
    }
  }
  return out;
}

function palm(x: number, baseY: number, scale = 1) {
  const s = scale;
  return `<g transform="translate(${x} ${baseY}) scale(${s})">
    <path d="M-6 0 C-4 -80 4 -160 0 -220 L8 -220 C12 -160 6 -80 6 0 Z" fill="#8b6b4a"/>
    <path d="M4 -220 C-40 -250 -90 -230 -120 -200 C-80 -215 -40 -215 4 -205 Z" fill="#3f7d4e"/>
    <path d="M4 -220 C50 -255 100 -235 125 -200 C85 -215 45 -215 4 -205 Z" fill="#4a8f5a"/>
    <path d="M4 -222 C-20 -270 -60 -285 -95 -280 C-55 -265 -25 -245 2 -212 Z" fill="#4a8f5a"/>
    <path d="M4 -222 C30 -272 70 -288 105 -282 C65 -266 35 -246 6 -212 Z" fill="#3f7d4e"/>
  </g>`;
}

function building(type: PropertyType, p: (typeof palettes)[number]) {
  switch (type) {
    case "APARTMENT":
      return `<rect x="380" y="200" width="440" height="560" rx="10" fill="${p.wall}"/>
        <rect x="380" y="200" width="440" height="40" fill="${p.accent}"/>
        ${windows(420, 270, 4, 5, 70, 60, 30, p.glass)}
        <rect x="560" y="680" width="80" height="80" rx="6" fill="${p.accent}"/>`;
    case "HOUSE":
      return `<polygon points="330,430 600,250 870,430" fill="${p.accent}"/>
        <rect x="370" y="430" width="460" height="330" fill="${p.wall}"/>
        ${windows(410, 480, 2, 1, 110, 100, 200, p.glass)}
        <rect x="550" y="600" width="100" height="160" rx="8" fill="${p.accent}"/>
        <rect x="300" y="700" width="70" height="60" fill="${p.wall}" opacity=".7"/>
        <rect x="830" y="700" width="70" height="60" fill="${p.wall}" opacity=".7"/>`;
    case "LAND":
      return `<path d="M0 700 L1200 640 L1200 900 L0 900 Z" fill="${p.ground}" opacity=".85"/>
        ${Array.from({ length: 13 }, (_, i) => `<rect x="${120 + i * 80}" y="${600 - i * 4}" width="10" height="90" fill="#8b6b4a"/>`).join("")}
        <path d="M120 630 L1090 585" stroke="#8b6b4a" stroke-width="6"/>
        <path d="M120 660 L1090 615" stroke="#8b6b4a" stroke-width="6"/>
        <rect x="520" y="470" width="160" height="110" rx="6" fill="${p.wall}"/>
        <rect x="590" y="580" width="20" height="60" fill="#8b6b4a"/>
        <rect x="540" y="495" width="120" height="16" rx="3" fill="${p.accent}"/>
        <rect x="540" y="525" width="80" height="12" rx="3" fill="${p.accent}" opacity=".6"/>`;
    case "SHOP":
      return `<rect x="300" y="330" width="600" height="430" rx="8" fill="${p.wall}"/>
        <rect x="300" y="330" width="600" height="70" fill="${p.accent}"/>
        ${Array.from({ length: 8 }, (_, i) => `<path d="M${300 + i * 75} 400 h75 v30 a37.5 37.5 0 0 1 -75 0 Z" fill="${i % 2 ? p.wall : p.accent}"/>`).join("")}
        <rect x="340" y="480" width="330" height="280" fill="${p.glass}"/>
        <rect x="710" y="480" width="150" height="280" rx="6" fill="${p.accent}" opacity=".85"/>`;
    case "OFFICE":
      return `<rect x="430" y="120" width="340" height="640" rx="10" fill="${p.wall}"/>
        ${windows(455, 150, 3, 8, 90, 55, 15, p.glass)}
        <rect x="250" y="400" width="180" height="360" rx="8" fill="${p.wall}" opacity=".9"/>
        ${windows(270, 430, 2, 5, 60, 45, 20, p.glass)}
        <rect x="560" y="690" width="80" height="70" fill="${p.accent}"/>`;
  }
}

/** Returns an SVG string (1200x900). `variant` picks palette and scenery. */
export function placeholderSvg(type: PropertyType, variant: number): string {
  const p = palettes[variant % palettes.length];
  const flip = variant % 2 === 1;
  const scenery = flip ? palm(1000, 780, 1.1) + palm(160, 790, 0.8) : palm(200, 780, 1.1);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.sky[0]}"/><stop offset="1" stop-color="${p.sky[1]}"/>
    </linearGradient></defs>
    <rect width="1200" height="900" fill="url(#sky)"/>
    <circle cx="${flip ? 230 : 970}" cy="170" r="70" fill="#fff6d5" opacity=".9"/>
    <rect y="750" width="1200" height="150" fill="${p.ground}"/>
    ${building(type, p)}
    ${scenery}
  </svg>`;
}
