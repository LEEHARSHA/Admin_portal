import { AdminLayout, DashboardPage } from "@/components/admin-portal";

export default function HomePage() {
  return (
    <AdminLayout activeNav="Dashboard">
      <DashboardPage />
    </AdminLayout>
  );
}
