import type { User } from "@firebase/auth";

export type MarketplaceProduct = {
  id: string;
  name: string;
  description?: string;
  shortDescription?: string;
  category: string;
  subCategory?: string;
  brand?: string;
  sku?: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  images?: string[];
  specifications?: Record<string, string | number | boolean>;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string | null;
  sellerId: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  approvedAt?: string | Date | null;
  rejectedAt?: string | Date | null;
  seller?: {
    businessName?: string;
    ownerName?: string;
    email?: string;
    phone?: string;
  } | null;
};

export function isAllowedProductImageUrl(src: string) {
  try {
    const url = new URL(src.trim());
    return url.protocol === "https:"
      && !url.port
      && !url.username
      && !url.password
      && (
        url.hostname === "images.unsplash.com"
        || (url.hostname === "www.myprotein.co.in" && url.pathname === "/images")
        || (url.hostname === "img.tatacliq.com" && url.pathname.startsWith("/images/i26/"))
        || (
          url.hostname === "contents.mediadecathlon.com"
          && /^\/p\d+\/[A-Za-z0-9_-]+\/[A-Za-z0-9._-]+$/.test(url.pathname)
        )
        || (
          url.hostname === "5.imimg.com"
          && /^\/data5\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9._-]+)+$/.test(url.pathname)
        )
        || (
          url.hostname === "firebasestorage.googleapis.com"
          && /^\/v0\/b\/sellerportal-2786c\.firebasestorage\.app\/o\/sellers%2F[^/]+%2Fproducts%2F[0-9a-f-]{36}\.(jpg|png|webp)$/i.test(url.pathname)
          && url.searchParams.get("alt") === "media"
          && Boolean(url.searchParams.get("token"))
        )
        || (
          url.hostname === "encrypted-tbn1.gstatic.com"
          && (url.pathname === "/shopping" || url.pathname === "/images")
        )
      );
  } catch {
    return false;
  }
}

type ApiResponse<T> = {
  success: boolean;
  message?: string;
} & T;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "");

export async function requestAdminApi<T>(
  user: User,
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  if (!API_BASE_URL) {
    throw new Error("Admin API is not configured. Set NEXT_PUBLIC_API_URL to the backend base URL.");
  }

  const token = await user.getIdToken();
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      cache: "no-store",
    });
  } catch {
    throw new Error(`Could not reach the backend at ${API_BASE_URL}. Check the API URL and server availability.`);
  }

  let payload: ApiResponse<T> | null = null;
  try {
    payload = await response.json() as ApiResponse<T>;
  } catch {
    payload = null;
  }
  if (!response.ok) {
    const message = payload?.message || `Backend request failed with HTTP ${response.status}.`;
    if (response.status === 401) {
      throw new Error(`Authentication required: ${message}`);
    }
    if (response.status === 403) {
      throw new Error(`Administrator access denied: ${message}`);
    }
    throw new Error(message);
  }
  if (!payload?.success) {
    throw new Error(payload?.message || "Backend returned an unsuccessful response.");
  }
  return payload;
}

export function productImage(product: MarketplaceProduct) {
  const images = Array.isArray(product.images) ? product.images : [];
  return images
    .map((image) => (typeof image === "string" ? image.trim() : ""))
    .find(isAllowedProductImageUrl) || "";
}

export function productSellerName(product: MarketplaceProduct) {
  return product.seller?.businessName || product.seller?.ownerName || product.sellerId;
}
