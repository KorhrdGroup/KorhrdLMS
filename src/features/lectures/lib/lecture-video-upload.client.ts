"use client";

import { LECTURE_VIDEO_BUCKET } from "@/features/lectures/constants";
import { createClient } from "@/lib/supabase/client";

/**
 * 대용량 영상 파일을 Next.js 서버(Server Action)를 거치지 않고 브라우저에서 곧바로
 * Supabase Storage로 업로드합니다. 서버는 업로드가 끝난 뒤의 공개 URL/경로만 전달받아
 * `lecture_sessions`에 저장합니다(추후 콘텐츠가 커져도 서버 요청 본문 크기 제한의 영향을 받지 않습니다).
 */
export async function uploadLectureVideoFile(
  lectureId: string,
  sessionId: string,
  file: File,
): Promise<{ url: string; path: string }> {
  const supabase = createClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${lectureId}/${sessionId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage.from(LECTURE_VIDEO_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "video/mp4",
  });

  if (uploadError) {
    throw new Error(toFriendlyUploadErrorMessage(uploadError.message));
  }

  const { data } = supabase.storage.from(LECTURE_VIDEO_BUCKET).getPublicUrl(path);

  return { url: data.publicUrl, path };
}

/**
 * Supabase Storage의 원본 오류 메시지는 "The object exceeded the maximum allowed size"처럼
 * 원인을 알기 어렵게 노출됩니다. 이 오류는 lecture-videos 버킷의 file_size_limit이 아니라,
 * Supabase 프로젝트 전체에 적용되는 "Global file size limit"(Dashboard > Project Settings >
 * Storage)에 걸릴 때 발생합니다. Free 플랜은 이 값이 50MB로 고정되어 있어 버킷 설정만으로는
 * 올릴 수 없고, Pro 플랜 이상으로 업그레이드하거나 Dashboard/관리 API에서 전역 한도를 올려야
 * 합니다. 관리자가 원인을 바로 파악할 수 있도록 메시지를 번역해 전달합니다.
 */
function toFriendlyUploadErrorMessage(rawMessage: string): string {
  if (/maximum allowed size/i.test(rawMessage)) {
    return (
      "영상 용량이 현재 Supabase 프로젝트의 업로드 허용 용량을 초과했습니다. " +
      "(Free 플랜은 파일당 50MB로 제한됩니다.) " +
      "Supabase Dashboard > Project Settings > Storage에서 Global file size limit을 높이거나 " +
      "프로젝트를 Pro 플랜 이상으로 업그레이드한 뒤 다시 시도해주세요."
    );
  }

  return rawMessage;
}

/** 브라우저에서 파일의 실제 재생 길이(초)를 추출합니다. 추출 실패 시 null을 반환합니다. */
export function readVideoDurationSeconds(source: File | string): Promise<number | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    const resolvedSrc = typeof source === "string" ? source : URL.createObjectURL(source);
    const objectUrl = typeof source === "string" ? null : resolvedSrc;

    const cleanup = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };

    video.onloadedmetadata = () => {
      const duration = video.duration;
      cleanup();
      resolve(Number.isFinite(duration) && duration > 0 ? Math.round(duration) : null);
    };

    video.onerror = () => {
      cleanup();
      resolve(null);
    };

    video.src = resolvedSrc;
  });
}

/**
 * 선택된 MP4 파일에 오디오 트랙이 있는지 여부를 최대한 판별합니다(업로드 전 사전 점검용).
 * MP4(ISO-BMFF) 컨테이너의 `moov` 박스 안에서 각 트랙의 `hdlr` 박스를 찾아 handler_type이
 * "soun"(오디오)인지 확인하는 방식입니다. `moov`가 파일 앞부분(fast-start)이나 뒷부분
 * (전통적인 인코더 출력) 어디에 있어도 찾을 수 있도록 파일의 앞/뒤 일부만 읽어 검사합니다.
 * 컨테이너 구조상 moov를 찾지 못하면(예: 매우 특수한 인코딩) null을 반환해 "판별 불가"로 처리합니다.
 */
export async function detectHasAudioTrack(file: File): Promise<boolean | null> {
  try {
    const PROBE_BYTES = 4 * 1024 * 1024;
    const headBuf = new Uint8Array(await file.slice(0, Math.min(PROBE_BYTES, file.size)).arrayBuffer());

    let moovBytes: Uint8Array | null = null;
    const headMoov = findTopLevelBox(headBuf, "moov");
    if (headMoov) {
      moovBytes = headBuf.subarray(headMoov.start, headMoov.end);
    } else if (file.size > PROBE_BYTES) {
      const tailStart = Math.max(0, file.size - PROBE_BYTES);
      const tailBuf = new Uint8Array(await file.slice(tailStart, file.size).arrayBuffer());
      const tailMoov = findTopLevelBox(tailBuf, "moov");
      if (tailMoov) {
        moovBytes = tailBuf.subarray(tailMoov.start, tailMoov.end);
      }
    }

    if (!moovBytes) {
      return null;
    }

    const handlerTypes = findHandlerTypes(moovBytes);
    if (handlerTypes.length === 0) {
      return null;
    }

    return handlerTypes.includes("soun");
  } catch {
    return null;
  }
}

function findTopLevelBox(
  buf: Uint8Array,
  targetType: string,
): { start: number; end: number } | null {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let offset = 0;

  while (offset + 8 <= buf.length) {
    const size = view.getUint32(offset);
    const type = bytesToAscii(buf, offset + 4, offset + 8);
    let boxSize = size;

    if (size === 1) {
      if (offset + 16 > buf.length) break;
      const high = view.getUint32(offset + 8);
      const low = view.getUint32(offset + 12);
      boxSize = high * 2 ** 32 + low;
    }

    if (boxSize < 8) break;

    if (type === targetType) {
      const end = Math.min(offset + boxSize, buf.length);
      return { start: offset, end };
    }

    offset += boxSize;
  }

  return null;
}

function findHandlerTypes(buf: Uint8Array): string[] {
  const types: string[] = [];
  const marker = [0x68, 0x64, 0x6c, 0x72]; // "hdlr"
  for (let i = 0; i + 4 <= buf.length; i += 1) {
    if (buf[i] === marker[0] && buf[i + 1] === marker[1] && buf[i + 2] === marker[2] && buf[i + 3] === marker[3]) {
      const handlerTypeOffset = i + 4 + 4;
      if (handlerTypeOffset + 4 <= buf.length) {
        types.push(bytesToAscii(buf, handlerTypeOffset, handlerTypeOffset + 4));
      }
    }
  }
  return types;
}

function bytesToAscii(buf: Uint8Array, start: number, end: number): string {
  let result = "";
  for (let i = start; i < end; i += 1) {
    result += String.fromCharCode(buf[i]);
  }
  return result;
}
