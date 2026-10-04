import { AdminLayout } from "@/components/admin-portal";

export default function SettingsPage() {
  return (
    <AdminLayout activeNav="Settings">
      <div className="rounded-xl border border-[#D5D9D9] bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-[#172033]">Settings</h1>
        <p className="mt-2 text-sm text-[#5F6B7A]">Marketplace policy, moderation, and operational preferences.</p>
      </div>
    </AdminLayout>
  );
}
