export const DOCTOR_MANAGEMENT_PATH = "/doctors";
export const DOCTOR_PAGE_SIZE = 25;
export const DOCTOR_MANAGEMENT_NAV_ITEM = {
  label: "Doctor Management",
  href: DOCTOR_MANAGEMENT_PATH,
} as const;

export const doctorStatuses = [
  "draft",
  "pending_review",
  "changes_requested",
  "approved",
  "rejected",
  "suspended",
] as const;

export type DoctorStatus = (typeof doctorStatuses)[number];
export type DoctorReviewStatus = "approved" | "rejected" | "changes_requested" | "suspended";

export type DoctorQualification = string | {
  qualification: string;
  institution: string;
  graduationYear?: number;
};

export type DoctorReviewHistoryEntry = {
  decision: DoctorReviewStatus;
  note: string | null;
  reviewerUid?: string;
  reviewedAt: string | Date;
};

export type DoctorApplication = {
  id: string;
  fullName: string;
  email?: string | null;
  profilePhotoUrl?: string | null;
  professionalEmail?: string | null;
  phone?: string;
  medicalRegistrationNumber?: string;
  medicalCouncil?: string;
  qualifications?: DoctorQualification[];
  primarySpecialty?: string;
  additionalSpecialties?: string[];
  yearsExperience?: number;
  clinicName?: string;
  clinicAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  consultationMode?: "online" | "offline" | "both";
  workingDays?: string[];
  openingTime?: string;
  closingTime?: string;
  timeZone?: string;
  breaks?: Array<{ startTime: string; endTime: string }>;
  appointmentDurationMinutes?: number;
  dailyAppointmentLimit?: number;
  consultationFee?: number;
  currency?: string;
  status: DoctorStatus;
  createdAt?: string | Date | null;
  submittedAt?: string | Date | null;
  updatedAt?: string | Date | null;
  reviewNote?: string | null;
  reviewedAt?: string | Date | null;
  approvedAt?: string | Date | null;
  suspendedAt?: string | Date | null;
  reviewHistory?: DoctorReviewHistoryEntry[];
  source?: "individual" | "hospital";
  organizationName?: string | null;
  organizationVerificationStatus?: string;
  accountStatus?: "active" | "inactive";
};

export type DoctorReviewAction = {
  status: DoctorReviewStatus;
  label: string;
  requiresNote: boolean;
};

export type DoctorQueueDisplayState = "loading" | "error" | "empty" | "results";

const reviewActionsByStatus: Record<DoctorStatus, DoctorReviewAction[]> = {
  draft: [],
  pending_review: [
    { status: "approved", label: "Approve application", requiresNote: false },
    { status: "changes_requested", label: "Request changes", requiresNote: true },
    { status: "rejected", label: "Reject application", requiresNote: true },
  ],
  changes_requested: [],
  approved: [
    { status: "suspended", label: "Suspend doctor", requiresNote: true },
  ],
  rejected: [],
  suspended: [
    { status: "approved", label: "Reinstate doctor", requiresNote: false },
  ],
};

export function getDoctorReviewActions(status: DoctorStatus) {
  return reviewActionsByStatus[status];
}

export function createDoctorReviewPayload(
  currentStatus: DoctorStatus,
  status: DoctorReviewStatus,
  note: string,
) {
  const action = getDoctorReviewActions(currentStatus).find((candidate) => candidate.status === status);
  if (!action) {
    throw new Error(`The ${status.replaceAll("_", " ")} action is not available for a ${currentStatus.replaceAll("_", " ")} application.`);
  }
  const reviewNote = note.trim();
  if (action.requiresNote && !reviewNote) {
    throw new Error("A review note is required for this decision.");
  }
  if (reviewNote.length > 1000) {
    throw new Error("Review notes must be 1000 characters or fewer.");
  }
  return {
    status,
    ...(action.requiresNote ? { reviewNote } : {}),
  };
}

export function doctorDetailPath(id: string) {
  return `${DOCTOR_MANAGEMENT_PATH}/${encodeURIComponent(id)}`;
}

export function doctorQueuePath(status: DoctorStatus, reviewed?: DoctorReviewStatus) {
  const query = new URLSearchParams({ status });
  if (reviewed) query.set("reviewed", reviewed);
  return `${DOCTOR_MANAGEMENT_PATH}?${query.toString()}`;
}

export function isDoctorStatus(value: string | undefined): value is DoctorStatus {
  return doctorStatuses.some((status) => status === value);
}

export function isDoctorReviewStatus(value: string | undefined): value is DoctorReviewStatus {
  return value === "approved"
    || value === "rejected"
    || value === "changes_requested"
    || value === "suspended";
}

export function filterDoctorApplications(
  applications: DoctorApplication[],
  query: string,
) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return applications;
  return applications.filter((application) => {
    const searchable = [
      application.fullName,
      application.professionalEmail,
      application.email,
      application.primarySpecialty,
      application.medicalRegistrationNumber,
      application.clinicName,
      application.organizationName,
      ...(application.qualifications || []).flatMap((qualification) => (
        typeof qualification === "string"
          ? [qualification]
          : [qualification.qualification, qualification.institution]
      )),
    ].filter(Boolean).join(" ").toLocaleLowerCase();
    return searchable.includes(normalizedQuery);
  });
}

export function doctorPageCount(total: number, pageSize = DOCTOR_PAGE_SIZE) {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function doctorQueueDisplayState({
  loading,
  error,
  filteredCount,
}: {
  loading: boolean;
  error: string;
  filteredCount: number;
}): DoctorQueueDisplayState {
  if (loading) return "loading";
  if (error) return "error";
  return filteredCount === 0 ? "empty" : "results";
}

export function formatDoctorDate(value?: string | Date | null) {
  if (!value) return "Not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Invalid date" : date.toLocaleString();
}

export function doctorAccessGuidance(error: string) {
  if (error.startsWith("Authentication required:")) {
    return "Your Firebase session may have expired. Sign in again and retry.";
  }
  if (error.startsWith("Administrator access denied:")) {
    return "The backend did not authorize this account. Doctor review access is controlled by the backend administrator allowlist.";
  }
  return "";
}

export function doctorDetailSections(doctor: DoctorApplication) {
  return {
    personal: [
      { label: "Full name", value: doctor.fullName },
      { label: "Source", value: doctor.source === "hospital" ? "Hospital/Clinic" : "Individual" },
      { label: "Account status", value: doctor.accountStatus === "active" ? "Active" : doctor.accountStatus === "inactive" ? "Inactive" : undefined },
      { label: "Profile photo URL", value: doctor.profilePhotoUrl },
      { label: "Email", value: doctor.professionalEmail || doctor.email },
      { label: "Phone", value: doctor.phone },
      { label: "Application created", value: formatDoctorDate(doctor.createdAt) },
      { label: "Submitted", value: formatDoctorDate(doctor.submittedAt) },
      { label: "Last updated", value: formatDoctorDate(doctor.updatedAt) },
    ],
    registration: [
      { label: "Medical registration number", value: doctor.medicalRegistrationNumber },
      { label: "Issuing medical council", value: doctor.medicalCouncil },
      { label: "Years of experience", value: doctor.yearsExperience },
    ],
    specialties: [
      { label: "Primary specialty", value: doctor.primarySpecialty },
      { label: "Additional specialties", value: doctor.additionalSpecialties?.join(", ") },
    ],
    clinic: [
      { label: "Clinic / hospital name", value: doctor.clinicName },
      { label: "Organization name", value: doctor.organizationName },
      { label: "Organization verification status", value: doctor.organizationVerificationStatus },
      { label: "Address", value: doctor.clinicAddress },
      { label: "City", value: doctor.city },
      { label: "State", value: doctor.state },
      { label: "Postal code", value: doctor.postalCode },
      { label: "Consultation mode", value: doctor.consultationMode },
    ],
    availability: [
      { label: "Working days", value: doctor.workingDays?.join(", ") },
      {
        label: "Working hours",
        value: doctor.openingTime && doctor.closingTime
          ? `${doctor.openingTime}–${doctor.closingTime}`
          : undefined,
      },
      { label: "Time zone", value: doctor.timeZone },
      { label: "Appointment duration (minutes)", value: doctor.appointmentDurationMinutes },
      { label: "Daily appointment limit", value: doctor.dailyAppointmentLimit },
      {
        label: "Consultation fee",
        value: doctor.consultationFee === undefined
          ? undefined
          : `${doctor.currency || ""} ${doctor.consultationFee}`.trim(),
      },
    ],
    review: [
      { label: "Current review note", value: doctor.reviewNote },
      {
        label: "Last reviewed",
        value: doctor.reviewedAt ? formatDoctorDate(doctor.reviewedAt) : undefined,
      },
      {
        label: "Approved at",
        value: doctor.approvedAt ? formatDoctorDate(doctor.approvedAt) : undefined,
      },
      {
        label: "Suspended at",
        value: doctor.suspendedAt ? formatDoctorDate(doctor.suspendedAt) : undefined,
      },
    ],
  };
}

export function createDoctorActionLock() {
  let locked = false;
  return {
    tryLock() {
      if (locked) return false;
      locked = true;
      return true;
    },
    unlock() {
      locked = false;
    },
  };
}
