export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type MemberStatus =
  | "active"
  | "inactive"
  | "dormant"
  | "withdrawn"
  | "pending";

export type CalendarType = "solar" | "lunar";

export type EnrollmentStatus =
  | "pending"
  | "confirmed"
  | "canceled"
  | "deleted";

export type PaymentStatus =
  | "unpaid"
  | "paid"
  | "partial"
  | "refunded"
  | "canceled"
  /** 자격증 발급비를 사전에 선납결제(`certificate_prepayments`)로 전액 충당한 경우입니다. */
  | "prepaid";

export type CourseStatus = "active" | "hidden" | "closed";

/** `lecture_progress`(설계 단계 테이블)의 출석 상태 값입니다. */
export type LectureAttendanceStatus = "not_started" | "in_progress" | "completed";

export type ExamKind = "midterm" | "final" | "mock" | "certificate" | "quiz" | "final_exam";

export type ExamType = "regular" | "makeup" | "retake" | "practice";

export type ExamStatus = "planned" | "confirmed";

export type ExamQuestionType = "multiple_choice" | "ox" | "short_answer";

export type MaterialFileType = "PDF" | "DOCX" | "PPT" | "ZIP" | "기타";

export type PaymentMethod =
  | "card"
  | "bank_transfer"
  | "virtual_account"
  | "mobile"
  | "cash";

/**
 * PG(결제대행사) 연동 표준 결제 상태값.
 * - ready   : 결제 준비 데이터 생성됨 (PG 결제창 호출 전)
 * - pending : PG 결제 진행 중 / 콜백 대기 (실제 PG 연동 시 사용)
 * - paid    : 결제 완료
 * - failed  : 결제 실패
 * - canceled: 결제 취소 (결제 완료 전 중단)
 * - refunded: 환불 완료 (결제 완료 후 취소)
 */
export type CoursePaymentStatus =
  | "ready"
  | "pending"
  | "paid"
  | "failed"
  | "canceled"
  | "refunded";

export type BoardType =
  | "consultation"
  | "notice"
  | "free"
  | "resource"
  | "faq";

export type CertificateKind =
  | "social_worker"
  | "child_care"
  | "lifelong_educator"
  | "youth_instructor"
  | "health_educator"
  | "course_completion";

/** 차시 영상 저장 방식: storage(Supabase Storage 업로드) 또는 external(외부 CDN URL). */
export type VideoSource = "storage" | "external";

export type CertificateDeliveryStatus =
  | "pending"
  | "preparing"
  | "shipped"
  | "delivered"
  | "canceled";

export type AdminType = "super_admin" | "admin" | "instructor" | "counselor";

export type MessageChannel =
  | "sms"
  | "lms"
  | "kakao_alimtalk"
  | "kakao_friendtalk"
  | "email";

export type MessageDispatchType = "single" | "bulk" | "scheduled";

export type MessageSendStatus =
  | "draft"
  | "scheduled"
  | "pending"
  | "sent"
  | "failed"
  | "canceled";

export type Database = {
  public: {
    Tables: {
      members: {
        Row: {
          id: string;
          login_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          tel: string | null;
          status: MemberStatus;
          manager_name: string | null;
          joined_at: string;
          last_login_at: string | null;
          resident_registration_number: string | null;
          birth_date: string | null;
          calendar_type: CalendarType | null;
          password_hash: string | null;
          postal_code: string | null;
          address: string | null;
          address_detail: string | null;
          graduated_school: string | null;
          school_name: string | null;
          major_name: string | null;
          desired_degree: string | null;
          desired_major_name: string | null;
          join_path: string | null;
          occupation: string | null;
          degree_purpose: string | null;
          referrer_login_id: string | null;
          memo: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          login_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          tel?: string | null;
          status?: MemberStatus;
          manager_name?: string | null;
          joined_at?: string;
          last_login_at?: string | null;
          resident_registration_number?: string | null;
          birth_date?: string | null;
          calendar_type?: CalendarType | null;
          password_hash?: string | null;
          postal_code?: string | null;
          address?: string | null;
          address_detail?: string | null;
          graduated_school?: string | null;
          school_name?: string | null;
          major_name?: string | null;
          desired_degree?: string | null;
          desired_major_name?: string | null;
          join_path?: string | null;
          occupation?: string | null;
          degree_purpose?: string | null;
          referrer_login_id?: string | null;
          memo?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          login_id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          tel?: string | null;
          status?: MemberStatus;
          manager_name?: string | null;
          joined_at?: string;
          last_login_at?: string | null;
          resident_registration_number?: string | null;
          birth_date?: string | null;
          calendar_type?: CalendarType | null;
          password_hash?: string | null;
          postal_code?: string | null;
          address?: string | null;
          address_detail?: string | null;
          graduated_school?: string | null;
          school_name?: string | null;
          major_name?: string | null;
          desired_degree?: string | null;
          desired_major_name?: string | null;
          join_path?: string | null;
          occupation?: string | null;
          degree_purpose?: string | null;
          referrer_login_id?: string | null;
          memo?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      courses: {
        Row: {
          id: string;
          code: string;
          name: string;
          category: string | null;
          /** course_categories.id 참조. 카테고리관리에서 만든 카테고리 중 선택합니다. */
          category_id: string | null;
          default_duration_days: number | null;
          completion_attendance_rate: number | null;
          completion_exam_score: number | null;
          exam_eligibility_progress_rate: number | null;
          /** 수강료(원). PG 결제 금액 산정 기준. 미설정 과정은 0(수강료 미정)입니다. */
          price: number;
          status: CourseStatus;
          description: string | null;
          /** 담당교수명. 학생 수강신청 과정 카드의 "담당교수"에 노출됩니다. */
          professor_name: string | null;
          /** 수업방식(예: 온라인 강의). 학생 수강신청 과정 카드에 노출됩니다. */
          study_method: string;
          /** 강의시간 안내 문구(예: 전체 약 20시간). 학생 수강신청 과정 카드에 노출됩니다. */
          lecture_time: string;
          /** 주무관청(예: 보건복지부). 학생 수강신청 과정 카드에 노출됩니다. */
          supervising_agency: string;
          /** "마감임박" 배지 노출 여부. 과정관리에서 ON/OFF. */
          is_deadline_soon: boolean;
          /** 과정 카드에 취소선으로 표시되는 정가. 기본값 400,000원. */
          regular_price: number;
          /** 과정 카드에 강조 표시되는 실제 표시가. 기본값 0원(무료수강). */
          display_price: number;
          /** 무료수강 과정 여부. 기본값 true. */
          is_free_course: boolean;
          /** 과정 카드 썸네일 이미지 공개 URL(course-thumbnails 버킷). 미설정 시 기본 이미지 사용. */
          thumbnail_url: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          category?: string | null;
          category_id?: string | null;
          default_duration_days?: number | null;
          completion_attendance_rate?: number | null;
          completion_exam_score?: number | null;
          exam_eligibility_progress_rate?: number | null;
          price?: number;
          status?: CourseStatus;
          description?: string | null;
          professor_name?: string | null;
          study_method?: string;
          lecture_time?: string;
          supervising_agency?: string;
          is_deadline_soon?: boolean;
          regular_price?: number;
          display_price?: number;
          is_free_course?: boolean;
          thumbnail_url?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          category?: string | null;
          category_id?: string | null;
          default_duration_days?: number | null;
          completion_attendance_rate?: number | null;
          completion_exam_score?: number | null;
          exam_eligibility_progress_rate?: number | null;
          price?: number;
          status?: CourseStatus;
          description?: string | null;
          professor_name?: string | null;
          study_method?: string;
          lecture_time?: string;
          supervising_agency?: string;
          is_deadline_soon?: boolean;
          regular_price?: number;
          thumbnail_url?: string | null;
          display_price?: number;
          is_free_course?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      course_categories: {
        Row: {
          id: string;
          name: string;
          slug: string | null;
          description: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug?: string | null;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string | null;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      enrollments: {
        Row: {
          id: string;
          member_id: string;
          course_id: string;
          start_date: string;
          end_date: string;
          status: EnrollmentStatus;
          year: number | null;
          batch: string | null;
          payment_status: PaymentStatus;
          application_date: string | null;
          memo: string | null;
          manager_name: string | null;
          deleted_at: string | null;
          confirmed_at: string | null;
          /** 등록된 모든 게시 차시가 완료되면 채워집니다. (수료증 발급은 다음 단계) */
          learning_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          course_id: string;
          start_date: string;
          end_date: string;
          status?: EnrollmentStatus;
          year?: number | null;
          batch?: string | null;
          payment_status?: PaymentStatus;
          application_date?: string | null;
          memo?: string | null;
          manager_name?: string | null;
          deleted_at?: string | null;
          confirmed_at?: string | null;
          learning_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          course_id?: string;
          start_date?: string;
          end_date?: string;
          status?: EnrollmentStatus;
          year?: number | null;
          batch?: string | null;
          payment_status?: PaymentStatus;
          application_date?: string | null;
          memo?: string | null;
          manager_name?: string | null;
          deleted_at?: string | null;
          confirmed_at?: string | null;
          learning_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      classes: {
        Row: {
          id: string;
          course_id: string;
          year: number;
          name: string;
          manager_name: string | null;
          application_start: string | null;
          application_end: string | null;
          enrollment_start: string;
          enrollment_end: string;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          year: number;
          name: string;
          manager_name?: string | null;
          application_start?: string | null;
          application_end?: string | null;
          enrollment_start: string;
          enrollment_end: string;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          year?: number;
          name?: string;
          manager_name?: string | null;
          application_start?: string | null;
          application_end?: string | null;
          enrollment_start?: string;
          enrollment_end?: string;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      exams: {
        Row: {
          id: string;
          course_id: string;
          year: number;
          name: string;
          exam_kind: ExamKind;
          exam_type: ExamType;
          exam_start: string | null;
          exam_end: string | null;
          question_count: number;
          exam_duration_minutes: number;
          status: ExamStatus;
          memo: string | null;
          print_enabled: boolean;
          is_published: boolean;
          pass_score: number | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          year: number;
          name: string;
          exam_kind?: ExamKind;
          exam_type: ExamType;
          exam_start?: string | null;
          exam_end?: string | null;
          question_count?: number;
          exam_duration_minutes?: number;
          status?: ExamStatus;
          memo?: string | null;
          print_enabled?: boolean;
          is_published?: boolean;
          pass_score?: number | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          year?: number;
          name?: string;
          exam_kind?: ExamKind;
          exam_type?: ExamType;
          exam_start?: string | null;
          exam_end?: string | null;
          question_count?: number;
          exam_duration_minutes?: number;
          status?: ExamStatus;
          memo?: string | null;
          print_enabled?: boolean;
          is_published?: boolean;
          pass_score?: number | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      exam_submissions: {
        Row: {
          id: string;
          enrollment_id: string;
          exam_id: string;
          score: number;
          total_score: number;
          is_passed: boolean | null;
          answers: Record<string, string>;
          submitted_at: string;
          /** 관리자가 재시험을 허용했는지 여부. true면 재응시 결과가 반영될 때까지 유지됩니다. */
          retake_allowed: boolean;
          /** 관리자가 재시험을 허용 처리한 시각. */
          retake_allowed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          enrollment_id: string;
          exam_id: string;
          score?: number;
          total_score?: number;
          is_passed?: boolean | null;
          answers?: Record<string, string>;
          submitted_at?: string;
          retake_allowed?: boolean;
          retake_allowed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          enrollment_id?: string;
          exam_id?: string;
          score?: number;
          total_score?: number;
          is_passed?: boolean | null;
          answers?: Record<string, string>;
          submitted_at?: string;
          retake_allowed?: boolean;
          retake_allowed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      learning_materials: {
        Row: {
          id: string;
          course_id: string | null;
          title: string;
          description: string;
          file_type: MaterialFileType;
          file_name: string;
          file_size_label: string | null;
          file_url: string | null;
          is_published: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id?: string | null;
          title: string;
          description: string;
          file_type?: MaterialFileType;
          file_name: string;
          file_size_label?: string | null;
          file_url?: string | null;
          is_published?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string | null;
          title?: string;
          description?: string;
          file_type?: MaterialFileType;
          file_name?: string;
          file_size_label?: string | null;
          file_url?: string | null;
          is_published?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      completion_certificates: {
        Row: {
          id: string;
          enrollment_id: string;
          course_id: string;
          member_id: string;
          certificate_number: string;
          issued_at: string;
          reissue_count: number;
          canceled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          enrollment_id: string;
          course_id: string;
          member_id: string;
          certificate_number: string;
          issued_at?: string;
          reissue_count?: number;
          canceled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          enrollment_id?: string;
          course_id?: string;
          member_id?: string;
          certificate_number?: string;
          issued_at?: string;
          reissue_count?: number;
          canceled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      exam_questions: {
        Row: {
          id: string;
          exam_id: string;
          question_type: ExamQuestionType;
          question: string;
          choice1: string | null;
          choice2: string | null;
          choice3: string | null;
          choice4: string | null;
          choice5: string | null;
          answer: string;
          score: number;
          sort_order: number;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          exam_id: string;
          question_type: ExamQuestionType;
          question: string;
          choice1?: string | null;
          choice2?: string | null;
          choice3?: string | null;
          choice4?: string | null;
          choice5?: string | null;
          answer: string;
          score?: number;
          sort_order?: number;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          exam_id?: string;
          question_type?: ExamQuestionType;
          question?: string;
          choice1?: string | null;
          choice2?: string | null;
          choice3?: string | null;
          choice4?: string | null;
          choice5?: string | null;
          answer?: string;
          score?: number;
          sort_order?: number;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      assignments: {
        Row: {
          id: string;
          course_id: string;
          class_id: string;
          year: number;
          name: string;
          submission_start: string;
          submission_end: string;
          submission_count: number;
          status: ExamStatus;
          memo: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          class_id: string;
          year: number;
          name: string;
          submission_start: string;
          submission_end: string;
          submission_count?: number;
          status?: ExamStatus;
          memo?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          class_id?: string;
          year?: number;
          name?: string;
          submission_start?: string;
          submission_end?: string;
          submission_count?: number;
          status?: ExamStatus;
          memo?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      course_payments: {
        Row: {
          id: string;
          member_id: string;
          course_id: string;
          class_id: string | null;
          enrollment_id: string | null;
          payment_date: string;
          coupon_number: string | null;
          assigned_instructor: string | null;
          amount: number;
          payment_method: PaymentMethod;
          coupon_applied: boolean;
          payment_number: string | null;
          product_name: string | null;
          deposit_bank: string | null;
          depositor_name: string | null;
          virtual_account_number: string | null;
          class_start_date: string | null;
          class_end_date: string | null;
          shipping_address: string | null;
          approved_at: string | null;
          canceled_at: string | null;
          /** PG(결제대행사) 식별자. 실제 PG 연동 전까지는 'dev_test' 사용 */
          pg_provider: string | null;
          /** 자체 채번 주문번호 (PG 전달용, 멱등키) */
          pg_order_id: string | null;
          /** PG사가 발급하는 결제 승인 트랜잭션 ID */
          pg_transaction_id: string | null;
          failed_reason: string | null;
          status: CoursePaymentStatus;
          memo: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          course_id: string;
          class_id?: string | null;
          enrollment_id?: string | null;
          payment_date: string;
          coupon_number?: string | null;
          assigned_instructor?: string | null;
          amount: number;
          payment_method: PaymentMethod;
          coupon_applied?: boolean;
          payment_number?: string | null;
          product_name?: string | null;
          deposit_bank?: string | null;
          depositor_name?: string | null;
          virtual_account_number?: string | null;
          class_start_date?: string | null;
          class_end_date?: string | null;
          shipping_address?: string | null;
          approved_at?: string | null;
          canceled_at?: string | null;
          pg_provider?: string | null;
          pg_order_id?: string | null;
          pg_transaction_id?: string | null;
          failed_reason?: string | null;
          status?: CoursePaymentStatus;
          memo?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          course_id?: string;
          class_id?: string | null;
          enrollment_id?: string | null;
          payment_date?: string;
          coupon_number?: string | null;
          assigned_instructor?: string | null;
          amount?: number;
          payment_method?: PaymentMethod;
          coupon_applied?: boolean;
          payment_number?: string | null;
          product_name?: string | null;
          deposit_bank?: string | null;
          depositor_name?: string | null;
          virtual_account_number?: string | null;
          class_start_date?: string | null;
          class_end_date?: string | null;
          shipping_address?: string | null;
          approved_at?: string | null;
          canceled_at?: string | null;
          pg_provider?: string | null;
          pg_order_id?: string | null;
          pg_transaction_id?: string | null;
          failed_reason?: string | null;
          status?: CoursePaymentStatus;
          memo?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      board_posts: {
        Row: {
          id: string;
          board_type: BoardType;
          parent_id: string | null;
          title: string;
          content: string;
          author_name: string;
          is_notice: boolean;
          attachment_file_name: string | null;
          attachment_file_url: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          board_type: BoardType;
          parent_id?: string | null;
          title: string;
          content: string;
          author_name: string;
          is_notice?: boolean;
          attachment_file_name?: string | null;
          attachment_file_url?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          board_type?: BoardType;
          parent_id?: string | null;
          title?: string;
          content?: string;
          author_name?: string;
          is_notice?: boolean;
          attachment_file_name?: string | null;
          attachment_file_url?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      board_comments: {
        Row: {
          id: string;
          post_id: string;
          content: string;
          author_name: string;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          content: string;
          author_name: string;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          content?: string;
          author_name?: string;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      certificate_applications: {
        Row: {
          id: string;
          member_id: string;
          course_id: string | null;
          certificate_kind: CertificateKind;
          certificate_name: string;
          member_login_id: string;
          applicant_name: string;
          birth_date: string | null;
          phone: string | null;
          postal_code: string | null;
          address: string | null;
          address_detail: string | null;
          photo_url: string | null;
          issuance_cost: number;
          actual_payment_amount: number;
          payment_method: PaymentMethod | null;
          payment_info: string | null;
          payment_status: PaymentStatus;
          delivery_status: CertificateDeliveryStatus;
          memo: string | null;
          applied_at: string;
          issued_at: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          course_id?: string | null;
          certificate_kind: CertificateKind;
          certificate_name: string;
          member_login_id: string;
          applicant_name: string;
          birth_date?: string | null;
          phone?: string | null;
          postal_code?: string | null;
          address?: string | null;
          address_detail?: string | null;
          photo_url?: string | null;
          issuance_cost?: number;
          actual_payment_amount?: number;
          payment_method?: PaymentMethod | null;
          payment_info?: string | null;
          payment_status?: PaymentStatus;
          delivery_status?: CertificateDeliveryStatus;
          memo?: string | null;
          applied_at: string;
          issued_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          course_id?: string | null;
          certificate_kind?: CertificateKind;
          certificate_name?: string;
          member_login_id?: string;
          applicant_name?: string;
          birth_date?: string | null;
          phone?: string | null;
          postal_code?: string | null;
          address?: string | null;
          address_detail?: string | null;
          photo_url?: string | null;
          issuance_cost?: number;
          actual_payment_amount?: number;
          payment_method?: PaymentMethod | null;
          payment_info?: string | null;
          payment_status?: PaymentStatus;
          delivery_status?: CertificateDeliveryStatus;
          memo?: string | null;
          applied_at?: string;
          issued_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      certificate_prepayments: {
        Row: {
          id: string;
          member_id: string;
          course_id: string | null;
          certificate_name: string;
          amount: number;
          payment_method: PaymentMethod | null;
          payment_status: PaymentStatus;
          paid_at: string | null;
          used_at: string | null;
          certificate_application_id: string | null;
          memo: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          course_id?: string | null;
          certificate_name: string;
          amount?: number;
          payment_method?: PaymentMethod | null;
          payment_status?: PaymentStatus;
          paid_at?: string | null;
          used_at?: string | null;
          certificate_application_id?: string | null;
          memo?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          course_id?: string | null;
          certificate_name?: string;
          amount?: number;
          payment_method?: PaymentMethod | null;
          payment_status?: PaymentStatus;
          paid_at?: string | null;
          used_at?: string | null;
          certificate_application_id?: string | null;
          memo?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_users: {
        Row: {
          id: string;
          admin_type: AdminType;
          login_id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          admin_type: AdminType;
          login_id: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          admin_type?: AdminType;
          login_id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_access_logs: {
        Row: {
          id: string;
          admin_user_id: string;
          access_ip: string;
          logged_in_at: string;
          logged_out_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_user_id: string;
          access_ip: string;
          logged_in_at: string;
          logged_out_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_user_id?: string;
          access_ip?: string;
          logged_in_at?: string;
          logged_out_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      message_dispatches: {
        Row: {
          id: string;
          channel: MessageChannel;
          dispatch_type: MessageDispatchType;
          status: MessageSendStatus;
          recipient_name: string | null;
          recipient_phone: string | null;
          bulk_summary: string | null;
          recipient_count: number;
          title: string | null;
          content: string;
          scheduled_at: string | null;
          sent_at: string | null;
          success_count: number;
          fail_count: number;
          sender_name: string;
          memo: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          channel: MessageChannel;
          dispatch_type: MessageDispatchType;
          status?: MessageSendStatus;
          recipient_name?: string | null;
          recipient_phone?: string | null;
          bulk_summary?: string | null;
          recipient_count?: number;
          title?: string | null;
          content: string;
          scheduled_at?: string | null;
          sent_at?: string | null;
          success_count?: number;
          fail_count?: number;
          sender_name: string;
          memo?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          channel?: MessageChannel;
          dispatch_type?: MessageDispatchType;
          status?: MessageSendStatus;
          recipient_name?: string | null;
          recipient_phone?: string | null;
          bulk_summary?: string | null;
          recipient_count?: number;
          title?: string | null;
          content?: string;
          scheduled_at?: string | null;
          sent_at?: string | null;
          success_count?: number;
          fail_count?: number;
          sender_name?: string;
          memo?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notice_popups: {
        Row: {
          id: string;
          title: string;
          content: string;
          is_active: boolean;
          is_notice: boolean;
          attachment_file_name: string | null;
          attachment_file_url: string | null;
          display_start_date: string | null;
          display_end_date: string | null;
          sort_order: number;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          is_active?: boolean;
          is_notice?: boolean;
          attachment_file_name?: string | null;
          attachment_file_url?: string | null;
          display_start_date?: string | null;
          display_end_date?: string | null;
          sort_order?: number;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          is_active?: boolean;
          is_notice?: boolean;
          attachment_file_name?: string | null;
          attachment_file_url?: string | null;
          display_start_date?: string | null;
          display_end_date?: string | null;
          sort_order?: number;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      course_lectures: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string;
          thumbnail_file_name: string | null;
          is_published: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string;
          thumbnail_file_name?: string | null;
          is_published?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          description?: string;
          thumbnail_file_name?: string | null;
          is_published?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      lecture_sessions: {
        Row: {
          id: string;
          lecture_id: string;
          session_order: number;
          title: string;
          duration_minutes: number | null;
          video_url: string | null;
          video_source: VideoSource;
          video_storage_path: string | null;
          video_file_name: string | null;
          video_duration_seconds: number | null;
          video_uploaded_at: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lecture_id: string;
          session_order: number;
          title: string;
          duration_minutes?: number | null;
          video_url?: string | null;
          video_source?: VideoSource;
          video_storage_path?: string | null;
          video_file_name?: string | null;
          video_duration_seconds?: number | null;
          video_uploaded_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lecture_id?: string;
          session_order?: number;
          title?: string;
          duration_minutes?: number | null;
          video_url?: string | null;
          video_source?: VideoSource;
          video_storage_path?: string | null;
          video_file_name?: string | null;
          video_duration_seconds?: number | null;
          video_uploaded_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      /**
       * 학생별 차시 진도/출석 기록. `src/features/classroom-lectures`에서 사용합니다.
       */
      lecture_progress: {
        Row: {
          id: string;
          enrollment_id: string;
          lecture_session_id: string;
          video_progress_percent: number;
          last_position_seconds: number;
          attendance_status: LectureAttendanceStatus;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          enrollment_id: string;
          lecture_session_id: string;
          video_progress_percent?: number;
          last_position_seconds?: number;
          attendance_status?: LectureAttendanceStatus;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          enrollment_id?: string;
          lecture_session_id?: string;
          video_progress_percent?: number;
          last_position_seconds?: number;
          attendance_status?: LectureAttendanceStatus;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      member_status: MemberStatus;
      calendar_type: CalendarType;
      enrollment_status: EnrollmentStatus;
      payment_status: PaymentStatus;
      course_status: CourseStatus;
      exam_kind: ExamKind;
      exam_type: ExamType;
      exam_status: ExamStatus;
      exam_question_type: ExamQuestionType;
      payment_method: PaymentMethod;
      course_payment_status: CoursePaymentStatus;
      board_type: BoardType;
      certificate_kind: CertificateKind;
      certificate_delivery_status: CertificateDeliveryStatus;
      video_source: VideoSource;
      admin_type: AdminType;
      message_channel: MessageChannel;
      message_dispatch_type: MessageDispatchType;
      message_send_status: MessageSendStatus;
    };
  };
};

export type Member = Database["public"]["Tables"]["members"]["Row"];

export type MemberListItem = Pick<
  Member,
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
  | "memo"
>;
