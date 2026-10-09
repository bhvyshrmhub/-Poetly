import { test, describe } from "node:test";
import assert from "node:assert";

// Helper for session token generation and verification mirroring src/lib/admin-auth.ts
function base64urlEncode(data: string): string {
  return Buffer.from(data)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(data: string): string {
  let base64 = data.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  return Buffer.from(base64, "base64").toString();
}

async function createSignedToken(username: string, secret: string, expiresInSec: number): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + expiresInSec;
  const data = `${username}:${expires}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const sigHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${base64urlEncode(data)}.${sigHex}`;
}

async function verifySignedToken(cookieValue: string, secret: string): Promise<boolean> {
  if (!secret) return false;
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return false;

  const [dataB64, sigHex] = parts;
  let data: string;
  try {
    data = base64urlDecode(dataB64);
  } catch {
    return false;
  }

  const colonIdx = data.lastIndexOf(":");
  if (colonIdx === -1) return false;
  const expires = parseInt(data.substring(colonIdx + 1), 10);
  if (isNaN(expires) || Math.floor(Date.now() / 1000) > expires) return false;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const match = sigHex.match(/.{2}/g);
    if (!match) return false;
    const sigBytes = new Uint8Array(match.map((h) => parseInt(h, 16)));
    return await crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(data));
  } catch {
    return false;
  }
}

async function deriveKey(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: salt as unknown as ArrayBuffer,
      iterations: 100000,
    },
    keyMaterial,
    256
  );
  return new Uint8Array(derivedBits);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

describe("Admin Authentication & Security", () => {
  const secret = "super-secret-test-key-32-chars-long!";
  const salt = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

  test("valid admin token is successfully verified", async () => {
    const token = await createSignedToken("admin", secret, 3600);
    const isValid = await verifySignedToken(token, secret);
    assert.strictEqual(isValid, true);
  });

  test("expired admin token is rejected", async () => {
    const token = await createSignedToken("admin", secret, -10); // Expired 10 seconds ago
    const isValid = await verifySignedToken(token, secret);
    assert.strictEqual(isValid, false);
  });

  test("tampered admin token signature is rejected", async () => {
    const token = await createSignedToken("admin", secret, 3600);
    const tampered = token.slice(0, -4) + "abcd";
    const isValid = await verifySignedToken(tampered, secret);
    assert.strictEqual(isValid, false);
  });

  test("tampered payload with valid signature is rejected", async () => {
    const token = await createSignedToken("admin", secret, 3600);
    const parts = token.split(".");
    const forgedData = base64urlEncode("hacker:9999999999");
    const tampered = `${forgedData}.${parts[1]}`;
    const isValid = await verifySignedToken(tampered, secret);
    assert.strictEqual(isValid, false);
  });

  test("PBKDF2 password verification succeeds on correct password with timingSafeEqual", async () => {
    const password = "CorrectAdminPassword123!";
    const hash = await deriveKey(password, salt);
    const checkHash = await deriveKey(password, salt);
    assert.strictEqual(timingSafeEqual(hash, checkHash), true);
  });

  test("PBKDF2 password verification fails on incorrect password with timingSafeEqual", async () => {
    const hash = await deriveKey("CorrectAdminPassword123!", salt);
    const wrongHash = await deriveKey("WrongPassword123!", salt);
    assert.strictEqual(timingSafeEqual(hash, wrongHash), false);
  });
});
