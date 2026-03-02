// lib/validations.js
import { z } from "zod";

// ────── Auth / Signup ──────
export const loginSchema = z.object({
  email: z.string().email("Invalid email address.").transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1, "Password is required."),
});

export const signupRequestSchema = z.object({
  name: z.string().min(1, "Name is required.").max(100),
  email: z.string().email("Invalid email address.").transform((v) => v.toLowerCase().trim()),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(["COORDINATOR", "LECTURER", "STAFF_REGISTRY"], {
    errorMap: () => ({ message: "Invalid role." }),
  }),
  requestedCenterId: z.string().optional().nullable(),
  requestedDesignation: z.string().optional().nullable(),
});

// ────── User Management ──────
export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required.").max(100),
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(["COORDINATOR", "LECTURER", "REGISTRY", "STAFF_REGISTRY"]),
  designation: z.string().optional().nullable(),
  centerId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  bankBranch: z.string().optional().nullable(),
  accountName: z.string().optional().nullable(),
  accountNumber: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password cannot be the same as current password.",
  path: ["newPassword"],
});

export const updateProfileSchema = z.object({
  newName: z.string().min(1, "Name is required.").max(100),
  newDesignation: z.string().optional().nullable(),
  newPhoneNumber: z.string().optional().nullable(),
  newBankName: z.string().optional().nullable(),
  newBankBranch: z.string().optional().nullable(),
  newAccountName: z.string().optional().nullable(),
  newAccountNumber: z.string().optional().nullable(),
});

// ────── Centers ──────
export const createCenterSchema = z.object({
  name: z.string().min(1, "Center name is required.").max(200),
  coordinatorId: z.string().min(1, "Coordinator is required."),
  departmentIds: z.array(z.string()).optional().default([]),
});

// ────── Departments ──────
export const createDepartmentSchema = z.object({
  name: z.string().min(1, "Department name is required.").max(200),
  centerId: z.string().min(1, "Center ID is required."),
});

// ────── Programs ──────
export const createProgramSchema = z.object({
  programCode: z.string().min(1, "Program code is required.").max(50),
  programTitle: z.string().min(1, "Program title is required.").max(200),
  programCategory: z.enum(["DIPLOMA", "UNDERGRADUATE", "POSTGRADUATE"]),
  departmentIds: z.array(z.string()).optional().default([]),
});

// ────── Courses ──────
export const createCourseSchema = z.object({
  courseCode: z.string().min(1, "Course code is required.").max(50),
  courseTitle: z.string().min(1, "Course title is required.").max(200),
  creditHours: z.number().positive("Credit hours must be positive."),
  level: z.enum(["LEVEL_100", "LEVEL_200", "LEVEL_300", "LEVEL_400", "LEVEL_500", "LEVEL_600"]),
  academicSemester: z.enum(["FIRST_SEMESTER", "SECOND_SEMESTER", "THIRD_SEMESTER"]),
  programId: z.string().min(1, "Program is required."),
});

// ────── Claims ──────
export const processClaimSchema = z.object({
  claimId: z.string().min(1, "Claim ID is required."),
  status: z.enum(["APPROVED", "REJECTED"]),
});

export const submitTeachingClaimSchema = z.object({
  centerId: z.string().min(1, "Center ID is required."),
  claimType: z.literal("TEACHING"),
  courseId: z.string().min(1, "Course is required."),
  teachingDate: z.string().or(z.date()),
  teachingStartTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)."),
  teachingEndTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)."),
  transportToTeachingFrom: z.string().optional().nullable(),
  transportToTeachingTo: z.string().optional().nullable(),
  transportToTeachingReturnFrom: z.string().optional().nullable(),
  transportToTeachingReturnTo: z.string().optional().nullable(),
});

// ────── Pagination ──────
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().min(1).max(200).default(50),
  search: z.string().optional().default(""),
});
