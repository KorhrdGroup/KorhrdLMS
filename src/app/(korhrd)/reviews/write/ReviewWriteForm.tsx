'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { submitCourseReviewAction } from '@/features/korhrd/actions/course-review.actions';
import type { ReviewableCourse } from '@/features/korhrd/services/course-review.service';
import { uploadCertificatePhotoFile } from '@/features/certificate-applications/lib/certificate-photo-upload.client';

const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = ['image/png', 'image/jpeg'];

/**
 * 합격후기 작성·수정 — 마크업은 korhrd 디자인(review-edit.html), 저장은 course_reviews.
 *
 * 기획 규칙대로 대표 과정 1건 + 함께 수강한 과정은 태그로만 남깁니다.
 * 합격한 과정만 선택지에 나오며, 서버가 한 번 더 확인합니다.
 */
export function ReviewWriteForm({
  courses,
  initial,
}: {
  courses: ReviewableCourse[];
  initial?: {
    id: string;
    courseId: string;
    title: string;
    body: string;
    alsoCourseIds: string[];
    photoUrl?: string | null;
  };
}) {
  const router = useRouter();
  const [courseId, setCourseId] = useState(initial?.courseId ?? courses[0]?.courseId ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [alsoIds, setAlsoIds] = useState<string[]>(initial?.alsoCourseIds ?? []);
  const [photo, setPhoto] = useState<File | null>(null);
  // 새로 고른 파일의 미리보기. 없으면 기존 사진(수정 시)을 보여줍니다.
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggleAlso = (id: string) =>
    setAlsoIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      let photoUrl: string | undefined;
      if (photo) {
        try {
          photoUrl = await uploadCertificatePhotoFile(photo);
        } catch (err) {
          setError(err instanceof Error ? err.message : '사진 업로드에 실패했습니다.');
          return;
        }
      }
      const result = await submitCourseReviewAction({
        reviewId: initial?.id,
        courseId,
        title,
        body,
        alsoCourseIds: alsoIds,
        photoUrl,
      });
      if (result.success) {
        router.push(`/reviews/${result.reviewId}`);
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  };

  if (courses.length === 0) {
    return (
      <div className="container">
        <div className="page-head"><h1>합격후기 작성</h1></div>
        <div className="guide-box">
          <strong>작성 가능한 과정이 없습니다</strong>
          <ul>
            <li>시험에 합격한 과정에 대해서만 후기를 작성하실 수 있습니다.</li>
            <li>수강 현황은 <Link href="/mylecture">나의 강의실</Link>에서 확인하세요.</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <nav className="breadcrumb" aria-label="현재 위치">
        <ol>
          <li><Link href="/">홈</Link></li>
          <li><Link href="/reviews">합격후기</Link></li>
          <li aria-current="page">{initial ? '후기 수정' : '후기 작성'}</li>
        </ol>
      </nav>

      <div className="page-head"><h1>{initial ? '합격후기 수정' : '합격후기 작성'}</h1></div>

      <div className="form-card">
        <form className="form" style={{ maxWidth: 'none' }} onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="course">대표 과정 <span className="req" aria-hidden="true">*</span></label>
            <select
              id="course" value={courseId} required
              onChange={(event) => setCourseId(event.target.value)}
            >
              {courses.map((course) => (
                <option
                  key={course.courseId}
                  value={course.courseId}
                  disabled={course.alreadyWritten && course.courseId !== initial?.courseId}
                >
                  {course.courseTitle}
                  {course.alreadyWritten && course.courseId !== initial?.courseId ? ' (작성 완료)' : ''}
                </option>
              ))}
            </select>
          </div>

          {courses.length > 1 ? (
            <div className="field">
              {/* 라벨이 아니라 묶음 제목이라 span 입니다 — .field label{display:block} 이
                  걸려 있어 label 로 두면 항목까지 세로로 밀립니다(원본 review-edit.html) */}
              <span className="field__label">함께 수강한 과정 <span className="hint">(선택)</span></span>
              {/* .check-row/.check 는 폼용 체크 목록입니다. .q-option 은 시험 문제
                  보기용(테두리 있는 큰 카드)이라 폼 안에서는 과합니다. */}
              <div className="check-row">
                {courses
                  .filter((course) => course.courseId !== courseId)
                  .map((course) => (
                    <label className="check" key={course.courseId}>
                      <input
                        type="checkbox"
                        checked={alsoIds.includes(course.courseId)}
                        onChange={() => toggleAlso(course.courseId)}
                      />
                      {course.courseTitle}
                    </label>
                  ))}
              </div>
              <p className="field__note">
                함께 들은 과정을 고르면 후기 카드에 태그로 표시됩니다.
                후기 자체는 위 대표 과정 하나에만 등록됩니다.
              </p>
            </div>
          ) : null}

          <div className="field">
            <label htmlFor="title">제목 <span className="req" aria-hidden="true">*</span></label>
            <input
              id="title" type="text" required value={title} maxLength={80}
              placeholder="예) 1개월만에 빠른 취득, 성공했습니다!"
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="body">내용 <span className="req" aria-hidden="true">*</span></label>
            <textarea
              id="body" rows={10} required value={body}
              placeholder="수강 계기, 학습 방법, 합격 후 달라진 점 등을 자유롭게 적어주세요."
              onChange={(event) => setBody(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="review-photo">
              자격증 사진 <span className="hint">(선택 · JPG/PNG, 5MB 이하)</span>
            </label>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {photoPreview || initial?.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoPreview ?? initial?.photoUrl ?? ''}
                  alt="자격증 사진 미리보기"
                  style={{
                    width: '96px', height: '96px', objectFit: 'cover',
                    borderRadius: '8px', border: '1px solid var(--border)', flexShrink: 0,
                  }}
                />
              ) : (
                <span className="ph ph--cert-sq" aria-hidden="true" style={{ flexShrink: 0 }}>
                  자격증 사진<small>1 : 1</small>
                </span>
              )}
              <div style={{ flex: 1, minWidth: '220px' }}>
                <input
                  id="review-photo" type="file" accept="image/png,image/jpeg"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    if (file) {
                      if (!PHOTO_TYPES.includes(file.type)) {
                        setError('JPG, PNG 형식의 이미지만 첨부할 수 있습니다.');
                        event.target.value = '';
                        return;
                      }
                      if (file.size > PHOTO_MAX_BYTES) {
                        setError('사진 파일은 5MB 이하만 첨부할 수 있습니다.');
                        event.target.value = '';
                        return;
                      }
                    }
                    setError(null);
                    setPhoto(file);
                    if (photoPreview) URL.revokeObjectURL(photoPreview);
                    setPhotoPreview(file ? URL.createObjectURL(file) : null);
                  }}
                />
                <p className="field__note">
                  {initial?.photoUrl
                    ? '새 파일을 올리면 기존 사진이 교체됩니다.'
                    : '취득한 자격증 사진을 올리면 후기 카드에 함께 표시됩니다.'}
                </p>
              </div>
            </div>
          </div>

          {error ? <p className="my-card__status my-card__status--fail">{error}</p> : null}

          {/* 원본과 같이 취소·저장 두 갈래를 한 줄에 둡니다(.result-cta).
              취소가 없으면 쓰다 그만둘 때 뒤로가기밖에 길이 없었습니다. */}
          <div className="result-cta mt-4">
            <Link className="btn btn--ghost btn--lg" href={initial ? `/reviews/${initial.id}` : '/reviews'}>
              취소
            </Link>
            <button className="btn btn--primary btn--lg" type="submit" disabled={isPending}>
              {isPending ? '저장 중…' : initial ? '수정하기' : '후기 등록하기'}
            </button>
          </div>
        </form>
      </div>

      <div className="guide-box mt-4">
        <strong>합격후기 안내</strong>
        <ul>
          <li>시험에 합격한 과정에 대해서만 작성하실 수 있습니다.</li>
          <li>여러 과정을 함께 들으셨다면 대표 과정 1개를 고르고 나머지는 태그로 남겨주세요.</li>
          <li>욕설·광고 등 운영 정책에 어긋나는 후기는 사전 고지 없이 삭제됩니다.</li>
        </ul>
      </div>
    </div>
  );
}
