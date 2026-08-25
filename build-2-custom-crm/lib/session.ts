/**
 * Stateless signed session token for the manager dashboard's shared PIN.
 * Uses Web Crypto (not Node's `crypto` module) so it works whether proxy.ts
 * runs on the Edge or Node runtime.
 */
const encoder = new TextEncoder();
const SESSION_TTL_SECONDS = 12 * 60 * 60;
export const SESSION_COOKIE = "dashboard_session";

function bufToHex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(message: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return bufToHex(sig);
}

export async function createSessionToken(secret: string) {
  const expires = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const sig = await sign(String(expires), secret);
  return `${expires}.${sig}`;
}

export async function verifySessionToken(token: string | undefined, secret: string) {
  if (!token) return false;
  const [expiresStr, sig] = token.split(".");
  const expires = Number(expiresStr);
  if (!expires || !sig) return false;
  if (Date.now() / 1000 > expires) return false;
  const expected = await sign(expiresStr, secret);
  return expected === sig;
}
