import { AdminLayout, ProductReviewPage } from "@/components/admin-portal";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AdminLayout activeNav="Products">
      <ProductReviewPage productId={id} />
    </AdminLayout>
  );
}
