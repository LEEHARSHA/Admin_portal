import { AdminLayout } from "@/components/admin-portal";

export default function HelpPage() {
  return (
    <AdminLayout activeNav="Help">
      <div className="rounded-xl border border-[#D5D9D9] bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-[#172033]">Help</h1>
        <p className="mt-2 text-sm text-[#5F6B7A]">Support documentation and moderation playbooks for marketplace operations.</p>
      </div>
    </AdminLayout>
  );
}
