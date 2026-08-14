"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import {
  createHomeBannerAction,
  deleteHomeBannerAction,
  moveHomeBannerAction,
  updateHomeBannerAction,
} from "@/features/banner-management/actions/banner-management.actions";
import { uploadHomeBannerImage } from "@/features/banner-management/lib/banner-upload.client";
import type { HomeBanner } from "@/features/banner-management/services/banner-management.service";

/**
 * 어드민 > 배너관리 — 홈 메인 캐러셀 배너 등록·순서·공개/숨김·삭제.
 * 배너가 하나도 없으면 홈은 기존 기본 배너 3장을 보여줍니다.
 */
export function BannerManagementView({ banners }: { banners: HomeBanner[] }) {
  const router = useRouter();
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 등록 폼
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [alt, setAlt] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  async function run(task: () => Promise<{ success: boolean; message: string }>) {
    setMessage(null);
    setErrorMessage(null);
    setIsBusy(true);
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
      setIsBusy(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div>
        <h1 className="text-lg font-bold text-[#111827]">배너관리</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          홈 화면 메인 배너를 등록·정렬합니다. 등록된 배너가 없으면 기본 배너 3장이 나갑니다.
          권장 크기 1200×480px (JPG·PNG·WebP, 5MB 이하)
        </p>
      </div>

      {message ? (
        <p className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 text-sm text-[#059669]">{message}</p>
      ) : null}
      {errorMessage ? (
        <p className="rounded-lg bg-[#FEF2F2] px-3 py-2 text-sm text-[#EF4444]">{errorMessage}</p>
      ) : null}

      {/* ===================== 새 배너 등록 ===================== */}
      <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
        <p className="mb-3 text-sm font-semibold text-[#111827]">새 배너 등록</p>
        <div className="flex flex-wrap items-start gap-3">
          <label className="flex h-24 w-60 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-[#C4C9D0] bg-white text-sm text-[#6B7280]">
            {previewUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={previewUrl} alt="배너 미리보기" className="h-full w-full object-cover" />
            ) : (
              "이미지 선택"
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(event) => {
                const selected = event.target.files?.[0] ?? null;
                setFile(selected);
                setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
              }}
            />
          </label>
          <div className="flex min-w-[260px] flex-1 flex-col gap-2">
            <AdminInput
              variant="outline"
              placeholder="배너 설명 (예: 병원동행매니저 1급 무료수강)"
              value={alt}
              onChange={(event) => setAlt(event.target.value)}
            />
            <AdminInput
              variant="outline"
              placeholder="클릭 시 이동 주소 (선택, 예: /courses/병원동행매니저1급)"
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
            />
            <div>
              <AdminButton
                type="button"
                disabled={isBusy || !file}
                onClick={async () => {
                  if (!file) return;
                  setIsBusy(true);
                  setErrorMessage(null);
                  try {
                    const imageUrl = await uploadHomeBannerImage(file);
                    const ok = await run(() =>
                      createHomeBannerAction({ imageUrl, alt, linkUrl: linkUrl || null }),
                    );
                    if (ok) {
                      setFile(null);
                      setPreviewUrl(null);
                      setAlt("");
                      setLinkUrl("");
                    }
                  } catch (error) {
                    setErrorMessage(
                      error instanceof Error ? error.message : "업로드에 실패했습니다.",
                    );
                  } finally {
                    setIsBusy(false);
                  }
                }}
              >
                {isBusy ? "등록 중..." : "배너 등록"}
              </AdminButton>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== 배너 목록 ===================== */}
      {banners.length === 0 ? (
        <div className="flex min-h-[160px] items-center justify-center text-sm text-[#9CA3AF]">
          등록된 배너가 없습니다 — 홈에는 기본 배너가 나가는 중입니다.
        </div>
      ) : (
        <ul className="space-y-3">
          {banners.map((banner, index) => (
            <li
              key={banner.id}
              className="flex flex-wrap items-center gap-4 rounded-lg border border-[#E5E7EB] p-3"
            >
              <span className="w-6 text-center text-sm font-semibold text-[#6B7280]">
                {index + 1}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={banner.imageUrl}
                alt={banner.alt}
                className="h-20 w-52 flex-none rounded-md border border-[#E5E7EB] object-cover"
              />
              <div className="min-w-[200px] flex-1">
                <p className="truncate text-sm font-medium text-[#111827]">
                  {banner.alt || "(설명 없음)"}
                </p>
                <p className="mt-0.5 truncate text-xs text-[#9CA3AF]">
                  {banner.linkUrl ? `클릭 → ${banner.linkUrl}` : "링크 없음"} · 등록 {banner.createdAt}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={isBusy || index === 0}
                  onClick={() => void run(() => moveHomeBannerAction(banner.id, "up"))}
                  className="rounded-md border border-[#E5E7EB] px-2 py-1.5 text-xs text-[#374151] disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={isBusy || index === banners.length - 1}
                  onClick={() => void run(() => moveHomeBannerAction(banner.id, "down"))}
                  className="rounded-md border border-[#E5E7EB] px-2 py-1.5 text-xs text-[#374151] disabled:opacity-40"
                >
                  ↓
                </button>
                <label className="ml-1 flex cursor-pointer items-center gap-1.5 text-xs text-[#374151]">
                  <input
                    type="checkbox"
                    checked={banner.isPublished}
                    disabled={isBusy}
                    onChange={(event) =>
                      void run(() =>
                        updateHomeBannerAction(banner.id, { isPublished: event.target.checked }),
                      )
                    }
                    className="h-4 w-4 accent-[#3182F6]"
                  />
                  공개
                </label>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => {
                    if (!window.confirm("이 배너를 삭제할까요?")) return;
                    void run(() => deleteHomeBannerAction(banner.id));
                  }}
                  className="ml-1 rounded-md border border-[#F4C9CD] px-2.5 py-1.5 text-xs text-[#EF4444]"
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
