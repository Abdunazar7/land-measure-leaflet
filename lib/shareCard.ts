import type { LatLng } from "@/lib/geoUtils";

/**
 * Renders a shareable PNG card for a measured plot: satellite imagery with the
 * outline drawn in green, the area, perimeter, address and the site name.
 * Everything is drawn on a canvas in the browser; the imagery comes from
 * Esri's tile server, which allows cross-origin use, so the canvas stays
 * exportable.
 */

export interface CardStat {
  label: string;
  value: string;
  accent?: boolean;
}

export interface AreaCardInput {
  points: LatLng[];
  areaLabel: string;
  areaValue: string;
  areaUnit: string;
  stats: CardStat[];
  address: string;
  dateText: string;
  pointsText: string;
  tagline: string;
}

const WIDTH = 1080;
const HEIGHT = 1350;
const PAD = 56;
const MAP = { x: PAD, y: 164, w: WIDTH - PAD * 2, h: 700, radius: 28 };

const TILE_SIZE = 256;
const MAX_TILE_ZOOM = 19;
const MAX_ZOOM = 21;
const TILE_TIMEOUT_MS = 15_000;

const SITE_NAME = "LandMeasure";
const SITE_DOMAIN = "land-measure.uz";
const IMAGERY_CREDIT = "Imagery © Esri, Maxar, Earthstar Geographics";

const tileUrl = (z: number, x: number, y: number) =>
  `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;

const COLORS = {
  bg: "#0a0c12",
  panel: "#111722",
  border: "rgba(51, 65, 85, 0.85)",
  green: "#22c55e",
  greenLight: "#4ade80",
  white: "#f8fafc",
  text: "#e2e8f0",
  muted: "#94a3b8",
  dim: "#64748b",
  blue: "#60a5fa",
};

/* ------------------------------------------------------------ geometry */

/** Web-Mercator world pixel coordinates at the given zoom. */
function project({ lat, lng }: LatLng, zoom: number) {
  const size = TILE_SIZE * 2 ** zoom;
  const sin = Math.min(Math.max(Math.sin((lat * Math.PI) / 180), -0.9999), 0.9999);

  return {
    x: ((lng + 180) / 360) * size,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * size,
  };
}

/** Highest zoom at which the whole outline fits comfortably inside the map. */
function pickZoom(points: LatLng[]): number {
  for (let zoom = MAX_ZOOM; zoom >= 2; zoom -= 1) {
    const projected = points.map((point) => project(point, zoom));
    const xs = projected.map((p) => p.x);
    const ys = projected.map((p) => p.y);
    const width = Math.max(...xs) - Math.min(...xs);
    const height = Math.max(...ys) - Math.min(...ys);

    if (width <= MAP.w * 0.7 && height <= MAP.h * 0.7) return zoom;
  }
  return 2;
}

function centroid(points: LatLng[]): LatLng {
  const sum = points.reduce(
    (acc, point) => ({ lat: acc.lat + point.lat, lng: acc.lng + point.lng }),
    { lat: 0, lng: 0 },
  );
  return { lat: sum.lat / points.length, lng: sum.lng / points.length };
}

export function outlineCenter(points: LatLng[]): LatLng {
  return centroid(points);
}

/* -------------------------------------------------------------- canvas */

function loadTile(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";

    const timer = window.setTimeout(() => resolve(null), TILE_TIMEOUT_MS);
    image.onload = () => {
      window.clearTimeout(timer);
      resolve(image);
    };
    image.onerror = () => {
      window.clearTimeout(timer);
      resolve(null);
    };
    image.src = url;
  });
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fontFamily(variable: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const value = getComputedStyle(document.body).getPropertyValue(variable).trim();
  return value ? `${value}, ${fallback}` : fallback;
}

function setLetterSpacing(ctx: CanvasRenderingContext2D, value: string) {
  // Not available in every browser; purely cosmetic.
  if ("letterSpacing" in ctx) {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
      value;
  }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    current = word;
    if (lines.length === maxLines) break;
  }
  if (current && lines.length < maxLines) lines.push(current);

  const usedWords = lines.join(" ").split(/\s+/).length;
  if (usedWords < words.length && lines.length > 0) {
    let last = lines[lines.length - 1]!;
    while (last.length > 1 && ctx.measureText(`${last}…`).width > maxWidth) {
      last = last.slice(0, -1).trimEnd();
    }
    lines[lines.length - 1] = `${last}…`;
  }

  return lines;
}

/** A readable scale-bar length (1, 2 or 5 × 10ⁿ metres) no wider than maxPx. */
function niceScale(metresPerPixel: number, maxPx: number) {
  const maxMetres = metresPerPixel * maxPx;
  const magnitude = 10 ** Math.floor(Math.log10(maxMetres));
  const step = [5, 2, 1].map((f) => f * magnitude).find((m) => m <= maxMetres);
  const metres = step ?? magnitude;

  return {
    px: metres / metresPerPixel,
    label: metres >= 1000 ? `${metres / 1000} km` : `${metres} m`,
  };
}

function drawPin(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.fillStyle = COLORS.green;
  ctx.beginPath();
  ctx.arc(x, y, 13, Math.PI, 0);
  ctx.quadraticCurveTo(x + 13, y + 10, x, y + 24);
  ctx.quadraticCurveTo(x - 13, y + 10, x - 13, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = COLORS.bg;
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

async function drawSatellite(
  ctx: CanvasRenderingContext2D,
  points: LatLng[],
  labelFont: string,
): Promise<void> {
  const zoom = pickZoom(points);
  const tileZoom = Math.min(zoom, MAX_TILE_ZOOM);
  const scale = 2 ** (zoom - tileZoom);
  const drawnTile = TILE_SIZE * scale;

  const projected = points.map((point) => project(point, zoom));
  const xs = projected.map((p) => p.x);
  const ys = projected.map((p) => p.y);
  const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
  const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;
  const originX = centerX - MAP.w / 2;
  const originY = centerY - MAP.h / 2;

  const tilesPerSide = 2 ** tileZoom;
  const firstX = Math.floor(originX / drawnTile);
  const lastX = Math.floor((originX + MAP.w) / drawnTile);
  const firstY = Math.max(0, Math.floor(originY / drawnTile));
  const lastY = Math.min(tilesPerSide - 1, Math.floor((originY + MAP.h) / drawnTile));

  const jobs: Promise<{ image: HTMLImageElement | null; dx: number; dy: number }>[] = [];
  for (let ty = firstY; ty <= lastY; ty += 1) {
    for (let tx = firstX; tx <= lastX; tx += 1) {
      const wrappedX = ((tx % tilesPerSide) + tilesPerSide) % tilesPerSide;
      const dx = MAP.x + tx * drawnTile - originX;
      const dy = MAP.y + ty * drawnTile - originY;
      jobs.push(
        loadTile(tileUrl(tileZoom, wrappedX, ty)).then((image) => ({ image, dx, dy })),
      );
    }
  }

  const tiles = await Promise.all(jobs);
  if (!tiles.some((tile) => tile.image)) {
    throw new Error("Satellite imagery could not be loaded");
  }

  ctx.save();
  roundedRect(ctx, MAP.x, MAP.y, MAP.w, MAP.h, MAP.radius);
  ctx.clip();

  ctx.fillStyle = "#0b1220";
  ctx.fillRect(MAP.x, MAP.y, MAP.w, MAP.h);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  for (const { image, dx, dy } of tiles) {
    if (image) ctx.drawImage(image, dx, dy, drawnTile + 0.5, drawnTile + 0.5);
  }

  // Slight darkening so the green outline pops on bright imagery.
  ctx.fillStyle = "rgba(10, 12, 18, 0.12)";
  ctx.fillRect(MAP.x, MAP.y, MAP.w, MAP.h);

  const outline = projected.map((p) => ({
    x: MAP.x + p.x - originX,
    y: MAP.y + p.y - originY,
  }));

  ctx.beginPath();
  outline.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.closePath();

  ctx.fillStyle = "rgba(34, 197, 94, 0.24)";
  ctx.fill();

  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
  ctx.lineWidth = 10;
  ctx.stroke();

  ctx.shadowColor = "rgba(74, 222, 128, 0.7)";
  ctx.shadowBlur = 14;
  ctx.strokeStyle = COLORS.greenLight;
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.shadowBlur = 0;

  for (const p of outline) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.white;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#16a34a";
    ctx.stroke();
  }

  // Scale bar
  const center = centroid(points);
  const metresPerPixel =
    (156_543.033_92 * Math.cos((center.lat * Math.PI) / 180)) / 2 ** zoom;
  const bar = niceScale(metresPerPixel, 180);
  const barX = MAP.x + 28;
  const barY = MAP.y + MAP.h - 30;

  ctx.fillStyle = "rgba(10, 12, 18, 0.7)";
  roundedRect(ctx, barX - 14, barY - 38, bar.px + 28, 52, 12);
  ctx.fill();
  ctx.fillStyle = COLORS.white;
  ctx.fillRect(barX, barY - 4, bar.px, 5);
  ctx.fillRect(barX, barY - 12, 3, 13);
  ctx.fillRect(barX + bar.px - 3, barY - 12, 3, 13);
  ctx.font = labelFont;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(bar.label, barX, barY - 14);
  ctx.restore();
}

/* ------------------------------------------------------------- public */

export async function renderAreaCard(input: AreaCardInput): Promise<Blob> {
  if (input.points.length < 3) throw new Error("Outline needs 3 points");

  const sans = fontFamily("--font-outfit", "ui-sans-serif, system-ui, sans-serif");
  const mono = fontFamily("--font-mono", "ui-monospace, monospace");

  if (typeof document !== "undefined" && document.fonts) {
    await Promise.all(
      [`400 24px ${sans}`, `600 24px ${sans}`, `700 24px ${sans}`, `500 24px ${mono}`].map(
        (font) => document.fonts.load(font).catch(() => []),
      ),
    );
  }

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported");

  /* Background */
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, "#0a0c12");
  gradient.addColorStop(1, "#0c1712");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.strokeStyle = "rgba(34, 197, 94, 0.05)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= WIDTH; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y <= HEIGHT; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(WIDTH, y + 0.5);
    ctx.stroke();
  }

  /* Header: logo, brand, tagline, date */
  ctx.fillStyle = COLORS.green;
  roundedRect(ctx, PAD, 52, 72, 72, 18);
  ctx.fill();
  ctx.fillStyle = "#000000";
  ctx.font = `700 40px ${sans}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("L", PAD + 36, 90);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = `700 42px ${sans}`;
  ctx.fillStyle = COLORS.white;
  ctx.fillText("Land", PAD + 92, 94);
  const landWidth = ctx.measureText("Land").width;
  ctx.fillStyle = COLORS.greenLight;
  ctx.fillText("Measure", PAD + 92 + landWidth, 94);

  ctx.font = `400 22px ${sans}`;
  ctx.fillStyle = COLORS.muted;
  ctx.fillText(input.tagline, PAD + 94, 124);

  ctx.textAlign = "right";
  ctx.font = `500 22px ${sans}`;
  ctx.fillStyle = COLORS.muted;
  ctx.fillText(input.dateText, WIDTH - PAD, 94);
  ctx.font = `400 20px ${sans}`;
  ctx.fillStyle = COLORS.dim;
  ctx.fillText(input.pointsText, WIDTH - PAD, 124);
  ctx.textAlign = "left";

  /* Satellite map with outline */
  await drawSatellite(ctx, input.points, `600 18px ${sans}`);

  ctx.font = `400 15px ${sans}`;
  const credit = ctx.measureText(IMAGERY_CREDIT).width;
  ctx.fillStyle = "rgba(10, 12, 18, 0.6)";
  roundedRect(ctx, MAP.x + MAP.w - credit - 34, MAP.y + MAP.h - 40, credit + 20, 28, 8);
  ctx.fill();
  ctx.fillStyle = "rgba(248, 250, 252, 0.85)";
  ctx.fillText(IMAGERY_CREDIT, MAP.x + MAP.w - credit - 24, MAP.y + MAP.h - 20);

  ctx.strokeStyle = "rgba(74, 222, 128, 0.4)";
  ctx.lineWidth = 2;
  roundedRect(ctx, MAP.x, MAP.y, MAP.w, MAP.h, MAP.radius);
  ctx.stroke();

  /* Area */
  ctx.font = `600 22px ${sans}`;
  ctx.fillStyle = COLORS.greenLight;
  setLetterSpacing(ctx, "4px");
  ctx.fillText(input.areaLabel.toUpperCase(), PAD, 922);
  setLetterSpacing(ctx, "0px");

  ctx.font = `700 104px ${sans}`;
  ctx.fillStyle = COLORS.white;
  ctx.fillText(input.areaValue, PAD - 4, 1024);
  const valueWidth = ctx.measureText(input.areaValue).width;
  ctx.font = `600 46px ${sans}`;
  ctx.fillStyle = COLORS.greenLight;
  ctx.fillText(input.areaUnit, PAD + valueWidth + 14, 1024);

  /* Stats chips */
  const gap = 20;
  const chipW = (WIDTH - PAD * 2 - gap * (input.stats.length - 1)) / input.stats.length;
  const chipY = 1058;
  input.stats.forEach((stat, index) => {
    const x = PAD + index * (chipW + gap);
    ctx.fillStyle = COLORS.panel;
    roundedRect(ctx, x, chipY, chipW, 104, 20);
    ctx.fill();
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = `500 19px ${sans}`;
    ctx.fillStyle = COLORS.dim;
    ctx.fillText(stat.label.toUpperCase(), x + 24, chipY + 38);

    ctx.font = `600 30px ${mono}`;
    ctx.fillStyle = stat.accent ? COLORS.blue : COLORS.white;
    ctx.fillText(stat.value, x + 24, chipY + 80, chipW - 40);
  });

  /* Address */
  drawPin(ctx, PAD + 13, 1210);
  ctx.font = `500 28px ${sans}`;
  ctx.fillStyle = COLORS.text;
  const addressLines = wrapText(ctx, input.address, WIDTH - PAD * 2 - 48, 2);
  addressLines.forEach((line, index) => {
    ctx.fillText(line, PAD + 44, 1220 + index * 38);
  });

  /* Footer */
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, 1290.5);
  ctx.lineTo(WIDTH - PAD, 1290.5);
  ctx.stroke();

  ctx.font = `700 24px ${sans}`;
  ctx.fillStyle = COLORS.greenLight;
  ctx.fillText(SITE_DOMAIN, PAD, 1326);
  const domainWidth = ctx.measureText(SITE_DOMAIN).width;
  ctx.font = `400 20px ${sans}`;
  ctx.fillStyle = COLORS.dim;
  ctx.fillText(`· ${SITE_NAME}`, PAD + domainWidth + 10, 1326);

  const center = centroid(input.points);
  ctx.textAlign = "right";
  ctx.font = `500 20px ${mono}`;
  ctx.fillStyle = COLORS.muted;
  ctx.fillText(
    `${center.lat.toFixed(5)}, ${center.lng.toFixed(5)}`,
    WIDTH - PAD,
    1326,
  );
  ctx.textAlign = "left";

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("PNG export failed"))),
      "image/png",
    );
  });
}
