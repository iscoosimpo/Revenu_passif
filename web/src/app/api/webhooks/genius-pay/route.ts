import { NextResponse } from "next/server";
import { verifyGeniusPayWebhookSignature } from "@/lib/geniuspay-webhook";

export const runtime = "nodejs";

/**
 * GeniusPay → POST avec body JSON brut. Signature :
 * HMAC-SHA256(`${timestamp}.${rawBody}`, GENIUSPAY_WEBHOOK_SECRET)
 */
export async function POST(req: Request) {
  const secret = process.env.GENIUSPAY_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.warn("[genius-pay webhook] GENIUSPAY_WEBHOOK_SECRET manquant");
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("X-Webhook-Signature");
  const timestamp = req.headers.get("X-Webhook-Timestamp");
  const event = req.headers.get("X-Webhook-Event");
  const deliveryId = req.headers.get("X-Webhook-Delivery");

  const check = verifyGeniusPayWebhookSignature(
    rawBody,
    timestamp,
    signature,
    secret
  );
  if (!check.ok) {
    console.warn("[genius-pay webhook] signature refused:", check.reason);
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody) as unknown;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const id =
    typeof payload === "object" &&
    payload !== null &&
    "id" in payload &&
    typeof (payload as { id: unknown }).id === "string"
      ? (payload as { id: string }).id
      : undefined;

  if (process.env.NODE_ENV !== "production") {
    console.log("[genius-pay webhook]", {
      event,
      id,
      deliveryId,
      parsed: payload,
    });
  } else {
    console.log("[genius-pay webhook]", { event, id, deliveryId });
  }

  // Idempotence : en prod, persister payload.id ou X-Webhook-Delivery (Supabase / KV)
  // avant tout effet métier pour ne pas traiter deux fois la même livraison.
  switch (event) {
    case "payment.success":
    case "payment.failed":
    case "payment.cancelled":
    case "payment.expired":
      break;
    default:
      break;
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
