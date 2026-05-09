import crypto from "crypto";

/** Voir doc GeniusPay : HMAC-SHA256(timestamp + '.' + corps_brut_JSON, secret). */
export function verifyGeniusPayWebhookSignature(
  rawBody: string,
  timestampHeader: string | null,
  signatureHex: string | null,
  webhookSecret: string
): { ok: true } | { ok: false; reason: string } {
  const secret = webhookSecret.trim();
  if (!secret) return { ok: false, reason: "no_secret" };
  if (!timestampHeader || !signatureHex)
    return { ok: false, reason: "missing_headers" };

  const tsNum = Number.parseInt(timestampHeader, 10);
  if (!Number.isFinite(tsNum)) return { ok: false, reason: "bad_timestamp" };
  const ageSec = Math.abs(Date.now() / 1000 - tsNum);
  if (ageSec > 300) return { ok: false, reason: "timestamp_stale" };

  const data = `${timestampHeader}.${rawBody}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(data, "utf8")
    .digest("hex");

  const sig = signatureHex.trim().toLowerCase();
  const exp = expected.toLowerCase();
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(exp, "utf8");
  if (a.length !== b.length) return { ok: false, reason: "sig_length" };
  if (!crypto.timingSafeEqual(a, b)) return { ok: false, reason: "sig_mismatch" };
  return { ok: true };
}
