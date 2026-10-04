import { AdminLayout } from "@/components/admin-portal";

export default function ReportsPage() {
  return (
    <AdminLayout activeNav="Reports">
      <div className="rounded-xl border border-[#D5D9D9] bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-[#172033]">Reports</h1>
        <p className="mt-2 text-sm text-[#5F6B7A]">Marketplace reporting and business health view is ready for backend integration.</p>
      </div>
    </AdminLayout>
  );
}
