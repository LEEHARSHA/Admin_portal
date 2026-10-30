"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminReviewAccess, useAdminUser } from "@/components/admin-auth";
import { AdminLayout } from "@/components/admin-portal";
import { requestAdminApi } from "@/lib/admin-api";
import {
  createOrganizationReviewPayload,
  formatOrganizationDate,
  isOrganizationStatus,
  ORGANIZATION_PAGE_SIZE,
  organizationDetailApiPath,
  organizationListApiPath,
  organizationPageCount,
  organizationQueueDisplayState,
  organizationReviewApiPath,
  organizationStatuses,
  organizationTypeLabel,
  type HospitalOrganization,
  type OrganizationVerificationDocument,
  type OrganizationVerificationStatus,
} from "@/lib/organization-management";

type OrganizationListResponse = {
  organizations: HospitalOrganization[];
  total: number;
  page: number;
  limit: number;
};

function statusStyle(status: OrganizationVerificationStatus) {
  if (status === "approved") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (status === "rejected") return "border-red-200 bg-red-50 text-red-800";
  return "border-amber-200 bg-amber-50 text-amber-800";
}

function StatusBadge({ status }: { status: OrganizationVerificationStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase ${statusStyle(status)}`}>
      {status}
    </span>
  );
}

function AccessError({ error }: { error: string }) {
  return (
    <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <p>{error}</p>
      {error.startsWith("Administrator access denied:") && (
        <p className="mt-1">This feature is restricted by the backend administrator allowlist.</p>
      )}
    </div>
  );
}

function OrganizationAddress({ organization }: { organization: HospitalOrganization }) {
  return [organization.address, organization.city, organization.state].filter(Boolean).join(", ") || "Not provided";
}

export function OrganizationManagementPage({
  initialStatus,
}: {
  initialStatus: OrganizationVerificationStatus;
}) {
  const user = useAdminUser();
  const [organizations, setOrganizations] = useState<HospitalOrganization[]>([]);
  const [status, setStatus] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    void requestAdminApi<OrganizationListResponse>(
      user,
      organizationListApiPath(status, page),
    ).then((response) => {
      if (!active) return;
      setOrganizations(response.organizations);
      setTotal(response.total);
      setError("");
    }).catch((loadError: unknown) => {
      if (!active) return;
      setOrganizations([]);
      setTotal(0);
      setError(loadError instanceof Error ? loadError.message : "Organizations could not be loaded.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [page, refreshKey, status, user]);

  const pageCount = organizationPageCount(total);
  const displayState = organizationQueueDisplayState({
    loading,
    error,
    count: organizations.length,
  });

  return (
    <AdminLayout activeNav="Organization Management">
      <AdminReviewAccess>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[#172033]">Organization management</h1>
            <p className="mt-1 text-sm text-[#5F6B7A]">Review hospital and clinic registrations. Decisions are authorized by the backend.</p>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setLoading(true);
              setError("");
              setRefreshKey((current) => current + 1);
            }}
            className="rounded-lg border border-[#D5D9D9] bg-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            Refresh organizations
          </button>
        </div>

        {error && <AccessError error={error} />}

        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-[#D5D9D9] bg-white p-4 sm:flex-row sm:items-end sm:justify-between">
          <p className="text-sm text-[#5F6B7A]">Organization contact and registration data is visible only through the authenticated admin API.</p>
          <label className="block text-sm font-medium text-[#344054]">
            Verification status
            <select
              value={status}
              onChange={(event) => {
                if (!isOrganizationStatus(event.target.value)) return;
                setLoading(true);
                setError("");
                setPage(1);
                setStatus(event.target.value);
              }}
              className="mt-1 h-11 min-w-48 rounded-lg border border-[#D5D9D9] bg-white px-3 text-sm"
            >
              {organizationStatuses.map((value) => (
                <option key={value} value={value}>{organizationTypeLabel(value)}</option>
              ))}
            </select>
          </label>
        </div>

        <p className="mb-3 text-sm text-[#5F6B7A]">
          {total} {status} organization{total === 1 ? "" : "s"} · Page {page} of {pageCount}
        </p>

        {displayState === "loading" ? (
          <div role="status" className="rounded-xl border border-[#D5D9D9] bg-white p-10 text-center text-sm text-[#5F6B7A]">
            Loading organizations…
          </div>
        ) : displayState === "error" ? (
          <div className="rounded-xl border border-[#D5D9D9] bg-white p-10 text-center text-sm text-[#5F6B7A]">
            Organizations could not be displayed.
            <button type="button" onClick={() => { setLoading(true); setError(""); setRefreshKey((current) => current + 1); }} className="ml-2 font-semibold text-[#146EB4] underline">Retry</button>
          </div>
        ) : displayState === "empty" ? (
          <div className="rounded-xl border border-dashed border-[#D5D9D9] bg-white p-10 text-center text-sm text-[#5F6B7A]">
            No {status} hospital or clinic registrations.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#D5D9D9] bg-white">
            <table className="min-w-[1150px] divide-y divide-[#E8ECEC] text-left text-sm">
              <thead className="bg-[#F7F7F7] text-[#5F6B7A]">
                <tr>
                  <th className="px-4 py-3 font-medium">Organization</th>
                  <th className="px-4 py-3 font-medium">Address</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Registration number</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Reviewed</th>
                  <th className="px-4 py-3 font-medium">Reviewer</th>
                  <th className="px-4 py-3 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8ECEC]">
                {organizations.map((organization) => (
                  <tr key={organization.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#172033]">{organization.name || "Name not provided"}</div>
                      <div className="text-xs text-[#5F6B7A]">{organizationTypeLabel(organization.organizationType)}</div>
                    </td>
                    <td className="max-w-64 px-4 py-3">{OrganizationAddress({ organization })}</td>
                    <td className="px-4 py-3">
                      <div>{organization.email || "Email not provided"}</div>
                      <div className="text-xs text-[#5F6B7A]">{organization.phone || "Phone not provided"}</div>
                    </td>
                    <td className="px-4 py-3">{organization.registrationNumber || "Not provided"}</td>
                    <td className="px-4 py-3"><StatusBadge status={organization.verificationStatus} /></td>
                    <td className="px-4 py-3">{formatOrganizationDate(organization.reviewedAt)}</td>
                    <td className="px-4 py-3">{organization.reviewedBy || "Not provided"}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/organizations/${encodeURIComponent(organization.id)}`}
                        className="rounded-lg border border-[#D5D9D9] px-3 py-2 text-sm font-medium hover:bg-[#F7F7F7]"
                      >
                        View details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            disabled={loading || page <= 1}
            onClick={() => { setLoading(true); setError(""); setPage((current) => Math.max(1, current - 1)); }}
            className="rounded-lg border border-[#D5D9D9] bg-white px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-[#5F6B7A]">Page {page} of {pageCount} · {ORGANIZATION_PAGE_SIZE} per page</span>
          <button
            type="button"
            disabled={loading || page >= pageCount}
            onClick={() => { setLoading(true); setError(""); setPage((current) => current + 1); }}
            className="rounded-lg border border-[#D5D9D9] bg-white px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </AdminReviewAccess>
    </AdminLayout>
  );
}

function verificationDocumentDetails(document: OrganizationVerificationDocument) {
  if (typeof document === "string") {
    return { label: document, url: document };
  }
  if (typeof document !== "object" || document === null) {
    return { label: "Verification document", url: "" };
  }
  return {
    label: document.name || document.fileName || document.url || document.downloadUrl || "Verification document",
    url: document.url || document.downloadUrl || "",
  };
}

function secureDocumentUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : "";
  } catch {
    return "";
  }
}

function DetailField({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-[#667085]">{label}</dt>
      <dd className="mt-1 break-words text-sm text-[#344054]">{value}</dd>
    </div>
  );
}

export function OrganizationDetailPage({ organizationId }: { organizationId: string }) {
  const user = useAdminUser();
  const [organization, setOrganization] = useState<HospitalOrganization | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    let active = true;
    void requestAdminApi<{ organization: HospitalOrganization }>(
      user,
      organizationDetailApiPath(organizationId),
    ).then((response) => {
      if (!active) return;
      setOrganization(response.organization);
      setError("");
    }).catch((loadError: unknown) => {
      if (!active) return;
      setError(loadError instanceof Error ? loadError.message : "Organization details could not be loaded.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [organizationId, user]);

  async function review(status: "approved" | "rejected") {
    let body: ReturnType<typeof createOrganizationReviewPayload>;
    try {
      body = createOrganizationReviewPayload(status, rejectionReason);
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : "Enter a rejection reason.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await requestAdminApi<{ organization: HospitalOrganization }>(
        user,
        organizationReviewApiPath(organizationId),
        { method: "PATCH", body: JSON.stringify(body) },
      );
      setOrganization(response.organization);
      setMessage(status === "approved" ? "Organization approved." : "Organization rejected.");
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : "The organization review could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  const documents = Array.isArray(organization?.verificationDocuments)
    ? organization.verificationDocuments
    : [];

  return (
    <AdminLayout activeNav="Organization Management">
      <AdminReviewAccess>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[#172033]">Organization details</h1>
            <p className="mt-1 text-sm text-[#5F6B7A]">Private registration details are loaded from the administrator-authorized backend API.</p>
          </div>
          <Link href="/organizations" className="rounded-lg border border-[#D5D9D9] bg-white px-4 py-2 text-sm font-semibold">
            Back to organizations
          </Link>
        </div>

        {error && <AccessError error={error} />}
        {message && <p role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}

        {loading ? (
          <div role="status" className="rounded-xl border border-[#D5D9D9] bg-white p-10 text-center text-sm text-[#5F6B7A]">Loading organization details…</div>
        ) : organization ? (
          <>
            <section className="rounded-xl border border-[#D5D9D9] bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-[#172033]">{organization.name}</h2>
                  <p className="mt-1 text-sm text-[#5F6B7A]">{organizationTypeLabel(organization.organizationType)}</p>
                </div>
                <StatusBadge status={organization.verificationStatus} />
              </div>

              <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <DetailField label="Organization name" value={organization.name} />
                <DetailField label="Organization type" value={organizationTypeLabel(organization.organizationType)} />
                <DetailField label="Address" value={OrganizationAddress({ organization })} />
                <DetailField label="Contact email" value={organization.email} />
                <DetailField label="Phone number" value={organization.phone} />
                <DetailField label="Registration number" value={organization.registrationNumber} />
                <DetailField label="Website" value={organization.website} />
                <DetailField label="Administrator" value={organization.adminName} />
                <DetailField label="Administrator designation" value={organization.adminDesignation} />
                <DetailField label="Submitted" value={formatOrganizationDate(organization.createdAt)} />
                <DetailField label="Verification date" value={formatOrganizationDate(organization.reviewedAt)} />
                <DetailField label="Reviewing administrator" value={organization.reviewedBy} />
              </dl>

              {organization.description && (
                <div className="mt-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[#667085]">Description</h3>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-[#344054]">{organization.description}</p>
                </div>
              )}
              {organization.facilities?.length ? (
                <div className="mt-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[#667085]">Facilities</h3>
                  <p className="mt-1 text-sm text-[#344054]">{organization.facilities.join(", ")}</p>
                </div>
              ) : null}
              {organization.reviewNote && (
                <div className="mt-5 rounded-lg border border-[#E8ECEC] bg-[#F7F7F7] p-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[#667085]">Review note</h3>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-[#344054]">{organization.reviewNote}</p>
                </div>
              )}
            </section>

            <section className="mt-4 rounded-xl border border-[#D5D9D9] bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-[#172033]">Verification documents</h2>
              {documents.length ? (
                <ul className="mt-3 space-y-2">
                  {documents.map((document, index) => {
                    const { label, url } = verificationDocumentDetails(document);
                    const safeUrl = secureDocumentUrl(url);
                    return (
                      <li key={`${label}-${index}`} className="rounded-lg border border-[#E8ECEC] px-3 py-2 text-sm">
                        {safeUrl ? (
                          <a href={safeUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-[#146EB4] underline">
                            {label}
                          </a>
                        ) : (
                          <span>{label}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-[#5F6B7A]">No verification documents were submitted with this registration.</p>
              )}
            </section>

            {organization.verificationStatus === "pending" && (
              <section className="mt-4 rounded-xl border border-[#D5D9D9] bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-[#172033]">Review application</h2>
                <p className="mt-1 text-sm text-[#5F6B7A]">Approval or rejection is enforced by the backend and recorded with the reviewer and timestamp.</p>
                <label className="mt-4 block text-sm font-medium text-[#344054]">
                  Rejection reason
                  <textarea
                    value={rejectionReason}
                    onChange={(event) => setRejectionReason(event.target.value)}
                    maxLength={1000}
                    rows={3}
                    placeholder="Required only when rejecting"
                    className="mt-1 w-full rounded-lg border border-[#D5D9D9] px-3 py-2 text-sm font-normal"
                  />
                </label>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void review("approved")}
                    className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {busy ? "Saving…" : "Approve organization"}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void review("rejected")}
                    className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {busy ? "Saving…" : "Reject organization"}
                  </button>
                </div>
              </section>
            )}
          </>
        ) : !error ? (
          <div className="rounded-xl border border-dashed border-[#D5D9D9] bg-white p-10 text-center text-sm text-[#5F6B7A]">Organization not found.</div>
        ) : null}
      </AdminReviewAccess>
    </AdminLayout>
  );
}
