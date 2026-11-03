"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminReviewAccess, useAdminUser } from "@/components/admin-auth";
import { AdminLayout } from "@/components/admin-portal";
import { requestAdminApi } from "@/lib/admin-api";
import {
  DOCTOR_MANAGEMENT_PATH,
  DOCTOR_PAGE_SIZE,
  createDoctorActionLock,
  createDoctorReviewPayload,
  doctorAccessGuidance,
  doctorDetailSections,
  doctorDetailPath,
  doctorPageCount,
  doctorQueueDisplayState,
  doctorQueuePath,
  doctorStatuses,
  filterDoctorApplications,
  formatDoctorDate,
  getDoctorReviewActions,
  isDoctorStatus,
  type DoctorApplication,
  type DoctorReviewStatus,
  type DoctorStatus,
} from "@/lib/doctor-management";

type DoctorListResponse = {
  doctors: DoctorApplication[];
  count: number;
  total: number;
  page: number;
  limit: number;
};

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function statusStyle(status: DoctorStatus) {
  if (status === "approved") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (status === "rejected") return "border-red-200 bg-red-50 text-red-800";
  if (status === "pending_review") return "border-amber-200 bg-amber-50 text-amber-800";
  if (status === "suspended") return "border-slate-200 bg-slate-100 text-slate-700";
  return "border-blue-200 bg-blue-50 text-blue-800";
}

function AccessError({ error }: { error: string }) {
  const guidance = doctorAccessGuidance(error);
  return (
    <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <p>{error}</p>
      {guidance && <p className="mt-1">{guidance}</p>}
    </div>
  );
}

export function DoctorManagementPage({
  initialStatus,
  reviewedStatus,
}: {
  initialStatus: DoctorStatus;
  reviewedStatus?: DoctorReviewStatus;
}) {
  const user = useAdminUser();
  const [applications, setApplications] = useState<DoctorApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<DoctorStatus>(initialStatus);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    void requestAdminApi<DoctorListResponse>(
      user,
      `/api/admin/doctors?status=${status}&page=${page}&limit=${DOCTOR_PAGE_SIZE}`,
    ).then((response) => {
      if (!active) return;
      setApplications(response.doctors);
      setTotal(response.total);
    }).catch((loadError: unknown) => {
      if (!active) return;
      setApplications([]);
      setTotal(0);
      setError(loadError instanceof Error ? loadError.message : "The doctor queue could not be loaded.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [page, refreshKey, status, user]);

  const filteredApplications = filterDoctorApplications(applications, query);
  const pageCount = doctorPageCount(total, DOCTOR_PAGE_SIZE);
  const queueState = doctorQueueDisplayState({
    loading,
    error,
    filteredCount: filteredApplications.length,
  });
  const successMessage = reviewedStatus
    ? `Review saved. The application is now ${statusLabel(reviewedStatus)}. The ${statusLabel(status)} queue has been refreshed.`
    : "";

  return (
    <AdminLayout activeNav="Doctor Management">
      <AdminReviewAccess>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[#172033]">Doctor management</h1>
            <p className="mt-1 text-sm text-[#5F6B7A]">Review doctor applications using backend-authorized admin access.</p>
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
            Refresh queue
          </button>
        </div>

        {successMessage && <p role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{successMessage}</p>}
        {error && <AccessError error={error} />}

        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-[#D5D9D9] bg-white p-4 sm:flex-row sm:items-end">
          <label className="block flex-1 text-sm font-medium text-[#344054]">
            Search this page
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, specialty, registration number, clinic, qualification"
              className="mt-1 h-11 w-full rounded-lg border border-[#D5D9D9] px-3 text-sm font-normal"
            />
          </label>
          <label className="block text-sm font-medium text-[#344054]">
            Application status
            <select
              value={status}
              onChange={(event) => {
                if (!isDoctorStatus(event.target.value)) return;
                setLoading(true);
                setError("");
                setPage(1);
                setStatus(event.target.value);
              }}
              className="mt-1 h-11 min-w-48 rounded-lg border border-[#D5D9D9] bg-white px-3 text-sm"
            >
              {doctorStatuses.map((value) => <option key={value} value={value}>{statusLabel(value)}</option>)}
            </select>
          </label>
        </div>
        <p className="mb-3 text-sm text-[#5F6B7A]">
          {total} application{total === 1 ? "" : "s"} · Page {page} of {pageCount}. Search filters this page; the backend supports status and pagination filters only.
        </p>

        {queueState === "loading" ? (
          <div role="status" className="rounded-xl border border-[#D5D9D9] bg-white p-10 text-center text-sm text-[#5F6B7A]">Loading doctor applications…</div>
        ) : queueState === "error" ? (
          <div className="rounded-xl border border-[#D5D9D9] bg-white p-10 text-center text-sm text-[#5F6B7A]">
            Doctor applications could not be displayed.
            <button type="button" onClick={() => { setLoading(true); setError(""); setRefreshKey((current) => current + 1); }} className="ml-2 font-semibold text-[#146EB4] underline">Retry</button>
          </div>
        ) : queueState === "empty" ? (
          <div className="rounded-xl border border-dashed border-[#D5D9D9] bg-white p-10 text-center text-sm text-[#5F6B7A]">
            {applications.length === 0 ? "No doctor applications match this status." : "No applications on this page match your search."}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#D5D9D9] bg-white">
            <table className="min-w-[900px] divide-y divide-[#E8ECEC] text-left text-sm">
              <thead className="bg-[#F7F7F7] text-[#5F6B7A]">
                <tr>
                  <th className="px-4 py-3 font-medium">Doctor</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Registration (unverified)</th>
                  <th className="px-4 py-3 font-medium">Qualifications</th>
                  <th className="px-4 py-3 font-medium">Organization / clinic</th>
                  <th className="px-4 py-3 font-medium">Consultation</th>
                  <th className="px-4 py-3 font-medium">Application date</th>
                  <th className="px-4 py-3 font-medium">Account</th>
                  <th className="px-4 py-3 font-medium">Doctor verification</th>
                  <th className="px-4 py-3 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8ECEC]">
                {filteredApplications.map((application) => (
                  <tr key={application.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#172033]">{application.fullName || "Name not provided"}</div>
                      <div className="text-xs text-[#5F6B7A]">{application.primarySpecialty || "Specialty not provided"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#172033]">{application.source === "hospital" ? "Hospital/Clinic" : "Individual"}</div>
                    </td>
                    <td className="px-4 py-3">{application.professionalEmail || application.email || "Not provided"}</td>
                    <td className="px-4 py-3">{application.medicalRegistrationNumber || "Not provided"}</td>
                    <td className="px-4 py-3">{application.qualifications?.map((qualification) => (
                      typeof qualification === "string" ? qualification : qualification.qualification
                    )).join(", ") || "Not provided"}</td>
                    <td className="px-4 py-3">
                      <div>{application.organizationName || application.clinicName || "Not provided"}</div>
                      {application.source === "hospital" && (
                        <div className="mt-1 text-xs text-[#5F6B7A]">
                          Organization: {statusLabel(application.organizationVerificationStatus || "unknown")}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">{application.consultationMode || "Not provided"}</td>
                    <td className="px-4 py-3">{formatDoctorDate(application.submittedAt)}</td>
                    <td className="px-4 py-3">{application.accountStatus === "active" ? "Active" : "Inactive"}</td>
                    <td className="px-4 py-3"><StatusBadge status={application.status} /></td>
                    <td className="px-4 py-3">
                      <Link href={doctorDetailPath(application.id)} className="rounded-lg border border-[#D5D9D9] px-3 py-2 text-sm font-medium hover:bg-[#F7F7F7]">Review</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <button type="button" disabled={loading || page <= 1} onClick={() => { setLoading(true); setError(""); setPage((current) => Math.max(1, current - 1)); }} className="rounded-lg border border-[#D5D9D9] bg-white px-4 py-2 text-sm font-medium disabled:opacity-50">Previous</button>
          <span className="text-sm text-[#5F6B7A]">Page {page} of {pageCount}</span>
          <button type="button" disabled={loading || page >= pageCount} onClick={() => { setLoading(true); setError(""); setPage((current) => current + 1); }} className="rounded-lg border border-[#D5D9D9] bg-white px-4 py-2 text-sm font-medium disabled:opacity-50">Next</button>
        </div>
      </AdminReviewAccess>
    </AdminLayout>
  );
}

function StatusBadge({ status }: { status: DoctorStatus }) {
  return <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase ${statusStyle(status)}`}>{statusLabel(status)}</span>;
}

function Field({ label, value }: { label: string; value: string | number | undefined | null }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-[#667085]">{label}</dt>
      <dd className="mt-1 break-words text-sm text-[#344054]">{value}</dd>
    </div>
  );
}

function DoctorDetail({ doctorId }: { doctorId: string }) {
  const user = useAdminUser();
  const router = useRouter();
  const [doctor, setDoctor] = useState<DoctorApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [actionLock] = useState(createDoctorActionLock);

  useEffect(() => {
    let active = true;
    void requestAdminApi<{ doctor: DoctorApplication }>(
      user,
      `/api/admin/doctors/${encodeURIComponent(doctorId)}`,
    ).then((response) => {
      if (!active) return;
      setDoctor(response.doctor);
    }).catch((loadError: unknown) => {
      if (!active) return;
      setDoctor(null);
      setError(loadError instanceof Error ? loadError.message : "Doctor application could not be loaded.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [doctorId, refreshKey, user]);

  async function review(status: DoctorReviewStatus) {
    if (!doctor || busy) return;
    let payload: ReturnType<typeof createDoctorReviewPayload>;
    try {
      payload = createDoctorReviewPayload(doctor.status, status, reviewNote);
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : "Review details are invalid.");
      return;
    }

    const action = getDoctorReviewActions(doctor.status).find((candidate) => candidate.status === status);
    const actionLabel = action?.label || statusLabel(status);
    if (!window.confirm(`${actionLabel} for ${doctor.fullName}?`)) return;

    if (!actionLock.tryLock()) return;
    setBusy(true);
    setError("");
    try {
      const response = await requestAdminApi<{ doctor: DoctorApplication }>(
        user,
        `/api/admin/doctors/${encodeURIComponent(doctor.id)}/review`,
        { method: "PATCH", body: JSON.stringify(payload) },
      );
      if (!response.doctor?.id) throw new Error("The backend did not return the reviewed application.");
      router.push(doctorQueuePath(response.doctor.status, status));
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : "The review decision could not be saved.");
    } finally {
      actionLock.unlock();
      setBusy(false);
    }
  }

  if (loading) {
    return <AdminLayout activeNav="Doctor Management"><div role="status" className="rounded-xl border border-[#D5D9D9] bg-white p-10 text-center text-sm text-[#5F6B7A]">Loading doctor application…</div></AdminLayout>;
  }

  if (!doctor) {
    return (
      <AdminLayout activeNav="Doctor Management">
        {error ? <AccessError error={error} /> : <p role="status" className="rounded-lg border border-[#D5D9D9] bg-white p-6 text-sm text-[#5F6B7A]">Doctor application not found.</p>}
        {error && <button type="button" onClick={() => { setLoading(true); setError(""); setRefreshKey((current) => current + 1); }} className="rounded-lg border border-[#D5D9D9] bg-white px-4 py-2 text-sm font-medium">Retry</button>}
        <Link href={DOCTOR_MANAGEMENT_PATH} className="ml-3 text-sm font-medium text-[#146EB4] underline">Back to Doctor Management</Link>
      </AdminLayout>
    );
  }

  const actions = getDoctorReviewActions(doctor.status);
  const detailSections = doctorDetailSections(doctor);

  return (
    <AdminLayout activeNav="Doctor Management">
        <Link href={DOCTOR_MANAGEMENT_PATH} className="mb-4 inline-block text-sm text-[#5F6B7A]">← Back to Doctor Management</Link>
        {error && <AccessError error={error} />}
        <article className="rounded-xl border border-[#D5D9D9] bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E8ECEC] pb-5">
            <div>
              <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[#172033]">{doctor.fullName || "Doctor application"}</h1>
              <p className="mt-1 text-sm text-[#5F6B7A]">{doctor.primarySpecialty || "Specialty not provided"} · Application {doctor.id}</p>
            </div>
            <StatusBadge status={doctor.status} />
          </div>

          <div className="mt-5 space-y-7">
            <section>
              <h2 className="mb-3 text-lg font-semibold">Personal and professional details</h2>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {detailSections.personal.map((field) => <Field key={field.label} {...field} />)}
              </dl>
            </section>

            <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h2 className="text-lg font-semibold text-amber-950">Registration and qualifications — not independently verified</h2>
              <p className="mt-1 text-sm text-amber-900">These details were submitted by the applicant. The API does not verify registration or credentials.</p>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                {detailSections.registration.map((field) => <Field key={field.label} {...field} />)}
              </dl>
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-amber-950">Qualifications (application-provided)</h3>
                {doctor.qualifications?.length ? (
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-950">
                    {doctor.qualifications.map((qualification, index) => (
                      <li key={`${typeof qualification === "string" ? qualification : qualification.qualification}-${index}`}>
                        {typeof qualification === "string"
                          ? qualification
                          : `${qualification.qualification} — ${qualification.institution}${qualification.graduationYear ? ` (${qualification.graduationYear})` : ""}`}
                      </li>
                    ))}
                  </ul>
                ) : <p className="mt-2 text-sm text-amber-900">Not provided</p>}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold">Specialties</h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                {detailSections.specialties.map((field) => <Field key={field.label} {...field} />)}
              </dl>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold">Clinic or hospital</h2>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {detailSections.clinic.map((field) => <Field key={field.label} {...field} />)}
              </dl>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold">Availability and consultation terms</h2>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {detailSections.availability.map((field) => <Field key={field.label} {...field} />)}
              </dl>
              {doctor.breaks?.length ? (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-[#344054]">Breaks</h3>
                  <ul className="mt-1 list-inside list-disc text-sm text-[#5F6B7A]">
                    {doctor.breaks.map((breakTime, index) => <li key={`${breakTime.startTime}-${breakTime.endTime}-${index}`}>{breakTime.startTime}–{breakTime.endTime}</li>)}
                  </ul>
                </div>
              ) : null}
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold">Application and review history</h2>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {detailSections.review.map((field) => <Field key={field.label} {...field} />)}
              </dl>
              {doctor.reviewHistory?.length ? (
                <ol className="mt-4 space-y-3">
                  {doctor.reviewHistory.map((entry, index) => (
                    <li key={`${entry.decision}-${String(entry.reviewedAt)}-${index}`} className="rounded-lg border border-[#E8ECEC] bg-[#F7F7F7] p-3 text-sm">
                      <p className="font-semibold capitalize">{statusLabel(entry.decision)} · {formatDoctorDate(entry.reviewedAt)}</p>
                      {entry.note && <p className="mt-1 whitespace-pre-wrap text-[#5F6B7A]">Note: {entry.note}</p>}
                      {entry.reviewerUid && <p className="mt-1 text-xs text-[#667085]">Reviewer UID: {entry.reviewerUid}</p>}
                    </li>
                  ))}
                </ol>
              ) : <p className="mt-2 text-sm text-[#5F6B7A]">No review history returned.</p>}
            </section>
          </div>

          {actions.length > 0 && (
            <section className="mt-7 border-t border-[#E8ECEC] pt-5">
              <h2 className="text-lg font-semibold">Review decision</h2>
              <label className="mt-3 block text-sm font-medium text-[#344054]">
                Review note (required for rejection, changes requested, and suspension)
                <textarea
                  value={reviewNote}
                  onChange={(event) => setReviewNote(event.target.value)}
                  maxLength={1000}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-[#D5D9D9] p-3 text-sm font-normal"
                />
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {actions.map((action) => (
                  <button
                    key={action.status}
                    type="button"
                    disabled={busy || (action.requiresNote && !reviewNote.trim())}
                    onClick={() => void review(action.status)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${action.status === "rejected" || action.status === "suspended" ? "bg-red-700" : action.status === "changes_requested" ? "bg-amber-700" : "bg-emerald-700"}`}
                  >
                    {busy ? "Saving…" : action.label}
                  </button>
                ))}
                {busy && <span role="status" className="self-center text-sm text-[#5F6B7A]">Saving review decision…</span>}
              </div>
            </section>
          )}
          {actions.length === 0 && <p className="mt-6 border-t border-[#E8ECEC] pt-4 text-sm text-[#5F6B7A]">No review action is available for this application status.</p>}
        </article>
    </AdminLayout>
  );
}

export function DoctorDetailPage({ doctorId }: { doctorId: string }) {
  return <AdminReviewAccess><DoctorDetail key={doctorId} doctorId={doctorId} /></AdminReviewAccess>;
}
