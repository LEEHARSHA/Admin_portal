import { AdminLayout, CategoriesPage } from "@/components/admin-portal";

export default function CategoriesRoute() {
  return (
    <AdminLayout activeNav="Categories">
      <CategoriesPage />
    </AdminLayout>
  );
}
