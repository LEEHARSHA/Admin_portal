import { OrganizationManagementPage } from "@/components/organization-management";
import {
  isOrganizationStatus,
  organizationStatuses,
  type OrganizationVerificationStatus,
} from "@/lib/organization-management";

export default async function OrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const initialStatus: OrganizationVerificationStatus = isOrganizationStatus(params.status)
    ? params.status
    : organizationStatuses[0];
  return <OrganizationManagementPage initialStatus={initialStatus} />;
}
