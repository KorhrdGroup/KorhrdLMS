import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CheckoutBoard } from "@/components/enrollment/CheckoutBoard";
import { getPaymentForCheckout } from "@/features/payments/services/payment.service";
import { getMockableStudentMember } from "@/lib/mock-auth-server";

export const metadata: Metadata = {
  title: "결제하기",
  description: "한평생직업훈련 수강료 결제",
};

type PageProps = {
  params: Promise<{ paymentId: string }>;
};

export default async function CheckoutPage({ params }: PageProps) {
  const { paymentId } = await params;
  const member = await getMockableStudentMember();

  if (!member) {
    redirect(`/login?redirect=/enrollment/checkout/${paymentId}`);
  }

  const payment = await getPaymentForCheckout(paymentId, member.id);

  return <CheckoutBoard payment={payment} />;
}
