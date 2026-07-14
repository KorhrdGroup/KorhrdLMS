import type { PaymentStatus } from "@/types/database.types";

export type PendingApplicantEditInput = {
  courseId: string;
  batch: string;
  managerName: string;
  paymentStatus: PaymentStatus;
  memo: string;
};

export type PendingApplicantEditResult =
  | { success: true; message: string }
  | {
      success: false;
      message: string;
      field?: keyof PendingApplicantEditInput;
    };
