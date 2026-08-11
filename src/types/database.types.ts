export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_access_logs: {
        Row: {
          access_ip: string
          admin_user_id: string
          created_at: string
          id: string
          logged_in_at: string
          logged_out_at: string | null
        }
        Insert: {
          access_ip: string
          admin_user_id: string
          created_at?: string
          id?: string
          logged_in_at: string
          logged_out_at?: string | null
        }
        Update: {
          access_ip?: string
          admin_user_id?: string
          created_at?: string
          id?: string
          logged_in_at?: string
          logged_out_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_access_logs_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          admin_type: Database["public"]["Enums"]["admin_type"]
          created_at: string
          id: string
          login_id: string
          name: string
          updated_at: string
        }
        Insert: {
          admin_type: Database["public"]["Enums"]["admin_type"]
          created_at?: string
          id?: string
          login_id: string
          name: string
          updated_at?: string
        }
        Update: {
          admin_type?: Database["public"]["Enums"]["admin_type"]
          created_at?: string
          id?: string
          login_id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      assignments: {
        Row: {
          class_id: string
          course_id: string
          created_at: string
          deleted_at: string | null
          id: string
          memo: string | null
          name: string
          status: Database["public"]["Enums"]["exam_status"]
          submission_count: number
          submission_end: string
          submission_start: string
          updated_at: string
          year: number
        }
        Insert: {
          class_id: string
          course_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          memo?: string | null
          name: string
          status?: Database["public"]["Enums"]["exam_status"]
          submission_count?: number
          submission_end: string
          submission_start: string
          updated_at?: string
          year: number
        }
        Update: {
          class_id?: string
          course_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          memo?: string | null
          name?: string
          status?: Database["public"]["Enums"]["exam_status"]
          submission_count?: number
          submission_end?: string
          submission_start?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      board_comments: {
        Row: {
          author_name: string
          content: string
          created_at: string
          deleted_at: string | null
          id: string
          post_id: string
          updated_at: string
        }
        Insert: {
          author_name: string
          content: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          post_id: string
          updated_at?: string
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "board_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      board_posts: {
        Row: {
          attachment_file_name: string | null
          attachment_file_url: string | null
          author_name: string
          board_type: Database["public"]["Enums"]["board_type"]
          content: string
          created_at: string
          deleted_at: string | null
          id: string
          is_notice: boolean
          member_id: string | null
          parent_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          attachment_file_name?: string | null
          attachment_file_url?: string | null
          author_name: string
          board_type: Database["public"]["Enums"]["board_type"]
          content: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_notice?: boolean
          member_id?: string | null
          parent_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          attachment_file_name?: string | null
          attachment_file_url?: string | null
          author_name?: string
          board_type?: Database["public"]["Enums"]["board_type"]
          content?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_notice?: boolean
          member_id?: string | null
          parent_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_posts_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "board_posts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "board_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      certificate_applications: {
        Row: {
          actual_payment_amount: number
          address: string | null
          address_detail: string | null
          applicant_name: string
          application_status: Database["public"]["Enums"]["certificate_application_status"]
          applied_at: string
          birth_date: string | null
          certificate_kind: Database["public"]["Enums"]["certificate_kind"]
          certificate_name: string
          course_id: string | null
          created_at: string
          deleted_at: string | null
          delivery_status: Database["public"]["Enums"]["certificate_delivery_status"]
          id: string
          issuance_cost: number
          issued_at: string | null
          member_id: string
          member_login_id: string
          memo: string | null
          paid_at: string | null
          payapp_mul_no: string | null
          payment_info: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          phone: string | null
          photo_url: string | null
          postal_code: string | null
          updated_at: string
        }
        Insert: {
          actual_payment_amount?: number
          address?: string | null
          address_detail?: string | null
          applicant_name: string
          application_status?: Database["public"]["Enums"]["certificate_application_status"]
          applied_at: string
          birth_date?: string | null
          certificate_kind: Database["public"]["Enums"]["certificate_kind"]
          certificate_name: string
          course_id?: string | null
          created_at?: string
          deleted_at?: string | null
          delivery_status?: Database["public"]["Enums"]["certificate_delivery_status"]
          id?: string
          issuance_cost?: number
          issued_at?: string | null
          member_id: string
          member_login_id: string
          memo?: string | null
          paid_at?: string | null
          payapp_mul_no?: string | null
          payment_info?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone?: string | null
          photo_url?: string | null
          postal_code?: string | null
          updated_at?: string
        }
        Update: {
          actual_payment_amount?: number
          address?: string | null
          address_detail?: string | null
          applicant_name?: string
          application_status?: Database["public"]["Enums"]["certificate_application_status"]
          applied_at?: string
          birth_date?: string | null
          certificate_kind?: Database["public"]["Enums"]["certificate_kind"]
          certificate_name?: string
          course_id?: string | null
          created_at?: string
          deleted_at?: string | null
          delivery_status?: Database["public"]["Enums"]["certificate_delivery_status"]
          id?: string
          issuance_cost?: number
          issued_at?: string | null
          member_id?: string
          member_login_id?: string
          memo?: string | null
          paid_at?: string | null
          payapp_mul_no?: string | null
          payment_info?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone?: string | null
          photo_url?: string | null
          postal_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificate_applications_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificate_applications_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      certificate_prepayments: {
        Row: {
          amount: number
          certificate_application_id: string | null
          certificate_name: string
          course_id: string | null
          created_at: string
          deleted_at: string | null
          id: string
          member_id: string
          memo: string | null
          paid_at: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          used_at: string | null
        }
        Insert: {
          amount?: number
          certificate_application_id?: string | null
          certificate_name: string
          course_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          member_id: string
          memo?: string | null
          paid_at?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          used_at?: string | null
        }
        Update: {
          amount?: number
          certificate_application_id?: string | null
          certificate_name?: string
          course_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          member_id?: string
          memo?: string | null
          paid_at?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificate_prepayments_certificate_application_id_fkey"
            columns: ["certificate_application_id"]
            isOneToOne: false
            referencedRelation: "certificate_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificate_prepayments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificate_prepayments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          application_end: string | null
          application_start: string | null
          course_id: string
          created_at: string
          deleted_at: string | null
          enrollment_end: string
          enrollment_start: string
          id: string
          manager_name: string | null
          name: string
          updated_at: string
          year: number
        }
        Insert: {
          application_end?: string | null
          application_start?: string | null
          course_id: string
          created_at?: string
          deleted_at?: string | null
          enrollment_end: string
          enrollment_start: string
          id?: string
          manager_name?: string | null
          name: string
          updated_at?: string
          year: number
        }
        Update: {
          application_end?: string | null
          application_start?: string | null
          course_id?: string
          created_at?: string
          deleted_at?: string | null
          enrollment_end?: string
          enrollment_start?: string
          id?: string
          manager_name?: string | null
          name?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "classes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      completion_certificates: {
        Row: {
          canceled_at: string | null
          certificate_number: string
          course_id: string
          created_at: string
          enrollment_id: string
          id: string
          issued_at: string
          member_id: string
          reissue_count: number
          updated_at: string
        }
        Insert: {
          canceled_at?: string | null
          certificate_number: string
          course_id: string
          created_at?: string
          enrollment_id: string
          id?: string
          issued_at?: string
          member_id: string
          reissue_count?: number
          updated_at?: string
        }
        Update: {
          canceled_at?: string | null
          certificate_number?: string
          course_id?: string
          created_at?: string
          enrollment_id?: string
          id?: string
          issued_at?: string
          member_id?: string
          reissue_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "completion_certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completion_certificates_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completion_certificates_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      course_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          slug: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      course_lectures: {
        Row: {
          course_id: string
          created_at: string
          deleted_at: string | null
          description: string
          id: string
          is_published: boolean
          thumbnail_file_name: string | null
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          deleted_at?: string | null
          description?: string
          id?: string
          is_published?: boolean
          thumbnail_file_name?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          deleted_at?: string | null
          description?: string
          id?: string
          is_published?: boolean
          thumbnail_file_name?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_lectures_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_payments: {
        Row: {
          amount: number
          approved_at: string | null
          assigned_instructor: string | null
          canceled_at: string | null
          class_end_date: string | null
          class_id: string | null
          class_start_date: string | null
          coupon_applied: boolean
          coupon_number: string | null
          course_id: string
          created_at: string
          deleted_at: string | null
          deposit_bank: string | null
          depositor_name: string | null
          enrollment_id: string | null
          failed_reason: string | null
          id: string
          member_id: string
          memo: string | null
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_number: string | null
          pg_order_id: string | null
          pg_provider: string | null
          pg_transaction_id: string | null
          product_name: string | null
          shipping_address: string | null
          status: Database["public"]["Enums"]["course_payment_status"]
          updated_at: string
          virtual_account_number: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          assigned_instructor?: string | null
          canceled_at?: string | null
          class_end_date?: string | null
          class_id?: string | null
          class_start_date?: string | null
          coupon_applied?: boolean
          coupon_number?: string | null
          course_id: string
          created_at?: string
          deleted_at?: string | null
          deposit_bank?: string | null
          depositor_name?: string | null
          enrollment_id?: string | null
          failed_reason?: string | null
          id?: string
          member_id: string
          memo?: string | null
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_number?: string | null
          pg_order_id?: string | null
          pg_provider?: string | null
          pg_transaction_id?: string | null
          product_name?: string | null
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["course_payment_status"]
          updated_at?: string
          virtual_account_number?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          assigned_instructor?: string | null
          canceled_at?: string | null
          class_end_date?: string | null
          class_id?: string | null
          class_start_date?: string | null
          coupon_applied?: boolean
          coupon_number?: string | null
          course_id?: string
          created_at?: string
          deleted_at?: string | null
          deposit_bank?: string | null
          depositor_name?: string | null
          enrollment_id?: string | null
          failed_reason?: string | null
          id?: string
          member_id?: string
          memo?: string | null
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_number?: string | null
          pg_order_id?: string | null
          pg_provider?: string | null
          pg_transaction_id?: string | null
          product_name?: string | null
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["course_payment_status"]
          updated_at?: string
          virtual_account_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_payments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_payments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_payments_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      course_review_helpfuls: {
        Row: {
          created_at: string
          member_id: string
          review_id: string
        }
        Insert: {
          created_at?: string
          member_id: string
          review_id: string
        }
        Update: {
          created_at?: string
          member_id?: string
          review_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_review_helpfuls_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_review_helpfuls_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "course_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      course_reviews: {
        Row: {
          also_course_ids: string[]
          body: string
          course_id: string
          created_at: string
          deleted_at: string | null
          id: string
          is_published: boolean
          member_id: string
          photo_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          also_course_ids?: string[]
          body: string
          course_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_published?: boolean
          member_id: string
          photo_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          also_course_ids?: string[]
          body?: string
          course_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_published?: boolean
          member_id?: string
          photo_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_reviews_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          career_paths: string[]
          category: string | null
          category_id: string | null
          certificate_fee: number
          code: string
          completion_attendance_rate: number | null
          completion_exam_score: number | null
          created_at: string
          default_duration_days: number | null
          deleted_at: string | null
          description: string | null
          display_price: number
          exam_eligibility_progress_rate: number | null
          hero_description: string | null
          hero_image_url: string | null
          id: string
          is_deadline_soon: boolean
          is_free_course: boolean
          issuing_agency_id: string | null
          lecture_format: string
          lecture_time: string
          license_number: string | null
          name: string
          price: number
          professor_id: string | null
          professor_name: string | null
          regular_price: number
          status: Database["public"]["Enums"]["course_status"]
          study_method: string
          supervising_agency: string
          target_audience: string[]
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          career_paths?: string[]
          category?: string | null
          category_id?: string | null
          certificate_fee?: number
          code: string
          completion_attendance_rate?: number | null
          completion_exam_score?: number | null
          created_at?: string
          default_duration_days?: number | null
          deleted_at?: string | null
          description?: string | null
          display_price?: number
          exam_eligibility_progress_rate?: number | null
          hero_description?: string | null
          hero_image_url?: string | null
          id?: string
          is_deadline_soon?: boolean
          is_free_course?: boolean
          issuing_agency_id?: string | null
          lecture_format?: string
          lecture_time?: string
          license_number?: string | null
          name: string
          price?: number
          professor_id?: string | null
          professor_name?: string | null
          regular_price?: number
          status?: Database["public"]["Enums"]["course_status"]
          study_method?: string
          supervising_agency?: string
          target_audience?: string[]
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          career_paths?: string[]
          category?: string | null
          category_id?: string | null
          certificate_fee?: number
          code?: string
          completion_attendance_rate?: number | null
          completion_exam_score?: number | null
          created_at?: string
          default_duration_days?: number | null
          deleted_at?: string | null
          description?: string | null
          display_price?: number
          exam_eligibility_progress_rate?: number | null
          hero_description?: string | null
          hero_image_url?: string | null
          id?: string
          is_deadline_soon?: boolean
          is_free_course?: boolean
          issuing_agency_id?: string | null
          lecture_format?: string
          lecture_time?: string
          license_number?: string | null
          name?: string
          price?: number
          professor_id?: string | null
          professor_name?: string | null
          regular_price?: number
          status?: Database["public"]["Enums"]["course_status"]
          study_method?: string
          supervising_agency?: string
          target_audience?: string[]
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "course_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_issuing_agency_id_fkey"
            columns: ["issuing_agency_id"]
            isOneToOne: false
            referencedRelation: "issuing_agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "professors"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          application_date: string | null
          batch: string | null
          confirmed_at: string | null
          course_id: string
          created_at: string
          deleted_at: string | null
          end_date: string
          id: string
          learning_completed_at: string | null
          manager_name: string | null
          member_id: string
          memo: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          start_date: string
          status: Database["public"]["Enums"]["enrollment_status"]
          updated_at: string
          year: number | null
        }
        Insert: {
          application_date?: string | null
          batch?: string | null
          confirmed_at?: string | null
          course_id: string
          created_at?: string
          deleted_at?: string | null
          end_date: string
          id?: string
          learning_completed_at?: string | null
          manager_name?: string | null
          member_id: string
          memo?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          start_date: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          updated_at?: string
          year?: number | null
        }
        Update: {
          application_date?: string | null
          batch?: string | null
          confirmed_at?: string | null
          course_id?: string
          created_at?: string
          deleted_at?: string | null
          end_date?: string
          id?: string
          learning_completed_at?: string | null
          manager_name?: string | null
          member_id?: string
          memo?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          start_date?: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_questions: {
        Row: {
          answer: string
          choice1: string | null
          choice2: string | null
          choice3: string | null
          choice4: string | null
          choice5: string | null
          created_at: string
          deleted_at: string | null
          exam_id: string
          id: string
          question: string
          question_type: Database["public"]["Enums"]["exam_question_type"]
          score: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          choice1?: string | null
          choice2?: string | null
          choice3?: string | null
          choice4?: string | null
          choice5?: string | null
          created_at?: string
          deleted_at?: string | null
          exam_id: string
          id?: string
          question: string
          question_type: Database["public"]["Enums"]["exam_question_type"]
          score?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          choice1?: string | null
          choice2?: string | null
          choice3?: string | null
          choice4?: string | null
          choice5?: string | null
          created_at?: string
          deleted_at?: string | null
          exam_id?: string
          id?: string
          question?: string
          question_type?: Database["public"]["Enums"]["exam_question_type"]
          score?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_submissions: {
        Row: {
          answers: Json
          created_at: string
          enrollment_id: string
          exam_id: string
          id: string
          is_passed: boolean | null
          retake_allowed: boolean
          retake_allowed_at: string | null
          score: number
          submitted_at: string
          total_score: number
          updated_at: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          enrollment_id: string
          exam_id: string
          id?: string
          is_passed?: boolean | null
          retake_allowed?: boolean
          retake_allowed_at?: string | null
          score?: number
          submitted_at?: string
          total_score?: number
          updated_at?: string
        }
        Update: {
          answers?: Json
          created_at?: string
          enrollment_id?: string
          exam_id?: string
          id?: string
          is_passed?: boolean | null
          retake_allowed?: boolean
          retake_allowed_at?: string | null
          score?: number
          submitted_at?: string
          total_score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_submissions_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_submissions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          course_id: string
          created_at: string
          deleted_at: string | null
          exam_duration_minutes: number
          exam_end: string | null
          exam_kind: Database["public"]["Enums"]["exam_kind"]
          exam_start: string | null
          exam_type: Database["public"]["Enums"]["exam_type"]
          id: string
          is_published: boolean
          memo: string | null
          name: string
          pass_score: number | null
          print_enabled: boolean
          question_count: number
          status: Database["public"]["Enums"]["exam_status"]
          updated_at: string
          year: number
        }
        Insert: {
          course_id: string
          created_at?: string
          deleted_at?: string | null
          exam_duration_minutes?: number
          exam_end?: string | null
          exam_kind?: Database["public"]["Enums"]["exam_kind"]
          exam_start?: string | null
          exam_type: Database["public"]["Enums"]["exam_type"]
          id?: string
          is_published?: boolean
          memo?: string | null
          name: string
          pass_score?: number | null
          print_enabled?: boolean
          question_count?: number
          status?: Database["public"]["Enums"]["exam_status"]
          updated_at?: string
          year: number
        }
        Update: {
          course_id?: string
          created_at?: string
          deleted_at?: string | null
          exam_duration_minutes?: number
          exam_end?: string | null
          exam_kind?: Database["public"]["Enums"]["exam_kind"]
          exam_start?: string | null
          exam_type?: Database["public"]["Enums"]["exam_type"]
          id?: string
          is_published?: boolean
          memo?: string | null
          name?: string
          pass_score?: number | null
          print_enabled?: boolean
          question_count?: number
          status?: Database["public"]["Enums"]["exam_status"]
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "exams_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      issuing_agencies: {
        Row: {
          address: string | null
          ceo: string | null
          created_at: string
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          ceo?: string | null
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          ceo?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      learning_materials: {
        Row: {
          course_id: string | null
          created_at: string
          deleted_at: string | null
          description: string
          file_name: string
          file_size_label: string | null
          file_type: Database["public"]["Enums"]["material_file_type"]
          file_url: string | null
          id: string
          is_published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description: string
          file_name: string
          file_size_label?: string | null
          file_type?: Database["public"]["Enums"]["material_file_type"]
          file_url?: string | null
          id?: string
          is_published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string
          file_name?: string
          file_size_label?: string | null
          file_type?: Database["public"]["Enums"]["material_file_type"]
          file_url?: string | null
          id?: string
          is_published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_materials_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      lecture_progress: {
        Row: {
          attendance_status: LectureAttendanceStatus
          completed_at: string | null
          created_at: string
          enrollment_id: string
          id: string
          last_position_seconds: number
          lecture_session_id: string
          updated_at: string
          video_progress_percent: number
        }
        Insert: {
          attendance_status?: LectureAttendanceStatus
          completed_at?: string | null
          created_at?: string
          enrollment_id: string
          id?: string
          last_position_seconds?: number
          lecture_session_id: string
          updated_at?: string
          video_progress_percent?: number
        }
        Update: {
          attendance_status?: LectureAttendanceStatus
          completed_at?: string | null
          created_at?: string
          enrollment_id?: string
          id?: string
          last_position_seconds?: number
          lecture_session_id?: string
          updated_at?: string
          video_progress_percent?: number
        }
        Relationships: [
          {
            foreignKeyName: "lecture_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lecture_progress_lecture_session_id_fkey"
            columns: ["lecture_session_id"]
            isOneToOne: false
            referencedRelation: "lecture_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      lecture_sessions: {
        Row: {
          created_at: string
          deleted_at: string | null
          duration_minutes: number | null
          id: string
          lecture_id: string
          session_order: number
          title: string
          updated_at: string
          video_duration_seconds: number | null
          video_file_name: string | null
          video_source: Database["public"]["Enums"]["video_source"]
          video_storage_path: string | null
          video_uploaded_at: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          duration_minutes?: number | null
          id?: string
          lecture_id: string
          session_order: number
          title: string
          updated_at?: string
          video_duration_seconds?: number | null
          video_file_name?: string | null
          video_source?: Database["public"]["Enums"]["video_source"]
          video_storage_path?: string | null
          video_uploaded_at?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          duration_minutes?: number | null
          id?: string
          lecture_id?: string
          session_order?: number
          title?: string
          updated_at?: string
          video_duration_seconds?: number | null
          video_file_name?: string | null
          video_source?: Database["public"]["Enums"]["video_source"]
          video_storage_path?: string | null
          video_uploaded_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lecture_sessions_lecture_id_fkey"
            columns: ["lecture_id"]
            isOneToOne: false
            referencedRelation: "course_lectures"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          address: string | null
          address_detail: string | null
          birth_date: string | null
          calendar_type: Database["public"]["Enums"]["calendar_type"] | null
          created_at: string
          degree_purpose: string | null
          deleted_at: string | null
          desired_degree: string | null
          desired_major_name: string | null
          email: string | null
          graduated_school: string | null
          id: string
          join_path: string | null
          joined_at: string
          last_login_at: string | null
          login_id: string
          kakao_id: string | null
          major_name: string | null
          manager_name: string | null
          memo: string | null
          name: string
          naver_id: string | null
          occupation: string | null
          password_hash: string | null
          phone: string | null
          postal_code: string | null
          referrer_login_id: string | null
          resident_registration_number: string | null
          school_name: string | null
          status: Database["public"]["Enums"]["member_status"]
          tel: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          address_detail?: string | null
          birth_date?: string | null
          calendar_type?: Database["public"]["Enums"]["calendar_type"] | null
          created_at?: string
          degree_purpose?: string | null
          deleted_at?: string | null
          desired_degree?: string | null
          desired_major_name?: string | null
          email?: string | null
          graduated_school?: string | null
          id?: string
          join_path?: string | null
          joined_at?: string
          last_login_at?: string | null
          login_id: string
          kakao_id?: string | null
          major_name?: string | null
          manager_name?: string | null
          memo?: string | null
          name: string
          naver_id?: string | null
          occupation?: string | null
          password_hash?: string | null
          phone?: string | null
          postal_code?: string | null
          referrer_login_id?: string | null
          resident_registration_number?: string | null
          school_name?: string | null
          status?: Database["public"]["Enums"]["member_status"]
          tel?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          address_detail?: string | null
          birth_date?: string | null
          calendar_type?: Database["public"]["Enums"]["calendar_type"] | null
          created_at?: string
          degree_purpose?: string | null
          deleted_at?: string | null
          desired_degree?: string | null
          desired_major_name?: string | null
          email?: string | null
          graduated_school?: string | null
          id?: string
          join_path?: string | null
          joined_at?: string
          last_login_at?: string | null
          login_id?: string
          kakao_id?: string | null
          major_name?: string | null
          manager_name?: string | null
          memo?: string | null
          name?: string
          naver_id?: string | null
          occupation?: string | null
          password_hash?: string | null
          phone?: string | null
          postal_code?: string | null
          referrer_login_id?: string | null
          resident_registration_number?: string | null
          school_name?: string | null
          status?: Database["public"]["Enums"]["member_status"]
          tel?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      message_dispatches: {
        Row: {
          bulk_summary: string | null
          channel: Database["public"]["Enums"]["message_channel"]
          content: string
          created_at: string
          deleted_at: string | null
          dispatch_type: Database["public"]["Enums"]["message_dispatch_type"]
          fail_count: number
          id: string
          memo: string | null
          recipient_count: number
          recipient_name: string | null
          recipient_phone: string | null
          scheduled_at: string | null
          sender_name: string
          sent_at: string | null
          status: Database["public"]["Enums"]["message_send_status"]
          success_count: number
          title: string | null
          updated_at: string
        }
        Insert: {
          bulk_summary?: string | null
          channel: Database["public"]["Enums"]["message_channel"]
          content: string
          created_at?: string
          deleted_at?: string | null
          dispatch_type: Database["public"]["Enums"]["message_dispatch_type"]
          fail_count?: number
          id?: string
          memo?: string | null
          recipient_count?: number
          recipient_name?: string | null
          recipient_phone?: string | null
          scheduled_at?: string | null
          sender_name: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["message_send_status"]
          success_count?: number
          title?: string | null
          updated_at?: string
        }
        Update: {
          bulk_summary?: string | null
          channel?: Database["public"]["Enums"]["message_channel"]
          content?: string
          created_at?: string
          deleted_at?: string | null
          dispatch_type?: Database["public"]["Enums"]["message_dispatch_type"]
          fail_count?: number
          id?: string
          memo?: string | null
          recipient_count?: number
          recipient_name?: string | null
          recipient_phone?: string | null
          scheduled_at?: string | null
          sender_name?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["message_send_status"]
          success_count?: number
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notice_popups: {
        Row: {
          attachment_file_name: string | null
          attachment_file_url: string | null
          content: string
          created_at: string
          deleted_at: string | null
          display_end_date: string | null
          display_start_date: string | null
          id: string
          is_active: boolean
          is_notice: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          attachment_file_name?: string | null
          attachment_file_url?: string | null
          content: string
          created_at?: string
          deleted_at?: string | null
          display_end_date?: string | null
          display_start_date?: string | null
          id?: string
          is_active?: boolean
          is_notice?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          attachment_file_name?: string | null
          attachment_file_url?: string | null
          content?: string
          created_at?: string
          deleted_at?: string | null
          display_end_date?: string | null
          display_start_date?: string | null
          id?: string
          is_active?: boolean
          is_notice?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notices: {
        Row: {
          attachment_file_name: string | null
          attachment_file_size_label: string | null
          attachment_file_url: string | null
          attachment_storage_path: string | null
          author_name: string
          content: string
          category: string | null
          created_at: string
          deleted_at: string | null
          id: string
          image_file_name: string | null
          image_file_url: string | null
          image_storage_path: string | null
          is_pinned: boolean
          is_published: boolean
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          attachment_file_name?: string | null
          attachment_file_size_label?: string | null
          attachment_file_url?: string | null
          attachment_storage_path?: string | null
          author_name?: string
          category?: string | null
          content: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          image_file_name?: string | null
          image_file_url?: string | null
          image_storage_path?: string | null
          is_pinned?: boolean
          is_published?: boolean
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          attachment_file_name?: string | null
          attachment_file_size_label?: string | null
          attachment_file_url?: string | null
          attachment_storage_path?: string | null
          author_name?: string
          category?: string | null
          content?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          image_file_name?: string | null
          image_file_url?: string | null
          image_storage_path?: string | null
          is_pinned?: boolean
          is_published?: boolean
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      phone_verifications: {
        Row: {
          attempts: number
          code_hash: string
          consumed_at: string | null
          created_at: string
          expires_at: string
          id: string
          phone: string
          purpose: string
          token_hash: string | null
          verified_at: string | null
        }
        Insert: {
          attempts?: number
          code_hash: string
          consumed_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          phone: string
          purpose: string
          token_hash?: string | null
          verified_at?: string | null
        }
        Update: {
          attempts?: number
          code_hash?: string
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          phone?: string
          purpose?: string
          token_hash?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      professors: {
        Row: {
          bio: string[]
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          bio?: string[]
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string[]
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          photo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      admin_type: "super_admin" | "admin" | "instructor" | "counselor"
      board_type: "consultation" | "notice" | "free" | "resource" | "faq"
      calendar_type: "solar" | "lunar"
      certificate_application_status:
        | "received"
        | "payment_pending"
        | "payment_completed"
        | "preparing"
        | "issued"
        | "canceled"
        | "reissued"
      certificate_delivery_status:
        | "pending"
        | "preparing"
        | "shipped"
        | "delivered"
        | "canceled"
      certificate_kind:
        | "social_worker"
        | "child_care"
        | "lifelong_educator"
        | "youth_instructor"
        | "health_educator"
        | "course_completion"
      course_payment_status:
        | "pending"
        | "completed"
        | "canceled"
        | "refunded"
        | "failed"
        | "approved"
        | "deposit_expired"
        | "ready"
        | "paid"
      course_status: "active" | "hidden" | "closed"
      enrollment_status: "pending" | "confirmed" | "canceled" | "deleted"
      exam_kind:
        | "midterm"
        | "final"
        | "mock"
        | "certificate"
        | "quiz"
        | "final_exam"
      exam_question_type: "multiple_choice" | "ox" | "short_answer"
      exam_status: "planned" | "confirmed"
      exam_type: "regular" | "makeup" | "retake" | "practice"
      material_file_type: "PDF" | "DOCX" | "PPT" | "ZIP" | "기타"
      member_status: "active" | "inactive" | "dormant" | "withdrawn" | "pending"
      message_channel:
        | "sms"
        | "lms"
        | "kakao_alimtalk"
        | "kakao_friendtalk"
        | "email"
      message_dispatch_type: "single" | "bulk" | "scheduled"
      message_send_status:
        | "draft"
        | "scheduled"
        | "pending"
        | "sent"
        | "failed"
        | "canceled"
      payment_method:
        | "card"
        | "bank_transfer"
        | "virtual_account"
        | "mobile"
        | "cash"
      payment_status:
        | "unpaid"
        | "paid"
        | "partial"
        | "refunded"
        | "canceled"
        | "prepaid"
      video_source: "storage" | "external"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_type: ["super_admin", "admin", "instructor", "counselor"],
      board_type: ["consultation", "notice", "free", "resource", "faq"],
      calendar_type: ["solar", "lunar"],
      certificate_application_status: [
        "received",
        "payment_pending",
        "payment_completed",
        "preparing",
        "issued",
        "canceled",
        "reissued",
      ],
      certificate_delivery_status: [
        "pending",
        "preparing",
        "shipped",
        "delivered",
        "canceled",
      ],
      certificate_kind: [
        "social_worker",
        "child_care",
        "lifelong_educator",
        "youth_instructor",
        "health_educator",
        "course_completion",
      ],
      course_payment_status: [
        "pending",
        "completed",
        "canceled",
        "refunded",
        "failed",
        "approved",
        "deposit_expired",
        "ready",
        "paid",
      ],
      course_status: ["active", "hidden", "closed"],
      enrollment_status: ["pending", "confirmed", "canceled", "deleted"],
      exam_kind: [
        "midterm",
        "final",
        "mock",
        "certificate",
        "quiz",
        "final_exam",
      ],
      exam_question_type: ["multiple_choice", "ox", "short_answer"],
      exam_status: ["planned", "confirmed"],
      exam_type: ["regular", "makeup", "retake", "practice"],
      material_file_type: ["PDF", "DOCX", "PPT", "ZIP", "기타"],
      member_status: ["active", "inactive", "dormant", "withdrawn", "pending"],
      message_channel: [
        "sms",
        "lms",
        "kakao_alimtalk",
        "kakao_friendtalk",
        "email",
      ],
      message_dispatch_type: ["single", "bulk", "scheduled"],
      message_send_status: [
        "draft",
        "scheduled",
        "pending",
        "sent",
        "failed",
        "canceled",
      ],
      payment_method: [
        "card",
        "bank_transfer",
        "virtual_account",
        "mobile",
        "cash",
      ],
      payment_status: [
        "unpaid",
        "paid",
        "partial",
        "refunded",
        "canceled",
        "prepaid",
      ],
      video_source: ["storage", "external"],
    },
  },
} as const

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
