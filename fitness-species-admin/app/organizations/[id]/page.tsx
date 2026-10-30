import { OrganizationDetailPage } from "@/components/organization-management";

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrganizationDetailPage organizationId={id} />;
}
