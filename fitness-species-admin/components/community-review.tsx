"use client";

import { useEffect, useState } from "react";
import { AdminReviewAccess, useAdminUser } from "@/components/admin-auth";
import { AdminLayout } from "@/components/admin-portal";
import { requestAdminApi } from "@/lib/admin-api";

type ReviewStatus = "approved" | "rejected" | "changes_requested";
type OrganizerApplication = {
  firebaseUid: string;
  email: string;
  type: "organization" | "individual";
  organizationName: string;
  organizationType: string;
  contactName: string;
  phone: string;
  address: string;
  city: string;
  website: string;
  publicProfile: string;
  description: string;
  experience: string;
  status: string;
  submittedAt: string;
};
type CommunityEvent = {
  id: string;
  title: string;
  description: string;
  category: string;
  startAt: string;
  endAt: string;
  timeZone: string;
  venueName: string;
  address: string;
  city: string;
  pricingType: "free" | "paid";
  amount: number | null;
  currency: string;
  status: string;
  reviewNote: string | null;
  organizerUid: string;
  organizer: { name: string; type: string } | null;
};

type Tab = "organizers" | "events";

export function CommunityReviewPage() {
  const user = useAdminUser();
  const [tab, setTab] = useState<Tab>("organizers");
  const [organizers, setOrganizers] = useState<OrganizerApplication[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    const request = tab === "organizers"
      ? requestAdminApi<{ organizers: OrganizerApplication[] }>(user, "/api/community/admin/organizers?status=pending")
        .then((response) => {
          if (!active) return;
          setOrganizers(response.organizers);
          setError("");
        })
      : requestAdminApi<{ events: CommunityEvent[] }>(user, "/api/community/admin/events?status=pending_review")
        .then((response) => {
          if (!active) return;
          setEvents(response.events);
          setError("");
        });
    void request.catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "Community review queue could not be loaded.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [tab, user, reloadKey]);

  async function review(kind: Tab, id: string, status: ReviewStatus) {
    const reviewNote = notes[id]?.trim();
    if (status !== "approved" && (!reviewNote || reviewNote.length < 5)) {
      setError("Add a review note of at least 5 characters before requesting changes or rejecting.");
      return;
    }
    setBusy(id);
    setError("");
    setMessage("");
    try {
      const path = kind === "organizers"
        ? `/api/community/admin/organizers/${encodeURIComponent(id)}/review`
        : `/api/community/admin/events/${encodeURIComponent(id)}/review`;
      await requestAdminApi(user, path, {
        method: "PATCH",
        body: JSON.stringify({ status, ...(status === "approved" ? {} : { reviewNote }) }),
      });
      setMessage(status === "approved" ? "Approved successfully." : status === "rejected" ? "Rejected with feedback." : "Changes requested.");
      setReloadKey((current) => current + 1);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The review decision could not be saved.");
    } finally {
      setBusy("");
    }
  }

  return (
    <AdminLayout activeNav="Community Review">
      <AdminReviewAccess>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[#172033]">Community review</h1>
            <p className="mt-1 text-sm text-[#5F6B7A]">Review organizer applications and event submissions. Decisions are enforced by the backend.</p>
          </div>
          <button type="button" onClick={() => { setLoading(true); setError(""); setReloadKey((current) => current + 1); }} className="rounded-lg border border-[#D5D9D9] bg-white px-4 py-2 text-sm font-semibold">Refresh queue</button>
        </div>

        <div className="mb-5 flex gap-2 border-b border-[#D5D9D9]">
          <button type="button" onClick={() => { setLoading(true); setError(""); setMessage(""); setTab("organizers"); setReloadKey((current) => current + 1); }} className={`border-b-2 px-4 py-3 text-sm font-semibold ${tab === "organizers" ? "border-[#FF9900] text-[#172033]" : "border-transparent text-[#5F6B7A]"}`}>Organizer applications</button>
          <button type="button" onClick={() => { setLoading(true); setError(""); setMessage(""); setTab("events"); setReloadKey((current) => current + 1); }} className={`border-b-2 px-4 py-3 text-sm font-semibold ${tab === "events" ? "border-[#FF9900] text-[#172033]" : "border-transparent text-[#5F6B7A]"}`}>Event submissions</button>
        </div>

        {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {message && <p role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
        {loading ? <div role="status" className="rounded-lg border border-[#D5D9D9] bg-white p-8 text-center text-sm text-[#5F6B7A]">Loading review queue…</div> : tab === "organizers" ? (
          <div className="space-y-4">
            {organizers.map((application) => <OrganizerCard key={application.firebaseUid} application={application} note={notes[application.firebaseUid] || ""} busy={busy === application.firebaseUid} onNote={(value) => setNotes((current) => ({ ...current, [application.firebaseUid]: value }))} onReview={(status) => void review("organizers", application.firebaseUid, status)} />)}
            {!organizers.length && <EmptyQueue label="No organizer applications are pending." />}
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => <EventCard key={event.id} event={event} note={notes[event.id] || ""} busy={busy === event.id} onNote={(value) => setNotes((current) => ({ ...current, [event.id]: value }))} onReview={(status) => void review("events", event.id, status)} />)}
            {!events.length && <EmptyQueue label="No event submissions are pending." />}
          </div>
        )}
      </AdminReviewAccess>
    </AdminLayout>
  );
}

function OrganizerCard({
  application,
  note,
  busy,
  onNote,
  onReview,
}: {
  application: OrganizerApplication;
  note: string;
  busy: boolean;
  onNote: (value: string) => void;
  onReview: (status: ReviewStatus) => void;
}) {
  return (
    <article className="rounded-xl border border-[#D5D9D9] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="text-lg font-semibold text-[#172033]">{application.organizationName || application.contactName}</h2><p className="text-sm text-[#5F6B7A]">{application.type} · {application.organizationType || "Individual organizer"} · {application.email}</p></div>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Pending review</span>
      </div>
      <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
        <Info label="Contact" value={`${application.contactName} · ${application.phone}`} />
        <Info label="Location" value={[application.address, application.city].filter(Boolean).join(", ") || "Not provided"} />
        <Info label="Website / profile" value={[application.website, application.publicProfile].filter(Boolean).join(" · ") || "Not provided"} />
        <Info label="Submitted" value={new Date(application.submittedAt).toLocaleString()} />
        <Info label="About" value={application.description} />
        {application.experience && <Info label="Experience" value={application.experience} />}
      </div>
      <ReviewActions note={note} busy={busy} onNote={onNote} onReview={onReview} />
    </article>
  );
}

function EventCard({
  event,
  note,
  busy,
  onNote,
  onReview,
}: {
  event: CommunityEvent;
  note: string;
  busy: boolean;
  onNote: (value: string) => void;
  onReview: (status: ReviewStatus) => void;
}) {
  return (
    <article className="rounded-xl border border-[#D5D9D9] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="text-lg font-semibold text-[#172033]">{event.title}</h2><p className="text-sm text-[#5F6B7A]">{event.organizer?.name || "Organizer"} · {event.category} · {event.pricingType === "free" ? "Free" : `${event.currency} ${event.amount}`}</p></div>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Pending review</span>
      </div>
      <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
        <Info label="Schedule" value={`${new Date(event.startAt).toLocaleString("en-IN", { timeZone: event.timeZone })} – ${new Date(event.endAt).toLocaleString("en-IN", { timeZone: event.timeZone })} (${event.timeZone})`} />
        <Info label="Venue" value={[event.venueName, event.address, event.city].filter(Boolean).join(", ") || "Online"} />
        <Info label="Description" value={event.description} />
      </div>
      <ReviewActions note={note} busy={busy} onNote={onNote} onReview={onReview} />
    </article>
  );
}

function ReviewActions({
  note,
  busy,
  onNote,
  onReview,
}: {
  note: string;
  busy: boolean;
  onNote: (value: string) => void;
  onReview: (status: ReviewStatus) => void;
}) {
  return (
    <div className="mt-5 border-t border-[#E5E7EB] pt-4">
      <label className="mb-2 block text-xs font-semibold text-[#344054]">Review note (required for changes or rejection)
        <textarea value={note} onChange={(event) => onNote(event.target.value)} maxLength={1000} className="mt-2 min-h-20 w-full rounded-lg border border-[#D5D9D9] p-3 text-sm" />
      </label>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => onReview("approved")} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Approve</button>
        <button type="button" disabled={busy || note.trim().length < 5} onClick={() => onReview("changes_requested")} className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 disabled:opacity-50">Request changes</button>
        <button type="button" disabled={busy || note.trim().length < 5} onClick={() => onReview("rejected")} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-800 disabled:opacity-50">Reject</button>
        {busy && <span role="status" className="self-center text-xs text-[#5F6B7A]">Saving decision…</span>}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><span className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#667085]">{label}</span><p className="mt-1 whitespace-pre-wrap text-sm text-[#344054]">{value}</p></div>;
}

function EmptyQueue({ label }: { label: string }) {
  return <div className="rounded-xl border border-dashed border-[#D5D9D9] bg-white p-10 text-center text-sm text-[#5F6B7A]">{label}</div>;
}
