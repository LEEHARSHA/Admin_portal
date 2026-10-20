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
  images?: Array<string | { url?: string; isPrimary?: boolean; alt?: string }>;
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
  const imageUrl = (image: (typeof images)[number] | null) => {
    if (typeof image === "string") return image;
    return image && typeof image === "object" && "url" in image && typeof image.url === "string"
      ? image.url
      : "";
  };
  const primary = images.find((image) => (
    typeof image === "object"
    && image !== null
    && "isPrimary" in image
    && image.isPrimary
    && imageUrl(image)
  ));
  if (primary) return imageUrl(primary);
  return images.map(imageUrl).find(Boolean) || "";
}

export function productSellerName(product: MarketplaceProduct) {
  return product.seller?.businessName || product.seller?.ownerName || product.sellerId;
}
