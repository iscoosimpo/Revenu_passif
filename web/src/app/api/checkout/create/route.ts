import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import {
  createHostedCheckout,
  getGeniusPayCredentials,
  getPublicAppUrl,
} from "@/lib/geniuspay";

type CheckoutLinePayload = {
  productId: string;
  slug: string;
  title: string;
  price: number;
  quantity: number;
};

type BodyPayload = {
  email?: string;
  phone?: string | null;
  lines?: CheckoutLinePayload[];
  subtotal?: number;
  currency?: string;
};

const MIN_AMOUNT_XOF = 200;

function computeTotalXof(lines: CheckoutLinePayload[]): number {
  return lines.reduce((sum, l) => {
    const unit = Math.round(Number(l.price));
    return sum + unit * l.quantity;
  }, 0);
}

function describeOrder(lines: CheckoutLinePayload[]): string {
  const parts = lines.map((l) => `${l.title} ×${l.quantity}`);
  let base = parts.join(", ");
  if (base.length > 420) {
    base =
      `${lines.length} article(s)` +
      (lines[0] ? ` — ${lines[0].title}` : "");
  }
  return `Magassa Hub — ${base}`.slice(0, 500);
}

export async function POST(req: Request) {
  let body: BodyPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Corps JSON invalide." },
      { status: 400 }
    );
  }

  const cred = getGeniusPayCredentials();
  if (!cred.ok) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Paiement non configuré côté serveur (GENIUSPAY_API_KEY / GENIUSPAY_API_SECRET).",
      },
      { status: 503 }
    );
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Adresse e-mail invalide." },
      { status: 400 }
    );
  }

  const lines = Array.isArray(body.lines) ? body.lines : [];
  if (lines.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Aucune ligne dans la commande." },
      { status: 400 }
    );
  }

  for (const l of lines) {
    if (
      typeof l.productId !== "string" ||
      typeof l.title !== "string" ||
      typeof l.slug !== "string" ||
      typeof l.price !== "number" ||
      typeof l.quantity !== "number"
    ) {
      return NextResponse.json(
        { ok: false, error: "Lignes de commande invalides." },
        { status: 400 }
      );
    }
    if (l.quantity < 1 || !Number.isFinite(l.price)) {
      return NextResponse.json(
        { ok: false, error: "Quantité ou prix invalide." },
        { status: 400 }
      );
    }
  }

  const amountXof = computeTotalXof(lines);
  if (amountXof < MIN_AMOUNT_XOF) {
    return NextResponse.json(
      {
        ok: false,
        error: `Montant minimum : ${MIN_AMOUNT_XOF} XOF.`,
      },
      { status: 400 }
    );
  }

  if (body.subtotal != null && Number.isFinite(Number(body.subtotal))) {
    const declared = Math.round(Number(body.subtotal));
    if (declared !== amountXof) {
      return NextResponse.json(
        {
          ok: false,
          error: "Le total du panier ne correspond pas. Actualisez la page.",
        },
        { status: 400 }
      );
    }
  }

  const orderDraftId = `mh_${randomUUID()}`;
  const phone =
    typeof body.phone === "string" && body.phone.trim()
      ? body.phone.trim()
      : null;

  const appBase = getPublicAppUrl();

  try {
    const { checkoutUrl, reference } = await createHostedCheckout({
      amountXof,
      description: describeOrder(lines),
      customerEmail: email,
      customerPhone: phone,
      customerName: email.includes("@") ? email.split("@")[0] : undefined,
      successUrl: `${appBase}/paiement/succes`,
      errorUrl: `${appBase}/paiement/echec`,
      metadata: {
        order_id: orderDraftId,
        item_count: String(lines.length),
      },
    });

    if (process.env.NODE_ENV !== "production") {
      console.log("[checkout/create] GeniusPay:", {
        orderDraftId,
        reference,
        amountXof,
      });
    }

    return NextResponse.json({
      ok: true,
      orderDraftId,
      geniusPayReference: reference,
      paymentUrl: checkoutUrl,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);

    const codeMap: Record<string, string> = {
      GENIUSPAY_NOT_CONFIGURED:
        "Paiement GeniusPay non configuré (clés manquantes).",
      GENIUSPAY_RESPONSE_INVALID_JSON: "Réponse GeniusPay illisible.",
      GENIUSPAY_MISSING_CHECKOUT_URL_OR_REFERENCE: "Réponse GeniusPay invalide.",
    };

    let userFacing =
      codeMap[msg.split(":")[0] || msg] ||
      "Erreur de liaison avec GeniusPay. Réessayez plus tard.";

    if (process.env.NODE_ENV !== "production" && msg) {
      userFacing = `${userFacing} (${msg})`;
    }

    console.error("[checkout/create] GeniusPay error:", msg);

    return NextResponse.json(
      {
        ok: false,
        error: userFacing,
      },
      { status: 502 }
    );
  }
}
