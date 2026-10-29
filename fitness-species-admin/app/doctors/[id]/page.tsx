import { DoctorDetailPage } from "@/components/doctor-management";

export default async function DoctorApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DoctorDetailPage doctorId={id} />;
}
