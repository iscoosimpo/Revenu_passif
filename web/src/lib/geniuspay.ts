export const GENIUSPAY_DEFAULT_API_BASE =
  "https://pay.genius.ci/api/v1/merchant";

const MIN_AMOUNT_XOF = 200;

export function getGeniusPayCredentials():
  | { ok: true; apiKey: string; apiSecret: string; baseUrl: string }
  | { ok: false } {
  const apiKey = process.env.GENIUSPAY_API_KEY?.trim();
  const apiSecret = process.env.GENIUSPAY_API_SECRET?.trim();
  const rawBase =
    process.env.GENIUSPAY_API_BASE_URL?.trim() || GENIUSPAY_DEFAULT_API_BASE;
  const baseUrl = rawBase.replace(/\/+$/, "");
  if (!apiKey || !apiSecret) return { ok: false };
  return { ok: true, apiKey, apiSecret, baseUrl };
}

export function getPublicAppUrl(): string {
  const u = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  return u.replace(/\/+$/, "");
}

export function assertAmountXof(n: number): void {
  if (!Number.isFinite(n) || n < MIN_AMOUNT_XOF || n !== Math.floor(n)) {
    throw new Error(
      `amount_invalid:${MIN_AMOUNT_XOF}:${n}`
    );
  }
}

type GeniusPayPaymentResponse = {
  success?: boolean;
  data?: {
    checkout_url?: string;
    payment_url?: string;
    reference?: string;
    id?: number;
  };
  error?: { message?: string; code?: string };
};

export type CreateHostedCheckoutInput = {
  amountXof: number;
  description: string;
  customerEmail: string;
  customerPhone?: string | null;
  customerName?: string | null;
  successUrl: string;
  errorUrl: string;
  metadata: Record<string, string>;
};

/** Sans `payment_method` → GeniusPay renvoie `checkout_url` (page hébergée). */
export async function createHostedCheckout(
  input: CreateHostedCheckoutInput
): Promise<{ checkoutUrl: string; reference: string }> {
  const cred = getGeniusPayCredentials();
  if (!cred.ok) {
    throw new Error("GENIUSPAY_NOT_CONFIGURED");
  }

  assertAmountXof(input.amountXof);

  const customer: Record<string, string> = {
    email: input.customerEmail,
  };
  const phone = input.customerPhone?.trim();
  if (phone) customer.phone = phone;
  const name = input.customerName?.trim();
  if (name) customer.name = name;

  const res = await fetch(`${cred.baseUrl}/payments`, {
    method: "POST",
    headers: {
      "X-API-Key": cred.apiKey,
      "X-API-Secret": cred.apiSecret,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amountXof,
      currency: "XOF",
      description: input.description.slice(0, 500),
      customer,
      success_url: input.successUrl,
      error_url: input.errorUrl,
      metadata: input.metadata,
    }),
  });

  let json: GeniusPayPaymentResponse;
  try {
    json = (await res.json()) as GeniusPayPaymentResponse;
  } catch {
    throw new Error("GENIUSPAY_RESPONSE_INVALID_JSON");
  }

  if (!res.ok || json.success !== true || !json.data) {
    const msg =
      json.error?.message ||
      json.error?.code ||
      `GENIUSPAY_HTTP_${res.status}`;
    throw new Error(msg);
  }

  const url = json.data.checkout_url || json.data.payment_url;
  const reference = json.data.reference;
  if (!url || !reference) {
    throw new Error("GENIUSPAY_MISSING_CHECKOUT_URL_OR_REFERENCE");
  }

  return { checkoutUrl: url, reference };
}
