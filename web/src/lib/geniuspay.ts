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
  /**
   * Si tout est omis : checkout GeniusPay (client choisit Wave / OM / carte / …).
   * Sinon : passage forcé selon la doc GeniusPay (`payment_method`, `gateway`, `mmo_provider`).
   */
  paymentMethod?: string | null;
  gateway?: string | null;
  mmoProvider?: string | null;
};

/** Lit les overrides depuis l’ENV (config marchand, pas exposé au navigateur). */
export function getGeniusPayCheckoutOverridesFromEnv(): {
  paymentMethod?: string;
  gateway?: string;
  mmoProvider?: string;
} {
  const pm = process.env.GENIUSPAY_CHECKOUT_PAYMENT_METHOD?.trim();
  const gw = process.env.GENIUSPAY_CHECKOUT_GATEWAY?.trim();
  const mmo = process.env.GENIUSPAY_CHECKOUT_MMO_PROVIDER?.trim();
  const out: { paymentMethod?: string; gateway?: string; mmoProvider?: string } =
    {};
  if (pm) out.paymentMethod = pm;
  if (gw) out.gateway = gw;
  if (mmo) out.mmoProvider = mmo;
  return out;
}

/**
 * Sans `payment_method` / overrides → `checkout_url` (page hébergée GeniusPay).
 * Avec `payment_method` ou `gateway` explicite → comportement documenté (souvent redirection directe vers un agrégateur).
 */
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

  const body: Record<string, unknown> = {
    amount: input.amountXof,
    currency: "XOF",
    description: input.description.slice(0, 500),
    customer,
    success_url: input.successUrl,
    error_url: input.errorUrl,
    metadata: input.metadata,
  };
  if (input.paymentMethod) body.payment_method = input.paymentMethod;
  if (input.gateway) body.gateway = input.gateway;
  if (input.mmoProvider) body.mmo_provider = input.mmoProvider;

  const res = await fetch(`${cred.baseUrl}/payments`, {
    method: "POST",
    headers: {
      "X-API-Key": cred.apiKey,
      "X-API-Secret": cred.apiSecret,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
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
