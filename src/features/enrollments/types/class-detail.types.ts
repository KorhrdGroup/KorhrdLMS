import type { EnrollmentStatus, PaymentStatus } from "@/types/database.types";

export type ClassAssignedStudent = {
  id: string;
  memberName: string;
  loginId: string;
  status: EnrollmentStatus;
  paymentStatus: PaymentStatus;
};

export type ClassDetail = {
  id: string;
  courseId: string;
  courseName: string;
  year: number;
  batchName: string;
  managerName: string | null;
  applicationPeriodStart: string | null;
  applicationPeriodEnd: string | null;
  enrollmentPeriodStart: string;
  enrollmentPeriodEnd: string;
  createdAt: string;
  students: ClassAssignedStudent[];
};

export type GetClassDetailResult =
  | { success: true; classDetail: ClassDetail }
  | { success: false; message: string };
