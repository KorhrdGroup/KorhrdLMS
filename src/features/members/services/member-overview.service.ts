import { getEnrollmentRecordsForMember } from "@/features/enrollments/services/enrollment-record-list.service";
import type { EnrollmentRecordListItem } from "@/features/enrollments/types/enrollment.types";
import { getGradeRecordsForMember } from "@/features/grades/services/grade-list.service";
import type { GradeListItem } from "@/features/grades/types/grade.types";
import type { CourseOption } from "@/features/members/components/member-enrollments-panel";
import { getMemberDetail } from "@/features/members/services/member-detail.service";
import type { MemberDetail } from "@/features/members/types/member-detail.types";
import { createClient } from "@/lib/supabase/server";
import type {
  CoursePaymentStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/types/database.types";

/** 회원 팝업(전체 보기)의 결제내역 한 줄 */
export type MemberPaymentItem = {
  id: string;
  paymentDate: string;
  courseName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: CoursePaymentStatus;
};

/** 회원 팝업 결제내역 탭 — 자격증 발급신청의 결제상태 한 줄 */
export type MemberCertPaymentItem = {
  id: string;
  certificateName: string;
  amount: number;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus;
  appliedAt: string;
};

/** 회원 팝업(전체 보기)의 시험 응시 한 줄 */
export type MemberExamItem = {
  id: string;
  examName: string;
  courseName: string;
  score: number;
  totalScore: number;
  isPassed: boolean | null;
  submittedAt: string;
};

export type MemberOverview = {
  member: MemberDetail;
  enrollments: EnrollmentRecordListItem[];
  grades: GradeListItem[];
  payments: MemberPaymentItem[];
  /** 자격증 발급신청 결제상태 — 계좌이체(무통장) 대기 건이 여기서 보입니다 */
  certPayments: MemberCertPaymentItem[];
  exams: MemberExamItem[];
  /** 수강정보 패널의 "수강신청 대행"에 쓰는 노출 중 과정 목록 */
  courseOptions: CourseOption[];
};

export type GetMemberOverviewResult =
  | { success: true; overview: MemberOverview }
  | { success: false; message: string };

/**
 * 회원관리 목록에서 이름을 눌렀을 때 뜨는 팝업 한 장에 필요한 모든 정보 —
 * 기본정보·수강정보·성적정보·결제내역·시험관리를 한 번에 모아 줍니다.
 * (회원 상세 페이지와 같은 데이터원을 씁니다)
 */
export async function getMemberOverview(memberId: string): Promise<GetMemberOverviewResult> {
  const detail = await getMemberDetail(memberId);
  if (!detail.success) {
    return { success: false, message: detail.message };
  }

  const supabase = await createClient();
  const [enrollments, grades, paymentRows, certRows, examRows, courseRows] = await Promise.all([
    getEnrollmentRecordsForMember(memberId),
    getGradeRecordsForMember(memberId),
    supabase
      .from("course_payments")
      .select("id, payment_date, amount, payment_method, status, course:courses!inner ( name )")
      .eq("member_id", memberId)
      .is("deleted_at", null)
      .order("payment_date", { ascending: false }),
    supabase
      .from("certificate_applications")
      .select("id, certificate_name, actual_payment_amount, payment_method, payment_status, applied_at")
      .eq("member_id", memberId)
      .is("deleted_at", null)
      .order("applied_at", { ascending: false }),
    supabase
      .from("exam_submissions")
      .select(
        `id, score, total_score, is_passed, submitted_at,
         exam:exams!inner ( name ),
         enrollment:enrollments!inner ( member_id, course:courses!inner ( name ) )`,
      )
      .eq("enrollment.member_id", memberId)
      .order("submitted_at", { ascending: false }),
    supabase
      .from("courses")
      .select("id, name, categoryRef:course_categories ( name )")
      .eq("status", "active")
      .is("deleted_at", null)
      .order("name"),
  ]);

  if (paymentRows.error) throw new Error(paymentRows.error.message);
  if (certRows.error) throw new Error(certRows.error.message);
  if (examRows.error) throw new Error(examRows.error.message);

  const payments: MemberPaymentItem[] = (
    (paymentRows.data ?? []) as unknown as Array<{
      id: string;
      payment_date: string;
      amount: number;
      payment_method: PaymentMethod;
      status: CoursePaymentStatus;
      course: { name: string };
    }>
  ).map((row) => ({
    id: row.id,
    paymentDate: row.payment_date,
    courseName: row.course.name,
    amount: row.amount,
    paymentMethod: row.payment_method,
    status: row.status,
  }));

  const certPayments: MemberCertPaymentItem[] = (
    (certRows.data ?? []) as unknown as Array<{
      id: string;
      certificate_name: string;
      actual_payment_amount: number;
      payment_method: PaymentMethod | null;
      payment_status: PaymentStatus;
      applied_at: string;
    }>
  ).map((row) => ({
    id: row.id,
    certificateName: row.certificate_name,
    amount: row.actual_payment_amount,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    appliedAt: row.applied_at,
  }));

  const exams: MemberExamItem[] = (
    (examRows.data ?? []) as unknown as Array<{
      id: string;
      score: number;
      total_score: number;
      is_passed: boolean | null;
      submitted_at: string;
      exam: { name: string };
      enrollment: { course: { name: string } };
    }>
  ).map((row) => ({
    id: row.id,
    examName: row.exam.name,
    courseName: row.enrollment.course.name,
    score: row.score,
    totalScore: row.total_score,
    isPassed: row.is_passed,
    submittedAt: row.submitted_at,
  }));

  const courseOptions: CourseOption[] = (
    (courseRows.data ?? []) as unknown as Array<{
      id: string;
      name: string;
      categoryRef: { name: string } | null;
    }>
  ).map((row) => ({ id: row.id, name: row.name, category: row.categoryRef?.name ?? null }));

  return {
    success: true,
    overview: { member: detail.member, enrollments, grades, payments, certPayments, exams, courseOptions },
  };
}
