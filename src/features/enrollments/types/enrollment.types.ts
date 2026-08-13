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
 * 진도율(lecture_progress)·시험점수(exam_submissions)·수료여부는 성적관리와
 * 같은 실제 데이터로 계산합니다. 담당교수만 아직 Mock이며, 과제 기능은
 * 사용하지 않아 과제 상태는 항상 "-"입니다.
 */
export type EnrollmentRecordListItem = EnrollmentListItem & {
  instructorName: string;
  learningStatus: EnrollmentLearningStatus;
  progressRate: number;
  /** 수료시험 백분율 점수. 미응시면 null */
  examPercent: number | null;
  /** 화면 표시용 시험 상태 라벨 — "미응시" 또는 "NN점" */
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
