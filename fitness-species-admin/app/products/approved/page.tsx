import { AdminLayout, ApprovedProductsPage } from "@/components/admin-portal";

export default function ApprovedPage() {
  return (
    <AdminLayout activeNav="Approved">
      <ApprovedProductsPage />
    </AdminLayout>
  );
}
