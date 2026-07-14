import type { EnrollmentStatus, PaymentStatus } from "@/types/database.types";

import type { PendingApplicantSearchField } from "@/features/enrollments/constants";

export type ConfirmedStudentListItem = {
  id: string;
  year: number | null;
  batch: string | null;
  start_date: string;
  end_date: string;
  status: EnrollmentStatus;
  payment_status: PaymentStatus;
  application_date: string | null;
  created_at: string;
  manager_name: string | null;
  member: {
    id: string;
    name: string;
    login_id: string;
    phone: string | null;
    manager_name: string | null;
  };
  course: {
    id: string;
    name: string;
    code: string;
  };
};

export type ConfirmedStudentDetail = {
  id: string;
  year: number | null;
  batch: string | null;
  startDate: string;
  endDate: string;
  status: EnrollmentStatus;
  paymentStatus: PaymentStatus;
  applicationDate: string | null;
  createdAt: string;
  memo: string | null;
  managerName: string | null;
  member: {
    id: string;
    name: string;
    loginId: string;
    phone: string | null;
    email: string | null;
    managerName: string | null;
  };
  course: {
    id: string;
    name: string;
    code: string;
  };
  enrollmentHistory: ConfirmedStudentEnrollmentHistoryItem[];
};

export type ConfirmedStudentEnrollmentHistoryItem = {
  id: string;
  courseName: string;
  startDate: string;
  endDate: string;
  paymentStatus: PaymentStatus;
};

export type ConfirmedStudentFilterOptions = {
  courses: Array<{ id: string; name: string; code: string }>;
  years: number[];
  batches: string[];
};

export type ConfirmedStudentListQuery = {
  page: number;
  pageSize: number;
  search: string;
  field: PendingApplicantSearchField;
  courseId: string;
  year: string;
  batch: string;
  status: string;
};

export type GetConfirmedStudentDetailResult =
  | { success: true; student: ConfirmedStudentDetail }
  | { success: false; message: string };
