import {
  CERTIFICATE_APPLICATION_ACTIVE_SELECT,
  CERTIFICATE_APPLICATION_LIST_SELECT,
} from "@/features/certificate-applications/constants";
import { createClient } from "@/lib/supabase/server";
import type { CertificateDeliveryStatus, Database, PaymentStatus } from "@/types/database.types";

/**
 * 학생 "자격증발급신청" 화면의 Supabase 접근을 캡슐화하는 repository입니다.
 * (관리자 자격증신청관리는 `src/features/certificates`에서 별도로 관리합니다.)
 */
export type ActiveCertificateApplication = {
  id: string;
  courseId: string | null;
  deliveryStatus: CertificateDeliveryStatus;
};

type ActiveApplicationRow = {
  id: string;
  course_id: string | null;
  delivery_status: CertificateDeliveryStatus;
};

/** 회원의 특정 과정에 대한 "취소되지 않은" 자격증 신청 1건을 조회합니다(중복 신청 방지용). */
export async function findActiveCertificateApplication(
  memberId: string,
  courseId: string,
): Promise<ActiveCertificateApplication | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("certificate_applications")
    .select(CERTIFICATE_APPLICATION_ACTIVE_SELECT)
    .eq("member_id", memberId)
    .eq("course_id", courseId)
    .is("deleted_at", null)
    .neq("delivery_status", "canceled")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const row = data as ActiveApplicationRow;
  return { id: row.id, courseId: row.course_id, deliveryStatus: row.delivery_status };
}

/** 회원이 신청한 모든 자격증(취소되지 않은/취소된 건 모두 포함) 목록을 최신순으로 조회합니다. */
export async function listCertificateApplicationsByMember(memberId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("certificate_applications")
    .select(CERTIFICATE_APPLICATION_LIST_SELECT)
    .eq("member_id", memberId)
    .is("deleted_at", null)
    .order("applied_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as {
    id: string;
    course_id: string | null;
    certificate_name: string;
    payment_status: PaymentStatus;
    delivery_status: CertificateDeliveryStatus;
    postal_code: string | null;
    address: string | null;
    address_detail: string | null;
    applied_at: string;
    issued_at: string | null;
    created_at: string;
  }[];
}

export async function insertCertificateApplication(
  insert: Database["public"]["Tables"]["certificate_applications"]["Insert"],
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("certificate_applications")
    .insert(insert)
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id as string;
}
