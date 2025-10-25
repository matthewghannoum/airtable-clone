import type { Buffer } from "buffer";

const DEFAULT_BASE_TITLE = "Base";

function normalizeTitle(title?: string | null) {
  const trimmed = title?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : DEFAULT_BASE_TITLE;
}

function computeInitials(title: string) {
  const normalized = normalizeTitle(title);
  const characters = Array.from(normalized).filter((character) => character.trim());
  const firstTwo = characters.slice(0, 2).join("");

  return (firstTwo || "BA").toUpperCase();
}

export function getBaseTitle(title?: string | null) {
  return normalizeTitle(title);
}

export function getBaseInitials(title?: string | null) {
  return computeInitials(getBaseTitle(title));
}

export function createBaseFaviconSvg(title?: string | null) {
  const initials = getBaseInitials(title);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" ry="12" fill="oklch(41% 0.159 10.272)" />
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="'Inter', 'Segoe UI', sans-serif" font-size="28" fill="#fff" font-weight="600">${initials}</text>
</svg>`;
}

function encodeSvg(svg: string) {
  if (typeof globalThis.btoa === "function") {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(svg);
    let binary = "";

    const chunkSize = 0x8000;
    for (let index = 0; index < bytes.length; index += chunkSize) {
      const chunk = bytes.subarray(index, index + chunkSize);
      binary += String.fromCharCode(...chunk);
    }

    return globalThis.btoa(binary);
  }

  if (typeof globalThis.Buffer !== "undefined") {
    return (globalThis.Buffer as typeof Buffer).from(svg).toString("base64");
  }

  throw new Error("Unable to encode SVG to base64 in the current environment.");
}

export function createBaseFaviconDataUrl(title?: string | null) {
  const svg = createBaseFaviconSvg(title);

  return `data:image/svg+xml;base64,${encodeSvg(svg)}`;
}

