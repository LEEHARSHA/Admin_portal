import { AdminLayout } from "@/components/admin-portal";
import { LiveProductReviewPage } from "@/components/admin-review";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AdminLayout activeNav="Products">
      <LiveProductReviewPage productId={id} />
    </AdminLayout>
  );
}
