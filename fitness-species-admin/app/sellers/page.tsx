import { AdminLayout, SellersPage } from "@/components/admin-portal";

export default function SellersRoute() {
  return (
    <AdminLayout activeNav="Sellers">
      <SellersPage />
    </AdminLayout>
  );
}
