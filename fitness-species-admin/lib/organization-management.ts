export const ORGANIZATION_MANAGEMENT_PATH = "/organizations";
export const ORGANIZATION_PAGE_SIZE = 25;
export const ORGANIZATION_MANAGEMENT_NAV_ITEM = {
  label: "Organization Management",
  href: ORGANIZATION_MANAGEMENT_PATH,
} as const;

export const organizationStatuses = ["pending", "approved", "rejected"] as const;
export type OrganizationVerificationStatus = (typeof organizationStatuses)[number];

export type OrganizationVerificationDocument = string | {
  name?: string;
  fileName?: string;
  url?: string;
  downloadUrl?: string;
};

export type HospitalOrganization = {
  id: string;
  name: string;
  organizationType: string;
  address: string;
  city: string;
  state: string;
  email: string;
  phone: string;
  registrationNumber: string;
  website?: string;
  description?: string;
  facilities?: string[];
  adminName?: string;
  adminDesignation?: string;
  verificationStatus: OrganizationVerificationStatus;
  verificationDocuments?: OrganizationVerificationDocument[];
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  reviewedAt?: string | Date | null;
  reviewedBy?: string | null;
  reviewNote?: string | null;
};

export type OrganizationQueueDisplayState = "loading" | "error" | "empty" | "results";

export function isOrganizationStatus(value: string | undefined): value is OrganizationVerificationStatus {
  return organizationStatuses.some((status) => status === value);
}

export function organizationQueuePath(status: OrganizationVerificationStatus) {
  return `${ORGANIZATION_MANAGEMENT_PATH}?status=${status}`;
}

export function organizationListApiPath(
  status: OrganizationVerificationStatus,
  page = 1,
  limit = ORGANIZATION_PAGE_SIZE,
) {
  const query = new URLSearchParams({
    status,
    page: String(page),
    limit: String(limit),
  });
  return `/api/doctor-portal/admin/organizations?${query.toString()}`;
}

export function organizationDetailApiPath(id: string) {
  return `/api/doctor-portal/admin/organizations/${encodeURIComponent(id)}`;
}

export function organizationReviewApiPath(id: string) {
  return `${organizationDetailApiPath(id)}/review`;
}

export function createOrganizationReviewPayload(
  status: "approved" | "rejected",
  rejectionReason = "",
) {
  if (status === "approved") return { status };
  const reviewNote = rejectionReason.trim();
  if (!reviewNote) throw new Error("A rejection reason is required.");
  if (reviewNote.length > 1000) {
    throw new Error("Rejection reasons must be 1000 characters or fewer.");
  }
  return { status, reviewNote };
}

export function formatOrganizationDate(value?: string | Date | null) {
  if (!value) return "Not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Invalid date" : date.toLocaleString();
}

export function organizationPageCount(total: number, pageSize = ORGANIZATION_PAGE_SIZE) {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function organizationQueueDisplayState({
  loading,
  error,
  count,
}: {
  loading: boolean;
  error: string;
  count: number;
}): OrganizationQueueDisplayState {
  if (loading) return "loading";
  if (error) return "error";
  return count === 0 ? "empty" : "results";
}

export function organizationTypeLabel(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
