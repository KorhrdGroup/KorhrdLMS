"use client";

import { MessageSquareReply, Paperclip } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  createBoardCommentAction,
  getBoardPostDetailAction,
} from "@/features/boards/actions/board.actions";
import { DEFAULT_BOARD_AUTHOR } from "@/features/boards/constants";
import { hasAttachment } from "@/features/boards/lib/board.utils";
import type { BoardPostDetail } from "@/features/boards/types/board.types";
import type { BoardCommentInput } from "@/features/boards/types/board-form.types";
import {
  EnrollmentFormField,
  EnrollmentFormTextarea,
} from "@/features/enrollments/components/enrollment-form-field";
import { formatDateTime } from "@/lib/shared/format-date";

type BoardDetailModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string | null;
  onReplyClick?: (postId: string) => void;
  onCommentAdded?: (message: string) => void;
};

const INITIAL_COMMENT: BoardCommentInput = {
  content: "",
  authorName: DEFAULT_BOARD_AUTHOR,
};

type DetailFieldProps = {
  label: string;
  value: React.ReactNode;
};

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div>
      <dt className="text-sm text-[#6B7280]">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-[#111827]">{value}</dd>
    </div>
  );
}

export function BoardDetailModal({
  open,
  onOpenChange,
  postId,
  onReplyClick,
  onCommentAdded,
}: BoardDetailModalProps) {
  const [detail, setDetail] = useState<BoardPostDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [commentForm, setCommentForm] = useState<BoardCommentInput>(INITIAL_COMMENT);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [isLoading, startLoad] = useTransition();
  const [isSubmittingComment, startSubmitComment] = useTransition();

  function loadDetail(targetPostId: string) {
    startLoad(async () => {
      setDetail(null);
      setErrorMessage(null);

      try {
        const result = await getBoardPostDetailAction(targetPostId);

        if (!result.success) {
          setErrorMessage(result.message);
          return;
        }

        setDetail(result.post);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "게시글 정보를 불러오지 못했습니다.",
        );
      }
    });
  }

  useEffect(() => {
    if (!open || !postId) {
      return;
    }

    setCommentForm(INITIAL_COMMENT);
    setCommentError(null);
    loadDetail(postId);
  }, [open, postId]);

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      setDetail(null);
      setErrorMessage(null);
      setCommentForm(INITIAL_COMMENT);
      setCommentError(null);
    }
  }

  function handleCommentSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!postId) {
      return;
    }

    startSubmitComment(async () => {
      setCommentError(null);

      try {
        const result = await createBoardCommentAction(postId, commentForm);

        if (!result.success) {
          setCommentError(result.message);
          return;
        }

        setCommentForm(INITIAL_COMMENT);
        loadDetail(postId);
        onCommentAdded?.(result.message);
      } catch (error) {
        setCommentError(
          error instanceof Error ? error.message : "댓글 등록에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="게시글 상세"
      description="게시글 내용, 답글, 댓글을 확인할 수 있습니다."
      className="sm:max-w-3xl"
      footer={
        <>
          {postId ? (
            <AdminButton
              type="button"
              variant="secondary"
              onClick={() => onReplyClick?.(postId)}
            >
              <MessageSquareReply className="size-4" />
              답글 작성
            </AdminButton>
          ) : null}
          <AdminButton type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            닫기
          </AdminButton>
        </>
      }
    >
      {isLoading ? (
        <div className="flex min-h-[320px] items-center justify-center text-sm text-[#6B7280]">
          정보를 불러오는 중...
        </div>
      ) : errorMessage ? (
        <div className="flex min-h-[320px] items-center justify-center text-sm text-[#EF4444]">
          {errorMessage}
        </div>
      ) : detail ? (
        <div className="space-y-6">
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailField
              label="공지"
              value={
                detail.isNotice ? (
                  <span className="rounded-full bg-[#FEE2E2] px-2 py-1 text-xs font-medium text-[#991B1B]">
                    공지
                  </span>
                ) : (
                  "일반"
                )
              }
            />
            <DetailField label="작성자" value={detail.authorName} />
            <DetailField label="등록일" value={formatDateTime(detail.createdAt)} />
            <DetailField label="수정일" value={formatDateTime(detail.updatedAt)} />
          </dl>

          <div>
            <h3 className="text-base font-semibold text-[#111827]">{detail.title}</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#374151]">
              {detail.content}
            </p>
          </div>

          {hasAttachment(detail.attachmentFileName) ? (
            <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-[#374151]">
                <Paperclip className="size-4" />
                첨부파일
              </div>
              <p className="mt-1 text-sm text-[#6B7280]">{detail.attachmentFileName}</p>
              {detail.attachmentFileUrl ? (
                <a
                  href={detail.attachmentFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-sm text-[#3B82F6] hover:underline"
                >
                  {detail.attachmentFileUrl}
                </a>
              ) : null}
            </div>
          ) : null}

          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-[#111827]">
              답글 ({detail.replies.length})
            </h4>
            {detail.replies.length === 0 ? (
              <p className="text-sm text-[#9CA3AF]">등록된 답글이 없습니다.</p>
            ) : (
              <ul className="space-y-3">
                {detail.replies.map((reply) => (
                  <li
                    key={reply.id}
                    className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
                      <span className="font-medium text-[#374151]">{reply.authorName}</span>
                      <span>{formatDateTime(reply.createdAt)}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-[#374151]">
                      {reply.content}
                    </p>
                    {hasAttachment(reply.attachmentFileName) ? (
                      <p className="mt-2 text-xs text-[#6B7280]">
                        첨부: {reply.attachmentFileName}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-[#111827]">
              댓글 ({detail.comments.length})
            </h4>
            {detail.comments.length === 0 ? (
              <p className="text-sm text-[#9CA3AF]">등록된 댓글이 없습니다.</p>
            ) : (
              <ul className="space-y-3">
                {detail.comments.map((comment) => (
                  <li
                    key={comment.id}
                    className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
                      <span className="font-medium text-[#374151]">{comment.authorName}</span>
                      <span>{formatDateTime(comment.createdAt)}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-[#374151]">
                      {comment.content}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <form className="space-y-3 border-t border-[#E5E7EB] pt-4" onSubmit={handleCommentSubmit}>
            <h4 className="text-sm font-semibold text-[#111827]">댓글 입력</h4>
            {commentError ? (
              <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
                {commentError}
              </p>
            ) : null}
            <EnrollmentFormField label="내용" htmlFor="commentContent" required>
              <EnrollmentFormTextarea
                id="commentContent"
                value={commentForm.content}
                onChange={(event) =>
                  setCommentForm((current) => ({
                    ...current,
                    content: event.target.value,
                  }))
                }
              />
            </EnrollmentFormField>
            <EnrollmentFormField label="작성자" htmlFor="commentAuthorName" required>
              <AdminInput
                id="commentAuthorName"
                variant="outline"
                value={commentForm.authorName}
                onChange={(event) =>
                  setCommentForm((current) => ({
                    ...current,
                    authorName: event.target.value,
                  }))
                }
              />
            </EnrollmentFormField>
            <div className="flex justify-end">
              <AdminButton type="submit" disabled={isSubmittingComment}>
                {isSubmittingComment ? "등록 중..." : "댓글 등록"}
              </AdminButton>
            </div>
          </form>
        </div>
      ) : null}
    </AdminModal>
  );
}
