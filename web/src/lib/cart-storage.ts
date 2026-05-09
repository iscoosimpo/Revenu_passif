export type CartLine = {
  productId: string;
  slug: string;
  title: string;
  price: number;
  image_url: string | null;
  quantity: number;
};

export const CART_STORAGE_KEY = "magassa_hub_cart_v1";

export function loadCartLines(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCartLine);
  } catch {
    return [];
  }
}

export function saveCartLines(lines: CartLine[]): void {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
}

function isCartLine(x: unknown): x is CartLine {
  return (
    typeof x === "object" &&
    x !== null &&
    typeof (x as CartLine).productId === "string" &&
    typeof (x as CartLine).slug === "string" &&
    typeof (x as CartLine).title === "string" &&
    typeof (x as CartLine).price === "number" &&
    typeof (x as CartLine).quantity === "number"
  );
}

export function mergeLine(
  lines: CartLine[],
  next: Omit<CartLine, "quantity"> & { quantity?: number }
): CartLine[] {
  const qty = Math.max(1, next.quantity ?? 1);
  const idx = lines.findIndex((l) => l.productId === next.productId);
  if (idx === -1) {
    return [...lines, { ...next, quantity: qty }];
  }
  const clone = [...lines];
  clone[idx] = {
    ...clone[idx],
    ...next,
    quantity: clone[idx].quantity + qty,
  };
  return clone;
}

export function cartLineCount(lines: CartLine[]): number {
  return lines.reduce((acc, l) => acc + l.quantity, 0);
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((acc, l) => acc + l.price * l.quantity, 0);
}
