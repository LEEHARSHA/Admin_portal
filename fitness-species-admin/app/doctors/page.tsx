import { DoctorManagementPage } from "@/components/doctor-management";
import {
  doctorStatuses,
  isDoctorReviewStatus,
  isDoctorStatus,
  type DoctorReviewStatus,
  type DoctorStatus,
} from "@/lib/doctor-management";

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; reviewed?: string }>;
}) {
  const params = await searchParams;
  const initialStatus: DoctorStatus = isDoctorStatus(params.status)
    ? params.status
    : doctorStatuses[1];
  const reviewedStatus: DoctorReviewStatus | undefined = isDoctorReviewStatus(params.reviewed)
    ? params.reviewed
    : undefined;
  return <DoctorManagementPage initialStatus={initialStatus} reviewedStatus={reviewedStatus} />;
}
