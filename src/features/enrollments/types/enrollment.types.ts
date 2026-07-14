import type { EnrollmentStatus, PaymentStatus } from "@/types/database.types";

export type EnrollmentRegistrationInput = {
  memberId: string;
  courseId: string;
  startDate: string;
  endDate: string;
  status: EnrollmentStatus;
};

export type EnrollmentRegistrationResult =
  | { success: true; enrollmentId: string }
  | {
      success: false;
      message: string;
      field?: keyof EnrollmentRegistrationInput;
    };

export type EnrollmentMemberOption = {
  id: string;
  name: string;
  loginId: string;
};

export type EnrollmentCourseOption = {
  id: string;
  name: string;
  code: string;
};

export type EnrollmentRegistrationOptions = {
  members: EnrollmentMemberOption[];
  courses: EnrollmentCourseOption[];
};

export type EnrollmentListItem = {
  id: string;
  year: number | null;
  batch: string | null;
  start_date: string;
  end_date: string;
  status: EnrollmentStatus;
  payment_status: PaymentStatus;
  application_date: string | null;
  created_at: string;
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

/**
 * 학습상태(수강중/종료/중지)는 실 컬럼이 아니라 status(confirmed/canceled)와
 * end_date를 기준으로 매번 파생시키는 값입니다. Supabase에 별도 컬럼을 추가하면
 * 이 파생 로직만 교체하면 됩니다.
 */
export type EnrollmentLearningStatus = "in_progress" | "ended" | "stopped";

/**
 * 진도율/시험/과제/수료여부는 아직 실제 학습 로그·시험관리·과제관리가
 * 회원 단위로 연동되지 않아 enrollment id 기반의 결정적 Mock 값으로 계산합니다.
 * 추후 진도 로그, exam-management, assignment-management가 member_id로
 * 연동되면 이 필드들만 실 데이터 조회로 교체하면 됩니다.
 */
export type EnrollmentRecordListItem = EnrollmentListItem & {
  instructorName: string;
  learningStatus: EnrollmentLearningStatus;
  progressRate: number;
  examStatus: string;
  assignmentStatus: string;
  isCompleted: boolean;
};

export type EnrollmentRecordEditInput = {
  startDate: string;
  endDate: string;
  learningStatus: Extract<EnrollmentLearningStatus, "in_progress" | "stopped">;
};

export type EnrollmentRecordEditResult =
  | { success: true; enrollmentId: string }
  | {
      success: false;
      message: string;
      field?: keyof EnrollmentRecordEditInput;
    };

export type GetEnrollmentRecordForEditResult =
  | {
      success: true;
      record: {
        id: string;
        memberName: string;
        courseName: string;
        startDate: string;
        endDate: string;
        learningStatus: EnrollmentLearningStatus;
      };
    }
  | { success: false; message: string };

export type EnrollmentRecordDeleteResult =
  | { success: true; message: string }
  | { success: false; message: string };
