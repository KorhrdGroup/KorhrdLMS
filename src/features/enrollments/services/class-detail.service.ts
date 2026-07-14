import {
  CLASS_ASSIGNED_STUDENTS_SELECT,
  CLASS_DETAIL_SELECT,
} from "@/features/enrollments/constants";
import type {
  ClassAssignedStudent,
  ClassDetail,
  GetClassDetailResult,
} from "@/features/enrollments/types/class-detail.types";
import { createClient } from "@/lib/supabase/server";
import type { EnrollmentStatus, PaymentStatus } from "@/types/database.types";

type ClassDetailRow = {
  id: string;
  course_id: string;
  year: number;
  name: string;
  manager_name: string | null;
  application_start: string | null;
  application_end: string | null;
  enrollment_start: string;
  enrollment_end: string;
  created_at: string;
  course: {
    id: string;
    name: string;
    code: string;
    deleted_at: string | null;
  };
};

type AssignedStudentRow = {
  id: string;
  status: EnrollmentStatus;
  payment_status: PaymentStatus;
  member: {
    id: string;
    name: string;
    login_id: string;
    deleted_at: string | null;
  };
};

function mapAssignedStudent(row: AssignedStudentRow): ClassAssignedStudent {
  return {
    id: row.id,
    memberName: row.member.name,
    loginId: row.member.login_id,
    status: row.status,
    paymentStatus: row.payment_status,
  };
}

function mapClassDetail(
  row: ClassDetailRow,
  students: ClassAssignedStudent[],
): ClassDetail {
  return {
    id: row.id,
    courseId: row.course_id,
    courseName: row.course.name,
    year: row.year,
    batchName: row.name,
    managerName: row.manager_name,
    applicationPeriodStart: row.application_start,
    applicationPeriodEnd: row.application_end,
    enrollmentPeriodStart: row.enrollment_start,
    enrollmentPeriodEnd: row.enrollment_end,
    createdAt: row.created_at,
    students,
  };
}

export async function getClassDetail(classId: string): Promise<GetClassDetailResult> {
  if (!classId.trim()) {
    return { success: false, message: "수강반 정보를 찾을 수 없습니다." };
  }

  const supabase = await createClient();

  const { data: classRow, error: classError } = await supabase
    .from("classes")
    .select(CLASS_DETAIL_SELECT)
    .eq("id", classId)
    .is("deleted_at", null)
    .is("course.deleted_at", null)
    .maybeSingle();

  if (classError) {
    throw new Error(classError.message);
  }

  if (!classRow) {
    return { success: false, message: "수강반 정보를 찾을 수 없습니다." };
  }

  const row = classRow as ClassDetailRow;

  const { data: studentsData, error: studentsError } = await supabase
    .from("enrollments")
    .select(CLASS_ASSIGNED_STUDENTS_SELECT)
    .eq("course_id", row.course_id)
    .eq("year", row.year)
    .eq("batch", row.name)
    .neq("status", "deleted")
    .is("deleted_at", null)
    .is("member.deleted_at", null)
    .order("created_at", { ascending: false });

  if (studentsError) {
    throw new Error(studentsError.message);
  }

  const students = ((studentsData ?? []) as AssignedStudentRow[]).map(mapAssignedStudent);

  return {
    success: true,
    classDetail: mapClassDetail(row, students),
  };
}
