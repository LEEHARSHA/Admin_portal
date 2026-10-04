import { AdminLayout, PendingQueuePage } from "@/components/admin-portal";

export default function PendingPage() {
  return (
    <AdminLayout activeNav="Pending Review">
      <PendingQueuePage />
    </AdminLayout>
  );
}
