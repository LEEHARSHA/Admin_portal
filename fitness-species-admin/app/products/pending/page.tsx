import { AdminLayout } from "@/components/admin-portal";
import { LivePendingQueuePage } from "@/components/admin-review";

export default function PendingPage() {
  return (
    <AdminLayout activeNav="Pending Review">
      <LivePendingQueuePage />
    </AdminLayout>
  );
}
