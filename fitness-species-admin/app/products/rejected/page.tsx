import { AdminLayout } from "@/components/admin-portal";
import { LiveRejectedProductsPage } from "@/components/admin-review";

export default function RejectedPage() {
  return (
    <AdminLayout activeNav="Rejected">
      <LiveRejectedProductsPage />
    </AdminLayout>
  );
}
