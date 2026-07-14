import { ENROLLMENT_MEMBER_COURSE_SELECT } from "@/features/completion-certificates/constants";
import { computeCompletionEligibility } from "@/features/completion-certificates/lib/completion-eligibility";
import { getCertificateRecord } from "@/features/completion-certificates/repositories/completion-certificate.repository";
import type {
  CertificateSearchField,
  CompletionCertificateListItem,
  CompletionCertificateListQuery,
} from "@/features/completion-certificates/types/completion-certificate.types";
import type { EnrollmentStatus } from "@/types/database.types";
import { getTotalPages, type PaginatedResult } from "@/lib/shared/list-query";
import { createClient } from "@/lib/supabase/server";

type EnrollmentRow = {
  id: string;
  start_date: string;
  end_date: string;
  status: EnrollmentStatus;
  member: { id: string; name: string; login_id: string };
  course: { id: string; name: string };
};

async function enrich(row: EnrollmentRow): Promise<CompletionCertificateListItem | null> {
  const { learningStatus, isCompleted } = await computeCompletionEligibility(
    row.id,
    row.course.id,
    row.status,
    row.end_date,
  );

  if (!isCompleted) {
    return null;
  }

  const record = await getCertificateRecord(row.id);

  return {
    enrollmentId: row.id,
    member: {
      id: row.member.id,
      name: row.member.name,
      loginId: row.member.login_id,
    },
    course: { id: row.course.id, name: row.course.name },
    learningStatus,
    completionDate: row.end_date,
    issuanceStatus: record ? "issued" : "not_issued",
    certificateNumber: record?.certificateNumber ?? null,
    issuedAt: record?.issuedAt ?? null,
    reissueCount: record?.reissueCount ?? 0,
  };
}

async function fetchConfirmedEnrollments(
  search: string,
  field: CertificateSearchField,
): Promise<EnrollmentRow[]> {
  const supabase = await createClient();

  let builder = supabase
    .from("enrollments")
    .select(ENROLLMENT_MEMBER_COURSE_SELECT)
    .eq("status", "confirmed")
    .is("deleted_at", null)
    .is("members.deleted_at", null)
    .order("end_date", { ascending: false });

  if (search) {
    const keyword = `%${search}%`;

    switch (field) {
      case "member_name":
        builder = builder.ilike("member.name", keyword);
        break;
      case "login_id":
        builder = builder.ilike("member.login_id", keyword);
        break;
      case "course_name":
        builder = builder.ilike("course.name", keyword);
        break;
      default:
        builder = builder.or(
          `member.name.ilike.${keyword},member.login_id.ilike.${keyword},course.name.ilike.${keyword}`,
        );
        break;
    }
  }

  const { data, error } = await builder;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as EnrollmentRow[];
}

export async function getCompletionCertificateList(
  query: CompletionCertificateListQuery,
): Promise<PaginatedResult<CompletionCertificateListItem>> {
  const rows = await fetchConfirmedEnrollments(query.search, query.field);
  const enriched = await Promise.all(rows.map(enrich));
  const eligible = enriched.filter(
    (item): item is CompletionCertificateListItem => item !== null,
  );

  const filtered = eligible.filter((item) => {
    if (query.status === "all") return true;
    return item.issuanceStatus === query.status;
  });

  const total = filtered.length;
  const from = (query.page - 1) * query.pageSize;
  const to = from + query.pageSize;

  return {
    data: filtered.slice(from, to),
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: getTotalPages(total, query.pageSize),
  };
}

export async function getCompletionCertificateByEnrollmentId(
  enrollmentId: string,
): Promise<CompletionCertificateListItem | null> {
  if (!enrollmentId.trim()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select(ENROLLMENT_MEMBER_COURSE_SELECT)
    .eq("id", enrollmentId)
    .eq("status", "confirmed")
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;

  return enrich(data as unknown as EnrollmentRow);
}

