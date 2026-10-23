"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminReviewAccess, useAdminUser } from "@/components/admin-auth";
import {
  isAllowedProductImageUrl,
  productImage,
  productSellerName,
  requestAdminApi,
  type MarketplaceProduct,
} from "@/lib/admin-api";

type ProductListResponse = {
  products: MarketplaceProduct[];
  total: number;
  page: number;
  limit: number;
};

function ReviewStatus({ status }: { status: MarketplaceProduct["status"] }) {
  const style = {
    pending: "bg-amber-50 text-amber-800",
    approved: "bg-emerald-50 text-emerald-800",
    rejected: "bg-red-50 text-red-800",
  }[status];
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${style}`}>{status}</span>;
}

function dateLabel(value?: string | Date) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
}

function productImageHostname(product: MarketplaceProduct, src: string) {
  let candidate = src;
  if (!candidate) {
    const firstImage = Array.isArray(product.images) ? product.images[0] : undefined;
    candidate = typeof firstImage === "string"
      ? firstImage
      : firstImage && typeof firstImage === "object" && typeof firstImage.url === "string"
        ? firstImage.url
        : "";
  }
  try {
    return candidate ? new URL(candidate.trim()).hostname : "none";
  } catch {
    return "invalid URL";
  }
}

function ProductImage({
  product,
  variant,
}: {
  product: MarketplaceProduct;
  variant: "thumbnail" | "detail";
}) {
  const src = productImage(product);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && isAllowedProductImageUrl(src) && failedSrc !== src;

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && !src) {
      console.warn("Product image is unavailable.", {
        productId: product.id,
        hostname: productImageHostname(product, src),
      });
    }
  }, [product, src]);

  const onError = () => {
    setFailedSrc(src);
    if (process.env.NODE_ENV !== "production") {
      console.warn("Product image failed to load.", {
        productId: product.id,
        hostname: productImageHostname(product, src),
      });
    }
  };

  if (variant === "thumbnail") {
    return showImage ? (
      <Image
        src={src}
        alt=""
        width={44}
        height={44}
        className="h-11 w-11 shrink-0 rounded object-cover"
        onError={onError}
      />
    ) : <div aria-hidden="true" className="h-11 w-11 shrink-0 rounded bg-[#F1F3F6]" />;
  }

  return showImage ? (
    <Image
      src={src}
      alt={product.name}
      width={1200}
      height={900}
      className="max-h-[420px] w-full rounded-xl bg-[#F7F7F7] object-contain"
      onError={onError}
    />
  ) : (
    <div className="flex h-48 w-full items-center justify-center rounded-xl bg-[#F7F7F7] text-sm text-[#5F6B7A]">
      No image available
    </div>
  );
}

function useProductList(status: MarketplaceProduct["status"]) {
  const user = useAdminUser();
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const limit = 50;

  useEffect(() => {
    let active = true;
    void requestAdminApi<ProductListResponse>(
      user,
      `/api/admin/products?status=${status}&page=${page}&limit=${limit}`,
    ).then((response) => {
      if (!active) return;
      setProducts(response.products);
      setTotal(response.total);
      setError(null);
    }).catch((loadError: unknown) => {
      if (!active) return;
      setProducts([]);
      setTotal(0);
      setError(loadError instanceof Error ? loadError.message : "Could not load products.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [limit, page, status, user]);

  return {
    products,
    total,
    page,
    setPage,
    limit,
    loading,
    startLoading: () => setLoading(true),
    error,
  };
}

function ProductListPage({ status }: { status: MarketplaceProduct["status"] }) {
  const { products, total, page, setPage, limit, loading, startLoading, error } = useProductList(status);
  const [query, setQuery] = useState("");
  const title = status === "pending" ? "Pending Reviews" : `${status[0].toUpperCase()}${status.slice(1)} Products`;
  const filteredProducts = products.filter((product) => (
    !query
    || product.name.toLowerCase().includes(query.toLowerCase())
    || (product.sku || "").toLowerCase().includes(query.toLowerCase())
  ));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#172033]">{title}</h1>
        <p className="mt-1 text-sm text-[#5F6B7A]">
          Live products read from the Fitness Species backend. {total} total.
        </p>
      </div>
      <div className="rounded-xl border border-[#D5D9D9] bg-white p-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products or SKU"
          className="mb-4 h-11 w-full max-w-md rounded-lg border border-[#D5D9D9] px-3 text-sm"
        />
        {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {loading ? (
          <p className="py-12 text-center text-sm text-[#5F6B7A]">Loading saved products…</p>
        ) : filteredProducts.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#5F6B7A]">
            {error ? "Products could not be loaded." : "No persisted products match this view."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#E8ECEC] text-left text-sm">
              <thead className="bg-[#F7F7F7] text-[#5F6B7A]">
                <tr>
                  <th className="px-3 py-3 font-medium">Product</th>
                  <th className="px-3 py-3 font-medium">Seller</th>
                  <th className="px-3 py-3 font-medium">Category</th>
                  <th className="px-3 py-3 font-medium">Price</th>
                  <th className="px-3 py-3 font-medium">Stock</th>
                  <th className="px-3 py-3 font-medium">Submitted</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8ECEC]">
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <ProductImage product={product} variant="thumbnail" />
                        <div>
                          <div className="font-medium text-[#172033]">{product.name}</div>
                          <div className="text-xs text-[#5F6B7A]">
                            {[product.brand, product.sku || "No SKU"].filter(Boolean).join(" · ")}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">{productSellerName(product)}</td>
                    <td className="px-3 py-3">{product.category}</td>
                    <td className="px-3 py-3">{product.price.toFixed(2)}</td>
                    <td className="px-3 py-3">{product.stock}</td>
                    <td className="px-3 py-3">{dateLabel(product.createdAt)}</td>
                    <td className="px-3 py-3"><ReviewStatus status={product.status} /></td>
                    <td className="px-3 py-3">
                      <Link className="rounded-lg border border-[#D5D9D9] px-3 py-2" href={`/products/${product.id}`}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 flex items-center justify-between text-sm text-[#5F6B7A]">
          <span>Page {page} of {Math.max(1, Math.ceil(total / limit))}</span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => {
                startLoading();
                setPage((current) => current - 1);
              }}
              className="rounded-lg border border-[#D5D9D9] px-3 py-2 disabled:opacity-40"
            >Previous</button>
            <button
              type="button"
              disabled={page >= Math.ceil(total / limit) || loading}
              onClick={() => {
                startLoading();
                setPage((current) => current + 1);
              }}
              className="rounded-lg border border-[#D5D9D9] px-3 py-2 disabled:opacity-40"
            >Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductDetail({ productId }: { productId: string }) {
  const user = useAdminUser();
  const router = useRouter();
  const [product, setProduct] = useState<MarketplaceProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    let active = true;
    void requestAdminApi<{ product: MarketplaceProduct }>(
      user,
      `/api/admin/products/${encodeURIComponent(productId)}`,
    ).then((response) => {
      if (!active) return;
      setProduct(response.product);
      setError(null);
    }).catch((loadError: unknown) => {
      if (!active) return;
      setError(loadError instanceof Error ? loadError.message : "Could not load product.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [productId, user]);

  async function review(status: "approved" | "rejected") {
    if (!product) return;
    setBusy(true);
    setError(null);
    try {
      const response = await requestAdminApi<{ product: MarketplaceProduct }>(
        user,
        `/api/admin/products/${encodeURIComponent(product.id)}/review`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status,
            ...(status === "rejected" ? { rejectionReason: rejectionReason.trim() } : {}),
          }),
        },
      );
      setProduct((current) => (current
        ? { ...response.product, seller: current.seller }
        : response.product));
      router.replace(status === "approved" ? "/products/approved" : "/products/rejected");
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : "Product review failed.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="p-8 text-sm text-[#5F6B7A]">Loading saved product…</p>;
  if (error && !product) return <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</p>;
  if (!product) return <p className="p-8 text-sm text-[#5F6B7A]">Product not found.</p>;
  const backHref = product.status === "approved"
    ? "/products/approved"
    : product.status === "rejected"
      ? "/products/rejected"
      : "/products/pending";

  return (
    <div>
      <Link href={backHref} className="mb-4 inline-block text-sm text-[#5F6B7A]">
        ← Back to {product.status === "pending" ? "review queue" : `${product.status} products`}
      </Link>
      <div className="rounded-xl border border-[#D5D9D9] bg-white p-6">
        {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#172033]">{product.name}</h1>
            <p className="mt-1 text-sm text-[#5F6B7A]">
              {[product.brand, productSellerName(product), product.sku || "No SKU"].filter(Boolean).join(" · ")}
            </p>
          </div>
          <ReviewStatus status={product.status} />
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.8fr)]">
          <div>
            <ProductImage product={product} variant="detail" />
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#5F6B7A]">{product.description || "No product description provided."}</p>
          </div>
          <dl className="grid content-start grid-cols-2 gap-4 text-sm">
            <div><dt className="text-[#5F6B7A]">Category</dt><dd className="mt-1 font-medium">{product.category}</dd></div>
            <div><dt className="text-[#5F6B7A]">Price</dt><dd className="mt-1 font-medium">{product.price.toFixed(2)}</dd></div>
            <div><dt className="text-[#5F6B7A]">Stock</dt><dd className="mt-1 font-medium">{product.stock}</dd></div>
            <div><dt className="text-[#5F6B7A]">Submitted</dt><dd className="mt-1 font-medium">{dateLabel(product.createdAt)}</dd></div>
            <div><dt className="text-[#5F6B7A]">Seller email</dt><dd className="mt-1 break-words font-medium">{product.seller?.email || "Not available"}</dd></div>
            <div><dt className="text-[#5F6B7A]">Seller phone</dt><dd className="mt-1 font-medium">{product.seller?.phone || "Not available"}</dd></div>
          </dl>
        </div>
        {product.status === "pending" && (
          <div className="mt-6 flex flex-col gap-3 border-t border-[#E8ECEC] pt-5 sm:flex-row">
            <button
              type="button"
              disabled={busy}
              onClick={() => void review("approved")}
              className="rounded-lg bg-emerald-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >{busy ? "Saving…" : "Approve product"}</button>
            <input
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              placeholder="Reason required to reject"
              className="min-w-60 flex-1 rounded-lg border border-[#D5D9D9] px-3 py-2 text-sm"
            />
            <button
              type="button"
              disabled={busy || rejectionReason.trim().length < 5}
              onClick={() => void review("rejected")}
              className="rounded-lg bg-red-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >Reject product</button>
          </div>
        )}
        {product.status === "rejected" && product.rejectionReason && (
          <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-800">Rejection reason: {product.rejectionReason}</p>
        )}
      </div>
    </div>
  );
}

export function LivePendingQueuePage() {
  return <AdminReviewAccess><ProductListPage status="pending" /></AdminReviewAccess>;
}

export function LiveApprovedProductsPage() {
  return <AdminReviewAccess><ProductListPage status="approved" /></AdminReviewAccess>;
}

export function LiveRejectedProductsPage() {
  return <AdminReviewAccess><ProductListPage status="rejected" /></AdminReviewAccess>;
}

export function LiveProductReviewPage({ productId }: { productId: string }) {
  return <AdminReviewAccess><ProductDetail productId={productId} /></AdminReviewAccess>;
}
