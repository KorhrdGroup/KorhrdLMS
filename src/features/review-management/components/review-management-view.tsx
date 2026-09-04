"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/admin-table";
import {
  createAdminCourseReviewAction,
  deleteAdminCourseReviewAction,
  updateAdminCourseReviewAction,
} from "@/features/review-management/actions/review-management.actions";
import type {
  AdminCourseReview,
  ReviewCourseOption,
} from "@/features/review-management/services/review-management.service";
import {
  uploadCertificatePhotoFile,
  validateCertificatePhotoFile,
} from "@/features/certificate-applications/lib/certificate-photo-upload.client";

/**
 * 어드민 게시판관리 > 합격후기 — 학생 후기게시판 글을 추가·수정·공개/숨김·삭제합니다.
 * 추가한 글은 member_id 없는 시드(홍보용) 글로 들어갑니다.
 * 삭제는 soft delete — 학생 화면에서만 사라지고 이력은 남습니다.
 */
export function ReviewManagementView({
  reviews,
  courseOptions,
}: {
  reviews: AdminCourseReview[];
  courseOptions: ReviewCourseOption[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AdminCourseReview | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editPublished, setEditPublished] = useState(true);
  const [editCreatedAt, setEditCreatedAt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /* ---------- 후기 추가 모달 ---------- */
  const [isCreating, setIsCreating] = useState(false);
  const [newCourseId, setNewCourseId] = useState("");
  const [newAuthorName, setNewAuthorName] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newPublished, setNewPublished] = useState(true);
  const [newPhoto, setNewPhoto] = useState<File | null>(null);

  function openCreate() {
    setMessage(null);
    setErrorMessage(null);
    setNewCourseId("");
    setNewAuthorName("");
    setNewTitle("");
    setNewBody("");
    setNewPublished(true);
    setNewPhoto(null);
    setIsCreating(true);
  }

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return reviews;
    return reviews.filter(
      (review) =>
        review.title.toLowerCase().includes(keyword) ||
        review.authorName.toLowerCase().includes(keyword) ||
        review.courseName.toLowerCase().includes(keyword),
    );
  }, [reviews, search]);

  function openEdit(review: AdminCourseReview) {
    setMessage(null);
    setErrorMessage(null);
    setEditing(review);
    setEditTitle(review.title);
    setEditBody(review.body);
    setEditPublished(review.isPublished);
    setEditCreatedAt(review.createdAt); // 이미 YYYY-MM-DD 형식
  }

  async function run(task: () => Promise<{ success: boolean; message: string }>) {
    setMessage(null);
    setErrorMessage(null);
    setIsSaving(true);
    try {
      const result = await task();
      if (!result.success) {
        setErrorMessage(result.message);
        return false;
      }
      setMessage(result.message);
      router.refresh();
      return true;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "처리에 실패했습니다.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#111827]">합격후기 관리</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            학생 후기게시판 글을 수정·공개/숨김·삭제할 수 있습니다. 총 {reviews.length}건
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AdminInput
            type="search"
            variant="outline"
            className="h-9 w-56"
            placeholder="제목·작성자·과정 검색"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <AdminButton type="button" onClick={openCreate}>
            + 후기 추가
          </AdminButton>
        </div>
      </div>

      {message ? (
        <p className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 text-sm text-[#059669]">{message}</p>
      ) : null}
      {errorMessage ? (
        <p className="rounded-lg bg-[#FEF2F2] px-3 py-2 text-sm text-[#EF4444]">{errorMessage}</p>
      ) : null}

      {filtered.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center text-sm text-[#9CA3AF]">
          {search ? "검색 결과가 없습니다." : "등록된 후기가 없습니다."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <AdminTable>
            <AdminTableHeader>
              <AdminTableRow className="hover:bg-transparent">
                <AdminTableHead className="text-center">사진</AdminTableHead>
                <AdminTableHead>제목</AdminTableHead>
                <AdminTableHead>작성자</AdminTableHead>
                <AdminTableHead>과정</AdminTableHead>
                <AdminTableHead className="text-center">도움됐어요</AdminTableHead>
                <AdminTableHead className="text-center">공개</AdminTableHead>
                <AdminTableHead className="text-center">작성일</AdminTableHead>
                <AdminTableHead className="text-right">관리</AdminTableHead>
              </AdminTableRow>
            </AdminTableHeader>
            <AdminTableBody>
              {filtered.map((review) => (
                <AdminTableRow key={review.id}>
                  <AdminTableCell className="text-center">
                    {review.photoUrl ? (
                      <a
                        href={review.photoUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="사진 크게 보기"
                        className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-md border border-[#E5E7EB] bg-[#F9FAFB]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={review.photoUrl}
                          alt={`${review.title} 후기 사진`}
                          className="h-full w-full object-cover"
                        />
                      </a>
                    ) : (
                      <span className="text-xs text-[#C4C9D0]">—</span>
                    )}
                  </AdminTableCell>
                  <AdminTableCell className="max-w-[280px]">
                    <span className="block truncate font-medium text-[#111827]" title={review.title}>
                      {review.title}
                    </span>
                  </AdminTableCell>
                  <AdminTableCell className="whitespace-nowrap">
                    {review.authorName}
                    {review.isSeed ? (
                      <span className="ml-1.5 rounded bg-[#EFF6FF] px-1.5 py-0.5 text-[11px] text-[#3182F6]">
                        홍보용
                      </span>
                    ) : null}
                  </AdminTableCell>
                  <AdminTableCell className="whitespace-nowrap text-[#6B7280]">
                    {review.courseName || "—"}
                  </AdminTableCell>
                  <AdminTableCell className="text-center text-[#6B7280]">
                    {review.helpfulCount}
                  </AdminTableCell>
                  <AdminTableCell className="text-center">
                    {review.isPublished ? (
                      <span className="inline-flex rounded-md bg-[#F0FDF4] px-2 py-0.5 text-xs font-medium text-[#059669]">
                        공개
                      </span>
                    ) : (
                      <span className="inline-flex rounded-md bg-[#F0F0F0] px-2 py-0.5 text-xs font-medium text-[#9CA3AF]">
                        숨김
                      </span>
                    )}
                  </AdminTableCell>
                  <AdminTableCell className="whitespace-nowrap text-center text-[#6B7280]">
                    {review.createdAt}
                  </AdminTableCell>
                  <AdminTableCell className="text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => openEdit(review)}
                        className="rounded-md border border-[#E5E7EB] px-2.5 py-1.5 text-xs text-[#374151]"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => {
                          if (!window.confirm(`"${review.title}" 후기를 삭제할까요?\n학생 화면에서 사라집니다.`)) return;
                          void run(() => deleteAdminCourseReviewAction(review.id));
                        }}
                        className="rounded-md border border-[#F4C9CD] px-2.5 py-1.5 text-xs text-[#EF4444]"
                      >
                        삭제
                      </button>
                    </div>
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </AdminTableBody>
          </AdminTable>
        </div>
      )}

      {/* ===================== 추가 모달 ===================== */}
      {isCreating ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-[rgba(15,18,25,0.55)] p-4"
          onClick={() => setIsCreating(false)}
        >
          <div
            className="w-full max-w-[640px] rounded-xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-[#111827]">후기 추가</h2>
              <button
                type="button"
                aria-label="닫기"
                onClick={() => setIsCreating(false)}
                className="text-lg text-[#9CA3AF]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#6B7280]">과정</label>
                <select
                  value={newCourseId}
                  onChange={(event) => setNewCourseId(event.target.value)}
                  className="h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827]"
                >
                  <option value="">과정 선택</option>
                  {courseOptions.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#6B7280]">작성자 이름</label>
                <AdminInput
                  variant="outline"
                  placeholder="예: 김민지"
                  value={newAuthorName}
                  onChange={(event) => setNewAuthorName(event.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#6B7280]">제목</label>
                <AdminInput
                  variant="outline"
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#6B7280]">내용</label>
                <textarea
                  value={newBody}
                  onChange={(event) => setNewBody(event.target.value)}
                  rows={8}
                  className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#6B7280]">
                  사진 첨부 (선택 — JPG·PNG, 2MB 이하)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    if (file) {
                      const problem = validateCertificatePhotoFile(file);
                      if (problem) {
                        setErrorMessage(problem);
                        event.target.value = "";
                        setNewPhoto(null);
                        return;
                      }
                    }
                    setErrorMessage(null);
                    setNewPhoto(file);
                  }}
                  className="block w-full text-sm text-[#374151] file:mr-3 file:rounded-md file:border file:border-[#E5E7EB] file:bg-white file:px-3 file:py-1.5 file:text-xs file:text-[#374151]"
                />
                {newPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={URL.createObjectURL(newPhoto)}
                    alt="첨부 사진 미리보기"
                    className="mt-2 h-24 w-24 rounded-md border border-[#E5E7EB] object-cover"
                  />
                ) : null}
              </div>
              <label className="flex items-center gap-2 text-sm text-[#374151]">
                <input
                  type="checkbox"
                  checked={newPublished}
                  onChange={(event) => setNewPublished(event.target.checked)}
                  className="h-4 w-4 accent-[#3182F6]"
                />
                학생 화면에 공개
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <AdminButton type="button" variant="outline" onClick={() => setIsCreating(false)}>
                취소
              </AdminButton>
              <AdminButton
                type="button"
                disabled={isSaving}
                onClick={async () => {
                  const ok = await run(async () => {
                    // 사진을 먼저 올리고 URL을 후기에 붙입니다 (학생 작성 화면과 같은 저장소)
                    let photoUrl: string | undefined;
                    if (newPhoto) {
                      photoUrl = await uploadCertificatePhotoFile(newPhoto);
                    }
                    return createAdminCourseReviewAction({
                      courseId: newCourseId,
                      authorName: newAuthorName,
                      title: newTitle,
                      body: newBody,
                      isPublished: newPublished,
                      photoUrl,
                    });
                  });
                  if (ok) setIsCreating(false);
                }}
              >
                {isSaving ? "등록 중..." : "등록"}
              </AdminButton>
            </div>
          </div>
        </div>
      ) : null}

      {/* ===================== 수정 모달 ===================== */}
      {editing ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-[rgba(15,18,25,0.55)] p-4"
          onClick={() => setEditing(null)}
        >
          <div
            className="w-full max-w-[640px] rounded-xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-[#111827]">후기 수정</h2>
              <button
                type="button"
                aria-label="닫기"
                onClick={() => setEditing(null)}
                className="text-lg text-[#9CA3AF]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#6B7280]">제목</label>
                <AdminInput
                  variant="outline"
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#6B7280]">내용</label>
                <textarea
                  value={editBody}
                  onChange={(event) => setEditBody(event.target.value)}
                  rows={8}
                  className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#6B7280]">작성일</label>
                <AdminInput
                  variant="outline"
                  type="date"
                  className="w-44"
                  value={editCreatedAt}
                  onChange={(event) => setEditCreatedAt(event.target.value)}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-[#374151]">
                <input
                  type="checkbox"
                  checked={editPublished}
                  onChange={(event) => setEditPublished(event.target.checked)}
                  className="h-4 w-4 accent-[#3182F6]"
                />
                학생 화면에 공개
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <AdminButton type="button" variant="outline" onClick={() => setEditing(null)}>
                취소
              </AdminButton>
              <AdminButton
                type="button"
                disabled={isSaving}
                onClick={async () => {
                  const ok = await run(() =>
                    updateAdminCourseReviewAction(editing.id, {
                      title: editTitle,
                      body: editBody,
                      isPublished: editPublished,
                      createdAt: editCreatedAt,
                    }),
                  );
                  if (ok) setEditing(null);
                }}
              >
                {isSaving ? "저장 중..." : "저장"}
              </AdminButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
