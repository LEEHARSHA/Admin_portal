import { AdminLayout, RejectedProductsPage } from "@/components/admin-portal";

export default function RejectedPage() {
  return (
    <AdminLayout activeNav="Rejected">
      <RejectedProductsPage />
    </AdminLayout>
  );
}
