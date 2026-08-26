import ExcelJS from "exceljs";

import { MEMBER_STATUS_LABELS } from "@/features/members/constants";
import type { MemberListQuery } from "@/features/members/services/member-list.service";
import { getMemberCourseSummaries } from "@/features/members/services/member-course-summary.service";
import { createClient } from "@/lib/supabase/server";
import type { MemberListItem } from "@/types/database.types";

/**
 * 회원목록 엑셀 다운로드 — 현재 검색·필터 조건 그대로, 페이지와 무관하게 전체를
 * 실제 엑셀 파일(.xlsx)로 만듭니다. (자격증신청 엑셀과 같은 방식 — CSV 는 엑셀이
 * 열 때 값을 날짜로 바꿔 ###### 이 되는 문제가 있어 쓰지 않습니다)
 */
export async function buildMemberExportXlsx(query: MemberListQuery): Promise<string> {
  const supabase = await createClient();

  // 학습 상태 필터가 걸려 있으면 목록과 같은 뷰에서 조회합니다
  const table = query.learningStatus
    ? ("members_with_learning_status" as "members")
    : "members";

  let builder = supabase
    .from(table)
    .select(
      "id, login_id, name, email, phone, status, manager_name, joined_at, last_login_at, deleted_at, referral_source",
    )
    .order("joined_at", { ascending: false });

  if (query.learningStatus) {
    builder = builder.eq(
      "learning_status" as never,
      query.learningStatus as never,
    );
  }

  if (!query.showDeleted) {
    builder = builder.is("deleted_at", null);
  }
  if (query.status) {
    builder = builder.eq("status", query.status);
  }
  if (query.search) {
    const keyword = `%${query.search}%`;
    switch (query.field) {
      case "name":
        builder = builder.ilike("name", keyword);
        break;
      case "login_id":
        builder = builder.ilike("login_id", keyword);
        break;
      case "email":
        builder = builder.ilike("email", keyword);
        break;
      case "phone":
        builder = builder.ilike("phone", keyword);
        break;
      default:
        builder = builder.or(
          `name.ilike.${keyword},login_id.ilike.${keyword},email.ilike.${keyword},phone.ilike.${keyword}`,
        );
        break;
    }
  }

  const { data, error } = await builder;
  if (error) {
    throw new Error(error.message);
  }

  const members = (data ?? []) as (Pick<
    MemberListItem,
    | "id"
    | "login_id"
    | "name"
    | "email"
    | "phone"
    | "status"
    | "manager_name"
    | "joined_at"
    | "last_login_at"
    | "deleted_at"
    | "referral_source"
  >)[];

  // 수강과정 요약 ("노인돌봄생활지원사(수강완료 100%)" 식) — 목록 화면과 같은 데이터원
  const courseSummaries = await getMemberCourseSummaries(members.map((member) => member.id));

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("회원목록");

  sheet.columns = [
    { header: "이름", key: "name", width: 12 },
    { header: "아이디", key: "loginId", width: 18 },
    { header: "연락처", key: "phone", width: 15 },
    { header: "이메일", key: "email", width: 24 },
    { header: "상태", key: "status", width: 10 },
    { header: "유입경로", key: "referral", width: 16 },
    { header: "수강과정", key: "courses", width: 50 },
    { header: "가입일", key: "joinedAt", width: 14 },
    { header: "최근 로그인", key: "lastLoginAt", width: 18 },
    { header: "담당자", key: "manager", width: 10 },
  ];
  sheet.getRow(1).font = { bold: true };

  /* 엑셀이 날짜로 바꿔 ###### 으로 보이지 않게 글자로 넣습니다 */
  const dateText = (value: string | null) => {
    if (!value) return "";
    const [y, m, d] = value.slice(0, 10).split("-").map(Number);
    return y && m && d ? `${y}년 ${m}월 ${d}일` : "";
  };

  for (const member of members) {
    const courses = (courseSummaries.get(member.id) ?? [])
      .map((course) => `${course.courseName}(${course.statusLabel})`)
      .join(", ");

    sheet.addRow({
      name: member.name,
      loginId: member.login_id,
      phone: member.phone ?? "",
      email: member.email ?? "",
      status: member.deleted_at ? "삭제" : (MEMBER_STATUS_LABELS[member.status] ?? member.status),
      referral: member.referral_source ?? "",
      courses,
      joinedAt: dateText(member.joined_at),
      lastLoginAt: dateText(member.last_login_at),
      manager: member.manager_name ?? "",
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer).toString("base64");
}
