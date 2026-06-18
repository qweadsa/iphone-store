/** Edge-compatible signed session tokens (HMAC-SHA256) */

const DEFAULT_SECRET = "dev-insecure-change-before-production";

export function getSessionSecret(): string {
  return process.env.SESSION_SECRET?.trim() || DEFAULT_SECRET;
}

function encodeBytes(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBytes(base64url: string): Uint8Array | null {
  try {
    const padded = base64url.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    const binary = atob(padded + pad);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

async function importKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signPayload(payload: string): Promise<string> {
  const key = await importKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return encodeBytes(new Uint8Array(sig));
}

async function verifyPayload(payload: string, signature: string): Promise<boolean> {
  const sigBytes = decodeBytes(signature);
  if (!sigBytes) return false;
  const key = await importKey();
  const data = new TextEncoder().encode(payload);
  const sig = Uint8Array.from(sigBytes);
  return crypto.subtle.verify("HMAC", key, sig, data);
}

export type SessionKind = "user" | "admin";

export type ParsedSession = {
  kind: SessionKind;
  id: string;
  exp: number;
};

export async function createSessionToken(
  kind: SessionKind,
  id: string,
  maxAgeSec: number,
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + maxAgeSec;
  const payload = `${kind}:${id}:${exp}`;
  const sig = await signPayload(payload);
  return `${payload}.${sig}`;
}

export async function parseSessionToken(token: string): Promise<ParsedSession | null> {
  const lastDot = token.lastIndexOf(".");
  if (lastDot <= 0) return null;

  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  const parts = payload.split(":");
  if (parts.length !== 3) return null;

  const [kind, id, expRaw] = parts;
  if ((kind !== "user" && kind !== "admin") || !id) return null;

  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return null;

  const ok = await verifyPayload(payload, sig);
  if (!ok) return null;

  return { kind, id, exp };
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function cookieSecureFlag(): boolean {
  return isProduction();
}

export function isWeakSessionSecret(): boolean {
  const s = process.env.SESSION_SECRET?.trim();
  return !s || s === DEFAULT_SECRET;
}
