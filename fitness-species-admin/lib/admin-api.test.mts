import assert from "node:assert/strict";
import test from "node:test";
import {
  adminApiErrorMessage,
  isAllowedProductImageUrl,
  productImage,
  type MarketplaceProduct,
} from "./admin-api.ts";
import {
  createDoctorActionLock,
  createDoctorReviewPayload,
  doctorAccessGuidance,
  doctorDetailSections,
  doctorDetailPath,
  DOCTOR_MANAGEMENT_NAV_ITEM,
  doctorPageCount,
  doctorQueueDisplayState,
  doctorQueuePath,
  filterDoctorApplications,
  getDoctorReviewActions,
  type DoctorApplication,
} from "./doctor-management.ts";
import {
  createOrganizationReviewPayload,
  organizationDetailApiPath,
  organizationListApiPath,
  organizationPageCount,
  organizationQueueDisplayState,
  organizationReviewApiPath,
} from "./organization-management.ts";

const decathlonImage =
  "https://contents.mediadecathlon.com/p1899141/682c88daaeb6785c264ccc027406ea84/p1899141.jpg?format=auto&quality=70&f=969x0";
const indiaMartImage =
  "https://5.imimg.com/data5/WHATSAPP/Default/2024/3/402239152/JL/TB/NV/4289864/new-product-1000x1000.jpeg";
const firebaseStorageImage =
  "https://firebasestorage.googleapis.com/v0/b/sellerportal-2786c.firebasestorage.app/o/sellers%2Fseller-1%2Fproducts%2F123e4567-e89b-42d3-a456-426614174000.webp?alt=media&token=test-image-token";

function product(images?: string[]): MarketplaceProduct {
  return {
    id: "test-product",
    name: "Test product",
    category: "Test",
    price: 10,
    stock: 1,
    status: "pending",
    sellerId: "test-seller",
    images,
  };
}

test("selects product URLs from supported providers", () => {
  assert.equal(productImage(product([decathlonImage])), decathlonImage);
  assert.equal(productImage(product([indiaMartImage])), indiaMartImage);
  assert.equal(productImage(product([firebaseStorageImage])), firebaseStorageImage);
});

test("skips malformed and unsupported product URLs", () => {
  assert.equal(productImage(product(["not a URL", "http://5.imimg.com/data5/image.jpg"])), "");
  assert.equal(
    isAllowedProductImageUrl("https://5.imimg.com/other/image.jpg"),
    false,
  );
  assert.equal(
    isAllowedProductImageUrl("https://untrusted.example/data5/image.jpg"),
    false,
  );
  assert.equal(
    isAllowedProductImageUrl(firebaseStorageImage.replace("sellerportal-2786c.firebasestorage.app", "untrusted.example")),
    false,
  );
});

test("returns the first valid URL and handles missing image arrays", () => {
  assert.equal(
    productImage(product(["https://untrusted.example/image.jpg", indiaMartImage])),
    indiaMartImage,
  );
  assert.equal(productImage(product([])), "");
  assert.equal(productImage(product()), "");
});

test("organization management API paths encode identifiers and status filters", () => {
  assert.equal(
    organizationListApiPath("pending", 2),
    "/api/doctor-portal/admin/organizations?status=pending&page=2&limit=25",
  );
  assert.equal(
    organizationListApiPath("approved", 1, 50),
    "/api/doctor-portal/admin/organizations?status=approved&page=1&limit=50",
  );
  assert.equal(organizationDetailApiPath("org/id"), "/api/doctor-portal/admin/organizations/org%2Fid");
  assert.equal(organizationReviewApiPath("organization-1"), "/api/doctor-portal/admin/organizations/organization-1/review");
});

test("organization review requires a rejection reason and bounds the backend payload", () => {
  assert.deepEqual(createOrganizationReviewPayload("approved"), { status: "approved" });
  assert.deepEqual(
    createOrganizationReviewPayload("rejected", "  Registration could not be verified.  "),
    { status: "rejected", reviewNote: "Registration could not be verified." },
  );
  assert.throws(() => createOrganizationReviewPayload("rejected", "  "), /reason is required/i);
  assert.throws(() => createOrganizationReviewPayload("rejected", "x".repeat(1001)), /1000 characters/i);
});

test("organization queue pagination and display states handle empty and failed queues", () => {
  assert.equal(organizationPageCount(0), 1);
  assert.equal(organizationPageCount(26), 2);
  assert.equal(organizationQueueDisplayState({ loading: true, error: "", count: 0 }), "loading");
  assert.equal(organizationQueueDisplayState({ loading: false, error: "Denied", count: 0 }), "error");
  assert.equal(organizationQueueDisplayState({ loading: false, error: "", count: 0 }), "empty");
  assert.equal(organizationQueueDisplayState({ loading: false, error: "", count: 1 }), "results");
});

function doctorApplication(overrides: Partial<DoctorApplication> = {}): DoctorApplication {
  return {
    id: "doctor-1",
    fullName: "Dr. Example",
    primarySpecialty: "Cardiology",
    medicalRegistrationNumber: "REG-12345",
    clinicName: "Fitness Clinic",
    qualifications: [{ qualification: "MBBS", institution: "Example University" }],
    status: "pending_review",
    ...overrides,
  };
}

test("doctor navigation paths encode application IDs and review queue state", () => {
  assert.deepEqual(DOCTOR_MANAGEMENT_NAV_ITEM, {
    label: "Doctor Management",
    href: "/doctors",
  });
  assert.equal(doctorDetailPath("doctor/id"), "/doctors/doctor%2Fid");
  assert.equal(
    doctorQueuePath("approved", "approved"),
    "/doctors?status=approved&reviewed=approved",
  );
});

test("doctor queue search filters supported application details on the current page", () => {
  const doctors = [
    doctorApplication(),
    doctorApplication({
      id: "doctor-2",
      fullName: "Dr. Another",
      primarySpecialty: "Pediatrics",
      medicalRegistrationNumber: "REG-67890",
      clinicName: "Other Clinic",
      qualifications: [{ qualification: "MD", institution: "North College" }],
    }),
  ];
  assert.deepEqual(filterDoctorApplications(doctors, "  REG-12345 "), [doctors[0]]);
  assert.deepEqual(filterDoctorApplications(doctors, "north college"), [doctors[1]]);
  const hospitalApplication = doctorApplication({
    id: "hospital-doctor",
    email: "doctor@north-hospital.example",
    organizationName: "North Hospital",
    qualifications: ["MBBS", "MD"],
  });
  assert.deepEqual(filterDoctorApplications([hospitalApplication], "north hospital"), [hospitalApplication]);
  assert.deepEqual(filterDoctorApplications([hospitalApplication], "doctor@north"), [hospitalApplication]);
  assert.deepEqual(filterDoctorApplications([hospitalApplication], "mbbs"), [hospitalApplication]);
  assert.deepEqual(filterDoctorApplications(doctors, ""), doctors);
});

test("doctor queue pagination and review actions follow the backend transitions", () => {
  assert.equal(doctorPageCount(0), 1);
  assert.equal(doctorPageCount(26), 2);
  assert.deepEqual(
    getDoctorReviewActions("pending_review").map(({ status }) => status),
    ["approved", "changes_requested", "rejected"],
  );
  assert.deepEqual(
    getDoctorReviewActions("approved").map(({ status }) => status),
    ["suspended"],
  );
  assert.deepEqual(
    getDoctorReviewActions("suspended").map(({ status }) => status),
    ["approved"],
  );
  assert.deepEqual(getDoctorReviewActions("rejected"), []);
});

test("doctor queue exposes loading, error, empty, and result states", () => {
  assert.equal(doctorQueueDisplayState({
    loading: true,
    error: "",
    filteredCount: 0,
  }), "loading");
  assert.equal(doctorQueueDisplayState({
    loading: false,
    error: "Backend unavailable",
    filteredCount: 0,
  }), "error");
  assert.equal(doctorQueueDisplayState({
    loading: false,
    error: "",
    filteredCount: 0,
  }), "empty");
  assert.equal(doctorQueueDisplayState({
    loading: false,
    error: "",
    filteredCount: 1,
  }), "results");
});

test("doctor detail view model includes the backend application, availability, and audit fields", () => {
  const sections = doctorDetailSections(doctorApplication({
    professionalEmail: "doctor@example.test",
    phone: "+1-555-0100",
    medicalCouncil: "State Medical Council",
    yearsExperience: 12,
    additionalSpecialties: ["Internal Medicine"],
    clinicAddress: "1 Main Street",
    city: "Pune",
    state: "MH",
    postalCode: "411001",
    consultationMode: "both",
    workingDays: ["monday", "tuesday"],
    openingTime: "09:00",
    closingTime: "17:00",
    timeZone: "Asia/Kolkata",
    appointmentDurationMinutes: 30,
    dailyAppointmentLimit: 20,
    consultationFee: 500,
    currency: "INR",
    reviewNote: "Please clarify the registration details.",
  }));
  assert.ok(sections.personal.some(({ label, value }) => label === "Email" && value === "doctor@example.test"));
  assert.ok(sections.registration.some(({ label, value }) => label === "Issuing medical council" && value === "State Medical Council"));
  assert.ok(sections.specialties.some(({ label, value }) => label === "Additional specialties" && value === "Internal Medicine"));
  assert.ok(sections.clinic.some(({ label, value }) => label === "Clinic / hospital name" && value === "Fitness Clinic"));
  assert.ok(sections.availability.some(({ label, value }) => label === "Working hours" && value === "09:00–17:00"));
  assert.ok(sections.availability.some(({ label, value }) => label === "Consultation fee" && value === "INR 500"));
  assert.ok(sections.review.some(({ label, value }) => label === "Current review note" && value === "Please clarify the registration details."));
});

test("doctor review payloads match backend validation and require notes where needed", () => {
  assert.deepEqual(createDoctorReviewPayload("pending_review", "approved", ""), {
    status: "approved",
  });
  assert.deepEqual(
    createDoctorReviewPayload("pending_review", "rejected", "  Incorrect details  "),
    { status: "rejected", reviewNote: "Incorrect details" },
  );
  assert.deepEqual(
    createDoctorReviewPayload("pending_review", "changes_requested", "Please clarify registration"),
    { status: "changes_requested", reviewNote: "Please clarify registration" },
  );
  assert.deepEqual(
    createDoctorReviewPayload("approved", "suspended", "Registration needs further review"),
    { status: "suspended", reviewNote: "Registration needs further review" },
  );
  assert.throws(
    () => createDoctorReviewPayload("pending_review", "rejected", "  "),
    /review note is required/i,
  );
  assert.throws(
    () => createDoctorReviewPayload("approved", "rejected", "Not supported"),
    /not available/i,
  );
  assert.throws(
    () => createDoctorReviewPayload("approved", "suspended", "x".repeat(1001)),
    /1000 characters/i,
  );
});

test("doctor review action lock prevents duplicate submissions until the request finishes", () => {
  const lock = createDoctorActionLock();
  assert.equal(lock.tryLock(), true);
  assert.equal(lock.tryLock(), false);
  lock.unlock();
  assert.equal(lock.tryLock(), true);
  lock.unlock();
});

test("doctor access errors distinguish expired sessions from backend admin denial", () => {
  assert.match(
    doctorAccessGuidance("Authentication required: token expired"),
    /sign in again/i,
  );
  assert.match(
    doctorAccessGuidance("Administrator access denied: not authorized"),
    /backend administrator allowlist/i,
  );
  assert.equal(doctorAccessGuidance("Backend unavailable"), "");
});

test("admin API failures preserve clear 401, 403, and general error messages", () => {
  assert.equal(
    adminApiErrorMessage(401, "Send a Firebase ID token."),
    "Authentication required: Send a Firebase ID token.",
  );
  assert.equal(
    adminApiErrorMessage(403, "Administrator access is not authorized."),
    "Administrator access denied: Administrator access is not authorized.",
  );
  assert.equal(adminApiErrorMessage(503, "Backend unavailable"), "Backend unavailable");
});
