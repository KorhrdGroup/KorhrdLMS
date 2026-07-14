import type { PaymentStatus } from "@/types/database.types";

export type PendingApplicantRegistrationInput = {
  memberId: string;
  courseId: string;
  batch: string;
  startDate: string;
  endDate: string;
  paymentStatus: PaymentStatus;
  managerName: string;
  memo: string;
};

export type PendingApplicantRegistrationResult =
  | { success: true; enrollmentId: string; message: string }
  | {
      success: false;
      message: string;
      field?: keyof PendingApplicantRegistrationInput;
    };

export type PendingApplicantRegistrationMemberOption = {
  id: string;
  name: string;
  loginId: string;
  managerName: string;
};

export type PendingApplicantRegistrationCourseOption = {
  id: string;
  name: string;
  code: string;
};

export type PendingApplicantRegistrationOptions = {
  members: PendingApplicantRegistrationMemberOption[];
  courses: PendingApplicantRegistrationCourseOption[];
};
