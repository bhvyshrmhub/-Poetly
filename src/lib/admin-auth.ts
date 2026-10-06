function base64urlDecode(data: string): string {
  let base64 = data.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  return Buffer.from(base64, "base64").toString();
}

export async function verifyAdminSession(cookieValue: string): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
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

  // Check expiration
  const colonIdx = data.lastIndexOf(":");
  if (colonIdx === -1) return false;
  const expires = parseInt(data.substring(colonIdx + 1), 10);
  if (isNaN(expires) || Math.floor(Date.now() / 1000) > expires) return false;

  // Verify HMAC signature
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
