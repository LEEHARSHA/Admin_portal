import { AdminLayout } from "@/components/admin-portal";
import { LiveApprovedProductsPage } from "@/components/admin-review";

export default function ApprovedPage() {
  return (
    <AdminLayout activeNav="Approved">
      <LiveApprovedProductsPage />
    </AdminLayout>
  );
}
