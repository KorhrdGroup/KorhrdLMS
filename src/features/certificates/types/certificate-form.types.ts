import type { CertificateDeliveryStatus, PaymentStatus } from "@/types/database.types";

export type CertificateUpdateInput = {
  actualPaymentAmount?: number;
  deliveryStatus?: CertificateDeliveryStatus;
  paymentStatus?: PaymentStatus;
  photoUrl?: string;
};

export type CertificateMutationResult =
  | { success: true; message: string }
  | {
      success: false;
      message: string;
      field?: keyof CertificateUpdateInput;
    };

export type CertificateDeleteResult =
  | { success: true; message: string }
  | { success: false; message: string };
